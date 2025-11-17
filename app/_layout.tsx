import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
// import 'react-native-reanimated';

import { PaperProvider } from "react-native-paper";
import { COLORS } from "../constants/colors";
import { AuthProvider } from "../contexts/AuthContext";

// Assuming SpaceMono is still used by some template files if you keep them.
// If not, you can remove this font loading or replace with your own.
// import { useColorScheme } from '@/hooks/useColorScheme'; // From template, remove if not used.

export { ErrorBoundary } from "expo-router"; // Recommended for error handling

export const unstable_settings = {
  initialRouteName: "(tabs)", // Start with the tab navigator
};

import AuthGate from "../components/AuthGate";

function InnerLayout() {
  return (
    <AuthGate>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="+not-found" />
        {/* Example of a global modal, if you need one */}
        {/* <Stack.Screen name="some-modal" options={{ presentation: 'modal', title: 'My Modal' }} /> */}
      </Stack>
    </AuthGate>
  );
}

export default function RootLayout() {
  // const colorScheme = useColorScheme(); // From template, remove if not directly used for ThemeProvider
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"), // Keep or remove based on usage
    // Add any custom fonts your app uses here
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded && !error) {
    return null; // Or a custom splash screen component
  }

  // Using DefaultTheme, customize if needed or integrate your COLORS constant
  const currentTheme = DefaultTheme; // Replace with DarkTheme based on colorScheme if you implement it

  const paperTheme = {
    colors: {
      primary: COLORS.primary,
      accent: COLORS.secondary,
      background: COLORS.light,
      surface: COLORS.white,
      error: COLORS.danger,
      text: COLORS.dark,
      onSurface: COLORS.dark,
      disabled: COLORS.grey,
      placeholder: COLORS.grey,
      backdrop: "rgba(0,0,0,0.5)",
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <AuthProvider>
        <ThemeProvider value={currentTheme}>
          <InnerLayout />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
