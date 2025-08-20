import { Stack } from 'expo-router';

const IdLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default IdLayout;
