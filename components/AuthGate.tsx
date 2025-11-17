import { useRouter, useSegments } from "expo-router";
import React from "react";
import LoadingOverlay from "../components/UI/LoadingOverlay";
import { useAuth } from "../contexts/AuthContext";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { token, user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading) return;
    // Only run redirect logic after loading and when token/user are fully loaded (not null)
    const inAuthGroup = segments[0] === "(auth)";
    if (token !== null && user !== null) {
      if (inAuthGroup) {
        router.replace("/(tabs)");
      }
    } else if (token === null && user === null && !inAuthGroup) {
      router.replace("/(auth)/login");
    }
  }, [token, user, isLoading, segments, router]);

  if (isLoading) {
    return <LoadingOverlay visible={true} text="Initializing..." />;
  }
  return <>{children}</>;
}
