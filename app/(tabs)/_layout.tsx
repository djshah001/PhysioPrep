import React, { useEffect } from 'react';
import { TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Tabs, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import colors from 'tailwindcss/colors';
import { CustomHeader } from '~/common/CustomHeader';


// Define the icons for each route
const TAB_ICONS: Record<string, { default: keyof typeof Ionicons.glyphMap; focused: keyof typeof Ionicons.glyphMap }> = {
  index: { default: 'home-outline', focused: 'home' },
  subjects: { default: 'book-outline', focused: 'book' },
  'comprehensive-test': { default: 'clipboard-outline', focused: 'clipboard' },
  profile: { default: 'person-outline', focused: 'person' },
};

// --- Individual Tab Button Component ---
const TabButton = ({
  isFocused,
  routeName,
  onPress,
  onLongPress,
  label,
}: {
  isFocused: boolean;
  routeName: string;
  onPress: () => void;
  onLongPress: () => void;
  label: string;
}) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, {
      damping: 30,
      stiffness: 200,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(scale.value, [0, 1], [1, 1.1]),
        },
        {
          translateY: interpolate(scale.value, [0, 1], [0, -1]),
        },
      ],
    };
  });

  const animatedBgStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: scale.value,
    };
  });

  const iconName = isFocused
    ? TAB_ICONS[routeName]?.focused || 'alert-circle'
    : TAB_ICONS[routeName]?.default || 'alert-circle-outline';

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabButton}
      activeOpacity={0.7}>
      
      {/* Animated Background Circle */}
      <Animated.View style={[styles.activeBackground, animatedBgStyle]} />

      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        <Ionicons
          name={iconName}
          size={24}
          color={isFocused ? colors.white : colors.gray[400]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// --- Main Custom Tab Bar Container ---
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const pathname = usePathname();
  
  // Logic to hide tab bar on specific screens
  // We use an "Allow List" approach based on your previous code
  const visibleRoutes = ['/', '/home', '/subjects', '/explore', '/quiz', '/profile'];
  
  // Check if current path matches strictly or is the index
  const isVisible = visibleRoutes.includes(pathname) || pathname === '/';

  // Animation for showing/hiding the bar
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(isVisible ? 0 : 100, { duration: 300 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View style={[styles.tabBarContainer, animatedContainerStyle]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // Add Haptic Feedback
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabButton
            key={route.key}
            isFocused={isFocused}
            routeName={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            label={options.tabBarLabel}
          />
        );
      })}
    </Animated.View>
  );
};

// --- Main Layout ---
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        // headerStyle: { backgroundColor: 'transparent',marginBottom: 0,paddingBottom: 0},
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="subjects"
        options={{
          title: 'Subjects',
          header: () => <CustomHeader title="Subjects" />,
          // headerShown: true, // If you want the header visible
        }}
      />
      <Tabs.Screen
        name="comprehensive-test"
        options={{
          title: 'Test',
          header: () => <CustomHeader title="Comprehensive Test" showBack />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 25 : 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 35,
    borderCurve: 'continuous',
    // High quality shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  activeBackground: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.blue[500], // Adjust to your primary color
    // Glow effect for active state
    shadowColor: colors.blue[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});