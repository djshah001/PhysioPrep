import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInUp, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Subject } from 'types/types'; // Adjust path as needed
import Gradients from '~/Gradients'; // Adjust path as needed

interface SubjectCardProps {
  subject: Subject;
  index: number;
  isAdmin: boolean;
}

export const SubjectCard = ({ subject, index, isAdmin }: SubjectCardProps) => {
  const { _id, name, stats, userStats, topics } = subject;
  
  // Animation for press effect
  const scale = useSharedValue(1);

  // Calculate Progress
  const totalQuestions = stats.totalQuestions || 0;
  const correct = userStats.correctlyAnsweredQuestions || 0;
  const progressPercent = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;
  
  // Handlers
  const handlePressIn = () => { scale.value = withSpring(0.97); };
  const handlePressOut = () => { scale.value = withSpring(1); };
  
  const handlePress = () => {
    router.push({ pathname: `subjects/${_id}` });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Select Gradient (Loop through presets)
  const gradientColors = Gradients[index % Gradients.length];

  return (
    <Animated.View 
      entering={FadeInUp.delay(index * 100).springify().damping(14)} 
      className="mb-1 w-full"
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={animatedStyle}>
          <LinearGradient
            colors={gradientColors as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="relative overflow-hidden rounded-[24px] p-5 shadow-lg shadow-neutral-200"
          >
            {/* Background Decorative Circle */}
            <View className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />

            <View className="flex-1 justify-between gap-4">
              
              {/* Header: Icon & Title */}
              <View className="flex-row items-start">
                <View className="mr-4 h-14 w-14 items-center justify-center rounded-2xl bg-white/20 border border-white/10 shadow-sm">
                  <Text className="text-3xl font-black text-white capitalize">
                    {name.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-white leading-tight shadow-sm" numberOfLines={2}>
                    {name}
                  </Text>
                  
                  {/* Metadata Row */}
                  <View className="mt-2 flex-row flex-wrap gap-3">
                    <View className="flex-row items-center rounded-full bg-black/10 px-2 py-1">
                      <Ionicons name="grid-outline" size={12} color="white" style={{ opacity: 0.8 }} />
                      <Text className="ml-1 text-xs font-medium text-white/90">
                        {topics?.length || 0} Topics
                      </Text>
                    </View>
                    <View className="flex-row items-center rounded-full bg-black/10 px-2 py-1">
                      <Ionicons name="help-circle-outline" size={12} color="white" style={{ opacity: 0.8 }} />
                      <Text className="ml-1 text-xs font-medium text-white/90">
                        {totalQuestions} Qs
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Progress Section */}
              <View>
                <View className="mb-1.5 flex-row items-center justify-between">
                  <Text className="text-xs font-semibold text-white/90 uppercase tracking-wide">
                    Mastery
                  </Text>
                  <Text className="text-sm font-bold text-white">
                    {Math.round(progressPercent)}%
                  </Text>
                </View>
                
                {/* Custom Progress Bar */}
                <View className="h-2 w-full overflow-hidden rounded-full bg-black/20">
                  <View 
                    className="h-full rounded-full bg-white shadow-sm" 
                    style={{ width: `${Math.round(progressPercent)}%` }} 
                  />
                </View>
              </View>

            </View>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};