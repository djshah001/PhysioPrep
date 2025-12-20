import React, { useEffect } from 'react';
import { View, ScrollView, Text, RefreshControl } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAtom, useSetAtom } from 'jotai';
import colors from 'tailwindcss/colors';

// Hooks & Store
import { useProAccess } from '~/useProAccess';
import { fetchSubjectAtom, loadingAtom, subjectAtom } from 'store/subject';
import {
  rewardedAdLoadedAtom,
  initializeRewardedAdAtom,
  loadRewardedAdAtom,
  showRewardedAdAtom,
} from 'store/rewardedAd';

// Components
import { CustomHeader } from 'components/common/CustomHeader';
import { TopicCard } from 'components/ui/TopicCard';
import { SubjectDetailSkeleton } from 'components/skeletons/SubjectDetailSkeleton';
import { Button } from 'components/ui/button';
import { Colors } from 'constants/Colors';
import { ProgressBar } from '~/ProgressBar';

// --- Helper Component for Hero Stats ---
const StatBadge = ({
  icon,
  value,
  label,
}: {
  icon: any;
  value: string | number;
  label: string;
}) => (
  <View className="mx-1 flex-1 items-center rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-md">
    <MaterialCommunityIcons name={icon} size={20} color="white" style={{ marginBottom: 4 }} />
    <Text className="text-lg font-bold text-white">{value}</Text>
    <Text className="text-[10px] font-medium uppercase tracking-wider text-white/70">{label}</Text>
  </View>
);

export default function SubjectDetailPage() {
  const { id, gradientColors } = useLocalSearchParams();
  const router = useRouter();
  const { shouldShowAds } = useProAccess();

  // State
  const [subject] = useAtom(subjectAtom);
  const [loading] = useAtom(loadingAtom);
  const fetchSubject = useSetAtom(fetchSubjectAtom);

  // Ads
  const [rewardedAdLoaded] = useAtom(rewardedAdLoadedAtom);
  const initializeRewardedAd = useSetAtom(initializeRewardedAdAtom);
  const loadRewardedAd = useSetAtom(loadRewardedAdAtom);
  const showRewardedAd = useSetAtom(showRewardedAdAtom);

  // --- Effects ---
  useEffect(() => {
    if (id) fetchSubject(id as string, false);
  }, [id, fetchSubject]);

  useEffect(() => {
    if (shouldShowAds()) {
      return initializeRewardedAd();
    }
  }, [initializeRewardedAd, shouldShowAds]);

  useFocusEffect(() => {
    if (shouldShowAds()) loadRewardedAd();
  });

  const onRefresh = () => {
    if (id) fetchSubject(id as string, true);
  };

  const handleSubjectQuiz = async () => {
    if (shouldShowAds()) {
      await showRewardedAd();
    }
    router.push(`/subjects/${subject?._id}/quiz`);
  };

  if (loading || !subject) {
    return <SubjectDetailSkeleton />;
  }

  // --- Data Calculation ---
  const totalQuestions = subject.stats?.totalQuestions ?? 0;
  const correctAnswers = subject.userStats?.correctlyAnsweredQuestions ?? 0;
  const progressPercent = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const roundedProgress = Math.round(progressPercent);
  const gradient = gradientColors ? JSON.parse(gradientColors as string) as string[] : ['#3B82F6', '#2563EB'];

  return (
    <View className="flex-1 bg-neutral-50">
      <CustomHeader title="Subject Details" showBack />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        {/* --- Hero Section --- */}
        <View className="px-4 pt-4">
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <LinearGradient
              colors={gradient as any} // Indigo to Violet
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="relative overflow-hidden rounded-[32px] p-6 shadow-xl shadow-neutral-600">
              {/* Decorative Circles */}
              <View className="absolute -right-4 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
              <View className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-black/5 blur-2xl" />
              {/* <View className="absolute -right-10 -bottom-10 h-36 w-36 rounded-full bg-black/20 blur-2xl" /> */}

              {/* Top Row: Icon & Title */}
              <View className="mb-6 flex-row items-center">
                <View className="h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/20">
                  <Text className="text-3xl font-black text-white">{subject.name.charAt(0)}</Text>
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-2xl font-bold leading-tight text-white">
                    {subject.name}
                  </Text>
                  <Text className="text-sm font-medium text-indigo-100">
                    {subject.topics?.length || 0} Topics Available
                  </Text>
                </View>
              </View>

              {/* Stats Grid */}
              <View className="mb-6 flex-row justify-between">
                <StatBadge icon="book-open-page-variant" value={totalQuestions} label="Questions" />
                <StatBadge icon="check-circle-outline" value={correctAnswers} label="Solved" />
                <StatBadge icon="chart-donut" value={`${roundedProgress}%`} label="Mastery" />
              </View>

              {/* Progress Bar */}
              <View className="mb-6">
                <View className="mb-2 flex-row justify-between">
                  <Text className="text-xs font-bold uppercase text-indigo-100">Progress</Text>
                  <Text className="text-xs font-bold text-white">{roundedProgress}% Complete</Text>
                </View>
                <ProgressBar
                  value={progressPercent}
                  color={colors.neutral[50]}
                  className="bg-black/20"
                />
              </View>

              {/* CTA Button */}
              <Button
                title="Start The Quiz "
                rightIcon="play-outline"
                rightIconColor={colors.neutral[800]}
                onPress={() => handleSubjectQuiz()}
                className=" flex-1 rounded-2xl bg-neutral-50 shadow-md z-40"
                textClassName="text-neutral-800 text-lg font-bold"
                disabled={!rewardedAdLoaded && shouldShowAds()}
                loading={!rewardedAdLoaded && shouldShowAds()}
              />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* --- Topics Section --- */}
        <View className="mt-8 px-6">
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            className="mb-4 flex-row items-end justify-between">
            <View>
              <Text className="text-xl font-bold text-neutral-800">Topics</Text>
              <Text className="text-sm text-neutral-400">Deep dive into specific areas</Text>
            </View>
          </Animated.View>

          {subject.topics && subject.topics.length > 0 ? (
            <View className="flex-row flex-wrap justify-between">
              {subject.topics.map((topic, index) => (
                <TopicCard
                  key={topic._id}
                  index={index}
                  topic={topic}
                  subjectId={subject._id}
                  // isAdmin={user?.role === 'admin'}
                  onTakeQuiz={() => router.push(`/topics/${topic._id}/quiz`)}
                  onViewDetails={() => router.push(`/topics/${topic._id}`)}
                />
              ))}
            </View>
          ) : (
            <View className="items-center justify-center py-10 opacity-50">
              <MaterialCommunityIcons name="bookshelf" size={48} color={colors.neutral[400]} />
              <Text className="mt-4 font-medium text-neutral-500">No topics available yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
