import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext'; // Adjusted
import { updateUserProfile, getUserProfile } from '../../../services/userService'; // Adjusted path for getUserProfile
import AppTextInput from '../../../components/UI/AppTextInput'; // Adjusted
import AppButton from '../../../components/UI/AppButton'; // Adjusted
import LoadingOverlay from '../../../components/UI/LoadingOverlay'; // Adjusted
import { COLORS } from '../../../constants/colors'; // Adjusted
import { getErrorMessage } from '../../../utils/helpers'; // Adjusted

const EditProfileScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user: contextUser, token, updateUserContext } = useAuth(); // token from context isn't needed for API call due to Axios global header
  
  // Initialize state with empty values or from contextUser if no specific user is fetched
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [role, setRole] = useState('rider');
  const [vehicleDetails, setVehicleDetails] = useState({
    type: 'motorbike', registrationNumber: '', licenseNumber: '', model: '',
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // For fetching user data

  // Fetch user data if userId is passed, otherwise use context user
  useEffect(() => {
    const loadProfile = async () => {
      setInitialLoading(true);
      let currentUserData = contextUser;
      if (params.userId && params.userId !== contextUser?._id) { // If viewing/editing another (admin feature?) or just to be safe
        try {
          // Note: Typically, users only edit their own profile.
          // This might be an admin feature or params.userId is just the current user's ID passed for consistency.
          // We rely on backend authorization to prevent unauthorized edits.
          // For this screen, we'll assume it's the logged-in user's profile.
          // So, fetching via getMe() or using contextUser is usually enough.
          // For this example, let's assume it's always the logged-in user.
          currentUserData = contextUser; // Or fetch fresh data: await getMe();
        } catch (error) {
          Alert.alert("Error", "Could not load profile data.");
          currentUserData = contextUser; // Fallback
        }
      } else {
         currentUserData = contextUser;
      }

      if (currentUserData) {
        setName(currentUserData.name || '');
        setPhone(currentUserData.phone || '');
        setProfilePictureUrl(currentUserData.profilePictureUrl || '');
        setRole(currentUserData.role || 'rider');
        setVehicleDetails(currentUserData.vehicleDetails || { type: 'motorbike', registrationNumber: '', licenseNumber: '', model: '' });
      }
      setInitialLoading(false);
    };

    loadProfile();
  }, [params.userId, contextUser]);


  const handleUpdate = async () => {
    setLoading(true);
    const updatedData = { name, phone, profilePictureUrl, role };

    if (password) {
      updatedData.password = password;
    }
    if (role === 'driver' || role === 'both') {
      if (!vehicleDetails.registrationNumber || !vehicleDetails.licenseNumber) {
        Alert.alert("Error", "Vehicle registration and license number are required for drivers.");
        setLoading(false);
        return;
      }
      updatedData.vehicleDetails = vehicleDetails;
    } else if (role === 'rider') {
        updatedData.vehicleDetails = null; 
    }

    try {
      const response = await updateUserProfile(updatedData); // backend returns full user obj + token
      // The AuthContext's updateUserContext should handle stripping the token before setting user state
      updateUserContext(response); // Pass the raw response from backend
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (error) {
      Alert.alert('Update Failed', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingOverlay visible={true} text="Loading profile..." />;
  }

  return (
    <>
    <Stack.Screen options={{ title: 'Edit Profile' }} />
    <ScrollView style={styles.container}>
      <LoadingOverlay visible={loading} />
      <Text style={styles.title}>Edit Profile</Text>

      <AppTextInput label="Full Name" value={name} onChangeText={setName} />
      <AppTextInput label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <AppTextInput label="Profile Picture URL" value={profilePictureUrl} onChangeText={setProfilePictureUrl} />
      <AppTextInput label="New Password (optional)" value={password} onChangeText={setPassword} secureTextEntry placeholder="Leave blank to keep current" />

      <View style={styles.roleSelector}>
        <Text style={styles.label}>Role:</Text>
        <View style={styles.roleButtons}>
          {["rider", "driver", "both"].map((r) => (
            <AppButton
              key={r}
              title={r.charAt(0).toUpperCase() + r.slice(1)}
              onPress={() => setRole(r)}
              style={[styles.roleButton, role === r && styles.roleButtonSelected]}
              textStyle={[styles.roleButtonText, role === r && styles.roleButtonTextSelected]}
              color={role === r ? "primary" : "lightGrey"}
            />
          ))}
        </View>
      </View>

      {(role === 'driver' || role === 'both') && (
        <View style={styles.vehicleSection}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          <AppTextInput
            label="Vehicle Type (motorbike/scooter)"
            value={vehicleDetails.type}
            onChangeText={(text) => setVehicleDetails((prev) => ({ ...prev, type: text }))}
          />
          <AppTextInput
            label="Registration Number"
            value={vehicleDetails.registrationNumber}
            onChangeText={(text) => setVehicleDetails((prev) => ({ ...prev, registrationNumber: text }))}
          />
          <AppTextInput
            label="License Number"
            value={vehicleDetails.licenseNumber}
            onChangeText={(text) => setVehicleDetails((prev) => ({ ...prev, licenseNumber: text }))}
          />
          <AppTextInput
            label="Model"
            value={vehicleDetails.model}
            onChangeText={(text) => setVehicleDetails((prev) => ({ ...prev, model: text }))}
          />
        </View>
      )}

      <AppButton title="Save Changes" onPress={handleUpdate} loading={loading} />
      <View style={{ height: 50}} />
    </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.light,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: COLORS.dark,
  },
  roleSelector: {
    marginVertical: 15,
  },
  roleButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roleButton: {
     flex: 1, marginHorizontal: 2,
  },
  roleButtonSelected: { /* Style applied by AppButton color prop */ },
  roleButtonText: { /* Style applied by AppButton textStyle prop if needed */ },
  roleButtonTextSelected: { /* Style applied by AppButton textStyle prop if needed */ },
  vehicleSection: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGrey,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.primary,
  },
});

export default EditProfileScreen;
