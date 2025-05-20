import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { getMyBookingRequests, updateBookingStatus } from '../../../services/bookingService'; // Adjusted
import LoadingOverlay from '../../../components/UI/LoadingOverlay'; // Adjusted
import AppButton from '../../../components/UI/AppButton'; // Adjusted
import { COLORS } from '../../../constants/colors'; // Adjusted
import { getErrorMessage, formatDate } from '../../../utils/helpers'; // Adjusted

const BookingCard = ({ item, onCancel, viewRide, viewDriver }) => (
    <View style={styles.bookingCard}>
        <Text style={styles.rideInfo}>
            Ride: {item.ride.startLocation.address} to {item.ride.endLocation.address}
        </Text>
        <Text>Driver: {item.ride.driver.name}</Text>
        <Text>Departure: {formatDate(item.ride.departureTime)}</Text>
        <Text>Requested Seats: {item.requestedSeats}</Text>
        <Text>Status: <Text style={styles.statusText(item.status)}>{item.status}</Text></Text>
        
        <View style={styles.buttonRow}>
            <AppButton title="View Ride" onPress={() => viewRide(item.ride._id)} color="info" style={styles.smallButton}/>
            {['pending', 'accepted'].includes(item.status) && (
                 <AppButton title="Cancel Booking" onPress={() => onCancel(item._id)} color="danger" style={styles.smallButton}/>
            )}
        </View>
    </View>
);


const MyBookingsScreen = () => {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchMyBookings = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedBookings = await getMyBookingRequests();
      setBookings(fetchedBookings);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(fetchMyBookings);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyBookings().finally(() => setRefreshing(false));
  }, [fetchMyBookings]);

  const handleCancelBooking = async (bookingId) => {
    setActionLoading(bookingId);
    try {
        await updateBookingStatus(bookingId, 'cancelled_by_rider');
        Alert.alert('Success', 'Booking cancelled.');
        fetchMyBookings(); // Refresh
    } catch (error) {
        Alert.alert('Cancellation Failed', getErrorMessage(error));
    } finally {
        setActionLoading(null);
    }
  };

  if (loading && bookings.length === 0 && !refreshing) {
    return <LoadingOverlay visible={true} text="Loading your bookings..." />;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'My Bookings' }} />
      <View style={styles.container}>
        {bookings.length === 0 && !loading ? (
          <Text style={styles.noBookingsText}>You have no active or pending bookings.</Text>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <BookingCard 
                item={item} 
                onCancel={handleCancelBooking}
                viewRide={(rideId) => router.push(`/(tabs)/bookings/ride-detail/${rideId}`)} // Path for ride detail from booking
                // viewDriver={(driverId) => router.push(`/(tabs)/bookings/user-profile/${driverId}`)} // Path for user profile from booking
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
  noBookingsText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: COLORS.secondary,
  },
  bookingCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
  },
  rideInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  statusText: (status) => ({
    fontWeight: 'bold',
    color: status === 'pending' ? COLORS.warning :
           status === 'accepted' ? COLORS.success :
           status.includes('reject') || status.includes('cancel') ? COLORS.danger : 
           status === 'completed' ? COLORS.info : COLORS.dark,
  }),
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Changed to space-around for better spacing
    marginTop: 10,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 10, // Adjusted for potentially longer text
    marginHorizontal: 5,
    flex: 1, // Make buttons take equal width in the row
  }
});

export default MyBookingsScreen;
