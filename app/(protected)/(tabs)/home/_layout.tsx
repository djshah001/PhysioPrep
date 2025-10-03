import { Stack, useRouter } from 'expo-router';
// import { BlurView } from 'expo-blur';
import { View, Text, Pressable } from 'react-native';
import { Colors } from 'constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Header = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top }}>
      <View
        // intensity={40}
        // tint="dark"
        // experimentalBlurMethod="dimezisBlurView"
        className="">
        <View className="px-4 py-3 bg-white shadow-xl shadow-slate-700">
          <View className="flex-row items-center justify-between">
            <Pressable onPress={() => router.push('/')} className="flex-row items-center space-x-2 gap-2">
              <Ionicons name="logo-react" size={24} color={Colors.primary} />
              <Text className="text-2xl font-bold" style={{ color: Colors.primary }}>
                PhysioPrep
              </Text>
            </Pressable>
            {/* <View className="flex-row items-center space-x-4 gap-2">
              <Pressable
                onPress={() => router.push('/notifications')}
                className="rounded-full bg-primary/10 p-2">
                <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
              </Pressable>
              <Pressable
                onPress={() => router.push('/settings')}
                className="rounded-full bg-primary/10 p-2">
                <Ionicons name="settings-outline" size={24} color={Colors.primary} />
              </Pressable>
            </View> */}
          </View>
        </View>
      </View>
    </View>
  );
};

const HomeLayout = () => {
  const insets = useSafeAreaInsets();

  return (
    <Stack
      screenOptions={{
        header: () => <Header />,
        headerShadowVisible: true,
      }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          // headerBackground: () => (
          //   <BlurView
          //     intensity={40}
          //     tint="dark"
          //     experimentalBlurMethod="dimezisBlurView"
          //     className="overflow-hidden">
          //     <View style={{ height: insets.top + 60 }} />
          //   </BlurView>
          // ),
        }}
      />
    </Stack>
  );
};

export default HomeLayout;
