import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Pressable, RefreshControl } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Link, useRouter } from 'expo-router';
import api from 'services/api';
import { useAtom } from 'jotai';
import { dailyQuestionVisibleAtom, homeStatsAtom } from 'store/home';
import { Button } from '~/ui/button';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ProgressBar } from '~/ProgressBar';
import colors from 'tailwindcss/colors';
import { ActionSheetRef } from 'react-native-actions-sheet';
import AnswerOption from '~/quiz/AnswerOption';
import ExplainSheet from '~/questions/ExplainSheet';
import { Question } from 'types/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BentoHome() {
  const router = useRouter();
  const [stats, setStats] = useAtom(homeStatsAtom);
  const [loading, setLoading] = useState(true);
  const [dqVisible, setDqVisible] = useAtom(dailyQuestionVisibleAtom);
  const insets = useSafeAreaInsets();

  const run = async (isMounted: boolean) => {
    try {
      setLoading(true);
      const res = await api.get('/users/me/stats');
      setStats(res.data?.data || null);
    } catch (e) {
      console.error('Failed to fetch stats:', e);
      // noop
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    run(isMounted);
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line
  }, [setStats, setLoading]);

  if (loading) {
    return <BentoHomeSkeleton />;
  }

  return (
    <ScrollView
      className="flex-1 bg-background p-4"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => run(true)}
          colors={[colors.blue[500], colors.rose[500]]}
        />
      }>
      <>
        {/* Bento Grid */}
        <View style={{ paddingTop: insets.top, marginBottom: 16 }}>
          <Text className=" font-bold text-blue-500" style={{ fontSize: 32 }}>
            PhysioPrep
          </Text>
        </View>
        <View className="flex-1 flex-row gap-2">
          {/* Left: Primary metric */}
          <Animated.View entering={FadeInDown.delay(50).springify()} className="flex-1">
            <View className="flex-1 justify-center gap-2 rounded-3xl bg-blue-500 p-5 shadow-lg shadow-slate-600">
              <Text className="text-sm text-blue-200">Correct Answers</Text>
              <Text className="text-4xl font-bold text-white">
                {stats?.totalCorrectlyAnswered ?? 0}
                <Text className="text-2xl font-bold text-white">
                  {' '}
                  / {stats?.totalQuestions ?? 0}
                </Text>
              </Text>
              <Text className="text-sm text-blue-100">
                Accuracy {stats?.accuracyPercentage ?? 0}% · Avg time{' '}
                {stats?.averageTimePerQuestion ?? 0}s
              </Text>
            </View>
          </Animated.View>

          {/* Right: Top streak, Bottom daily question CTA */}
          <View className="flex-1 gap-2">
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <View className="gap-2 rounded-3xl bg-rose-500 p-5 shadow-2xl shadow-rose-500">
                <Text className="text-sm text-rose-100">Current Streak</Text>
                <Text className="text-3xl font-bold text-white">
                  {stats?.currentStreak ?? 0} 🔥
                </Text>
                {/* <Text style={{ color: '#94A3B8', fontSize: 12 }}>Keep it going!</Text> */}
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(150).springify()}>
              {/* <TouchableOpacity
              onPress={() => setDqVisible(true)}
              style={{ backgroundColor: '#1F2937', borderRadius: 16, padding: 16 }}>
              <Text style={{ color: '#D1D5DB', fontSize: 14 }}>Daily Question</Text>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Answer today’s question →
              </Text>
              <Text style={{ color: '#9CA3AF', marginTop: 6 }}>
                {stats?.questionsAnsweredToday
                  ? 'You’ve answered today'
                  : 'Available until midnight'}
              </Text>
            </TouchableOpacity> */}
              <Button
                title="Daily Question"
                onPress={() => setDqVisible(true)}
                className="rounded-full bg-green-500 py-4 shadow-lg shadow-black"
                textClassName="text-white"
                rightIcon={
                  <MaterialCommunityIcons name="arrow-top-right" size={20} color="white" />
                }
              />
            </Animated.View>
          </View>
        </View>
      </>

      {/* Embedded Daily Question inside Home */}
      {dqVisible && (
        <Animated.View entering={FadeInDown.delay(300).springify()} style={{ marginTop: 16 }}>
          <DailyQuestionCard onClose={() => setDqVisible(false)} />
        </Animated.View>
      )}

      {/* Subjects performance */}
      <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 16 }}>
        <View className="mb-2 flex-row gap-1 ">
          <MaterialCommunityIcons name="heart" size={18} color={colors.rose[500]} />
          <Text className="text-md font-bold text-slate-400">Favorite Subjects</Text>
        </View>
        <View className="flex-row flex-wrap gap-3">
          {stats?.favoriteSubjects?.slice(0, 4).map((s) => (
            <View
              key={s.id}
              className="w-[48%] flex-row items-center gap-2 rounded-2xl bg-white p-4 shadow-md shadow-slate-600">
              <Text className="rounded-full bg-rose-500 px-3.5 py-2 text-white">{s.name[0]}</Text>
              <Text className="text-lg font-bold text-slate-700">{s.name}</Text>
              {/* <Text className="text-sm text-white">
                {JSON.stringify(s)}
              </Text> */}
            </View>
          ))}
          {!stats?.favoriteSubjects?.length && (
            <Text style={{ color: '#6B7280' }}>No activity yet. Start a quiz!</Text>
          )}
        </View>
      </Animated.View>

      {/* Recent activity */}
      {/* <Animated.View entering={FadeInDown.delay(250).springify()} style={{ marginTop: 16 }}>
        <Text style={{ color: '#9CA3AF', marginBottom: 8 }}>Recent Activity</Text>
        <View style={{ gap: 8 }}>
          {stats?.recentActivity?.map((a, idx) => (
            <View key={idx} style={{ backgroundColor: '#0B1220', borderRadius: 12, padding: 12 }}>
              <Text style={{ color: 'white' }}>
                {a.isCorrect ? '✅' : '❌'} Question {String(a.questionId).slice(-6)} •{' '}
                {a.timeSpent}s
              </Text>
              <Text style={{ color: '#94A3B8', fontSize: 12 }}>
                {new Date(a.attemptedAt).toLocaleString()}
              </Text>
            </View>
          ))}
          {!stats?.recentActivity?.length && (
            <Text style={{ color: '#6B7280' }}>No recent attempts.</Text>
          )}
        </View>
      </Animated.View> */}

      {/* Questions Solved Per Subject */}
      <Animated.View entering={FadeInDown.delay(300).springify()} style={{ marginTop: 16 }}>
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row gap-1 ">
            <MaterialCommunityIcons name="chart-line" size={18} color={colors.rose[500]} />
            <Text className="text-md font-bold text-slate-400">Your Progress </Text>
          </View>
          <Link href="/subjects" className="text-sm text-blue-500">
            View All
          </Link>
        </View>

        <View className=" gap-3">
          <View className="flex-row flex-wrap gap-3">
            {stats?.questionsSolvedPerSubject?.slice(0, 6).map((s, idx) => (
              <Pressable
                onPress={() => router.push(`/subjects/${s.id}`)}
                key={idx}
                className="w-[48%] rounded-2xl bg-white p-4 shadow-md shadow-slate-600">
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-md font-bold text-slate-700">{s.name}</Text>
                  <Text style={{ fontSize: 13, color: '#64748B' }}>
                    {((s.solved / s.totalQuestions) * 100).toFixed(1)}%
                  </Text>
                </View>
                <ProgressBar value={(s.solved / s.totalQuestions) * 100} />
              </Pressable>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* <Animated.View entering={FadeInDown.delay(100).springify()} className="my-4 flex-row gap-2">
        <Button
          title="Take Test"
          onPress={() => router.push('/comprehensive-test')}
          className="flex-1 rounded-3xl bg-green-500 py-4 shadow-lg shadow-black"
          textClassName="text-white mr-1"
          rightIcon={<MaterialCommunityIcons name="arrow-top-right" size={20} color="white" />}
        />
        <Button
          title="Explore Subjects"
          onPress={() => router.push('/subjects')}
          className="flex-1 rounded-3xl bg-blue-500 py-4 shadow-lg shadow-black"
          textClassName="text-white"
          rightIcon="earth-sharp"
        />
      </Animated.View> */}

      <View className="h-32" />
    </ScrollView>
  );
}

function DailyQuestionCard({ onClose }: { onClose: () => void }) {
  const explainRef = useRef<ActionSheetRef>(null);
  const [state, setState] = useState<{
    question: Question | null;
    hasAnswered: boolean;
    selected: string | null;
    submitting: boolean;
    result: null | { isCorrect: boolean };
    userResponse: {
      selectedOptionId: string;
      isCorrect: boolean;
      timeSpent: number;
      answeredAt: string;
    } | null;
  }>({
    question: null,
    hasAnswered: false,
    selected: null,
    submitting: false,
    result: null,
    userResponse: null,
  });

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await api.get('/daily-questions');
        if (!alive) return;
        const { question, hasAnswered } = res.data?.data || {};
        setState((s) => ({ ...s, question, hasAnswered }));
      } catch {}
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  const onSubmit = async () => {
    if (!state.question || !state.selected || state.submitting) return;
    try {
      setState((s) => ({ ...s, submitting: true }));
      const res = await api.post('/daily-questions/submit', {
        selectedOptionId: state.selected,
        timeSpent: 0,
      });
      const { isCorrect } = res.data?.data || { isCorrect: false };
      setState((s) => ({ ...s, result: { isCorrect }, hasAnswered: true }));

      // Show explanation after submission
      if (state.question?.explanationHtml) {
        explainRef.current?.show();
      }
    } catch {
      // noop
    } finally {
      setState((s) => ({ ...s, submitting: false }));
    }
  };

  if (!state.question) {
    return (
      <View style={{ backgroundColor: '#0F172A', borderRadius: 16, padding: 16 }}>
        <Text style={{ color: '#94A3B8' }}>Loading daily question...</Text>
      </View>
    );
  }

  return (
    <>
      <View className="rounded-3xl bg-[#0F172A] p-6">
        <View className="mb-2 flex-row justify-between">
          <Text className="text-lg font-bold text-white">Today&apos;s Question</Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-red-500">Close</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: '#CBD5E1', marginBottom: 12 }}>{state.question?.text}</Text>

        <View style={{ gap: 8 }}>
          {state.hasAnswered ? (
            <View className=" gap-2 ">
              {/* <Text style={{ color: '#94A3B8' }}>
                {state.result?.isCorrect ? 'Correct!' : 'Incorrect.'}
              </Text> */}
              <Text className="text-xl text-white">You have already answered this question.</Text>
              <Text style={{ color: '#94A3B8' }}>Your answer:</Text>
              <AnswerOption
                text={
                  state.question?.options?.find(
                    (o) => o._id === state.userResponse?.selectedOptionId
                  )?.text as string
                }
                onPress={() => {}}
                selected={true}
                correctAnswer={state.result?.isCorrect}
              />
              <Text style={{ color: '#94A3B8' }}>Correct answer:</Text>
              <AnswerOption
                text={state.question?.options?.find((o) => o.isCorrect)?.text as string}
                onPress={() => {}}
                selected={true}
                correctAnswer={true}
              />
            </View>
          ) : (
            // <Text style={{ color: '#94A3B8' }}>Select an answer:</Text>
            state.question?.options?.map((opt: any, idx: number) => {
              const isSelected = state.selected === (opt._id || opt.id);
              const correctAnswer = state.hasAnswered ? opt.isCorrect : undefined;

              return (
                <AnswerOption
                  key={opt._id || opt.id}
                  text={opt.text}
                  selected={isSelected}
                  correctAnswer={correctAnswer}
                  onPress={() => setState((s) => ({ ...s, selected: opt._id || opt.id }))}
                  disabled={state.hasAnswered}
                />
              );
            })
          )}
        </View>

        {!state.hasAnswered && (
          <TouchableOpacity
            onPress={onSubmit}
            style={{ marginTop: 12, backgroundColor: '#22D3EE', borderRadius: 12, padding: 12 }}>
            <Text style={{ color: '#0B1220', fontWeight: '700', textAlign: 'center' }}>Submit</Text>
          </TouchableOpacity>
        )}

        {state.result && (
          <Text style={{ color: state.result.isCorrect ? '#34D399' : '#F87171', marginTop: 10 }}>
            {state.result.isCorrect ? 'Correct! 🎉' : 'Incorrect. Keep practicing!'}
          </Text>
        )}
      </View>

      <ExplainSheet
        ref={explainRef}
        title="Explanation"
        html={state.question?.explanationHtml || ''}
      />
    </>
  );
}

// Skeleton component that mirrors the exact BentoHome layout
function BentoHomeSkeleton() {
  const SkeletonBlock = ({ className }: { className?: string }) => (
    <View className={`animate-pulse rounded-md bg-card/50 ${className}`} />
  );
  const insets = useSafeAreaInsets();

  return (
    <ScrollView className="flex-1 bg-background p-4" showsVerticalScrollIndicator={false}>
      <View style={{ paddingTop: insets.top, marginBottom: 16 }}>
        <Text className=" font-bold text-blue-500" style={{ fontSize: 32 }}>
          PhysioPrep
        </Text>
      </View>
      {/* Main Bento Grid Skeleton */}
      <View className="flex-1 flex-row gap-2">
        {/* Left: Primary metric card skeleton */}
        <Animated.View entering={FadeInDown.delay(50).springify()} className="flex-1">
          <View className="flex-1 justify-center gap-2 rounded-3xl bg-blue-500 p-5 shadow-lg shadow-slate-600/20">
            <SkeletonBlock className="h-4 w-24 bg-blue-200/40" />
            <View className="flex-row items-baseline gap-1">
              <SkeletonBlock className="h-10 w-16 bg-white/40" />
              <SkeletonBlock className="h-6 w-8 bg-white/40" />
              <SkeletonBlock className="h-6 w-12 bg-white/40" />
            </View>
            <SkeletonBlock className="h-4 w-40 bg-blue-100/40" />
          </View>
        </Animated.View>

        {/* Right: Streak and Daily Question skeleton */}
        <View className="flex-1 gap-2">
          {/* Streak card skeleton */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <View className="gap-2 rounded-3xl bg-rose-500 p-5 shadow-2xl shadow-rose-500/20">
              <SkeletonBlock className="h-4 w-20 bg-rose-100/40" />
              <View className="flex-row items-center gap-2">
                <SkeletonBlock className="h-8 w-8 bg-white/40" />
                <SkeletonBlock className="h-6 w-6 rounded-full bg-white/40" />
              </View>
            </View>
          </Animated.View>

          {/* Daily Question button skeleton */}
          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <View className="rounded-full bg-green-500 px-5 py-4 shadow-lg shadow-black/20">
              <View className="flex-row items-center justify-center gap-2">
                <SkeletonBlock className="h-5 w-24 bg-white/40" />
                <SkeletonBlock className="h-5 w-5 rounded-full bg-white/40" />
              </View>
            </View>
          </Animated.View>
        </View>
      </View>

      {/* Favorite Subjects section skeleton */}
      <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 16 }}>
        <View className="mb-2 flex-row gap-1">
          <SkeletonBlock className="h-4 w-4 rounded-full bg-rose-500/40" />
          <SkeletonBlock className="h-4 w-32 bg-slate-400/40" />
        </View>
        <View className="flex-row flex-wrap gap-3">
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              className="w-[48%] flex-row items-center gap-2 rounded-2xl bg-white/50 p-4 shadow-md shadow-slate-600/20">
              <SkeletonBlock className="h-8 w-8 rounded-full bg-rose-500/40" />
              <SkeletonBlock className="h-5 w-16 bg-slate-700/40" />
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Your Progress section skeleton */}
      <Animated.View entering={FadeInDown.delay(300).springify()} style={{ marginTop: 16 }}>
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row gap-1">
            <SkeletonBlock className="h-4 w-4 rounded-full bg-rose-500/40" />
            <SkeletonBlock className="h-4 w-24 bg-slate-400/40" />
          </View>
          <SkeletonBlock className="h-4 w-16 bg-blue-500/40" />
        </View>

        <View className="gap-3">
          <View className="flex-row flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View
                key={i}
                className="w-[48%] rounded-2xl bg-white/50 p-4 shadow-md shadow-slate-600/20">
                <View className="mb-2 flex-row items-center justify-between">
                  <SkeletonBlock className="h-5 w-20 bg-slate-700/40" />
                  <SkeletonBlock className="h-4 w-10 bg-slate-600/40" />
                </View>
                {/* Progress bar skeleton */}
                <View className="h-2 rounded-full bg-gray-200/60">
                  <SkeletonBlock className="h-2 w-3/5 rounded-full bg-blue-500/40" />
                </View>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Bottom spacing */}
      <View className="h-32" />
    </ScrollView>
  );
}
