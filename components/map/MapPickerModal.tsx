import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { COLORS } from "../../constants/colors";
import {
  DEFAULT_MAP_REGION,
  NOMINATIM_BASE_URL,
  OSM_TILE_URL,
} from "../../constants/mapConstants";
import AppButton from "../UI/AppButton";

interface MapPickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

// Helper function to handle fetch and JSON parsing
async function fetchAndParseNominatim(url: string, operationName: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "LyftSyncApp/1.0 (anupamjain0x0@gmail.com)",
    },
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error(
      `Nominatim ${operationName} error: Status ${response.status}`
    );
    console.error(`Nominatim ${operationName} response: ${responseText}`);
    throw new Error(
      `Nominatim ${operationName} request failed with status ${response.status}`
    );
  }

  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.error(`Nominatim ${operationName} JSON Parse error:`, e);
    console.error(
      `Nominatim ${operationName} raw response that failed parsing: ${responseText}`
    );
    throw new Error(
      `Failed to parse Nominatim ${operationName} response as JSON.`
    );
  }
}

const MapPickerModal: React.FC<MapPickerModalProps> = ({
  isVisible,
  onClose,
  onLocationSelect,
  initialRegion,
}) => {
  const [region, setRegion] = useState(initialRegion || DEFAULT_MAP_REGION);
  const [markerCoordinate, setMarkerCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const mapRef = useRef<MapView>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRequestTimeRef = useRef<number>(0); // For simple rate limiting

  // Simple delay function
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    if (isVisible) {
      if (initialRegion) {
        setRegion(initialRegion);
        setMarkerCoordinate({
          latitude: initialRegion.latitude,
          longitude: initialRegion.longitude,
        });
        reverseGeocodeNominatim(
          initialRegion.latitude,
          initialRegion.longitude
        );
      } else {
        setMarkerCoordinate(null);
        setSelectedAddress("");
        setSearchQuery("");
        setSearchResults([]);
        setRegion(DEFAULT_MAP_REGION);
      }
    }
  }, [isVisible, initialRegion]);

  const ensureRateLimit = async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;
    if (timeSinceLastRequest < 1100) {
      // Slightly more than 1 second
      await delay(1100 - timeSinceLastRequest);
    }
    lastRequestTimeRef.current = Date.now();
  };

  const reverseGeocodeNominatim = async (
    latitude: number,
    longitude: number
  ) => {
    setLoading(true);
    try {
      await ensureRateLimit();
      const url = `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`;
      const data = await fetchAndParseNominatim(url, "Reverse Geocoding");

      if (data && data.display_name) {
        setSelectedAddress(data.display_name);
      } else {
        setSelectedAddress("Address not found");
        console.warn(
          "Nominatim reverse geocoding failed (no display_name):",
          data
        );
      }
    } catch (error) {
      console.error("Nominatim reverse geocoding process error:", error);
      setSelectedAddress("Error fetching address");
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerCoordinate({ latitude, longitude });
    reverseGeocodeNominatim(latitude, longitude);
    setSearchQuery("");
    setSearchResults([]);
    Keyboard.dismiss();
  };

  const handleSearchNominatim = async (text: string) => {
    setSearchQuery(text);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    setIsDebouncing(true);

    debounceTimeoutRef.current = setTimeout(async () => {
      setIsDebouncing(false);
      if (text.length < 3) {
        setSearchResults([]);
        return;
      }
      setLoading(true);
      try {
        await ensureRateLimit();
        const url = `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(
          text
        )}&format=json&addressdetails=1&limit=5&countrycodes=IN&accept-language=en`;
        const data = await fetchAndParseNominatim(url, "Search");

        if (data && Array.isArray(data)) {
          setSearchResults(data);
        } else {
          setSearchResults([]);
          console.warn("Nominatim search failed or returned no results:", data);
        }
      } catch (error) {
        console.error("Nominatim search process error:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 1200); // Increased debounce slightly
  };

  const handleSelectSearchResultNominatim = (place: any) => {
    // No API call here, just using data from search results
    Keyboard.dismiss();
    setSearchQuery(place.display_name);
    setSelectedAddress(place.display_name);
    setSearchResults([]);

    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    if (!isNaN(lat) && !isNaN(lon)) {
      setMarkerCoordinate({ latitude: lat, longitude: lon });
      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    } else {
      Alert.alert("Error", "Could not get coordinates for the selected place.");
    }
  };

  const confirmLocation = () => {
    if (markerCoordinate && selectedAddress) {
      onLocationSelect({ ...markerCoordinate, address: selectedAddress });
      onClose();
    } else {
      Alert.alert(
        "Error",
        "Please select a location on the map or search for an address."
      );
    }
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to use this feature."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setMarkerCoordinate({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      reverseGeocodeNominatim(latitude, longitude);
      setSearchQuery("");
      setSearchResults([]);
      Keyboard.dismiss();
    } catch (error) {
      Alert.alert("Error", "Unable to get current location. Please try again.");
      console.error("Location error:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Location</Text>
          <TouchableOpacity
            onPress={getCurrentLocation}
            style={styles.locateButton}
            disabled={locationLoading}
          >
            <Ionicons
              name="location"
              size={24}
              color={locationLoading ? COLORS.grey : COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search address (e.g., Bombay Hospital, Indore)"
            value={searchQuery}
            onChangeText={handleSearchNominatim}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
            >
              <Ionicons name="close" size={20} color={COLORS.grey} />
            </TouchableOpacity>
          )}
        </View>
        {loading && searchResults.length === 0 && !isDebouncing && (
          <ActivityIndicator
            style={styles.listLoading}
            color={COLORS.primary}
          />
        )}

        {searchResults.length > 0 && (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.place_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelectSearchResultNominatim(item)}
              >
                <Text>{item.display_name}</Text>
              </TouchableOpacity>
            )}
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
          />
        )}

        <MapView
          ref={mapRef}
          style={styles.map}
          mapType="standard"
          initialRegion={region}
          onRegionChangeComplete={setRegion}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={true}
          urlTemplate={OSM_TILE_URL}
        >
          {markerCoordinate && (
            <Marker
              coordinate={markerCoordinate}
              draggable
              onDragEnd={(e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setMarkerCoordinate({ latitude, longitude });
                reverseGeocodeNominatim(latitude, longitude); // This can be frequent, ensure rate limit
              }}
            />
          )}
        </MapView>

        {selectedAddress ? (
          <Text style={styles.addressText}>Selected: {selectedAddress}</Text>
        ) : (
          <Text style={styles.addressText}>
            Tap on map or search to select location
          </Text>
        )}
        {loading && markerCoordinate && (
          <ActivityIndicator
            style={{ marginVertical: 5 }}
            color={COLORS.primary}
          />
        )}
        {locationLoading && (
          <ActivityIndicator
            style={{ marginVertical: 5 }}
            color={COLORS.primary}
          />
        )}

        <Text style={styles.osmAttribution}>
          Map data © OpenStreetMap contributors
        </Text>
        <AppButton
          title="Confirm Location"
          onPress={confirmLocation}
          style={styles.confirmButton}
          textStyle={{}}
          disabled={false}
          loading={false}
        />
      </View>
    </Modal>
  );
};

// Styles remain the same as your previous version
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
    zIndex: 100,
    justifyContent: "space-between",
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.dark,
  },
  locateButton: {
    padding: 5,
  },
  searchContainer: {
    position: "relative",
  },
  searchInput: {
    height: 45,
    borderColor: COLORS.grey,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingRight: 40, // Make room for the clear button
    backgroundColor: COLORS.white,
  },
  clearButton: {
    position: "absolute",
    right: 10,
    top: 8,
    padding: 5,
  },
  map: {
    flex: 1,
  },
  addressText: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    textAlign: "center",
    backgroundColor: COLORS.light,
    fontSize: 14,
    color: COLORS.dark,
  },
  confirmButton: {
    marginHorizontal: 10,
    marginBottom: 10,
    marginTop: 5,
  },
  resultsList: {
    maxHeight: 150,
    backgroundColor: COLORS.white,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
    position: "absolute",
    top: 115, // Adjust as per your layout (header + search input height)
    left: 0,
    right: 0,
    zIndex: 10,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  listLoading: {
    marginVertical: 10,
  },
  osmAttribution: {
    fontSize: 10,
    textAlign: "center",
    paddingVertical: 5,
    backgroundColor: COLORS.light,
    color: COLORS.secondary,
  },
});

export default MapPickerModal;
