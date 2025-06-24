import { Stack } from 'expo-router';
import { CustomHeader } from '~/common/CustomHeader';

const IdLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="add-question"
        options={{
          headerShown: true,
          header: () => <CustomHeader title="Add Question" showBack />,
        }}
      />
      <Stack.Screen
        name="add-quiz"
        options={{
          headerShown: true,
          header: () => <CustomHeader title="Add Quiz" showBack />,
        }}
      />
      <Stack.Screen
        name="questions"
        options={{
          headerShown: true,
          header: () => <CustomHeader title="All Questions" showBack  />,
        }}
      />
    </Stack>
  );
};

export default IdLayout;
