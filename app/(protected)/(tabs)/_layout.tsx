import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, usePathname } from 'expo-router';
import colors from 'tailwindcss/colors';
import Animated from 'react-native-reanimated';
import { CustomHeader } from '~/common/CustomHeader';

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

  const CustomTabBar = ({
    color,
    size,
    focused,
    name,
  }: {
    color: string;
    focused: boolean;
    size: number;
    name: keyof typeof Ionicons.glyphMap;
  }) => {
    return (
      <Animated.View
        className={`relative h-14 w-14 items-center justify-center ${focused ? 'bg-primary shadow-xl shadow-neutral-700' : ''} rounded-full`}>
        {/* Background circle for active state */}
        {/* <Animated.View
          style={[
            {
              position: 'absolute',
              width: 45,
              height: 45,
              borderRadius: 50,
              backgroundColor: Colors.primary,
            }
          ]}
        /> */}
        {/* Icon */}
        <Ionicons name={name} size={24} color={color} />
      </Animated.View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.blue[400],
        tabBarShowLabel: false,
        tabBarIconStyle: {},
        animation: 'shift',
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 20 : 15,
          left: 20,
          right: 20,
          borderRadius: 50,
          overflow: 'hidden',
          marginHorizontal: 20,
          // backgroundColor: Colors.primary,
          height: 65,
          display: isIndexScreen ? 'flex' : 'none',
          paddingHorizontal: 15,
          paddingTop: 4,
          borderWidth: 0,
          boxShadow: '0px 20px 40px rgba(20, 20, 20, 0.2)',
        },
        tabBarItemStyle: {
          paddingVertical: 9,
          paddingHorizontal: 4,
          borderRadius: 25,
          marginHorizontal: 2,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
      // screenOptions={{
      //   headerShown: false,
      //   tabBarActiveTintColor: colors.white,
      //   tabBarInactiveTintColor: colors.blue[400],
      //   tabBarShowLabel: false,
      //   tabBarIconStyle: {},
      //   animation: 'shift',
      //   tabBarStyle: {
      //     position: 'absolute',
      //     bottom: Platform.OS === 'ios' ? 20 : 15,
      //     left: 20,
      //     right: 20,
      //     borderRadius: 50,
      //     overflow: 'hidden',
      //     marginHorizontal: 20,
      //     backgroundColor: 'transparent',
      //     height: 65,
      //     display: isIndexScreen ? 'flex' : 'none',
      //     paddingHorizontal: 15,
      //     paddingTop: 6,
      //     borderWidth: 1,
      //     borderColor: Colors.secondary,
      //     elevation: 5,
      //     // borderBottomLeftRadius: 30,
      //     // borderTopRightRadius: 30,
      //   },
      //   tabBarBackground: () => (
      //     <BlurView
      //       intensity={10}
      //       tint="systemChromeMaterialLight"
      //       experimentalBlurMethod={`${isIndexScreen ? 'dimezisBlurView' : 'none'}`}
      //       style={{
      //         position: 'absolute',
      //         top: 0,
      //         left: 0,
      //         right: 0,
      //         bottom: 0,
      //         borderRadius: 20,
      //       }}
      //     />
      //   ),
      //   tabBarItemStyle: {
      //     paddingVertical: 8,
      //     paddingHorizontal: 4,
      //     borderRadius: 25,
      //     marginHorizontal: 2,
      //   },
      //   tabBarLabelStyle: {
      //     fontSize: 12,
      //     fontWeight: '600',
      //   },
      // }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <CustomTabBar color={color} size={size} focused={focused} name="home" />
          ),
        }}
      />
      <Tabs.Screen
        name="subjects"
        options={{
          title: 'Subjects',
          tabBarIcon: ({ color, size, focused }) => (
            <CustomTabBar color={color} size={size} focused={focused} name="book" />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size, focused }) => (
            <CustomTabBar color={color} size={size} focused={focused} name="compass" />
          ),
        }}
      />
      <Tabs.Screen
        name="comprehensive-test"
        options={{
          title: 'Comprehensive Test',
          header: () => <CustomHeader title="Comprehensive Test" showBack />,
          headerShown: true,
          tabBarIcon: ({ color, size, focused }) => (
            <CustomTabBar color={color} size={size} focused={focused} name="clipboard" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <CustomTabBar color={color} size={size} focused={focused} name="person" />
          ),
        }}
      />
    </Tabs>
  );
}
