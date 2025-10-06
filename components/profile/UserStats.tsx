import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '../../store/auth';
import { userApi } from '../../services/api';
import UserStatsSkeleton from '../skeletons/UserStatsSkeleton';

interface RecentActivityItem {
  questionId: string;
  subjectId: string | null;
  isCorrect: boolean;
  timeSpent: number;
  attemptedAt: string;
}

interface FavoriteSubject {
  id: string;
  name: string;
  attempts: number;
  correct: number;
  accuracy: number;
}

interface DetailedStats {
  totalCorrectlyAnswered: number;
  totalQuestionAttempts: number;
  totalQuestions: number;
  currentStreak: number;
  accuracyPercentage: number;
  questionsAnsweredToday: number;
  averageTimePerQuestion: number;
  favoriteSubjects: FavoriteSubject[];
  questionsSolvedPerSubject: any[];
  recentActivity: RecentActivityItem[];
}

export default function UserStats() {
  const [user] = useUser();
  const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetailedStats = async () => {
      try {
        setError('');
        setLoading(true);
        const response = await userApi.getStats();
        if (response.data?.success) {
          setDetailedStats(response.data.data);
        } else {
          setError('Failed to load detailed statistics');
        }
      } catch (err: any) {
        console.error('Failed to fetch detailed stats:', err);
        setError(err?.response?.data?.errors?.[0]?.msg || 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedStats();
  }, []);

  if (loading) {
    return <UserStatsSkeleton />;
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        <View className="p-6">
          <Text className="text-red-500 text-center">{error}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-blue-500 rounded-xl p-3"
          >
            <Text className="text-white text-center font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Use basic stats from user atom if available, otherwise show loading
  const basicStats = user?.stats;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        className="px-6 py-4 bg-white border-b border-neutral-200 flex-row items-center"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 p-2 rounded-full bg-neutral-100"
        >
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-neutral-800">Statistics</Text>
          <Text className="text-sm text-neutral-500">Your learning progress</Text>
        </View>
      </Animated.View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Statistics Cards */}
        <Animated.View entering={FadeInDown.delay(200).springify()} className="px-6 py-4">
          <Text className="text-xl font-bold text-neutral-800 mb-4">Overview</Text>

          <View className="flex-row flex-wrap gap-3">
            {/* Total Questions Answered */}
            <View className="w-[48%] overflow-hidden rounded-2xl">
              <LinearGradient
                colors={['#10B981', '#059669']}
                className="p-4 "
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="checkmark-circle" size={24} color="white" className="mb-2" />
                <Text className="text-white text-lg font-bold">
                  {detailedStats?.totalCorrectlyAnswered || basicStats?.correctAnswers || 0}
                </Text>
                <Text className="text-white/80 text-xs">Correct Answers</Text>
              </LinearGradient>
            </View>

            {/* Total Attempts */}
            <View className="w-[48%] overflow-hidden rounded-2xl">
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                className="p-4 "
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="help-circle" size={24} color="white" className="mb-2" />
                <Text className="text-white text-lg font-bold">
                  {detailedStats?.totalQuestionAttempts || basicStats?.totalQuestionsAnswered || 0}
                </Text>
                <Text className="text-white/80 text-xs">Total Attempts</Text>
              </LinearGradient>
            </View>

            {/* Current Streak */}
            <View className="w-[48%] overflow-hidden rounded-2xl">
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                className="p-4 "
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="flame" size={24} color="white" className="mb-2" />
                <Text className="text-white text-lg font-bold">
                  {detailedStats?.currentStreak || basicStats?.currentStreak || 0}
                </Text>
                <Text className="text-white/80 text-xs">Current Streak</Text>
              </LinearGradient>
            </View>

            {/* Accuracy */}
            <View className="w-[48%] overflow-hidden rounded-2xl">
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                className="p-4 "
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="analytics" size={24} color="white" className="mb-2" />
                <Text className="text-white text-lg font-bold">
                  {detailedStats?.accuracyPercentage ||
                   (basicStats?.correctAnswers && basicStats?.totalQuestionsAnswered
                     ? Math.round((basicStats.correctAnswers / basicStats.totalQuestionsAnswered) * 100)
                     : 0)}%
                </Text>
                <Text className="text-white/80 text-xs">Accuracy</Text>
              </LinearGradient>
            </View>

            {/* Average Time */}
            <View className="w-[48%] overflow-hidden rounded-2xl">
              <LinearGradient
                colors={['#06B6D4', '#0891B2']}
                className="p-4 "
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="time" size={24} color="white" className="mb-2" />
                <Text className="text-white text-lg font-bold">
                  {detailedStats?.averageTimePerQuestion ? `${Math.round(detailedStats.averageTimePerQuestion)}s` : 'N/A'}
                </Text>
                <Text className="text-white/80 text-xs">Avg Time</Text>
              </LinearGradient>
            </View>

            {/* Today's Questions */}
            <View className="w-[48%] overflow-hidden rounded-2xl">
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                className="p-4 "
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="calendar-outline" size={24} color="white" className="mb-2" />
                <Text className="text-white text-lg font-bold">
                  {detailedStats?.questionsAnsweredToday || 0}
                </Text>
                <Text className="text-white/80 text-xs">Today</Text>
              </LinearGradient>
            </View>
          </View>
        </Animated.View>

        {/* Performance Breakdown */}
        {detailedStats && (
          <Animated.View entering={FadeInDown.delay(300).springify()} className="px-6 py-4">
            <Text className="text-xl font-bold text-neutral-800 mb-4">Performance Breakdown</Text>

            <View className="gap-3">
              {/* Quiz Performance */}
              <View className="overflow-hidden rounded-2xl">
                <LinearGradient
                  colors={['#F9FAFB', '#F3F4F6']}
                  className="p-4"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-semibold text-neutral-800">Quiz Performance</Text>
                    <Text className="text-sm text-neutral-500">{basicStats?.totalQuizzesTaken || 0} taken</Text>
                  </View>
                  <View className="bg-neutral-200 h-2 rounded-full mb-2">
                    <View
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${basicStats?.averageScore || 0}%` }}
                    />
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-neutral-600">Average Score</Text>
                    <Text className="text-sm font-medium text-neutral-800">{basicStats?.averageScore || 0}%</Text>
                  </View>
                </LinearGradient>
              </View>

              {/* Test Performance */}
              <View className="overflow-hidden rounded-2xl">
                <LinearGradient
                  colors={['#F9FAFB', '#F3F4F6']}
                  className="p-4"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-semibold text-neutral-800">Test Performance</Text>
                    <Text className="text-sm text-neutral-500">{basicStats?.totalTestsTaken || 0} taken</Text>
                  </View>
                  <View className="bg-neutral-200 h-2 rounded-full mb-2">
                    <View
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${basicStats?.averageScore || 0}%` }}
                    />
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-neutral-600">Average Score</Text>
                    <Text className="text-sm font-medium text-neutral-800">{basicStats?.averageScore || 0}%</Text>
                  </View>
                </LinearGradient>
              </View>

              {/* Streak Performance */}
              <View className="overflow-hidden rounded-2xl">
                <LinearGradient
                  colors={['#F9FAFB', '#F3F4F6']}
                  className="p-4"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-semibold text-neutral-800">Streak Performance</Text>
                    <Text className="text-sm text-neutral-500">Best: {basicStats?.longestStreak || 0}</Text>
                  </View>
                  <View className="bg-neutral-200 h-2 rounded-full mb-2">
                    <View
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${Math.min((basicStats?.currentStreak || 0) / Math.max(basicStats?.longestStreak || 1, 1) * 100, 100)}%` }}
                    />
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-neutral-600">Current Streak</Text>
                    <Text className="text-sm font-medium text-neutral-800">{basicStats?.currentStreak || 0} days</Text>
                  </View>
                </LinearGradient>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Recent Activity */}
        {detailedStats?.recentActivity && detailedStats.recentActivity.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400).springify()} className="px-6 py-4">
            <Text className="text-xl font-bold text-neutral-800 mb-4">Recent Activity</Text>

            <View className="gap-3">
              {detailedStats.recentActivity.slice(0, 5).map((activity, index) => (
                <View key={index} className="flex-row items-center p-3 bg-white rounded-xl shadow-sm">
                  <View className={`w-10 h-10 rounded-full mr-3 items-center justify-center ${
                    activity.isCorrect ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Ionicons
                      name={activity.isCorrect ? "checkmark" : "close"}
                      size={16}
                      color={activity.isCorrect ? "#059669" : "#DC2626"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-neutral-800">
                      Question {activity.isCorrect ? 'Correct' : 'Incorrect'}
                    </Text>
                    <Text className="text-xs text-neutral-500">
                      {new Date(activity.attemptedAt).toLocaleDateString()} • {activity.timeSpent}s
                    </Text>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${
                    activity.isCorrect ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Text className={`text-xs font-medium ${
                      activity.isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {activity.isCorrect ? '✓' : '✗'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Favorite Subjects */}
        {detailedStats?.favoriteSubjects && detailedStats.favoriteSubjects.length > 0 && (
          <Animated.View entering={FadeInDown.delay(500).springify()} className="px-6 py-4">
            <Text className="text-xl font-bold text-neutral-800 mb-4">Favorite Subjects</Text>

            <View className="flex-row flex-wrap gap-3">
              {detailedStats.favoriteSubjects.slice(0, 4).map((subject, index) => (
                <View key={subject.id} className="w-[48%] overflow-hidden rounded-2xl">
                  <LinearGradient
                    colors={['#FEF3C7', '#FDE68A']}
                    className="p-4 h-28"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View className="w-6 h-6 bg-yellow-500 rounded-full mb-2 items-center justify-center">
                      <Text className="text-white text-xs font-bold">{index + 1}</Text>
                    </View>
                    <Text className="text-yellow-800 text-sm font-semibold mb-1" numberOfLines={1}>
                      {subject.name}
                    </Text>
                    <Text className="text-yellow-700 text-xs">
                      {subject.attempts} attempts
                    </Text>
                    <Text className="text-yellow-700 text-xs">
                      {subject.accuracy}% accuracy
                    </Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}