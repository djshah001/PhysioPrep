import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Profile'
        }}
      />
      {/* <Stack.Screen
        name="settings"
        options={{
          title: 'Settings'
        }}
      /> */}
      <Stack.Screen
        name="password"
        options={{
          title: 'Change Password'
        }}
      />
      <Stack.Screen
        name="stats"
        options={{
          title: 'Statistics'
        }}
      />
      <Stack.Screen
        name="delete"
        options={{
          title: 'Delete Account'
        }}
      />
    </Stack>
  );
} 