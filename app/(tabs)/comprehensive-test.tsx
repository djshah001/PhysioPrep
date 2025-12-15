import { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { testApi } from 'services/api';
import { Button } from 'components/ui/button';
import AnswerOption from 'components/quiz/AnswerOption';
import QuizHeader from 'components/quiz/QuizHeader';
import JumpToQuestionModal from 'components/quiz/JumpToQuestionModal';
import { SimpleSelect } from 'components/ui/SimpleSelect';
import { ActionSheetRef } from 'react-native-actions-sheet';

import TestReview from 'components/test/TestReview';
import { useAtom } from 'jotai';
import { testStateAtom } from 'store/comprehensive-test-strore';
import { useProAccess } from 'hooks/useProAccess';
import ProUpgradeSheet from 'components/pro/ProUpgradeSheet';
import { RestrictAccess } from '../../components/pro/RestrictAccess';
import { customHTMLElementModels, renderers, tagsStyles } from 'lib/HtmlRenderers';
import RenderHTML from 'react-native-render-html';

export default function ComprehensiveTestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [timeLimitSec, setTimeLimitSec] = useState(60 * 60); // server provided
  const [startTimeMs, setStartTimeMs] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showJumpModal, setShowJumpModal] = useState(false);

  // Pre-test configuration state
  const [configCount, setConfigCount] = useState(100);
  const [configDuration, setConfigDuration] = useState(180); // minutes
  const [configDifficulty, setConfigDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>(
    'mixed'
  );
  const [configuring, setConfiguring] = useState(true);

  const [testState, setTestState] = useAtom(testStateAtom);
  const proUpgradeSheetRef = useRef<ActionSheetRef>(null);

  // Pro access hook
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
      // persist
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

  // Check pro access when component mounts or user changes
  const canAccess = canAccessComprehensiveTests();

  // Restore persisted session on mount
  useEffect(() => {
    try {
      const { SID, Qs, ANS, ST, IDX, TL } = testState;
      console.log('testState:', testState.Qs.length);
      if (SID && Qs && ST && TL) {
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

  // Persist answers and index when they change
  useEffect(() => {
    setTestState((prev) => ({ ...prev, ANS: answers }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);
  useEffect(() => {
    setTestState((prev) => ({ ...prev, IDX: String(currentIndex) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const handleSelect = (idx: number) => {
    const newAns = [...answers];
    newAns[currentIndex] = idx;
    setAnswers(newAns);
  };

  const handleSubmit = async () => {
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
      // persist
      setShowReview(true);
    } catch (e: any) {
      // Render configuration UI before starting the test

      setError(e?.response?.data?.errors?.[0]?.msg || 'Failed to submit test');
    } finally {
      setSubmitting(false);
      setTestState({ SID: '', Qs: [], ANS: [], ST: '', IDX: '', TL: '' });
    }
  };

  const { width } = useWindowDimensions();

  // Show loading state
  if (loading || proLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-100">
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text className="mt-4 text-center text-neutral-800">
          {proLoading ? 'Checking access...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  // Show locked feature if user doesn't have pro access
  if (!canAccess) {
    return <RestrictAccess />;
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-100 p-6">
        <Text className="mb-4 text-red-500">{error}</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  if (showReview && result) {
    const items = (result.review || []).map((r: any) => ({
      question: {
        _id: r.question._id,
        text: r.question.text,
        options: r.question.options,
        explanationHtml: r.question.explanationHtml,
      },
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

  if (configuring) {
    return (
      <View className="flex-1 bg-neutral-50">
        <ScrollView contentContainerClassName="flex-1 bg-neutral-50 p-4">
          <Text className="mb-4 text-2xl font-bold text-rose-600">
            Configure Comprehensive Test
          </Text>
          <View className="mb-4 rounded-2xl bg-white p-4 shadow">
            <Text className="mb-2 text-base font-semibold text-neutral-600">
              Question Count (10 - 200)
            </Text>
            <View className="flex-row items-center">
              <Button
                title="-"
                onPress={() => setConfigCount(Math.max(10, configCount - 10))}
                className="mr-3"
              />
              <Text className="mx-2 text-lg font-bold text-rose-600">{configCount}</Text>
              <Button
                title="+"
                onPress={() => setConfigCount(Math.min(200, configCount + 10))}
                className="ml-3"
              />
            </View>
          </View>
          <View className="mb-4 rounded-2xl bg-white p-4 shadow">
            <Text className="mb-2 text-base font-semibold text-neutral-600">
              Duration (minutes, 30 - 300)
            </Text>
            <View className="flex-row items-center">
              <Button
                title="-"
                onPress={() => setConfigDuration(Math.max(30, configDuration - 10))}
                className="mr-3"
              />
              <Text className="mx-2 text-lg font-bold text-rose-600">{configDuration}</Text>
              <Button
                title="+"
                onPress={() => setConfigDuration(Math.min(300, configDuration + 10))}
                className="ml-3"
              />
            </View>
          </View>
          <View className="mb-6 rounded-2xl bg-white p-4 shadow">
            <SimpleSelect
              label="Difficulty"
              value={configDifficulty}
              options={[
                { label: 'Mixed', value: 'mixed' },
                { label: 'Easy', value: 'easy' },
                { label: 'Medium', value: 'medium' },
                { label: 'Hard', value: 'hard' },
              ]}
              onSelect={(v) => setConfigDifficulty(v as any)}
            />
          </View>
        </ScrollView>
        <View className="p-4">
          <Text className="mb-2 p-2 text-sm text-neutral-600">
            Review your settings, then start the test. The timer begins immediately.
          </Text>
          <Button
            title={loading ? 'Starting...' : 'Start Test'}
            onPress={startTest}
            disabled={loading}
            className="rounded-2xl bg-neutral-900 py-4 shadow-md"
            textClassName="text-white font-bold"
            rightIcon={'chevron-forward-outline'}
          />
        </View>
      </View>
    );
  }

  if (!questions || questions.length === 0) return null;

  const q = questions[currentIndex];

  return (
    <ScrollView contentContainerClassName="bg-neutral-50 p-4">
      <QuizHeader
        current={currentIndex}
        total={questions.length}
        startTime={startTimeMs ?? null}
        elapsed={{ current: 0 } as any}
        duration={timeLimitSec}
        onExpire={handleSubmit}
        showTimeDisplay={false}
        showTimer={true}
      />
      <View className="mb-4 rounded-2xl bg-white p-6 shadow">
        <Text className="mb-2 text-lg font-bold text-neutral-800">
          Question {currentIndex + 1} / {questions.length}
        </Text>
        {/* <Text className="mb-4 text-lg leading-6 text-blue-400">{q.text}</Text> */}
        <RenderHTML
          contentWidth={width - 48} // Account for padding
          source={{ html: q.textHtml as string }}
          customHTMLElementModels={customHTMLElementModels}
          renderers={renderers}
          tagsStyles={tagsStyles}
          systemFonts={['System']}
          enableExperimentalMarginCollapsing
          defaultTextProps={{ selectable: false }}
          renderersProps={{
            img: { enableExperimentalPercentWidth: true },
          }}
        />
      </View>
      {q.options.map((opt: any, idx: number) => (
        <AnswerOption
          key={idx}
          text={opt.text}
          selected={answers[currentIndex] === idx}
          onPress={() => handleSelect(idx)}
          disabled={submitting}
        />
      ))}

      <View className="mt-6 flex-row items-center justify-between">
        <Button
          title="Previous"
          onPress={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0 || submitting}
          className="mx-2"
          leftIcon="chevron-back-outline"
        />
        <Button
          title="Jump"
          onPress={() => setShowJumpModal(true)}
          disabled={submitting}
          className="mx-2"
          leftIcon="swap-horizontal-outline"
        />
        {currentIndex === questions.length - 1 ? (
          <Button
            title={submitting ? 'Submitting...' : 'Submit'}
            onPress={handleSubmit}
            disabled={submitting || answers.some((a) => a == null)}
            className="mx-2 bg-green-400"
          />
        ) : (
          <Button
            title="Next"
            onPress={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            disabled={submitting}
            className="mx-2"
            rightIcon="chevron-forward-outline"
          />
        )}
      </View>

      <JumpToQuestionModal
        visible={showJumpModal}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        onJump={(idx) => {
          setCurrentIndex(idx);
          setShowJumpModal(false);
        }}
        onClose={() => setShowJumpModal(false)}
        submitting={submitting}
      />

      {/* Pro Upgrade Sheet for test interface */}
      <ProUpgradeSheet
        ref={proUpgradeSheetRef}
        title="Upgrade to Pro"
        subtitle="Unlock unlimited access to comprehensive tests and premium features"
      />
    </ScrollView>
  );
}
