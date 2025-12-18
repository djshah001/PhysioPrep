import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import colors from 'tailwindcss/colors';
import { BadgeDetails } from 'store/home';

interface XPLevelCardProps {
  xp: number;
  level: number;
  xpToNextLevel: number;
  xpInCurrentLevel: number;
  levelProgressPercent: number;
  hasLeveledUp: boolean;
  currentBadge?: BadgeDetails;
  variant?: 'compact' | 'full';
}

export default function XPLevelCard({
  xp,
  level,
  xpToNextLevel,
  xpInCurrentLevel,
  levelProgressPercent,
  hasLeveledUp,
  currentBadge,
  variant = 'compact',
}: XPLevelCardProps) {
  const progressWidth = useSharedValue(0);

  console.log('XP:', xp);
  console.log('Level:', level);
  console.log('XP to Next Level:', xpToNextLevel);
  console.log('XP in Current Level:', xpInCurrentLevel);
  console.log('Level Progress Percent:', levelProgressPercent);
  console.log('Has Leveled Up:', hasLeveledUp);
  console.log('Current Badge:', currentBadge);

  React.useEffect(() => {
    progressWidth.value = withSpring(levelProgressPercent, {
      damping: 20,
      mass: 1.5,
      stiffness: 150,
    });
  }, [levelProgressPercent, progressWidth]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  if (variant === 'compact') {
    return (
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        className="mt-3 flex-1 overflow-hidden rounded-3xl">
        <LinearGradient
          colors={['#a855f7', '#4f46e5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 justify-center gap-2 p-5">
          {/* Level and Badge */}
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-white">Level {level}</Text>
            {currentBadge && <Text className="text-xl">{currentBadge.icon}</Text>}
          </View>

          {/* XP Display */}
          <Text className="text-sm text-purple-200">{xp.toLocaleString()} XP</Text>

          {/* Progress Bar */}
          <View className="gap-1">
            <View className="h-3 rounded-full bg-purple-400/30">
              <Animated.View
                style={[animatedProgressStyle]}
                className="h-full overflow-hidden rounded-full bg-white/20">
                <LinearGradient
                  colors={['#facc15', '#fb923c']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="h-full rounded-full w-full"  
                />
              </Animated.View>
            </View>
            <Text className="text-xs text-purple-200">
              {Math.round(xpToNextLevel)} XP to Level {level + 1}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }

  // Full variant for detailed view
  return (
    <Animated.View
      entering={FadeInDown.delay(100).springify()}
      className="mt-3 flex-1 overflow-hidden">
      <LinearGradient
        colors={['#a855f7', '#4f46e5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className=" overflow-hidden rounded-3xl p-6 shadow-2xl shadow-purple-500">
        {/* Header */}
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-bold text-white">Level {level}</Text>
            <Text className="text-sm text-purple-200">{xp.toLocaleString()} Total XP</Text>
          </View>
          {currentBadge && (
            <View className="items-center">
              <Text className="text-3xl">{currentBadge.icon}</Text>
              <Text className="text-xs text-purple-200">{currentBadge.name}</Text>
            </View>
          )}
        </View>

        {/* Progress Section */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-purple-200">Progress to Level {level + 1}</Text>
            <Text className="text-sm font-semibold text-white">
              {Math.round(levelProgressPercent)}%
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="h-3 rounded-full bg-purple-400/30">
            <Animated.View
              style={[animatedProgressStyle]}
              className="h-full overflow-hidden rounded-full">
              <LinearGradient
                colors={['#facc15', '#fb923c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-full rounded-full"
              />
            </Animated.View>
          </View>

          <Text className="text-xs text-purple-200">
            {xpInCurrentLevel.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
          </Text>
        </View>

        {/* Achievement Icon */}
        <View className="mt-3 flex-row items-center gap-2">
          <MaterialCommunityIcons name="trophy" size={16} color={colors.yellow[400]} />
          <Text className="text-xs text-purple-200">Keep learning to reach the next level!</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}
