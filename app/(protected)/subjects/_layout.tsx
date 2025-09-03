import { Stack} from 'expo-router';


export default function SubjectsLayout() {
  // const insets = useSafeAreaInsets();

  return (
    <Stack
      screenOptions={{
      }}>
      {/* <Stack.Screen
        name="comprehensive-test"
         options={{
          // headerShown: false,
          header: () => (
            <CustomHeader
              title="Comprehensive Test"
              showBack
            />
          ),
          // headerTransparent: true,
          // headerBackground: () => <HeaderBlurView height={insets.top + 60} />,
          
        }}
      /> */}
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
