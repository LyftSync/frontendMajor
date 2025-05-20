import { Stack } from 'expo-router';
import React from 'react';

export default function ProfileStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'My Profile' }} />
      <Stack.Screen name="edit" options={{ title: 'Edit Profile' }} />
      {/* Public profile for OTHER users would typically be a top-level dynamic route 
          or a modal. For simplicity, if it was meant for the current user's public view,
          it might be part of 'index', or you'd navigate to e.g. /user/[id] 
      */}
      {/* <Stack.Screen name="user-public-profile" options={{ title: 'User Profile Preview' }} /> */}
    </Stack>
  );
}
