import React, { useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView} from 'react-native';
import { useRouter } from 'expo-router';
import { testApi } from 'services/api';
import { Button } from 'components/ui/button';
import AnswerOption from 'components/quiz/AnswerOption';
import QuizReview from 'components/questions/QuizReview';
import QuizHeader from 'components/quiz/QuizHeader';
import JumpToQuestionModal from 'components/quiz/JumpToQuestionModal';
import { SimpleSelect } from 'components/ui/SimpleSelect';

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
  const [duration, setDuration] = useState(60 * 60); // seconds, once started
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showJumpModal, setShowJumpModal] = useState(false);

  // Pre-test configuration state
  const [configCount, setConfigCount] = useState(100);
  const [configDuration, setConfigDuration] = useState(180); // minutes
  const [configDifficulty, setConfigDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>(
    'mixed'
  );
  const [configuring, setConfiguring] = useState(true);

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
      setDuration(data.timeLimit);
      setSessionId(data.sessionId);
      setConfiguring(false);
    } catch (e: any) {
      setError(e?.response?.data?.errors?.[0]?.msg || 'Failed to start comprehensive test');
    } finally {
      setLoading(false);
    }
  };

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
        timeSpent: duration, // optional: real time could be tracked separately
      };
      const res = await testApi.submitComprehensive(payload);
      setResult(res.data.data);
      setShowReview(true);
    } catch (e: any) {
      // Render configuration UI before starting the test

      setError(e?.response?.data?.errors?.[0]?.msg || 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="mb-4 text-red-500">{error}</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  if (showReview && result) {
    // Use the shared QuizReview component for consistency
    // Map server review (result.review) to QuizReview props
    const reviewQuestions = result.review.map((r: any) => ({
      question: r.question,
      timeSpent: r.timeSpent,
      isCorrect: r.isCorrect,
      userAnswer: { selectedAnswer: r.selectedAnswer },
    }));

    return (
      <QuizReview
        reviewQuestions={reviewQuestions}
        userAnswers={answers}
        onBack={() => router.back()}
        totalTime={duration}
      />
    );
  }

  if (configuring) {
    return (
      <View className="flex-1 bg-background">
        <ScrollView contentContainerClassName="flex-1 bg-background p-4">
          <Text className="mb-4 text-2xl font-bold text-primary">Configure Comprehensive Test</Text>
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
              <Text className="mx-2 text-lg font-bold text-primary">{configCount}</Text>
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
              <Text className="mx-2 text-lg font-bold text-primary">{configDuration}</Text>
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
          <Text className="mb-2 p-2 text-sm text-red-600">
            Please review your settings before starting the test. Once started, the timer will begin
            and you must complete all questions before time runs out.
          </Text>
          <Button
            title={loading ? 'Starting...' : 'Start Test'}
            onPress={startTest}
            disabled={loading}
            className="rounded-xl bg-green-500 py-4 shadow-green-600 "
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
    <ScrollView contentContainerClassName="bg-background p-4">
      <QuizHeader
        current={currentIndex}
        total={questions.length}
        elapsed={{ current: 0 } as any}
        duration={duration}
        onExpire={handleSubmit}
        showTimeDisplay={false}
        showTimer={true}
      />
      <View className="mb-4 rounded-2xl bg-white p-6 shadow">
        <Text className="mb-2 text-lg font-bold text-neutral-800">
          Question {currentIndex + 1} / {questions.length}
        </Text>
        <Text className="mb-4 text-lg leading-6 text-blue-400">{q.text}</Text>
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
    </ScrollView>
  );
}
