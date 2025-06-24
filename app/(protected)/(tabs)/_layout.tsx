import { Platform, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, usePathname } from 'expo-router';
import { Colors } from 'constants/Colors';

export default function TabsLayout() {
  const pathname = usePathname();
  const isIndexScreen =
    pathname === '/' ||
    pathname === '/home' ||
    pathname === '/subjects' ||
    pathname === '/explore' ||
    pathname === '/quiz' ||
    pathname === '/profile';

  // console.log(pathname);

  const CustomTabBar = ({ color, size, name }: { color: string; size: number; name: keyof typeof Ionicons.glyphMap }) => {
    return (
      <View className="flex-row items-center justify-center">
        {/* <Text>Custom Tab Bar</Text> */}
        <Ionicons name={name} size={size} color={color} />
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.grey,
        tabBarShowLabel: false,
        tabBarIconStyle: {
          // paddingTop: 10,
        },
        animation: 'shift',
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 20 : 15,
          left: 20,
          right: 20,
          borderRadius: 50,
          overflow: 'hidden',
          marginHorizontal: 20,
          backgroundColor: 'transparent',
          height: 65,
          display: isIndexScreen ? 'flex' : 'none',
          paddingHorizontal: 15,
          paddingTop: 6,
          borderWidth: 1,
          borderColor: Colors.secondary,
          elevation: 5,
          borderBottomLeftRadius: 30,
          borderTopRightRadius: 30,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={40}
            tint="dark"
            // experimentalBlurMethod={`${isIndexScreen ? 'dimezisBlurView' : 'none'}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 20,
            }}
          />
        ),
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <CustomTabBar color={color} size={size} name="home" />,
        }}
      />
      <Tabs.Screen
        name="subjects"
        options={{
          title: 'Subjects',
          tabBarIcon: ({ color, size }) => <CustomTabBar color={color} size={size} name="book" />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <CustomTabBar color={color} size={size} name="compass" />,
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'Quiz',
          tabBarIcon: ({ color, size }) => <CustomTabBar color={color} size={size} name="document-text" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <CustomTabBar color={color} size={size} name="person" />,
        }}
      />
    </Tabs>
  );
}
