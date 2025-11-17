import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
// import 'react-native-reanimated';

import { AuthProvider, useAuth } from "../contexts/AuthContext";
import LoadingOverlay from "../components/UI/LoadingOverlay";
// Assuming SpaceMono is still used by some template files if you keep them.
// If not, you can remove this font loading or replace with your own.
// import { useColorScheme } from '@/hooks/useColorScheme'; // From template, remove if not used.

export { ErrorBoundary } from "expo-router"; // Recommended for error handling

export const unstable_settings = {
	initialRouteName: "(tabs)", // Start with the tab navigator
};

function InnerLayout() {
	const { token, user, isLoading } = useAuth();
	const segments = useSegments();
	const router = useRouter();

	useEffect(() => {
		if (isLoading) return;

		const inAuthGroup = segments[0] === "(auth)";

		if (token && user && inAuthGroup) {
			router.replace("/(tabs)/"); // Redirect to home tab
		} else if ((!token || !user) && !inAuthGroup) {
			router.replace("/(auth)/login");
		}
	}, [token, user, isLoading, segments, router]);

	if (isLoading) {
		return <LoadingOverlay visible={true} text="Initializing..." />;
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="(tabs)" />
			<Stack.Screen name="(auth)" />
			<Stack.Screen name="+not-found" />
			{/* Example of a global modal, if you need one */}
			{/* <Stack.Screen name="some-modal" options={{ presentation: 'modal', title: 'My Modal' }} /> */}
		</Stack>
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

	return (
		<AuthProvider>
			<ThemeProvider value={currentTheme}>
				<InnerLayout />
				<StatusBar style="auto" />
			</ThemeProvider>
		</AuthProvider>
	);
}
