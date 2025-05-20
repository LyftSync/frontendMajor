import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors'; // Adjusted path

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.grey,
        headerShown: false, // Stack navigators within tabs will manage their own headers
      }}>
      <Tabs.Screen
        name="index" // Corresponds to app/(tabs)/index.tsx
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rides" // Corresponds to app/(tabs)/rides/_layout.tsx
        options={{
          title: 'Rides',
          tabBarIcon: ({ color, size }) => <Ionicons name="car-sport" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings" // Corresponds to app/(tabs)/bookings/_layout.tsx
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => <Ionicons name="list-circle" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile" // Corresponds to app/(tabs)/profile/_layout.tsx
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
