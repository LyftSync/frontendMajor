import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { getRideBookings } from '../../../../services/rideService'; // Adjusted
import { updateBookingStatus } from '../../../../services/bookingService'; // Adjusted
import AppButton from '../../../../components/UI/AppButton'; // Adjusted
import { COLORS } from '../../../../constants/colors'; // Adjusted
import { getErrorMessage, formatDate } from '../../../../utils/helpers'; // Adjusted

const BookingRequestCard = ({ item, onAccept, onReject, viewRiderProfile }) => (
    <View style={styles.bookingCard}>
        <Text style={styles.riderName}>{item.rider.name}</Text>
        <Text>Requested Seats: {item.requestedSeats}</Text>
        <Text>Status: <Text style={styles.statusText(item.status)}>{item.status}</Text></Text>
        <Text>Booked: {formatDate(item.createdAt)}</Text>
        {item.status === 'pending' && (
            <View style={styles.actionButtons}>
                <AppButton title="Accept" onPress={() => onAccept(item._id)} color="success" style={styles.smallButton}/>
                <AppButton title="Reject" onPress={() => onReject(item._id)} color="danger" style={styles.smallButton}/>
            </View>
        )}
        {item.status === 'accepted' && (
             <AppButton title="Cancel (Reject)" onPress={() => onReject(item._id)} color="danger" style={styles.smallButton}/>
        )}
    </View>
);

const RideBookingsScreen = () => {
  const router = useRouter();
  const { rideId } = useLocalSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // To track loading for specific booking

  const fetchBookings = useCallback(async () => {
    if (!rideId) return;
    setLoading(true);
    try {
      const data = await getRideBookings(rideId);
      setBookings(data);
    } catch (error) {
      Alert.alert('Error fetching bookings', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [rideId]);

  useFocusEffect(fetchBookings);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setActionLoading(bookingId);
    try {
        await updateBookingStatus(bookingId, newStatus);
        Alert.alert('Success', `Booking ${newStatus.replace('_by_driver', '')} successfully.`);
        fetchBookings(); // Refresh list
    } catch (error) {
        Alert.alert('Update Failed', getErrorMessage(error));
    } finally {
        setActionLoading(null);
    }
  };


  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Booking Requests' }} />
      <View style={styles.container}>
        {bookings.length === 0 ? (
          <Text style={styles.noBookingsText}>No booking requests for this ride yet.</Text>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <BookingRequestCard 
                item={item}
                onAccept={(bookingId) => handleUpdateStatus(bookingId, 'accepted')}
                onReject={(bookingId) => handleUpdateStatus(bookingId, 'rejected_by_driver')}
                // viewRiderProfile={(riderId) => router.push(`/user-profile/${riderId}`)} // TODO: Implement this route
              />
            )}
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
  riderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  statusText: (status) => ({
    fontWeight: 'bold',
    color: status === 'pending' ? COLORS.warning :
           status === 'accepted' ? COLORS.success :
           status.includes('reject') || status.includes('cancel') ? COLORS.danger : COLORS.dark,
  }),
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
    flex: 1,
  }
});

export default RideBookingsScreen;
