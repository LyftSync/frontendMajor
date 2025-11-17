import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import AppButton from "../../components/UI/AppButton"; // Adjusted path
import AppTextInput from "../../components/UI/AppTextInput"; // Adjusted path
import LoadingOverlay from "../../components/UI/LoadingOverlay"; // Adjusted path
import { COLORS } from "../../constants/colors"; // Adjusted path
import { useAuth } from "../../contexts/AuthContext"; // Adjusted path
import { getErrorMessage } from "../../utils/helpers"; // Adjusted path

const LoginScreen = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await login(emailOrPhone, password);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Login Failed", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LoadingOverlay visible={loading} />
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Log in to continue with LyftSync</Text>

      <AppTextInput
        label="Email or Phone"
        value={emailOrPhone}
        onChangeText={setEmailOrPhone}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <AppTextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <AppButton title="Login" onPress={handleLogin} loading={loading} />
      <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
        <Text style={styles.switchText}>
          Don't have an account? <Text style={styles.switchLink}>Sign Up</Text>
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
    marginBottom: 30,
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

export default LoginScreen;
