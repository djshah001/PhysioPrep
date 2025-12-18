import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Link, useRouter } from 'expo-router';
import api from 'services/api';
import { useAtom } from 'jotai';
import { dailyQuestionVisibleAtom } from 'store/home';
import { Button } from '~/ui/button';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ProgressBar } from '~/ProgressBar';
import colors from 'tailwindcss/colors';
import { ActionSheetRef } from 'react-native-actions-sheet';
import AnswerOption from '~/quiz/AnswerOption';
import ExplainSheet from '~/questions/ExplainSheet';
import { Question } from 'types/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BentoHomeSkeleton from '~/skeletons/BentoHomeSkeleton';
import ProButton from '../ui/ProButton';
import ProUpgradeSheet from '../pro/ProUpgradeSheet';
import XPLevelCard from '../ui/XPLevelCard';
import { useXPLevel } from '../../hooks/useXPLevel';

export default function BentoHome() {
  const router = useRouter();
  const [dqVisible, setDqVisible] = useAtom(dailyQuestionVisibleAtom);
  const insets = useSafeAreaInsets();
  const proUpgradeSheetRef = useRef<ActionSheetRef>(null);

  // Use XP Level hook for stats and level-up management
  const { stats, loading, refreshStats } = useXPLevel();

  const run = async () => {
    await refreshStats();
  };

  useEffect(() => {
    run();
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return <BentoHomeSkeleton />;
  }

  return (
    <ScrollView
      className="bg-background p-4"
      contentContainerClassName="pb-32"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => run()}
          colors={[colors.blue[500], colors.rose[500]]}
        />
      }>
      <>
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
                Accuracy {stats?.accuracyPercentage ?? 0}% 
                {/* · Avg time {stats?.averageTimePerQuestion}s */}
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
        {/* Second Row: XP/Level and Daily Question */}
        <View className="flex-row">
          {/* Left: XP/Level Card */}
          <View className="flex-1">
            <XPLevelCard
              xp={stats?.xp ?? 0}
              level={stats?.level ?? 1}
              xpToNextLevel={stats?.xpToNextLevel ?? 1000}
              xpInCurrentLevel={stats?.xpInCurrentLevel ?? 0}
              levelProgressPercent={stats?.levelProgressPercent ?? 0}
              hasLeveledUp={stats?.hasLeveledUp ?? false}
              currentBadge={stats?.currentBadge}
              variant="compact"
            />
          </View>
        </View>
      </>

      {/* Embedded Daily Question inside Home */}
      {dqVisible && (
        <Animated.View entering={FadeInDown.delay(300).springify()} style={{ marginTop: 16 }}>
          <DailyQuestionCard onClose={() => setDqVisible(false)} />
        </Animated.View>
      )}

      {/* Pro Upgrade Button */}
      <Animated.View entering={FadeInDown.delay(250).springify()} style={{ marginTop: 24 }}>
        <ProButton
          size="large"
          text="Upgrade to Pro ✨"
          // variant="secondary"
          onPress={() => proUpgradeSheetRef.current?.show()}
        />
      </Animated.View>

      {/* Subjects performance */}
      <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 16 }}>
        <View className="mb-2 flex-row gap-1 ">
          <MaterialCommunityIcons name="heart" size={18} color={colors.rose[500]} />
          <Text className="text-md font-bold text-slate-400">Favorite Subjects</Text>
        </View>
        <View className="flex-row flex-wrap gap-3">
          {stats?.favoriteSubjects?.slice(0, 4).map((s: any) => (
            <View
              key={s?.id}
              className="w-[48%] flex-row items-center gap-2 rounded-2xl bg-white p-4 shadow-md shadow-slate-600">
              <Text className="rounded-full bg-rose-500 px-3.5 py-2 text-white">{s?.name[0]}</Text>
              <Text className="text-lg font-bold text-slate-700">{s?.name}</Text>
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
            {(Array.isArray(stats?.questionsSolvedPerSubject)
              ? stats.questionsSolvedPerSubject
              : []
            )
              .slice(0, 6)
              .map((s: any, idx: number) => {
                const percentage = s.totalQuestions > 0 ? (s.solved / s.totalQuestions) * 100 : 0;
                return (
                  <Pressable
                    onPress={() => router.push(`/subjects/${s.id}`)}
                    key={idx}
                    className="w-[48%] rounded-2xl bg-white p-4 shadow-md shadow-slate-600">
                    <View className="mb-2 flex-row items-center justify-between">
                      <Text className="text-md font-bold text-slate-700">{s.name}</Text>
                      <Text style={{ fontSize: 13, color: '#64748B' }}>
                        {percentage.toFixed(1)}%
                      </Text>
                    </View>
                    <ProgressBar value={percentage} />
                  </Pressable>
                );
              })}
          </View>
        </View>
      </Animated.View>

      <View className="h-32" />


      {/* Pro Upgrade Sheet */}
      <ProUpgradeSheet ref={proUpgradeSheetRef} />
    </ScrollView>
  );
}

function DailyQuestionCard({ onClose }: { onClose: () => void }) {
  const explainRef = useRef<ActionSheetRef>(null);
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      try {
        const res = await api.get('/daily-questions');
        if (!alive) return;
        const { question, hasAnswered } = res.data?.data || {};
        setState((s) => ({ ...s, question, hasAnswered }));
      } catch {
        // console.error('Failed to fetch daily question:', e);
        setState((s) => ({ ...s, question: null, hasAnswered: false }));
      } finally {
        setLoading(false);
      }
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

  if (loading) {
    return (
      <View className="rounded-3xl bg-[#0F172A] p-6">
        <View className="mb-2 flex-row justify-between">
          <Text className="text-lg font-bold text-white">Today&apos;s Question</Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-red-500">Close</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center py-8">
          <ActivityIndicator size="large" color="#22D3EE" />
          <Text className="mt-4 text-slate-400">Loading daily question...</Text>
        </View>
      </View>
    );
  }

  if (!state.question) {
    return (
      <View className="rounded-3xl bg-[#0F172A] p-6">
        <View className="mb-2 flex-row justify-between">
          <Text className="text-lg font-bold text-white">Today&apos;s Question</Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-red-500">Close</Text>
          </TouchableOpacity>
        </View>
        <View className="items-center justify-center py-8">
          <MaterialCommunityIcons name="calendar-question" size={48} color="#64748B" />
          <Text className="mt-4 text-center text-lg text-slate-400">
            No daily question available at the moment
          </Text>
          <Text className="mt-2 text-center text-sm text-slate-500">
            Check back later for today&apos;s question
          </Text>
        </View>
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
