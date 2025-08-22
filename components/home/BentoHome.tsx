import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import api from 'services/api';
import { useAtom } from 'jotai';
import { dailyQuestionVisibleAtom, homeLoadingAtom, homeStatsAtom } from 'lib/atoms/home';

export default function BentoHome() {
  const router = useRouter();
  const [stats, setStats] = useAtom(homeStatsAtom);
  const [loading, setLoading] = useAtom(homeLoadingAtom);
  const [dqVisible, setDqVisible] = useAtom(dailyQuestionVisibleAtom);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        setLoading(true);
        const res = await api.get('/users/me/stats');
        if (!isMounted) return;
        setStats(res.data?.data || null);
      } catch (e) {
        // noop
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [setStats, setLoading]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* Bento Grid */}
      <View className="flex-row gap-2">
        {/* Left: Primary metric */}
        <Animated.View entering={FadeInDown.delay(50).springify()} className="flex-1">
          <View className="flex-1 gap-2 rounded-2xl bg-primary p-5 justify-center shadow-lg shadow-black">
            <Text className="text-sm text-blue-500">Correct Answers</Text>
            <Text className="text-4xl font-bold text-white">
              {stats?.totalCorrectlyAnswered ?? 0}
            </Text>
            <Text className="text-sm text-white">
              Accuracy {stats?.accuracyPercentage ?? 0}% · Avg time{' '}
              {stats?.averageTimePerQuestion ?? 0}s
            </Text>
          </View>
        </Animated.View>

        {/* Right: Top streak, Bottom daily question CTA */}
        <View className="flex-auto gap-2">
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <View className="gap-2 rounded-2xl bg-card p-5">
              <Text className="text-sm text-neutral-500">Current Streak</Text>
              <Text className="text-2xl font-bold text-white">{stats?.currentStreak ?? 0} 🔥</Text>
              {/* <Text style={{ color: '#94A3B8', fontSize: 12 }}>Keep it going!</Text> */}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <TouchableOpacity
              onPress={() => setDqVisible(true)}
              style={{ backgroundColor: '#1F2937', borderRadius: 16, padding: 16 }}>
              <Text style={{ color: '#D1D5DB', fontSize: 14 }}>Daily Question</Text>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Answer today’s question →
              </Text>
              {/* <Text style={{ color: '#9CA3AF', marginTop: 6 }}>
                {stats?.questionsAnsweredToday
                  ? 'You’ve answered today'
                  : 'Available until midnight'}
              </Text> */}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* Subjects performance */}
      <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 16 }}>
        <Text style={{ color: '#9CA3AF', marginBottom: 8 }}>Favorite Subjects</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {stats?.favoriteSubjects?.map((s) => (
            <View
              key={s.id}
              style={{ width: '48%', backgroundColor: '#111827', borderRadius: 12, padding: 12 }}>
              <Text style={{ color: s.color || '#FF6B6B', fontWeight: '700' }}>{s.name}</Text>
              <Text style={{ color: '#D1D5DB' }}>{s.attempts} attempts</Text>
            </View>
          ))}
          {!stats?.favoriteSubjects?.length && (
            <Text style={{ color: '#6B7280' }}>No activity yet. Start a quiz!</Text>
          )}
        </View>
      </Animated.View>

      {/* Recent activity */}
      <Animated.View entering={FadeInDown.delay(250).springify()} style={{ marginTop: 16 }}>
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
      </Animated.View>

      {/* Embedded Daily Question inside Home */}
      {dqVisible && (
        <Animated.View entering={FadeInDown.delay(300).springify()} style={{ marginTop: 16 }}>
          <DailyQuestionCard onClose={() => setDqVisible(false)} />
        </Animated.View>
      )}
    </ScrollView>
  );
}

function DailyQuestionCard({ onClose }: { onClose: () => void }) {
  const [state, setState] = React.useState<{
    question: any | null;
    hasAnswered: boolean;
    selected: string | null;
    submitting: boolean;
    result: null | { isCorrect: boolean };
  }>({ question: null, hasAnswered: false, selected: null, submitting: false, result: null });

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
    <View style={{ backgroundColor: '#0F172A', borderRadius: 16, padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
          Today’s Daily Question
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={{ color: '#94A3B8' }}>Close</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ color: '#CBD5E1', marginBottom: 12 }}>
        {state.question?.text || state.question?.questionText}
      </Text>
      <View style={{ gap: 8 }}>
        {state.question?.options?.map((opt: any) => (
          <TouchableOpacity
            key={opt._id || opt.id}
            style={{
              padding: 12,
              borderRadius: 12,
              backgroundColor: state.selected === (opt._id || opt.id) ? '#1F2937' : '#0B1220',
            }}
            disabled={state.hasAnswered}
            onPress={() => setState((s) => ({ ...s, selected: opt._id || opt.id }))}>
            <Text style={{ color: 'white' }}>{opt.text}</Text>
          </TouchableOpacity>
        ))}
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
  );
}
