import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DatePickerModal } from "react-native-paper-dates";
import AppButton from "../../../components/UI/AppButton";
import AppTextInput from "../../../components/UI/AppTextInput";
import { COLORS } from "../../../constants/colors";
import { searchRides } from "../../../services/rideService";
import { formatDate, getErrorMessage } from "../../../utils/helpers";
// import RideCard from '../../../components/RideCard'; // Assuming you have a proper one
import { Ionicons } from "@expo/vector-icons";
import MapPickerModal from "../../../components/map/MapPickerModal"; // Import the modal
import { DEFAULT_MAP_REGION } from "../../../constants/mapConstants"; // Import default region

// RideCardPlaceholder remains the same from your previous version
const RideCardPlaceholder = ({
  item,
  onPress,
}: {
  item: any;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} style={styles.rideCard}>
    <Text style={styles.rideCardTitle}>
      {item.startLocation.address} to {item.endLocation.address}
    </Text>
    <Text>
      Driver: {item.driver?.name || "N/A"} (
      {item.driver?.averageRating?.toFixed(1) || "NR"})
    </Text>
    <Text>Departure: {formatDate(item.departureTime)}</Text>
    <Text>Seats: {item.availableSeats}</Text>
    <Text>Price: IDR {item.pricePerSeat}</Text>
  </TouchableOpacity>
);

const SearchRidesScreen = () => {
  const router = useRouter();

  // State for selected location from map picker
  const [fromLocation, setFromLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  const [toLocation, setToLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  // Kept for direct input/display, but map picker will be primary
  const [fromLatText, setFromLatText] = useState("");
  const [fromLngText, setFromLngText] = useState("");

  const [departureAfter, setDepartureAfter] = useState(new Date());
  const [seats, setSeats] = useState("1");

  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [mapInitialRegion, setMapInitialRegion] = useState(DEFAULT_MAP_REGION);
  const [isToMapModalVisible, setIsToMapModalVisible] = useState(false);
  const [toMapInitialRegion, setToMapInitialRegion] = useState(DEFAULT_MAP_REGION);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateConfirm = (params: { date: Date }) => {
    setDepartureAfter(params.date);
    setShowDatePicker(false);
  };

  // Update text inputs when fromLocation changes (e.g., after map selection)
  useEffect(() => {
    if (fromLocation) {
      setFromLatText(fromLocation.latitude.toString());
      setFromLngText(fromLocation.longitude.toString());
    } else {
      // Optionally clear or set to default if you want to allow manual input after clearing map selection
      // setFromLatText('');
      // setFromLngText('');
    }
  }, [fromLocation]);

  const handleSearch = async () => {
    setLoading(true);
    setRides([]);
    try {
      const params: any = {
        // Use 'any' temporarily for flexibility or define a proper type
        seats: parseInt(seats) || 1,
      };

      // Prioritize location selected from map
      if (fromLocation) {
        params.fromLat = fromLocation.latitude;
        params.fromLng = fromLocation.longitude;
      } else if (fromLatText && fromLngText) {
        // Fallback to manual text input if map not used
        const lat = parseFloat(fromLatText);
        const lng = parseFloat(fromLngText);
        if (!isNaN(lat) && !isNaN(lng)) {
          params.fromLat = lat;
          params.fromLng = lng;
        } else {
          // Optional: Alert user about invalid manual lat/lng or search without geo-filter
          // For now, it will search without fromLat/fromLng if manual inputs are invalid & no map selection
        }
      }

      if (toLocation) {
        params.toLat = toLocation.latitude;
        params.toLng = toLocation.longitude;
      }

      if (departureAfter) {
        const departureDateTime = new Date(departureAfter);
        if (!isNaN(departureDateTime.getTime())) {
          // Check if it's a valid date
          params.departureAfter = departureDateTime.toISOString();
        }
      }

      const results = await searchRides(params);
      setRides(results);
    } catch (error) {
      Alert.alert("Search Failed", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Auto-search on load for demonstration (using default or hardcoded initial values)
  useEffect(() => {
    // Example: Set an initial fromLocation for auto-search or leave null
    // setFromLocation({ latitude: 22.7196, longitude: 75.8577, address: "Indore (Default)"});
    // For this example, let's not set initial fromLocation, so first search might be broad
    handleSearch();
  }, []); // Empty dependency to run once on mount

  const openMapPickerForFromLocation = () => {
    if (fromLocation) {
      setMapInitialRegion({
        latitude: fromLocation.latitude,
        longitude: fromLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else if (fromLatText && fromLngText) {
      const lat = parseFloat(fromLatText);
      const lng = parseFloat(fromLngText);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapInitialRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } else {
        setMapInitialRegion(DEFAULT_MAP_REGION);
      }
    } else {
      setMapInitialRegion(DEFAULT_MAP_REGION);
    }
    setIsMapModalVisible(true);
  };

  const openMapPickerForToLocation = () => {
    if (toLocation) {
      setToMapInitialRegion({
        latitude: toLocation.latitude,
        longitude: toLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      setToMapInitialRegion(DEFAULT_MAP_REGION);
    }
    setIsToMapModalVisible(true);
  };

  const openFromMapPicker = () => {
    setMapInitialRegion(fromLocation ? {
      latitude: fromLocation.latitude,
      longitude: fromLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    } : DEFAULT_MAP_REGION);
    setIsMapModalVisible(true);
  };

  const openToMapPicker = () => {
    setToMapInitialRegion(toLocation ? {
      latitude: toLocation.latitude,
      longitude: toLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    } : DEFAULT_MAP_REGION);
    setIsToMapModalVisible(true);
  };

  const handleLocationSelected = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setFromLocation(location); // This will trigger the useEffect to update fromLatText and fromLngText
    setIsMapModalVisible(false);
    // Optionally trigger search immediately after location selection
    // handleSearch();
  };

  const handleToLocationSelected = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setToLocation(location);
    setIsToMapModalVisible(false);
  };

  const handleFromLocationSelected = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setFromLocation(location);
    setIsMapModalVisible(false);
  };

  return (
    <>
      <Stack.Screen options={{ title: "Find a Ride" }} />
      <View style={styles.container}>
        <View style={styles.searchForm}>
          <Text style={styles.formTitle}>Search Criteria</Text>

          <TouchableOpacity
            style={styles.locationPickerButton}
            onPress={openMapPickerForFromLocation}
          >
            <Text
              style={styles.locationPickerText}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {fromLocation
                ? `From: ${fromLocation.address}`
                : "Select Start Location on Map"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.locationPickerButton}
            onPress={openMapPickerForToLocation}
          >
            <Text
              style={styles.locationPickerText}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {toLocation
                ? `To: ${toLocation.address}`
                : "Select Destination on Map"}
            </Text>
          </TouchableOpacity>

          {/* Optional: Display/Allow manual override of Lat/Lng from map. Can be removed for cleaner UX. */}
          {/* 
          <AppTextInput 
            label="From Latitude (from map or manual)" 
            value={fromLatText} 
            onChangeText={(text) => { setFromLatText(text); setFromLocation(null); }} // Clear map selection if manually editing
            keyboardType="numeric" 
            placeholder="e.g., -6.2088" 
          />
          <AppTextInput 
            label="From Longitude (from map or manual)" 
            value={fromLngText} 
            onChangeText={(text) => { setFromLngText(text); setFromLocation(null); }} // Clear map selection
            keyboardType="numeric" 
            placeholder="e.g., 106.8456" 
          />
          */}

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.datePickerButton}
          >
            <View style={styles.pickerRow}>
              <Ionicons name="calendar" size={20} color={COLORS.primary} />
              <Text style={styles.datePickerButtonText}>
                Departure on or after: {departureAfter.toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>

          <AppTextInput
            label="Seats Required"
            value={seats}
            onChangeText={setSeats}
            keyboardType="number-pad"
            placeholder="1"
            error=""
          />
          <AppButton
            title="Search Rides"
            onPress={handleSearch}
            loading={loading}
            style={{}}
            textStyle={{}}
            disabled={false}
          />
        </View>

        {loading && rides.length === 0 && (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 20 }}
          />
        )}

        {!loading && rides.length === 0 && (
          <Text style={styles.noRidesText}>
            No rides found matching your criteria. Try adjusting your search.
          </Text>
        )}

        <FlatList
          data={rides}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <RideCardPlaceholder
              item={item}
              onPress={() => router.push(`/(tabs)/rides/${item._id}`)}
            />
          )}
          contentContainerStyle={styles.list}
        />

        {/* Date Picker Modal */}
        <DatePickerModal
          locale="en"
          mode="single"
          visible={showDatePicker}
          onDismiss={() => setShowDatePicker(false)}
          date={departureAfter}
          onConfirm={handleDateConfirm as any}
        />
      </View>

      <MapPickerModal
        isVisible={isMapModalVisible}
        onClose={() => setIsMapModalVisible(false)}
        onLocationSelect={handleLocationSelected}
        initialRegion={mapInitialRegion}
      />

      <MapPickerModal
        isVisible={isToMapModalVisible}
        onClose={() => setIsToMapModalVisible(false)}
        onLocationSelect={handleToLocationSelected}
        initialRegion={toMapInitialRegion}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  searchForm: {
    padding: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 10,
  },
  locationPickerButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: "center",
    marginVertical: 8, // Adjusted margin
    minHeight: 45, // Ensure enough height
    justifyContent: "center",
  },
  locationPickerText: {
    color: COLORS.primary,
    fontSize: 15, // Adjusted font size
    textAlign: "center",
  },
  list: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  noRidesText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: COLORS.secondary,
  },
  rideCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  rideCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 5,
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

export default SearchRidesScreen;
