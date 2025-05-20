import { Stack } from 'expo-router';
import React from 'react';
import { useAuth } from '../../../contexts/AuthContext'; // Adjusted

export default function RideStackLayout() {
  const { user } = useAuth();
  const isDriver = user?.role === 'driver' || user?.role === 'both';

  return (
    <Stack>
      <Stack.Screen name="search" options={{ title: 'Find a Ride' }} />
      {isDriver && <Stack.Screen name="create" options={{ title: 'Offer a Ride' }} />}
      {isDriver && <Stack.Screen name="my-offered" options={{ title: 'My Offered Rides' }} />}
      {/* Dynamic route for Ride Details */}
      <Stack.Screen name="[rideId]/index" options={{ title: 'Ride Details' }} />
      {/* Dynamic route for Bookings of a specific ride */}
      {isDriver && <Stack.Screen name="[rideId]/bookings" options={{ title: 'Ride Bookings' }} />}
      
      {/* Screens pushed onto the stack, like viewing a user profile from a ride, or adding a review */}
      {/* The actual UserPublicProfileScreen and AddReviewScreen will be top-level or differently organized */}
      <Stack.Screen 
        name="user-profile/[userId]"  // Example path for viewing user profile from this stack
        options={{ title: 'User Profile' }} 
      />
      <Stack.Screen 
        name="add-review" // Example: path could be /rides/add-review?rideId=123&revieweeId=456
        options={{ title: 'Leave a Review' }} 
      />
    </Stack>
  );
}
