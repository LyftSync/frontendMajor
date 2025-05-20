import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { createRide } from "../../../services/rideService"; 
import AppTextInput from "../../../components/UI/AppTextInput"; 
import AppButton from "../../../components/UI/AppButton"; 
import LoadingOverlay from "../../../components/UI/LoadingOverlay"; 
import { COLORS } from "../../../constants/colors"; 
import { getErrorMessage } from "../../../utils/helpers"; 
import MapPickerModal from "../../../components/map/MapPickerModal";
import { DEFAULT_MAP_REGION } from "../../../constants/mapConstants"; // Updated import

const CreateRideScreen = () => {
  const router = useRouter();
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  
  const [departureTime, setDepartureTime] = useState(
    new Date(Date.now() + 60 * 60 * 1000), 
  );
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  const [availableSeats, setAvailableSeats] = useState("1");
  const [pricePerSeat, setPricePerSeat] = useState("0");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [mapMode, setMapMode] = useState<'start' | 'end' | null>(null);
  const [mapInitialRegion, setMapInitialRegion] = useState(DEFAULT_MAP_REGION);


  const onDateTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false); 
    if (event.type === "set" && selectedDate) {
      const currentSelectedDate = selectedDate;
      if (pickerMode === 'date') {
        const newDepartureTime = new Date(departureTime);
        newDepartureTime.setFullYear(currentSelectedDate.getFullYear());
        newDepartureTime.setMonth(currentSelectedDate.getMonth());
        newDepartureTime.setDate(currentSelectedDate.getDate());
        setDepartureTime(newDepartureTime);
      } else if (pickerMode === 'time') {
        const newDepartureTime = new Date(departureTime);
        newDepartureTime.setHours(currentSelectedDate.getHours());
        newDepartureTime.setMinutes(currentSelectedDate.getMinutes());
        newDepartureTime.setSeconds(0); 
        newDepartureTime.setMilliseconds(0);
        setDepartureTime(newDepartureTime);
      }
    }
  };
  
  const showDatePicker = () => {
    setPickerMode('date');
    setShowPicker(true);
  };

  const showTimePicker = () => {
    setPickerMode('time');
    setShowPicker(true);
  };

  const openMapPicker = (mode: 'start' | 'end') => {
    setMapMode(mode);
    const currentLocation = mode === 'start' ? startLocation : endLocation;
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

  const handleLocationSelected = (location: { latitude: number; longitude: number; address: string }) => {
    if (mapMode === 'start') {
      setStartLocation(location);
    } else if (mapMode === 'end') {
      setEndLocation(location);
    }
    setIsMapModalVisible(false);
    setMapMode(null);
  };

  const handleCreateRide = async () => {
    if (
      !startLocation ||
      !endLocation ||
      !availableSeats ||
      !pricePerSeat
    ) {
      Alert.alert(
        "Error",
        "Please select start and end locations, and fill all required fields.",
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
          coordinates: [
            startLocation.longitude,
            startLocation.latitude,
          ],
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
        
        <TouchableOpacity style={styles.locationPickerButton} onPress={() => openMapPicker('start')}>
          <Text style={styles.locationPickerText} numberOfLines={2} ellipsizeMode="tail">
            {startLocation ? `Start: ${startLocation.address}` : "Select Start Location on Map"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.locationPickerButton} onPress={() => openMapPicker('end')}>
          <Text style={styles.locationPickerText} numberOfLines={2} ellipsizeMode="tail">
            {endLocation ? `End: ${endLocation.address}` : "Select End Location on Map"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={showDatePicker} style={styles.datePickerButton}>
          <Text style={styles.datePickerButtonText}>
            Departure Date: {departureTime.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={showTimePicker} style={styles.datePickerButton}>
          <Text style={styles.datePickerButtonText}>
            Departure Time: {departureTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            })}
          </Text>
        </TouchableOpacity>
        
        {showPicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={departureTime}
            mode={pickerMode}
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateTimeChange}
            minimumDate={new Date()} 
          />
        )}

        <AppTextInput
          label="Available Seats"
          value={availableSeats}
          onChangeText={setAvailableSeats}
          keyboardType="number-pad"
        />
        <AppTextInput
          label="Price Per Seat (INR)"
          value={pricePerSeat}
          onChangeText={setPricePerSeat}
          keyboardType="number-pad"
        />
        <AppTextInput
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="e.g., Cash only, no pets"
        />
        <AppButton
          title="Create Ride"
          onPress={handleCreateRide}
          loading={loading}
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
    justifyContent: 'center',
  },
  locationPickerText: {
    color: COLORS.primary,
    fontSize: 16,
    textAlign: 'center',
  },
  datePickerButton: {
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 5,
  },
  datePickerButtonText: {
    color: COLORS.white,
    fontSize: 16,
  },
});

export default CreateRideScreen;
