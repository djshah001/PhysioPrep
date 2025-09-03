import { Stack } from 'expo-router';

// SplashScreen.preventAutoHideAsync();

export default function TopicIdLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="questions" />
      <Stack.Screen name="quiz" />
    </Stack>
  );
}
