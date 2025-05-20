import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext"; // Adjusted
import AppTextInput from "../../components/UI/AppTextInput"; // Adjusted
import AppButton from "../../components/UI/AppButton"; // Adjusted
import LoadingOverlay from "../../components/UI/LoadingOverlay"; // Adjusted
import { COLORS } from "../../constants/colors"; // Adjusted
import { getErrorMessage } from "../../utils/helpers"; // Adjusted

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("rider"); 
  const [vehicleDetails, setVehicleDetails] = useState({
    type: "motorbike",
    registrationNumber: "",
    licenseNumber: "",
    model: "",
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    if ((role === "driver" || role === "both") && (!vehicleDetails.registrationNumber || !vehicleDetails.licenseNumber)) {
      Alert.alert("Error", "Vehicle registration and license number are required for drivers.");
      return;
    }

    setLoading(true);
    try {
      const userData = { name, email, phone, password, role };
      if (role === "driver" || role === "both") {
        userData.vehicleDetails = vehicleDetails;
      }
      await register(userData);
      // Navigation happens via RootLayout effect
    } catch (error) {
      Alert.alert("Registration Failed", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LoadingOverlay visible={loading} />
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join LyftSync today!</Text>

      <AppTextInput label="Full Name" value={name} onChangeText={setName} />
      <AppTextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <AppTextInput label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <AppTextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />

      <View style={styles.roleSelector}>
        <Text style={styles.roleLabel}>I want to be a:</Text>
        <View style={styles.roleButtons}>
          {["rider", "driver", "both"].map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.roleButton, role === r && styles.roleButtonSelected]}
              onPress={() => setRole(r)}
            >
              <Text style={[styles.roleButtonText, role === r && styles.roleButtonTextSelected]}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {(role === "driver" || role === "both") && (
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

      <AppButton title="Sign Up" onPress={handleRegister} loading={loading} />
      <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
        <Text style={styles.switchText}>
          Already have an account? <Text style={styles.switchLink}>Log In</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: COLORS.light,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondary,
    textAlign: "center",
    marginBottom: 20,
  },
  roleSelector: {
    marginVertical: 15,
  },
  roleLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: COLORS.dark,
  },
  roleButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.grey,
    borderRadius: 5,
  },
  roleButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleButtonText: {
    color: COLORS.dark,
  },
  roleButtonTextSelected: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
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
  switchText: {
    textAlign: "center",
    marginTop: 20,
    color: COLORS.dark,
  },
  switchLink: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
