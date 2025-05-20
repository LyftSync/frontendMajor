import { Stack } from 'expo-router';
import React from 'react';

export default function BookingStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'My Bookings' }} />
      {/* If you have a specific booking detail screen */}
      {/* <Stack.Screen name="[bookingId]" options={{ title: 'Booking Details' }} /> */}
      {/* Screens pushed onto this stack, e.g., Ride Details from a booking */}
      <Stack.Screen 
        name="ride-detail/[rideId]" // Path to ride detail from a booking
        options={{ title: 'Ride Details' }} 
      /> 
       <Stack.Screen 
        name="user-profile/[userId]" 
        options={{ title: 'User Profile' }} 
      />
      <Stack.Screen 
        name="add-review" // Example: path could be /bookings/add-review?rideId=123&revieweeId=456
        options={{ title: 'Leave a Review' }} 
      />
    </Stack>
  );
}
