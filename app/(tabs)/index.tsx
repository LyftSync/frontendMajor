import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext'; // Adjusted
import { COLORS } from '../../constants/colors'; // Adjusted
import AppButton from '../../components/UI/AppButton'; // Adjusted

const HomeScreen = () => {
  const { user } = useAuth();
  const router = useRouter();
  const isDriver = user?.role === 'driver' || user?.role === 'both';
  const isRider = user?.role === 'rider' || user?.role === 'both';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome, {user?.name || 'User'}!</Text>
      <Text style={styles.subtitle}>What would you like to do today?</Text>

      {isRider && (
        <AppButton
          title="Find a Ride"
          onPress={() => router.push('/(tabs)/rides/search')}
          style={styles.button}
        />
      )}

      {isDriver && (
        <AppButton
          title="Offer a Ride"
          onPress={() => router.push('/(tabs)/rides/create')}
          style={styles.button}
        />
      )}
      
      {isDriver && (
         <AppButton
          title="My Offered Rides"
          onPress={() => router.push('/(tabs)/rides/my-offered')}
          style={styles.button}
        />
      )}

      {isRider && (
        <AppButton
          title="My Bookings"
          onPress={() => router.push('/(tabs)/bookings/')} // Navigates to bookings index
          style={styles.button}
        />
      )}
      
      <AppButton
          title="View My Profile"
          onPress={() => router.push('/(tabs)/profile/')} // Navigates to profile index
          style={styles.button}
          color="secondary"
        />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: COLORS.light,
    alignItems: 'center',
    justifyContent: 'center', // Added for better centering if content is short
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.secondary,
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    width: '90%', // Adjusted for better fit
    marginBottom: 15,
  },
});

export default HomeScreen;
