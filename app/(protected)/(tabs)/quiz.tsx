import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function QuizPage() {
  const router = useRouter();
  const scale = useSharedValue(1);

  const quizCategories = [
    {
      title: 'Quick Quiz',
      description: '10 questions, 5 minutes',
      icon: '⚡',
      action: () => router.push('quick' as any),
      colors: ['#FF6B6B', '#FF8E8E'] as const,
    },
    {
      title: 'Full Test',
      description: '50 questions, 30 minutes',
      icon: '📝',
      action: () => router.push('full' as any),
      colors: ['#00FFFF', '#00CCCC'] as const,
    },
    {
      title: 'Practice Mode',
      description: 'Unlimited questions, no time limit',
      icon: '🎯',
      action: () => router.push('practice' as any),
      colors: ['#FFD700', '#FFA500'] as const,
    }
  ];

  const recentQuizzes = [
    {
      title: 'Anatomy Quiz',
      date: '2024-03-15',
      score: 85,
      totalQuestions: 10,
      icon: '🧠'
    },
    {
      title: 'Physiology Test',
      date: '2024-03-14',
      score: 78,
      totalQuestions: 20,
      icon: '💪'
    }
  ];

  const topPerformers = [
    {
      name: 'John Doe',
      score: 95,
      rank: 1,
      avatar: '👨‍🎓'
    },
    {
      name: 'Jane Smith',
      score: 92,
      rank: 2,
      avatar: '👩‍🎓'
    },
    {
      name: 'Mike Johnson',
      score: 90,
      rank: 3,
      avatar: '👨‍🎓'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-500';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-500';
    return 'bg-red-500/20 text-red-500';
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]">
      <ScrollView className="flex-1">
        <View className="p-6">
          <Animated.View 
            entering={FadeInDown.delay(200).springify()}
            className="mb-8"
          >
            <Text className="text-3xl font-bold text-white mb-2">Quiz Center 🎯</Text>
            <Text className="text-base text-gray-300">Test your knowledge and track your progress</Text>
          </Animated.View>

          {/* Quiz Categories */}
          <Animated.View 
            entering={FadeInDown.delay(400).springify()}
            className="mb-8"
          >
            <Text className="text-xl font-bold text-white mb-4">Quiz Types 📚</Text>
            <View className="flex-row flex-wrap justify-between">
              {quizCategories.map((category, index) => (
                <Animated.View
                  key={category.title}
                  entering={FadeInRight.delay(600 + index * 200).springify()}
                  style={buttonAnimatedStyle}
                  className="w-[48%] mb-4"
                >
                  <TouchableOpacity
                    onPress={category.action}
                    className="h-40 rounded-2xl overflow-hidden"
                  >
                    <LinearGradient
                      colors={category.colors}
                      className="flex-1 p-4 justify-between"
                    >
                      <Text className="text-3xl">{category.icon}</Text>
                      <View>
                        <Text className="text-lg font-bold text-white mb-1">{category.title}</Text>
                        <Text className="text-sm text-white/80">{category.description}</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Recent Quizzes */}
          <Animated.View 
            entering={FadeInDown.delay(800).springify()}
            className="mb-8"
          >
            <Text className="text-xl font-bold text-white mb-4">Recent Quizzes 📊</Text>
            <View className="space-y-4">
              {recentQuizzes.map((quiz, index) => (
                <Animated.View
                  key={quiz.title}
                  entering={FadeInDown.delay(1000 + index * 200).springify()}
                >
                  <BlurView intensity={20} tint="dark" className="rounded-2xl overflow-hidden">
                    <View className="p-4 flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <Text className="text-2xl mr-3">{quiz.icon}</Text>
                        <View className="flex-1">
                          <Text className="text-base font-bold text-white">{quiz.title}</Text>
                          <View className="flex-row items-center mt-1">
                            <Ionicons name="calendar-outline" size={14} color="#666" />
                            <Text className="text-sm text-gray-300 ml-1">{quiz.date}</Text>
                            <Text className="text-sm text-gray-300 mx-2">•</Text>
                            <Text className="text-sm text-gray-300">{quiz.score}/{quiz.totalQuestions}</Text>
                          </View>
                        </View>
                      </View>
                      <View className={`px-3 py-1 rounded-full ${getScoreColor(quiz.score)}`}>
                        <Text className="text-sm font-medium">{quiz.score}%</Text>
                      </View>
                    </View>
                  </BlurView>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Top Performers */}
          <Animated.View 
            entering={FadeInDown.delay(1200).springify()}
          >
            <Text className="text-xl font-bold text-white mb-4">Top Performers 🏆</Text>
            <View className="space-y-4">
              {topPerformers.map((performer, index) => (
                <Animated.View
                  key={performer.name}
                  entering={FadeInDown.delay(1400 + index * 200).springify()}
                >
                  <BlurView intensity={20} tint="dark" className="rounded-2xl overflow-hidden">
                    <View className="p-4 flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] justify-center items-center mr-3">
                        <Text className="text-xl">{performer.avatar}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold text-white">{performer.name}</Text>
                        <Text className="text-sm text-gray-300">Rank #{performer.rank}</Text>
                      </View>
                      <View className="bg-green-500/20 px-3 py-1 rounded-full">
                        <Text className="text-sm font-medium text-green-500">{performer.score}%</Text>
                      </View>
                    </View>
                  </BlurView>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 