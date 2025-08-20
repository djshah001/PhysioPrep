import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { testApi } from 'services/api';
import { Test } from 'types/types';
import { Button } from 'components/ui/button';
import { SimpleSelect } from 'components/ui/SimpleSelect';
import { useAtom } from 'jotai';
import { CustomHeader } from 'components/common/CustomHeader';
import { testAtom, loadingTestAtom, errorTestAtom, currentTestIndexAtom, testAnswersAtom } from 'store/test';
import { ProgressBar } from 'components/ProgressBar';
import { Timer } from 'components/ui/Timer';
import QuizReview from 'components/questions/QuizReview';
import { Ionicons } from '@expo/vector-icons';

const DIFFICULTY_OPTIONS = [
  { label: 'Mixed', value: 'mixed' },
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
];

export default function TopicTestPage() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const router = useRouter();
  const [test, setTest] = useAtom(testAtom);
  const [loading, setLoading] = useAtom(loadingTestAtom);
  const [error, setError] = useAtom(errorTestAtom);
  const [currentIndex, setCurrentIndex] = useAtom(currentTestIndexAtom);
  const [answers, setAnswers] = useAtom(testAnswersAtom);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; totalQuestions: number } | null>(null);
  const [difficulty, setDifficulty] = useState('mixed');
  const [timeLimit, setTimeLimit] = useState(30);
  const [started, setStarted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [questionTimes, setQuestionTimes] = useState<number[]>([]);
  const [questionStart, setQuestionStart] = useState<number | null>(null);

  const duration = (test?.timeLimit || timeLimit) * 60;

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await testApi.startTopicTest(topicId as string, { timeLimit, difficulty });
      setTest(res.data.data);
      setAnswers([]);
      setCurrentIndex(0);
      setStarted(true);
    } catch (err: any) {
      setError(err?.response?.data?.errors?.[0]?.msg || 'Failed to start test');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (optionIdx: number) => {
    const now = Date.now();
    if (questionStart !== null) {
      const elapsed = Math.floor((now - questionStart) / 1000);
      const newTimes = [...questionTimes];
      newTimes[currentIndex] = (newTimes[currentIndex] || 0) + elapsed;
      setQuestionTimes(newTimes);
    }
    setQuestionStart(now);
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIdx;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (questionStart !== null) {
      const now = Date.now();
      const elapsed = Math.floor((now - questionStart) / 1000);
      const newTimes = [...questionTimes];
      newTimes[currentIndex] = (newTimes[currentIndex] || 0) + elapsed;
      setQuestionTimes(newTimes);
      setQuestionStart(now);
    }
    if (currentIndex < (test?.questions.length || 0) - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (questionStart !== null) {
      const now = Date.now();
      const elapsed = Math.floor((now - questionStart) / 1000);
      const newTimes = [...questionTimes];
      newTimes[currentIndex] = (newTimes[currentIndex] || 0) + elapsed;
      setQuestionTimes(newTimes);
      setQuestionStart(now);
    }
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!test) return;
    if (questionStart !== null) {
      const now = Date.now();
      const elapsed = Math.floor((now - questionStart) / 1000);
      const newTimes = [...questionTimes];
      newTimes[currentIndex] = (newTimes[currentIndex] || 0) + elapsed;
      setQuestionTimes(newTimes);
      setQuestionStart(null);
    }
    setSubmitting(true);
    try {
      const res = await testApi.submitTest(test._id, { answers, timeSpent: questionTimes });
      setResult(res.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.errors?.[0]?.msg || 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpire = () => {
    handleSubmit();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-lg text-red-500">{error}</Text>
        <Button title="Retry" onPress={() => router.replace('/')} className="mt-4" />
      </View>
    );
  }
  if (!test && !started) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-2xl font-bold mb-4">Start Topic Test</Text>
        <SimpleSelect
          label="Difficulty"
          value={difficulty}
          options={DIFFICULTY_OPTIONS}
          onSelect={setDifficulty}
        />
        <View className="my-4">
          <Text className="mb-2 text-lg font-medium text-foreground">Time Limit (minutes)</Text>
          <Button title="-" onPress={() => setTimeLimit(Math.max(5, timeLimit - 5))} />
          <Text className="text-xl mx-4">{timeLimit}</Text>
          <Button title="+" onPress={() => setTimeLimit(timeLimit + 5)} />
        </View>
        <Button title="Start Test" onPress={handleStart} className="mt-4" />
      </View>
    );
  }
  if (!test) return null;
  if (result || showReview) {
    const reviewQuestions = test.questions.map((q, i) => ({
      ...q,
      timeSpent: questionTimes[i] || 0,
      isCorrect: typeof q.isCorrect === 'boolean' ? q.isCorrect : (answers[i] === q.question.options.findIndex(o => o.isCorrect)),
      userAnswer: answers[i],
    }));
    return (
      <QuizReview
        questions={reviewQuestions}
        userAnswers={answers}
        onBack={() => router.back()}
      />
    );
  }
  const q = test.questions[currentIndex]?.question;
  return (
    <View className="flex-1 bg-background p-4">
      <View className="mb-4 flex-row items-center justify-between">
        <ProgressBar
          value={((currentIndex + 1) / test.questions.length) * 100}
          style={{ flex: 1, marginRight: 12 }}
          color="#6366F1"
        />
        <Timer duration={duration} onExpire={handleExpire} />
      </View>
      <View className="mb-4 rounded-2xl bg-card p-4 shadow">
        <Text className="mb-2 text-lg font-bold text-primary">
          Question {currentIndex + 1} / {test.questions.length}
        </Text>
        <Text className="mb-4 text-base text-foreground">{q.text}</Text>
        {q.options.map((opt, idx) => (
          <Button
            key={idx}
            title={opt.text}
            onPress={() => handleSelect(idx)}
            className={`mb-2 ${answers[currentIndex] === idx ? 'bg-primary text-white' : 'bg-card'}`}
          />
        ))}
      </View>
      <View className="mt-6 flex-row justify-between">
        <Button title="Previous" onPress={handlePrev} disabled={currentIndex === 0} />
        {currentIndex === test.questions.length - 1 ? (
          <Button
            title={submitting ? 'Submitting...' : 'Submit'}
            onPress={handleSubmit}
            disabled={submitting || answers.length < test.questions.length}
          />
        ) : (
          <Button title="Next" onPress={handleNext} disabled={answers[currentIndex] == null} />
        )}
      </View>
      <Button
        title="Review Answers"
        onPress={() => setShowReview(true)}
        className="mt-4"
        disabled={answers.length < test.questions.length}
      />
    </View>
  );
} 