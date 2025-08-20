import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from 'hooks/useAuth';
import api from 'services/api';

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar } from 'components/ProgressBar';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Colors } from 'constants/Colors';
import colors from 'tailwindcss/colors';

const { width } = Dimensions.get('window');

interface Progress {
  overall: number;
  subjects: {
    [key: string]: number;
  };
}

interface UpcomingQuiz {
  id: string;
  title: string;
  subject: string;
  date: string;
  duration: number;
}

interface QuickStats {
  quizzesCompleted: number;
  averageScore: number;
  streakDays: number;
}

interface ApiError {
  response?: {
    data?: {
      errors?: string[];
    };
  };
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState<UpcomingQuiz[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const scale = useSharedValue(1);
  const scrollY = useSharedValue(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, quizzesRes, statsRes] = await Promise.all([
          api.get('/subjects/progress'),
          api.get('/quizzes'),
          api.get('/users/me/stats'),
        ]);

        setProgress(progressRes.data);
        setUpcomingQuizzes(quizzesRes.data);
        setQuickStats(statsRes.data);
      } catch (error: unknown) {
        const apiError = error as ApiError;
        console.error(
          'Error fetching dashboard data:',
          apiError.response?.data?.errors || 'Unknown error'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const quickActions = [
    {
      title: 'Start Quiz',
      description: 'Test your knowledge',
      icon: '📝',
      action: () => router.push('/(tabs)/quiz' as any),
      gradient: ['rgb(255, 107, 107)', 'rgb(255, 142, 142)'] as const,
    },
    {
      title: 'Study',
      description: 'Access materials',
      icon: '📚',
      action: () => router.push('/(tabs)/subjects' as any),
      gradient: ['rgb(78, 205, 196)', 'rgb(69, 183, 175)'] as const,
    },
    {
      title: 'Progress',
      description: 'View stats',
      icon: '📊',
      action: () => router.push('/(tabs)/profile/stats' as any),
      gradient: ['rgb(167, 139, 250)', 'rgb(139, 92, 246)'] as const,
    },
  ];

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const renderSkeleton = () => (
    <View className="p-4">
      <View className="mb-6 h-12 rounded-2xl bg-card/50" />
      <View className="mb-6 h-24 rounded-2xl bg-card/50" />
      <View className="mb-6 flex-row justify-between">
        {[1, 2, 3].map((i) => (
          <View key={i} className="mx-1 h-20 flex-1 rounded-2xl bg-card/50" />
        ))}
      </View>
      <View className="mb-6 flex-row justify-between">
        {[1, 2, 3].map((i) => (
          <View key={i} className="mx-1 h-24 flex-1 rounded-2xl bg-card/50" />
        ))}
      </View>
      <View className="mb-6">
        {[1, 2].map((i) => (
          <View key={i} className="mb-4 h-20 rounded-2xl bg-card/50" />
        ))}
      </View>
    </View>
  );

  if (loading) {
    return <ScrollView className="bg-background">{renderSkeleton()}</ScrollView>;
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <StatusBar barStyle='dark-content' />
      <ScrollView
        className="flex-1"
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 0 }}>
        <View className="p-6">
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            className="mb-8 flex-row items-center">
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              className="mr-4 h-14 w-14 items-center justify-center rounded-2xl">
              <Text className="text-primary-foreground text-2xl font-bold">
                {user?.name?.[0]?.toUpperCase() || 'S'}
              </Text>
            </LinearGradient>
            <View>
              <Text className="text-2xl font-bold text-foreground">
                Welcome back, {user?.name || 'Student'}! 👋
              </Text>
              <Text className="text-muted-foreground text-base">
                {quickStats?.streakDays} day streak 🔥
              </Text>
            </View>
          </Animated.View>

          {/* Progress Card */}
          <Animated.View entering={FadeInDown.delay(400).springify()} className="mb-8">
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              className="rounded-2xl p-6"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Text className="text-primary-foreground mb-4 text-xl font-bold">
                Overall Progress 📈
              </Text>
              <View className="items-center">
                <Text className="text-primary-foreground mb-2 text-base">Course Completion</Text>
                <ProgressBar value={progress?.overall || 0} color={Colors.primary} />
                <Text className="text-primary-foreground mt-2 text-base">
                  {progress?.overall || 0}% Complete
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Quick Stats */}
          <Animated.View
            entering={FadeInDown.delay(600).springify()}
            className="mb-8 flex-row justify-between">
            {[
              { label: 'Quizzes', value: quickStats?.quizzesCompleted || 0, color: Colors.primary },
              { label: 'Score', value: `${quickStats?.averageScore || 0}%`, color: Colors.accent },
              { label: 'Streak', value: quickStats?.streakDays || 0, color: Colors.secondary },
            ].map((stat, index) => (
              <AnimatedBlurView
                key={stat.label}
                intensity={20}
                tint="dark"
                className="mx-1 flex-1 overflow-hidden rounded-2xl"
                entering={FadeInDown.delay(800 + index * 100).springify()}>
                <View className="items-center bg-card/50 p-4">
                  <Text className="text-2xl font-bold" style={{ color: stat.color }}>
                    {stat.value}
                  </Text>
                  <Text className="text-muted-foreground text-sm">{stat.label}</Text>
                </View>
              </AnimatedBlurView>
            ))}
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.delay(800).springify()} className="mb-8">
            <Text className="mb-4 text-xl font-bold text-foreground">Quick Actions ⚡</Text>
            <View className="flex-row justify-between">
              {quickActions.map((action, index) => (
                <Animated.View
                  key={action.title}
                  entering={FadeInRight.delay(1000 + index * 200).springify()}
                  style={buttonAnimatedStyle}>
                  <TouchableOpacity
                    onPress={action.action}
                    onPressIn={() => {
                      scale.value = withSpring(0.95);
                    }}
                    onPressOut={() => {
                      scale.value = withSpring(1);
                    }}>
                    <LinearGradient
                      colors={action.gradient}
                      className="w-[width/3.5] rounded-2xl p-4"
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}>
                      <Text className="mb-2 text-2xl">{action.icon}</Text>
                      <Text className="mb-1 text-lg font-bold text-white">{action.title}</Text>
                      <Text className="text-sm text-white/80">{action.description}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Upcoming Quizzes */}
          <Animated.View entering={FadeInDown.delay(1000).springify()}>
            <Text className="mb-4 text-xl font-bold text-foreground">Upcoming Quizzes 📚</Text>
            {upcomingQuizzes.map((quiz, index) => (
              <Animated.View
                key={quiz.id}
                entering={FadeInDown.delay(1200 + index * 200).springify()}>
                <TouchableOpacity
                  onPress={() => router.push(`/quiz/${quiz.id}` as any)}
                  className="mb-4">
                  <AnimatedBlurView
                    intensity={20}
                    tint="dark"
                    className="overflow-hidden rounded-2xl">
                    <LinearGradient
                      colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                      className="p-4">
                      <Text className="text-lg font-bold text-foreground">{quiz.title}</Text>
                      <Text className="text-muted-foreground mt-1 text-sm">{quiz.subject}</Text>
                      <View className="mt-2 flex-row items-center">
                        <Ionicons name="calendar-outline" size={16} color={Colors.grey} />
                        <Text className="text-muted-foreground ml-1 text-sm">{quiz.date}</Text>
                        <Text className="text-muted-foreground mx-2 text-sm">•</Text>
                        <Ionicons name="time-outline" size={16} color={Colors.grey} />
                        <Text className="text-muted-foreground ml-1 text-sm">
                          {quiz.duration} min
                        </Text>
                      </View>
                    </LinearGradient>
                  </AnimatedBlurView>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
