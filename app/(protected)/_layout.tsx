import { Stack } from 'expo-router';

// SplashScreen.preventAutoHideAsync();

export default function ProtectedLayout() {

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="subjects" />
      {/* <Stack.Screen name="daily-question" /> */}
      <Stack.Screen name="topics/[topicId]" />

    </Stack>
  );
}
