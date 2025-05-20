import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter, Stack } from 'expo-router'; // Added Stack for header
import { useAuth } from '../../../contexts/AuthContext'; // Adjusted
import { getMe } from '../../../services/authService'; // Adjusted
import { getUserReviews } from '../../../services/userService'; // Adjusted
import AppButton from '../../../components/UI/AppButton'; // Adjusted
import LoadingOverlay from '../../../components/UI/LoadingOverlay'; // Adjusted
import ReviewCard from '../../../components/ReviewCard'; // Adjusted
import { COLORS } from '../../../constants/colors'; // Adjusted
import { getErrorMessage } from '../../../utils/helpers'; // Adjusted
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const { user, logout, updateUserContext } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(user);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfileAndReviews = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const freshUser = await getMe(); // Fetches complete user data from backend
      updateUserContext(freshUser); // Update context, AuthContext handles storing only profile fields
      setProfileData(freshUser); // Local state also updated

      const userReviews = await getUserReviews(user._id);
      setReviews(userReviews);
    } catch (error) {
      Alert.alert('Error fetching profile', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [user?._id, updateUserContext]); // Added updateUserContext to dependencies

  useFocusEffect(
    useCallback(() => {
      fetchProfileAndReviews();
    }, [fetchProfileAndReviews]) // Depend on the memoized fetchProfileAndReviews
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfileAndReviews();
    setRefreshing(false);
  }, [fetchProfileAndReviews]);

  if (loading && !refreshing && !profileData) { // Show loading only if no data yet
    return <LoadingOverlay visible={true} text="Loading profile..." />;
  }

  if (!profileData) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Profile Error" }} />
        <Text>No profile data found. Try logging in again.</Text>
        <AppButton title="Logout" onPress={logout} color="danger" />
      </View>
    );
  }

  return (
    <>
    <Stack.Screen options={{ title: 'My Profile' }} />
    <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Image
          source={profileData.profilePictureUrl ? { uri: profileData.profilePictureUrl } : require('../../../assets/images/icon.png')} // Adjusted path
          style={styles.avatar}
        />
        <Text style={styles.name}>{profileData.name}</Text>
        <Text style={styles.email}>{profileData.email}</Text>
        <Text style={styles.phone}>{profileData.phone}</Text>
        <Text style={styles.role}>Role: {profileData.role}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={20} color={COLORS.warning} />
          <Text style={styles.ratingText}>
            {profileData.averageRating?.toFixed(1) || 'N/A'} ({profileData.totalRatings || 0} ratings)
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
            <Text style={styles.statValue}>{profileData.ridesOfferedCount || 0}</Text>
            <Text style={styles.statLabel}>Rides Offered</Text>
        </View>
        <View style={styles.statItem}>
            <Text style={styles.statValue}>{profileData.ridesTakenCount || 0}</Text>
            <Text style={styles.statLabel}>Rides Taken</Text>
        </View>
      </View>

      {profileData.role !== 'rider' && profileData.vehicleDetails && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          <Text>Type: {profileData.vehicleDetails.type}</Text>
          <Text>Model: {profileData.vehicleDetails.model || 'N/A'}</Text>
          <Text>Registration: {profileData.vehicleDetails.registrationNumber}</Text>
          <Text>License: {profileData.vehicleDetails.licenseNumber}</Text>
        </View>
      )}

      <AppButton 
        title="Edit Profile" 
        onPress={() => router.push({ 
            pathname: '/(tabs)/profile/edit', 
            // Pass minimal data or just user ID and refetch in edit screen
            params: { userId: profileData._id } 
        })} 
        style={styles.button} 
      />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Reviews</Text>
        {reviews.length > 0 ? (
          reviews.map(review => <ReviewCard key={review._id} review={review} />)
        ) : (
          <Text>No reviews yet.</Text>
        )}
      </View>

      <AppButton title="Logout" onPress={logout} color="danger" style={styles.button} />
       <View style={{ height: 30}} />
    </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    backgroundColor: COLORS.lightGrey, 
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  email: {
    fontSize: 16,
    color: COLORS.secondary,
  },
  phone: {
    fontSize: 16,
    color: COLORS.secondary,
    marginBottom: 5,
  },
  role: {
    fontSize: 16,
    color: COLORS.info,
    fontStyle: 'italic',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
    color: COLORS.dark,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  section: {
    padding: 20,
    backgroundColor: COLORS.white,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.dark,
  },
  button: {
    marginHorizontal: 20,
    marginTop: 20,
  },
});

export default ProfileScreen;
