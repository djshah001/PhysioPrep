import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  FadeInUp, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
} from 'react-native-reanimated';
import { Topic } from 'types/types';
import Gradients from '~/Gradients';

interface TopicCardProps {
  topic: Topic;
  subjectId: string;
  isAdmin?: boolean;
  index: number;
  onTakeQuiz: () => void;
  onViewDetails?: () => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  index,
  onViewDetails,
}) => {
  const gradientColors = Gradients[index % Gradients.length];
  const primaryColor = gradientColors[0]; // Extract primary color for theming
  
  // Interaction Animation
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 10 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const questionCount = topic.stats?.totalQuestions || 0;

  return (
    <Animated.View 
      entering={FadeInUp.delay(index * 50).springify().damping(14)} 
      className="w-[48%] mb-4"
    >
      <Pressable 
        onPress={onViewDetails}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="flex-1"
      >
        <Animated.View style={animatedStyle} className="h-full">
          <View className="h-full justify-between rounded-[24px] bg-white p-5 shadow-sm shadow-neutral-200 border border-neutral-100">
            
            {/* --- Top Section --- */}
            <View>
              {/* Icon Container */}
              <LinearGradient
                colors={gradientColors as any}
                className="h-12 w-12 items-center justify-center rounded-2xl shadow-sm mb-4 overflow-hidden"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text className="text-xl font-black text-white capitalize">
                  {topic.topicName.charAt(0)}
                </Text>
              </LinearGradient>

              {/* Title */}
              <Text 
                className="text-[16px] font-bold text-neutral-800 leading-tight" 
                numberOfLines={3}
              >
                {topic.topicName}
              </Text>
            </View>

            {/* --- Bottom Section --- */}
            <View className=" pt-4 border-t border-neutral-50 flex-row items-center justify-between">
              
              {/* Stats */}
              <View className="flex-row items-center gap-1">
                <MaterialCommunityIcons name="file-document-outline" size={14} color="#9CA3AF" />
                <Text className="text-xs font-medium text-neutral-400">
                  {questionCount}
                </Text>
              </View>

              {/* Action Button (Themed) */}
              <View 
                className="h-8 w-8 rounded-full items-center justify-center"
                style={{ backgroundColor: `${primaryColor}15` }} // 10% opacity version of primary color
              >
                <Ionicons name="arrow-forward" size={16} color={primaryColor} />
              </View>

            </View>

          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};