import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import RenderHTML from 'react-native-render-html';
import { ActionSheetRef } from 'react-native-actions-sheet';
import { useAtom } from 'jotai';

// Store & Hooks
import { testApi } from 'services/api';
import { testStateAtom } from 'store/comprehensive-test-strore';
import { useProAccess } from 'hooks/useProAccess';
import { customHTMLElementModels, renderers, tagsStyles } from 'lib/HtmlRenderers';

// Components
import { Button } from 'components/ui/button';
import AnswerOption from 'components/quiz/AnswerOption';
import QuizHeader from 'components/quiz/QuizHeader';
import JumpToQuestionModal from 'components/quiz/JumpToQuestionModal';
import TestReview from 'components/test/TestReview';
import { RestrictAccess } from '../../components/pro/RestrictAccess';
import ProUpgradeSheet from 'components/pro/ProUpgradeSheet';
import colors from 'tailwindcss/colors';
import { Question } from 'types/types';

// --- Sub-Component: Configuration Card ---
const ConfigCard = ({
  label,
  icon,
  value,
  onIncrease,
  onDecrease,
  min,
  max,
  step = 1,
  suffix = '',
}: any) => (
  <View className="mb-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
    <View className="mb-4 flex-row items-center">
      <View className="mr-3 rounded-lg bg-indigo-50 p-2">
        <MaterialCommunityIcons name={icon} size={20} color={colors.indigo[500]} />
      </View>
      <Text className="text-base font-bold text-slate-700">{label}</Text>
    </View>

    <View className="flex-row items-center justify-between rounded-xl bg-slate-50 p-1">
      <TouchableOpacity
        onPress={onDecrease}
        disabled={value <= min}
        className={`h-10 w-12 items-center justify-center rounded-lg ${value <= min ? 'bg-transparent' : 'bg-white shadow-sm'}`}>
        <MaterialCommunityIcons
          name="minus"
          size={20}
          color={value <= min ? colors.slate[300] : colors.slate[700]}
        />
      </TouchableOpacity>

      <Text className="text-lg font-bold text-slate-800">
        {value} <Text className="text-sm font-normal text-slate-500">{suffix}</Text>
      </Text>

      <TouchableOpacity
        onPress={onIncrease}
        disabled={value >= max}
        className={`h-10 w-12 items-center justify-center rounded-lg ${value >= max ? 'bg-transparent' : 'bg-white shadow-sm'}`}>
        <MaterialCommunityIcons
          name="plus"
          size={20}
          color={value >= max ? colors.slate[300] : colors.slate[700]}
        />
      </TouchableOpacity>
    </View>
  </View>
);

// --- Sub-Component: Difficulty Selector ---
const DifficultyOption = ({ label, value, selected, onSelect }: any) => {
  const isSelected = selected === value;
  return (
    <TouchableOpacity
      onPress={() => onSelect(value)}
      className={`flex-1 items-center justify-center rounded-xl border py-3 ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-200 bg-white'}`}>
      <Text className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-600'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default function ComprehensiveTestPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [timeLimitSec, setTimeLimitSec] = useState(60 * 60);
  const [startTimeMs, setStartTimeMs] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showJumpModal, setShowJumpModal] = useState(false);

  // Configuration
  const [configCount, setConfigCount] = useState(50);
  const [configDuration, setConfigDuration] = useState(60);
  const [configDifficulty, setConfigDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>(
    'mixed'
  );
  const [configuring, setConfiguring] = useState(true);

  // Atoms & Hooks
  const [testState, setTestState] = useAtom(testStateAtom);
  const proUpgradeSheetRef = useRef<ActionSheetRef>(null);
  const { canAccessComprehensiveTests, loading: proLoading } = useProAccess();

  const getRemaining = () => {
    if (!startTimeMs) return timeLimitSec;
    const elapsed = Math.floor((Date.now() - startTimeMs) / 1000);
    return Math.max(0, timeLimitSec - elapsed);
  };

  const startTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await testApi.startComprehensive({
        count: configCount,
        duration: configDuration,
        difficulty: configDifficulty,
      });
      const data = res.data.data;
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(undefined));
      setTimeLimitSec(data.timeLimit);
      const now = Date.now();
      setStartTimeMs(now);
      setSessionId(data.sessionId);

      setTestState({
        SID: data.sessionId,
        Qs: data.questions,
        ANS: new Array(data.questions.length).fill(null),
        ST: String(now),
        IDX: '0',
        TL: String(data.timeLimit),
      });
      setConfiguring(false);
    } catch (e: any) {
      setError(e?.response?.data?.errors?.[0]?.msg || 'Failed to start comprehensive test');
    } finally {
      setLoading(false);
    }
  };

  // Resume Session Logic
  useEffect(() => {
    try {
      const { SID, Qs, ANS, ST, IDX, TL } = testState;
      if (SID && Qs && ST && TL && Qs.length > 0) {
        setSessionId(SID);
        setQuestions(Qs);
        setAnswers(ANS ? ANS : new Array(Qs.length).fill(null));
        setStartTimeMs(parseInt(ST, 10));
        setTimeLimitSec(parseInt(TL, 10));
        setCurrentIndex(IDX ? parseInt(IDX, 10) : 0);
        setConfiguring(false);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist State
  useEffect(() => {
    if (!configuring) {
      setTestState((prev) => ({ ...prev, ANS: answers, IDX: String(currentIndex) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, currentIndex, configuring]);

  const handleSelect = (idx: number) => {
    const newAns = [...answers];
    newAns[currentIndex] = idx;
    setAnswers(newAns);
  };

  const submitTest = async () => {
    if (sessionId == null) return;
    setSubmitting(true);
    try {
      const payload = {
        sessionId,
        answers: answers.map((a, i) => ({ questionId: questions[i]._id, selectedAnswer: a })),
        timeSpent: timeLimitSec - getRemaining(),
      };
      const res = await testApi.submitComprehensive(payload);
      setResult(res.data.data);
      setShowReview(true);
      setTestState({ SID: '', Qs: [], ANS: [], ST: '', IDX: '', TL: '' }); // Clear persist
    } catch (e: any) {
      setError(e?.response?.data?.errors?.[0]?.msg || 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSubmit = () => {
    Alert.alert('Submit Test?', 'Are you sure you want to finish?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Submit', style: 'default', onPress: submitTest },
    ]);
  };

  const handleTimeExpire = useCallback(() => {
    // Automatically submit without alert when time runs out
    submitTest();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, answers, timeLimitSec, startTimeMs]);

  const handleCancelTest = () => {
    Alert.alert('Quit Test?', 'Your progress will be lost.', [
      { text: 'Continue Test', style: 'cancel' },
      {
        text: 'Quit',
        style: 'destructive',
        onPress: () => {
          setQuestions([]);
          setAnswers([]);
          setResult(null);
          setShowReview(false);
          setStartTimeMs(null);
          setSessionId(null);
          setTestState({ SID: '', Qs: [], ANS: [], ST: '', IDX: '', TL: '' }); // Clear persist
          setConfiguring(true);
          router.back();
        },
      },
    ]);
  };

  // --- Conditionals ---

  if (loading || proLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 font-medium text-slate-500">Preparing environment...</Text>
      </View>
    );
  }

  if (!canAccessComprehensiveTests()) {
    return <RestrictAccess title="Comprehensive Tests" featureName="Full-length exams" />;
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-6">
        <View className="mb-4 rounded-full bg-red-50 p-4">
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.red[500]} />
        </View>
        <Text className="mb-2 text-center text-xl font-bold text-slate-800">
          Something went wrong
        </Text>
        <Text className="mb-6 text-center text-slate-500">{error}</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          className="bg-slate-800 px-8"
          textClassName="text-white"
        />
      </View>
    );
  }

  if (showReview && result) {
    const items = (result.review || []).map((r: any) => ({
      question: r.question,
      selectedAnswer: r.selectedAnswer,
      correctAnswer: r.correctAnswer,
      isCorrect: r.isCorrect,
    }));
    return (
      <TestReview
        score={result.score}
        correct={result.correct}
        totalQuestions={result.totalQuestions}
        timeSpent={result.timeSpent}
        items={items}
        onBack={() => router.replace('/subjects')}
        onRetake={() => {
          setConfiguring(true);
          setQuestions([]);
          setAnswers([]);
          setResult(null);
          setShowReview(false);
        }}
      />
    );
  }

  // --- Configuration View ---
  if (configuring) {
    return (
      <View className="flex-1 bg-slate-50">
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-slate-100 bg-white px-6 pb-6 pt-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Ionicons name="arrow-back" size={20} color={colors.slate[700]} />
            </TouchableOpacity>
            <View className="flex-1 items-center justify-between">
              <Text className="mb-1 text-3xl font-black text-slate-900">Comprehensive Test</Text>
              <Text className="text-slate-500">Configure your full-length practice exam.</Text>
            </View>
          </View>

          <View className="p-6">
            <ConfigCard
              label="Number of Questions"
              icon="format-list-numbered"
              value={configCount}
              suffix="Questions"
              min={10}
              max={200}
              step={10}
              onDecrease={() => setConfigCount(Math.max(10, configCount - 10))}
              onIncrease={() => setConfigCount(Math.min(200, configCount + 10))}
            />

            <ConfigCard
              label="Test Duration"
              icon="clock-outline"
              value={configDuration}
              suffix="Minutes"
              min={1}
              max={300}
              step={1}
              onDecrease={() => setConfigDuration(Math.max(1, configDuration - 1))}
              onIncrease={() => setConfigDuration(Math.min(300, configDuration + 1))}
            />

            <View className="mb-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <View className="mb-4 flex-row items-center">
                <View className="mr-3 rounded-lg bg-indigo-50 p-2">
                  <MaterialCommunityIcons
                    name="signal-cellular-3"
                    size={20}
                    color={colors.indigo[500]}
                  />
                </View>
                <Text className="text-base font-bold text-slate-700">Difficulty</Text>
              </View>
              <View className="flex-row gap-3">
                <DifficultyOption
                  label="Mixed"
                  value="mixed"
                  selected={configDifficulty}
                  onSelect={setConfigDifficulty}
                />
                <DifficultyOption
                  label="Easy"
                  value="easy"
                  selected={configDifficulty}
                  onSelect={setConfigDifficulty}
                />
              </View>
              <View className="mt-3 flex-row gap-3">
                <DifficultyOption
                  label="Medium"
                  value="medium"
                  selected={configDifficulty}
                  onSelect={setConfigDifficulty}
                />
                <DifficultyOption
                  label="Hard"
                  value="hard"
                  selected={configDifficulty}
                  onSelect={setConfigDifficulty}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Floating Start Button */}
        <Animated.View
          entering={FadeInUp.delay(300)}
          className="absolute bottom-0 w-full border-t border-slate-200 bg-white/90 p-6 backdrop-blur-md"
          style={{ paddingBottom: insets.bottom + 10 }}>
          <TouchableOpacity
            onPress={startTest}
            disabled={loading}
            className="w-full flex-row items-center justify-center rounded-2xl bg-indigo-600 py-4 shadow-lg shadow-indigo-200">
            <Text className="mr-2 text-lg font-bold text-white">Start Exam</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // --- Active Test View ---
  if (!questions || questions.length === 0) return null;
  const q = questions[currentIndex];
  console.log('Question:', JSON.stringify(q, null, 2));

  return (
    <View className="flex-1 bg-slate-100">
      {/* Sticky Header */}
      <View className="relative z-20">
        <QuizHeader
          current={currentIndex}
          total={questions.length}
          startTime={startTimeMs ?? null}
          elapsed={{ current: 0 } as any}
          duration={timeLimitSec}
          onExpire={handleTimeExpire}
          showTimeDisplay={true}
          showTimer={true}
        />
        {/* Cancel Button Overlay (Top Left) */}
        <TouchableOpacity
          onPress={handleCancelTest}
          className="absolute z-50 flex-row items-center rounded-full border border-red-100 bg-red-50 px-4 py-2 shadow-sm"
          style={{ top: -50, right: 10 }}>
          <Text className="text-sm text-red-500">Exit</Text>
          <Ionicons name="close" size={20} color={colors.red[500]} style={{ marginRight: 0 }} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        {/* Question Card */}
        <Animated.View
          key={currentIndex}
          entering={FadeInRight}
          className="mb-6 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <View className="mb-4 flex-row justify-between">
            <Text className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase text-indigo-500">
              Question {currentIndex + 1}
            </Text>
          </View>

          <RenderHTML
            contentWidth={width - 88}
            source={{ html: q.textHtml as string }}
            customHTMLElementModels={customHTMLElementModels}
            renderers={renderers}
            tagsStyles={tagsStyles}
            defaultTextProps={{ selectable: false }}
            renderersProps={{
              img: { enableExperimentalPercentWidth: true },
            }}
          />
        </Animated.View>

        {/* Answer Options */}
        <View className="gap-3">
          {q.options.map((opt: any, idx: number) => (
            <Animated.View key={`${currentIndex}-${idx}`} entering={FadeInDown.delay(idx * 50)}>
              <AnswerOption
                text={opt.text}
                selected={answers[currentIndex] === idx}
                onPress={() => handleSelect(idx)}
                disabled={submitting}
                // Add visual checkmark if selected
                // rightIcon={answers[currentIndex] === idx ?
                //     <Ionicons name="checkmark-circle" size={24} color={colors.indigo[500]} /> : undefined
                // }
              />
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View className="absolute bottom-0 w-full flex-row items-center justify-between border-t border-slate-200 bg-white px-6 pb-8 pt-4 shadow-2xl">
        <TouchableOpacity
          onPress={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0 || submitting}
          className={`rounded-full bg-slate-100 p-3 ${currentIndex === 0 ? 'opacity-50' : ''}`}>
          <Ionicons name="chevron-back" size={24} color={colors.slate[700]} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowJumpModal(true)}
          className="flex-row items-center rounded-xl bg-slate-100 px-4 py-3">
          <MaterialCommunityIcons name="view-grid-outline" size={20} color={colors.slate[600]} />
          <Text className="ml-2 font-semibold text-slate-700">Overview</Text>
        </TouchableOpacity>

        {currentIndex === questions.length - 1 ? (
          <TouchableOpacity
            onPress={handleManualSubmit}
            disabled={submitting}
            className="flex-row items-center rounded-xl bg-green-600 px-6 py-3 shadow-md shadow-green-200">
            <Text className="mr-2 text-base font-bold text-white">
              {submitting ? 'Sending...' : 'Submit'}
            </Text>
            {!submitting && <Ionicons name="checkmark-done" size={20} color="white" />}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            disabled={submitting}
            className="rounded-full bg-indigo-600 p-3 shadow-md shadow-indigo-200">
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <JumpToQuestionModal
        visible={showJumpModal}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        // answers={answers} // Pass answers to visualize progress in modal if supported
        onJump={(idx) => {
          setCurrentIndex(idx);
          setShowJumpModal(false);
        }}
        onClose={() => setShowJumpModal(false)}
        submitting={submitting}
      />

      <ProUpgradeSheet ref={proUpgradeSheetRef} />
    </View>
  );
}
