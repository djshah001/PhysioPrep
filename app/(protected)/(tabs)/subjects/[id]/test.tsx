import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { testApi } from 'services/api';
import { Test } from 'types/types';
import { Button } from 'components/ui/button';
import { SimpleSelect } from 'components/ui/SimpleSelect';
import { useAtom } from 'jotai';
import { testAtom, loadingTestAtom, errorTestAtom, currentTestIndexAtom, testAnswersAtom } from 'store/test';
import QuizHeader from 'components/quiz/QuizHeader';
import AnswerOption from 'components/quiz/AnswerOption';
import SubmissionModal from 'components/quiz/SubmissionModal';
import JumpToQuestionModal from 'components/quiz/JumpToQuestionModal';
import QuizReview from 'components/questions/QuizReview';
import { Timer } from 'components/ui/Timer';

const DIFFICULTY_OPTIONS = [
  { label: 'Mixed', value: 'mixed' },
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
];

export default function SubjectTestPage() {
  const { id: subjectId } = useLocalSearchParams<{ id: string }>();
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
  const [showJumpModal, setShowJumpModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const duration: number = Number(test?.timeLimit || timeLimit) * 60;

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await testApi.startSubjectTest(subjectId as string, { timeLimit, difficulty });
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
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIdx;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < (test?.questions.length || 0) - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!test) return;
    setSubmitting(true);
    try {
      const timeSpent = duration - timeLeft;
      const res = await testApi.submitTest(test._id, { answers, timeSpent });
      setResult(res.data.data);
      setShowSubmissionModal(true);
    } catch (err: any) {
      setError(err?.response?.data?.errors?.[0]?.msg || 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpire = () => {
    handleSubmit();
  };

  const handleJumpTo = (idx: number) => {
    setCurrentIndex(idx);
    setShowJumpModal(false);
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
        <View className="w-full max-w-md rounded-2xl bg-indigo-500 p-6 shadow items-center">
          <Text className="text-2xl font-bold mb-2 text-primary">Start Subject Test</Text>
          <Text className="mb-4 text-base text-foreground text-center">
            Ready to challenge yourself? Configure your test below. Once started, the timer will begin and you must complete all questions before time runs out.
          </Text>
          <View className="mb-4 w-full">
            <SimpleSelect
              label="Difficulty"
              value={difficulty}
              options={DIFFICULTY_OPTIONS}
              onSelect={setDifficulty}
            />
          </View>
          <View className="mb-4 w-full flex-row items-center justify-center">
            <Text className="text-lg font-medium text-foreground mr-2">Time Limit:</Text>
            <Button title="-" onPress={() => setTimeLimit(Math.max(5, timeLimit - 5))} className="px-3" />
            <Text className="text-xl mx-4 font-bold">{timeLimit} min</Text>
            <Button title="+" onPress={() => setTimeLimit(timeLimit + 5)} className="px-3" />
          </View>
          <View className="mb-4 w-full bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
            <Text className="text-yellow-700 font-semibold mb-1">Disclaimer</Text>
            <Text className="text-yellow-700 text-sm">
              • The timer starts as soon as you begin the test. {'\n'}
              • You cannot pause or restart the test. {'\n'}
              • Submitting early will end the test. {'\n'}
              • You cannot change answers after submitting. {'\n'}
              • Make sure you are ready before you start!
            </Text>
          </View>
          <Button title="Start Test" onPress={handleStart} className="mt-2 w-full" />
        </View>
      </View>
    );
  }
  if (!test) return null;
  if ((result && typeof result === 'object') || showReview) {
    const reviewQuestions = test.questions.map((q, i) => ({
      ...q,
      isCorrect: typeof q.isCorrect === 'boolean' ? q.isCorrect : (answers[i] === q.question.options.findIndex(o => o.isCorrect)),
      userAnswer: answers[i],
    }));
    return (
      <QuizReview
        questions={reviewQuestions}
        userAnswers={answers}
        totalTime={duration - timeLeft}
        onBack={() => router.back()}
      />
    );
  }
  const q = test.questions[currentIndex]?.question;
  return (
    <View className="flex-1 bg-background p-4">
      <QuizHeader current={currentIndex} total={test.questions.length} elapsed={duration - timeLeft} />
      <View className="mb-4">
        <Timer duration={duration} onExpire={handleExpire} onTick={setTimeLeft} />
      </View>
      <View className="mb-4 rounded-2xl bg-indigo-500 p-4 shadow">
        <Text className="mb-2 text-lg font-bold text-primary">
          Question {currentIndex + 1} / {test.questions.length}
        </Text>
        <Text className="mb-4 text-base text-foreground">{q.text}</Text>
        {q.options.map((opt, idx) => (
          <AnswerOption
            key={idx}
            text={opt.text}
            selected={answers[currentIndex] === idx}
            onPress={() => handleSelect(idx)}
            disabled={submitting}
          />
        ))}
      </View>
      <View className="mt-6 flex-row items-center justify-between">
        <Button title="Previous" onPress={handlePrev} disabled={currentIndex === 0 || submitting} />
        <Button
          title="Jump to Question"
          onPress={() => setShowJumpModal(true)}
          disabled={submitting}
          className="mx-2 py-2"
        />
        {currentIndex === test.questions.length - 1 ? (
          <Button
            title={submitting ? 'Submitting...' : 'Submit'}
            onPress={handleSubmit}
            disabled={submitting || answers.length < test.questions.length}
          />
        ) : (
          <Button title="Next" onPress={handleNext} disabled={answers[currentIndex] == null || submitting} />
        )}
      </View>
      <JumpToQuestionModal
        visible={showJumpModal}
        currentIndex={currentIndex}
        totalQuestions={test.questions.length}
        onJump={handleJumpTo}
        onClose={() => setShowJumpModal(false)}
        submitting={submitting}
      />
      <SubmissionModal
        visible={!!result && showSubmissionModal}
        onClose={() => {
          setShowSubmissionModal(false);
          setShowReview(true);
        }}
        score={typeof result === 'object' && result ? (result as any).score || 0 : 0}
        total={typeof result === 'object' && result ? (result as any).totalQuestions || 0 : 0}
        time={duration - timeLeft}
      />
    </View>
  );
} 