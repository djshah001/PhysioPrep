import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { fetchUserStats, UserStatsResponse } from 'actions/user';

// --- Components ---

const ProgressBar = ({ percent, color = '#6366F1' }: { percent: number; color?: string }) => {
  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withTiming(percent, { duration: 1000 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percent]);
  const style = useAnimatedStyle(() => ({ width: `${width.value}%`, backgroundColor: color }));

  return (
    <View className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
      <Animated.View className="h-full rounded-full" style={style} />
    </View>
  );
};

const StatCard = ({ label, value, icon, color, delay }: any) => (
  <Animated.View
    entering={FadeInDown.delay(delay).springify()}
    className="mb-3 w-[48%] overflow-hidden rounded-2xl border border-neutral-50 bg-white p-4 shadow-sm">
    <View
      className="mb-3 h-10 w-10 items-center justify-center rounded-full"
      style={{ backgroundColor: `${color}15` }}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text className="text-2xl font-bold text-neutral-800">{value}</Text>
    <Text className="text-xs font-medium uppercase tracking-wide text-neutral-400">{label}</Text>
  </Animated.View>
);

const SubjectRow = ({ subject, maxVal }: any) => (
  <View className="mb-4">
    <View className="mb-1 flex-row justify-between">
      <Text className="text-sm font-semibold text-neutral-700">{subject.name}</Text>
      <Text className="text-xs font-bold text-neutral-500">{subject.solved} Solved</Text>
    </View>
    <ProgressBar percent={(subject.solved / maxVal) * 100} color={subject.color} />
  </View>
);

export default function UserStats() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStatsResponse['data'] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const res = await fetchUserStats();
      if (res.success) setStats(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  if (!stats) return <View className="flex-1 bg-neutral-50" />;

  // Calculate Max for relative bars
  const maxSubjectQuestions = Math.max(
    ...(stats.questionsSolvedPerSubject?.map((s) => s.solved) || [10])
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center border-b border-neutral-200 bg-white px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-4 rounded-full bg-neutral-100 p-2">
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-neutral-900">Your Statistics</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        {/* XP & Level Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()} className="mb-6">
          <LinearGradient
            colors={['#4F46E5', '#4338CA']}
            className="rounded-3xl p-6 shadow-lg shadow-indigo-200"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <View className="mb-6 flex-row items-start justify-between">
              <View>
                <Text className="mb-1 font-medium text-indigo-200">Current Level</Text>
                <Text className="text-4xl font-black text-white">{stats.level}</Text>
                <Text className="mt-1 text-xs text-indigo-200">
                  {stats.currentBadge?.name} Rank
                </Text>
              </View>
              <View className="h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                <Text className="text-3xl">{stats.currentBadge?.icon || '🏆'}</Text>
              </View>
            </View>

            <View>
              <View className="mb-2 flex-row justify-between">
                <Text className="text-xs font-bold text-indigo-200">
                  {stats.xpInCurrentLevel} XP
                </Text>
                <Text className="text-xs font-bold text-indigo-200">{stats.xpToNextLevel} XP</Text>
              </View>
              <View className="h-3 overflow-hidden rounded-full border border-white/10 bg-black/20">
                <View
                  className="h-full rounded-full bg-white"
                  style={{ width: `${stats.levelProgressPercent}%` }}
                />
              </View>
              <Text className="mt-2 text-center text-xs text-indigo-300">
                {stats.xpToNextLevel - stats.xpInCurrentLevel} XP needed for Level {stats.level + 1}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Grid Stats */}
        <View className="mb-2 flex-row flex-wrap justify-between">
          <StatCard
            label="Total Questions"
            value={stats.totalQuestionAttempts}
            icon="layers"
            color="#3B82F6"
            delay={200}
          />
          <StatCard
            label="Accuracy"
            value={`${stats.accuracyPercentage}%`}
            icon="disc"
            color="#10B981"
            delay={250}
          />
          <StatCard
            label="Current Streak"
            value={stats.currentStreak}
            icon="flame"
            color="#F59E0B"
            delay={300}
          />
          <StatCard
            label="Today's Activity"
            value={stats.questionsAnsweredToday}
            icon="calendar"
            color="#EC4899"
            delay={350}
          />
        </View>

        {/* Subject Performance */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          className="mb-6 rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
          <Text className="mb-6 text-lg font-bold text-neutral-800">Subject Mastery</Text>
          {stats.questionsSolvedPerSubject.map((subj) => (
            <SubjectRow key={subj.id} subject={subj} maxVal={maxSubjectQuestions} />
          ))}
        </Animated.View>

        {/* Recent Activity List */}
        <Animated.View
          entering={FadeInDown.delay(500).springify()}
          className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
          <Text className="mb-4 text-lg font-bold text-neutral-800">Recent Activity</Text>
          {stats.recentActivity.length === 0 ? (
            <Text className="py-4 text-center text-neutral-400">No recent activity found.</Text>
          ) : (
            stats.recentActivity.map((activity, index) => (
              <View
                key={index}
                className="flex-row items-center border-b border-neutral-50 py-3 last:border-0">
                <View
                  className={`mr-4 h-10 w-10 items-center justify-center rounded-full ${activity.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Ionicons
                    name={activity.isCorrect ? 'checkmark' : 'close'}
                    size={18}
                    color={activity.isCorrect ? '#10B981' : '#EF4444'}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-neutral-800">
                    {activity.subjectName}
                  </Text>
                  <Text className="text-xs text-neutral-400">
                    {new Date(activity.createdAt).toLocaleDateString()} • {activity.timeSpent}s
                  </Text>
                </View>
              </View>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
