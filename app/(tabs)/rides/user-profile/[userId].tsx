import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image, RefreshControl } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { getUserProfile, getUserReviews } from '../../../../services/userService'; // Adjusted
import LoadingOverlay from '../../../../components/UI/LoadingOverlay'; // Adjusted
import ReviewCard from '../../../../components/ReviewCard'; // Adjusted
import { COLORS } from '../../../../constants/colors'; // Adjusted
import { getErrorMessage } from '../../../../utils/helpers'; // Adjusted
import { Ionicons } from '@expo/vector-icons';

const UserPublicProfileScreen = () => {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfileAndReviews = useCallback(async () => {
    if (!userId) {
        Alert.alert("Error", "User ID is missing.");
        router.back();
        return;
    }
    setLoading(true);
    try {
      const userProfile = await getUserProfile(userId);
      setProfile(userProfile);
      const userReviews = await getUserReviews(userId);
      setReviews(userReviews);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [userId, router]);

  useEffect(() => {
    fetchProfileAndReviews();
  }, [fetchProfileAndReviews]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfileAndReviews().finally(() => setRefreshing(false));
  }, [fetchProfileAndReviews]);

  if (loading && !refreshing && !profile) {
    return <LoadingOverlay visible={true} text="Loading profile..." />;
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'User Not Found' }} />
        <Text>User profile not found.</Text>
      </View>
    );
  }

  return (
    <>
    <Stack.Screen options={{ title: profile.name || 'User Profile' }} />
    <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Image
          source={profile.profilePictureUrl ? { uri: profile.profilePictureUrl } : require('../../../../assets/images/icon.png')}
          style={styles.avatar}
        />
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.role}>Role: {profile.role}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={20} color={COLORS.warning} />
          <Text style={styles.ratingText}>
            {profile.averageRating?.toFixed(1) || 'N/A'} ({profile.totalRatings || 0} ratings)
          </Text>
        </View>
        <Text style={styles.joinedDate}>Joined: {new Date(profile.createdAt).toLocaleDateString()}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.ridesOfferedCount || 0}</Text>
            <Text style={styles.statLabel}>Rides Offered</Text>
        </View>
        <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.ridesTakenCount || 0}</Text>
            <Text style={styles.statLabel}>Rides Taken</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reviews for {profile.name}</Text>
        {reviews.length > 0 ? (
          reviews.map(review => <ReviewCard key={review._id} review={review} />)
        ) : (
          <Text>No reviews yet for this user.</Text>
        )}
      </View>
       <View style={{ height: 30}} />
    </ScrollView>
    </>
  );
};
// Add Styles (similar to ProfileScreen styles, but adjust for public view)
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
    role: {
      fontSize: 16,
      color: COLORS.info,
      fontStyle: 'italic',
      marginBottom: 5,
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
    joinedDate: {
        fontSize: 14,
        color: COLORS.secondary,
        marginTop: 5,
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
  });

export default UserPublicProfileScreen;
