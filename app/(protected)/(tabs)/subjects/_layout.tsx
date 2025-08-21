import { Stack} from 'expo-router';
import { CustomHeader } from 'components/common/CustomHeader';


export default function SubjectsLayout() {
  // const insets = useSafeAreaInsets();

  return (
    <Stack
      screenOptions={{
      }}>
      <Stack.Screen
        name="index"
        options={{
          // headerShown: false,
          header: () => (
            <CustomHeader
              title="Subjects"
            />
          ),
          // headerTransparent: true,
          // headerBackground: () => <HeaderBlurView height={insets.top + 60} />,
          
        }}
      />
      <Stack.Screen
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
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
