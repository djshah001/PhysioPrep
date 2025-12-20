import React, { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Subject } from 'types/types';
import Gradients from '~/Gradients';

interface SubjectCardProps {
  subject: Subject;
  index: number;
  isAdmin?: boolean; // Optional if you want to show admin edit buttons later
}

const SubjectCardComponent = ({ subject, index }: SubjectCardProps) => {
  const { _id, name, description, stats, userStats, topics } = subject;
  
  // --- Animation Values ---
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // --- Stats Logic ---
  const totalQuestions = stats?.totalQuestions || 0;
  const correct = userStats?.correctlyAnsweredQuestions || 0;
  const progressPercent = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;
  const roundedProgress = Math.round(progressPercent);
  const isStarted = roundedProgress > 0;
  const isCompleted = roundedProgress >= 100;

  // --- Mastery Badge Logic ---
  let masteryIcon = 'medal-outline';
  let masteryText = 'Not Started';
  // Note: Colors handled via Tailwind text classes below or style prop if needed dynamically

  if (isCompleted) {
    masteryIcon = 'trophy';
    masteryText = 'Mastered';
  } else if (progressPercent > 75) {
    masteryIcon = 'star-face';
    masteryText = 'Expert';
  } else if (progressPercent > 20) {
    masteryIcon = 'fire';
    masteryText = 'Learning';
  }

  // --- Handlers ---
  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 10 });
    opacity.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12 });
    opacity.value = withTiming(1, { duration: 200 });
  };

  const handlePress = () => {
    router.push({ pathname: `subjects/${_id}`, params: { gradientColors: JSON.stringify(Gradients[index % Gradients.length]) } });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const gradientColors = Gradients[index % Gradients.length];

  return (
    <Animated.View style={[animatedStyle]} className="mb-6">
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="active:opacity-100"
      >
        <View className="relative overflow-hidden rounded-[32px] bg-white shadow-md shadow-neutral-500 border border-neutral-100">
          
          {/* --- TOP SECTION: Visual Header --- */}
          <LinearGradient
            colors={gradientColors as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="h-32 w-full flex-row justify-between p-6 relative"
          >
            {/* Background Decor */}
            <View className="absolute -right-4 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
            <View className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-black/5 blur-2xl" />

            {/* Subject Icon / Letter */}
            <View>
                <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/25 border border-white/30 backdrop-blur-md ">
                    <Text className="text-3xl font-black text-white capitalize">
                        {name.charAt(0)}
                    </Text>
                </View>
            </View>

            {/* Mastery Badge */}
            <View className="items-end">
                <View className="flex-row items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 border border-white/10 backdrop-blur-md">
                    <MaterialCommunityIcons name={masteryIcon as any} size={14} color="white" />
                    <Text className="text-xs font-bold text-white uppercase tracking-wide">
                        {masteryText}
                    </Text>
                </View>
            </View>
          </LinearGradient>

          {/* --- BOTTOM SECTION: Content & Stats --- */}
          <View className="px-5 pb-5 pt-5 bg-white -mt-6 rounded-t-[28px] shadow-sm shadow-neutral-600">
            
            {/* Title Row */}
            <View className="flex-row justify-between items-start mb-1.5">
                <Text className="text-xl font-bold text-neutral-800 flex-1 mr-2 leading-7" numberOfLines={2}>
                    {name}
                </Text>
                <View className="bg-neutral-50 p-2.5 rounded-full border border-neutral-100">
                    <Ionicons name="arrow-forward" size={18} color={gradientColors[0]} />
                </View>
            </View>

            {/* Description (Truncated) */}
            {/* {description ? (
                <Text className="text-sm text-neutral-400 mb-5 leading-5" numberOfLines={1}>
                    {description}
                </Text>
            ) : (
                <View className="mb-2" />
            )} */}

            {/* Stats Grid */}
            <View className="flex-row gap-3 mb-5">
                {/* Topics Count */}
                <View className="flex-1 bg-neutral-50 rounded-2xl p-3 flex-row items-center gap-3 border border-neutral-100 shadow-sm shadow-neutral-600">
                    <View className="bg-white p-2 rounded-xl border border-neutral-100 shadow-sm shadow-purple-700 ">
                        <Ionicons name="grid-outline" size={16} color="#6366F1" />
                    </View>
                    <View>
                        <Text className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider">Topics</Text>
                        <Text className="text-sm font-bold text-neutral-800">{topics?.length || 0}</Text>
                    </View>
                </View>

                {/* Questions Count */}
                <View className="flex-1 bg-neutral-50 rounded-2xl p-3 flex-row items-center gap-3 border border-neutral-100 shadow-sm shadow-neutral-600">
                    <View className="bg-white p-2 rounded-xl border border-neutral-100 shadow-sm shadow-green-600">
                        <Ionicons name="help-circle-outline" size={16} color="#10B981" />
                    </View>
                    <View>
                        <Text className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider">Questions</Text>
                        <Text className="text-sm font-bold text-neutral-800">{totalQuestions}</Text>
                    </View>
                </View>
            </View>

            {/* Progress Bar Section */}
            <View>
                <View className="flex-row justify-between mb-2 items-end">
                    <Text className="text-xs font-medium text-neutral-500">
                        {isStarted ? 'Progress' : 'Start Learning'}
                    </Text>
                    <Text className="text-xs font-bold text-neutral-800">
                        {roundedProgress}% <Text className="text-neutral-600 font-normal">Completed</Text>
                    </Text>
                </View>
                <View className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden shadow-sm shadow-neutral-600">
                    <Animated.View 
                        className="h-full rounded-full" 
                        style={{ 
                            width: `${progressPercent}%`, 
                            backgroundColor: gradientColors[0] 
                        }} 
                    />
                </View>
            </View>

          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export const SubjectCard = memo(SubjectCardComponent);