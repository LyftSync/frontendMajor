import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { getMyOfferedRides } from '../../../services/rideService'; // Adjusted
import LoadingOverlay from '../../../components/UI/LoadingOverlay'; // Adjusted
import { COLORS } from '../../../constants/colors'; // Adjusted
import { getErrorMessage, formatDate } from '../../../utils/helpers'; // Adjusted

// Placeholder RideCard - ideally, you create a reusable RideCard component
const OfferedRideCard = ({ item, onPressDetails, onPressBookings }) => (
  <View style={styles.rideCard}>
    <Text style={styles.rideCardTitle}>{item.startLocation.address} to {item.endLocation.address}</Text>
    <Text>Departure: {formatDate(item.departureTime)}</Text>
    <Text>Status: {item.status}</Text>
    <Text>Seats Available: {item.availableSeats}</Text>
    <Text>Passengers: {item.passengers?.length || 0}</Text>
    <View style={styles.buttonRow}>
        <TouchableOpacity onPress={onPressDetails} style={[styles.cardButton, {backgroundColor: COLORS.info}]}>
            <Text style={styles.cardButtonText}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressBookings} style={[styles.cardButton, {backgroundColor: COLORS.primary}]}>
            <Text style={styles.cardButtonText}>Bookings ({/* You might need to fetch booking count or pass it */}0)</Text>
        </TouchableOpacity>
    </View>
  </View>
);


const MyOfferedRidesScreen = () => {
  const router = useRouter();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyOfferedRides = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedRides = await getMyOfferedRides();
      setRides(fetchedRides);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(fetchMyOfferedRides);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyOfferedRides().finally(() => setRefreshing(false));
  }, [fetchMyOfferedRides]);

  if (loading && rides.length === 0 && !refreshing) {
    return <LoadingOverlay visible={true} text="Loading your rides..." />;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'My Offered Rides' }} />
      <View style={styles.container}>
        {rides.length === 0 && !loading ? (
          <Text style={styles.noRidesText}>You haven't offered any rides yet.</Text>
        ) : (
          <FlatList
            data={rides}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <OfferedRideCard 
                item={item} 
                onPressDetails={() => router.push(`/(tabs)/rides/${item._id}`)}
                onPressBookings={() => router.push(`/(tabs)/rides/${item._id}/bookings`)}
              />
            )}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ padding: 15 }}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  noRidesText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: COLORS.secondary,
  },
  rideCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
  },
  rideCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  cardButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  cardButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  }
});

export default MyOfferedRidesScreen;
