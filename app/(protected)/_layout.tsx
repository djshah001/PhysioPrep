import { Stack } from 'expo-router';

// SplashScreen.preventAutoHideAsync();

export default function ProtectedLayout() {

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      {/* <Stack.Screen name="index" /> */}
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
