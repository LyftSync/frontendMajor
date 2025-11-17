import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DatePickerModal, TimePickerModal } from "react-native-paper-dates";
import MapPickerModal from "../../../components/map/MapPickerModal";
import AppButton from "../../../components/UI/AppButton";
import AppTextInput from "../../../components/UI/AppTextInput";
import LoadingOverlay from "../../../components/UI/LoadingOverlay";
import { COLORS } from "../../../constants/colors";
import { DEFAULT_MAP_REGION } from "../../../constants/mapConstants"; // Updated import
import { createRide } from "../../../services/rideService";
import { getErrorMessage } from "../../../utils/helpers";

const CreateRideScreen = () => {
  const router = useRouter();
  const [startLocation, setStartLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [endLocation, setEndLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  const [departureTime, setDepartureTime] = useState(
    new Date(Date.now() + 60 * 60 * 1000)
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [availableSeats, setAvailableSeats] = useState("1");
  const [pricePerSeat, setPricePerSeat] = useState("0");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [mapMode, setMapMode] = useState<"start" | "end" | null>(null);
  const [mapInitialRegion, setMapInitialRegion] = useState(DEFAULT_MAP_REGION);

  const handleDateConfirm = (params: { date: Date }) => {
    const selectedDate = params.date;
    const newDepartureTime = new Date(departureTime);
    newDepartureTime.setFullYear(selectedDate.getFullYear());
    newDepartureTime.setMonth(selectedDate.getMonth());
    newDepartureTime.setDate(selectedDate.getDate());
    setDepartureTime(newDepartureTime);
    setShowDatePicker(false);
  };

  const handleTimeConfirm = (params: { hours: number; minutes: number }) => {
    const { hours, minutes } = params;
    const newDepartureTime = new Date(departureTime);
    newDepartureTime.setHours(hours);
    newDepartureTime.setMinutes(minutes);
    newDepartureTime.setSeconds(0);
    newDepartureTime.setMilliseconds(0);
    setDepartureTime(newDepartureTime);
    setShowTimePicker(false);
  };

  const openDatePicker = () => setShowDatePicker(true);
  const openTimePicker = () => setShowTimePicker(true);

  const openMapPicker = (mode: "start" | "end") => {
    setMapMode(mode);
    const currentLocation = mode === "start" ? startLocation : endLocation;
    if (currentLocation) {
      setMapInitialRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01, // Zoom in a bit for already picked location
        longitudeDelta: 0.01,
      });
    } else {
      setMapInitialRegion(DEFAULT_MAP_REGION);
    }
    setIsMapModalVisible(true);
  };

  const handleLocationSelected = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    if (mapMode === "start") {
      setStartLocation(location);
    } else if (mapMode === "end") {
      setEndLocation(location);
    }
    setIsMapModalVisible(false);
    setMapMode(null);
  };

  const handleCreateRide = async () => {
    if (!startLocation || !endLocation || !availableSeats || !pricePerSeat) {
      Alert.alert(
        "Error",
        "Please select start and end locations, and fill all required fields."
      );
      return;
    }
    if (new Date(departureTime) < new Date()) {
      Alert.alert("Error", "Departure time cannot be in the past.");
      return;
    }

    setLoading(true);
    try {
      const rideData = {
        startLocation: {
          address: startLocation.address,
          coordinates: [startLocation.longitude, startLocation.latitude],
        },
        endLocation: {
          address: endLocation.address,
          coordinates: [endLocation.longitude, endLocation.latitude],
        },
        departureTime: departureTime.toISOString(),
        availableSeats: parseInt(availableSeats),
        pricePerSeat: parseFloat(pricePerSeat),
        notes,
      };
      await createRide(rideData);
      Alert.alert("Success", "Ride created successfully!");
      router.replace("/(tabs)/rides/my-offered");
    } catch (error) {
      Alert.alert("Creation Failed", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Offer a New Ride" }} />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <LoadingOverlay visible={loading} />

        <TouchableOpacity
          style={styles.locationPickerButton}
          onPress={() => openMapPicker("start")}
        >
          <Text
            style={styles.locationPickerText}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {startLocation
              ? `Start: ${startLocation.address}`
              : "Select Start Location on Map"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.locationPickerButton}
          onPress={() => openMapPicker("end")}
        >
          <Text
            style={styles.locationPickerText}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {endLocation
              ? `End: ${endLocation.address}`
              : "Select End Location on Map"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openDatePicker}
          style={styles.datePickerButton}
        >
          <View style={styles.pickerRow}>
            <Ionicons name="calendar" size={20} color={COLORS.primary} />
            <Text style={styles.datePickerButtonText}>
              Departure Date: {departureTime.toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={openTimePicker}
          style={styles.datePickerButton}
        >
          <View style={styles.pickerRow}>
            <Ionicons name="time" size={20} color={COLORS.primary} />
            <Text style={styles.datePickerButtonText}>
              Departure Time:{" "}
              {departureTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </Text>
          </View>
        </TouchableOpacity>

        {showDatePicker && (
          <DatePickerModal
            locale="en"
            mode="single"
            visible={showDatePicker}
            onDismiss={() => setShowDatePicker(false)}
            date={departureTime}
            onConfirm={handleDateConfirm as any}
          />
        )}

        {showTimePicker && (
          <TimePickerModal
            locale="en"
            visible={showTimePicker}
            onDismiss={() => setShowTimePicker(false)}
            onConfirm={handleTimeConfirm}
          />
        )}

        <AppTextInput
          label="Available Seats"
          value={availableSeats}
          onChangeText={setAvailableSeats}
          keyboardType="number-pad"
          error=""
        />
        <AppTextInput
          label="Price Per Seat (INR)"
          value={pricePerSeat}
          onChangeText={setPricePerSeat}
          keyboardType="numeric"
          error=""
        />
        <AppTextInput
          label="Notes (Optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="Any additional notes..."
          error=""
        />
        <AppButton
          title="Create Ride"
          onPress={handleCreateRide}
          loading={loading}
          style={{}}
          textStyle={{}}
          disabled={false}
        />
        <View style={{ height: 50 }} />
      </ScrollView>

      <MapPickerModal
        isVisible={isMapModalVisible}
        onClose={() => setIsMapModalVisible(false)}
        onLocationSelect={handleLocationSelected}
        initialRegion={mapInitialRegion}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.light,
  },
  locationPickerButton: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: "center",
    marginVertical: 10,
    minHeight: 50, // Ensure enough height for text
    justifyContent: "center",
  },
  locationPickerText: {
    color: COLORS.primary,
    fontSize: 16,
    textAlign: "center",
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: COLORS.grey,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: COLORS.white,
    marginVertical: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  datePickerButtonText: {
    color: COLORS.dark,
    fontSize: 16,
    marginLeft: 10,
  },
});

export default CreateRideScreen;
