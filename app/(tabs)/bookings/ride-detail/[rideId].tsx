import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { getRideById, updateRideStatus } from '../../../../services/rideService'; 
import { createBooking } from '../../../../services/bookingService'; 
import AppButton from '../../../../components/UI/AppButton'; 
import { COLORS } from '../../../../constants/colors'; 
import { getErrorMessage, formatDate } from '../../../../utils/helpers'; 
import { useAuth } from '../../../../contexts/AuthContext'; 
import { OSM_TILE_URL } from '../../../../constants/mapConstants';

const RideDetailScreenFromBookings = () => {
  const router = useRouter();
  const { rideId } = useLocalSearchParams();
  const { user } = useAuth();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRideDetails = useCallback(async () => {
    if (!rideId) return;
    setLoading(true);
    try {
      const data = await getRideById(rideId as string); // Cast rideId to string
      setRide(data);
    } catch (error) {
      Alert.alert('Error fetching ride', getErrorMessage(error));
      router.back(); 
    } finally {
      setLoading(false);
    }
  }, [rideId, router]);

  useEffect(() => {
    fetchRideDetails();
  }, [fetchRideDetails]);

  const handleBookRide = async () => {
    if (!user || !ride) return;
    setActionLoading(true);
    try {
      await createBooking(ride._id, { requestedSeats: 1 });
      Alert.alert('Success', 'Booking request sent!');
      fetchRideDetails(); 
    } catch (error) {
      Alert.alert('Booking Failed', getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };
  
  // Note: Drivers usually manage their rides from the 'My Offered Rides' screen.
  // Actions like 'updateRideStatus' might be less common from this booking-centric view,
  // but included for completeness if a driver views their own ride detail here.
  const handleUpdateRideStatus = async (newStatus: string) => {
    if (!user || !ride || ride.driver._id !== user._id) return;
    setActionLoading(true);
    try {
        await updateRideStatus(ride._id, newStatus);
        Alert.alert('Success', `Ride status updated to ${newStatus}`);
        fetchRideDetails(); 
    } catch (error) {
        Alert.alert('Status Update Failed', getErrorMessage(error));
    } finally {
        setActionLoading(false);
    }
  };

  const getMapRegion = () => {
    if (!ride || !ride.startLocation?.coordinates || !ride.endLocation?.coordinates) return null;
    const startLat = ride.startLocation.coordinates[1];
    const startLng = ride.startLocation.coordinates[0];
    const endLat = ride.endLocation.coordinates[1];
    const endLng = ride.endLocation.coordinates[0];

    const midLat = (startLat + endLat) / 2;
    const midLng = (startLng + endLng) / 2;

    const latDelta = Math.abs(startLat - endLat) * 1.8; 
    const lngDelta = Math.abs(startLng - endLng) * 1.8;

    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: Math.max(latDelta, 0.03), 
      longitudeDelta: Math.max(lngDelta, 0.03), 
    };
  };


  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1, justifyContent: 'center' }} />;
  }

  if (!ride) {
    return (
      <View style={styles.container}><Text>Ride not found.</Text></View>
    );
  }
  
  const isDriverOfThisRide = user && ride.driver._id === user._id;
  const canBook = user && !isDriverOfThisRide && ride.status === 'pending' && ride.availableSeats > 0;
  // Check if current user is a passenger who has booked this ride
  const isPassengerOfThisRide = user && ride.passengers?.some(p => p._id === user._id);


  return (
    <>
    <Stack.Screen options={{ title: 'Ride Details' }} />
    <ScrollView style={styles.container}>
      {ride.startLocation?.coordinates && ride.endLocation?.coordinates && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              urlTemplate={OSM_TILE_URL}
              initialRegion={getMapRegion()}
              showsUserLocation={false} 
            >
              <Marker
                coordinate={{ latitude: ride.startLocation.coordinates[1], longitude: ride.startLocation.coordinates[0] }}
                title="Start Location"
                description={ride.startLocation.address}
                pinColor={COLORS.success}
              />
              <Marker
                coordinate={{ latitude: ride.endLocation.coordinates[1], longitude: ride.endLocation.coordinates[0] }}
                title="End Location"
                description={ride.endLocation.address}
                pinColor={COLORS.primary}
              />
            </MapView>
            <Text style={styles.osmAttributionSmall}>Map data © OpenStreetMap contributors</Text>
          </View>
        )}

      <View style={styles.detailSection}>
        <Text style={styles.headerText}>{ride.startLocation?.address || 'N/A'} to {ride.endLocation?.address || 'N/A'}</Text>
        <TouchableOpacity onPress={() => router.push(`/(tabs)/bookings/user-profile/${ride.driver._id}`)}>
            <Text style={styles.driverLinkText}>Driver: {ride.driver.name}</Text>
        </TouchableOpacity>
        <Text style={styles.detailText}>Departure: {formatDate(ride.departureTime)}</Text>
        {ride.estimatedArrivalTime && <Text style={styles.detailText}>Est. Arrival: {formatDate(ride.estimatedArrivalTime)}</Text>}
        <Text style={styles.detailText}>Status: <Text style={styles.statusText(ride.status)}>{ride.status}</Text></Text>
        <Text style={styles.detailText}>Available Seats: {ride.availableSeats}</Text>
        <Text style={styles.detailText}>Price per Seat: IDR {ride.pricePerSeat}</Text>
        {ride.notes && <Text style={styles.detailText}>Notes: {ride.notes}</Text>}
      </View>

      {ride.passengers && ride.passengers.length > 0 && (
        <View style={styles.detailSection}>
            <Text style={styles.subHeaderText}>Passengers ({ride.passengers.length}):</Text>
            {ride.passengers.map(p => (
                <TouchableOpacity key={p._id} onPress={() => router.push(`/(tabs)/bookings/user-profile/${p._id}`)}>
                    <Text style={styles.passengerLinkText}>- {p.name}</Text>
                </TouchableOpacity>
            ))}
        </View>
      )}

      {canBook && (
        <AppButton title="Request to Book (1 Seat)" onPress={handleBookRide} loading={actionLoading} style={styles.actionButton}/>
      )}

      {/* Driver actions are less likely here but kept for consistency if needed */}
      {isDriverOfThisRide && ride.status === 'pending' && (
        <>
         <AppButton title="Start Ride" onPress={() => handleUpdateRideStatus('active')} loading={actionLoading} color="success" style={styles.actionButton}/>
         <AppButton title="Cancel Ride" onPress={() => handleUpdateRideStatus('cancelled_by_driver')} loading={actionLoading} color="danger" style={styles.actionButton}/>
         {/* Navigating to booking requests is usually done via My Offered Rides */}
        </>
      )}
      {isDriverOfThisRide && ride.status === 'active' && (
         <AppButton title="Complete Ride" onPress={() => handleUpdateRideStatus('completed')} loading={actionLoading} color="success" style={styles.actionButton}/>
      )}
      
      {ride.status === 'completed' && user && (isDriverOfThisRide || isPassengerOfThisRide) && (
        <AppButton 
            title="Leave a Review" 
            onPress={() => {
                let revieweeId, reviewType, revieweeName;
                if (isDriverOfThisRide) {
                    // Driver reviews a passenger
                    if (ride.passengers.length === 1) {
                        revieweeId = ride.passengers[0]._id;
                        revieweeName = ride.passengers[0].name;
                        reviewType = 'rider_review';
                         router.push({ pathname: '/(tabs)/bookings/add-review', params: { rideId: ride._id, revieweeId, reviewType, revieweeName }});
                    } else if (ride.passengers.length > 1) {
                        Alert.alert("Review Passenger", "Which passenger would you like to review?", [
                            ...ride.passengers.map(p => ({
                                text: p.name,
                                onPress: () => router.push({ pathname: '/(tabs)/bookings/add-review', params: { rideId: ride._id, revieweeId: p._id, reviewType: 'rider_review', revieweeName: p.name }})
                            })),
                            {text: "Cancel", style: "cancel"}
                        ]);
                    } else {
                        Alert.alert("Info", "No passengers on this ride to review.");
                    }
                } else if (isPassengerOfThisRide) {
                    // Passenger reviews the driver
                    revieweeId = ride.driver._id;
                    revieweeName = ride.driver.name;
                    reviewType = 'driver_review';
                     router.push({ pathname: '/(tabs)/bookings/add-review', params: { rideId: ride._id, revieweeId, reviewType, revieweeName }});
                }
            }} 
            color="warning" 
            style={styles.actionButton}
        />
      )}
      <View style={{height: 30}} />
    </ScrollView>
    </>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  mapContainer: {
    // No specific styling needed here unless you want borders etc.
  },
  map: {
    width: screenWidth,
    height: 220, 
  },
  osmAttributionSmall: {
    fontSize: 9,
    textAlign: 'center',
    paddingVertical: 3,
    backgroundColor: 'rgba(255,255,255,0.7)',
    color: COLORS.secondary,
  },
  detailSection: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  subHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 10,
    marginBottom: 5,
  },
  detailText: {
    fontSize: 16,
    color: COLORS.secondary,
    marginBottom: 5,
  },
  driverLinkText: {
    fontSize: 16,
    color: COLORS.info,
    textDecorationLine: 'underline',
    marginBottom: 5,
  },
  passengerLinkText: {
    fontSize: 15,
    color: COLORS.info,
    textDecorationLine: 'underline',
    marginLeft: 10,
    marginVertical: 2,
  },
  statusText: (status: string) => ({
    fontWeight: 'bold',
    color: status === 'pending' ? COLORS.warning :
           status === 'active' ? COLORS.info :
           status === 'completed' ? COLORS.success :
           status.includes('cancel') ? COLORS.danger : COLORS.dark,
  }),
  actionButton: {
    marginHorizontal: 20,
    marginTop: 10,
  }
});

export default RideDetailScreenFromBookings;
