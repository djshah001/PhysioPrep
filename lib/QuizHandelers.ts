import { RefObject } from 'react';
import { ActionSheetRef } from 'react-native-actions-sheet';
import { Quiz, quizAnswerType, QuizResultProps } from 'types/types';
import { quizApi } from '~/api';
import { handleError } from './utils';

export const handleSelect = (
  optionIdx: number,
  answers: quizAnswerType[],
  currentIndex: number,
  setAnswers: (answers: quizAnswerType[]) => void,
  explainRef: RefObject<ActionSheetRef>,
  quiz: Quiz
) => {
  // Prevent changing answer once selected for this question
  if (answers[currentIndex] != null) {
    explainRef.current?.show();
    return;
  }
  const newAnswers = [...answers];
  newAnswers[currentIndex] = {
    questionId: quiz?.questions[currentIndex]._id || '',
    selectedAnswer: optionIdx,
  };
  setAnswers(newAnswers);
  // Auto-open explanation after first selection
  explainRef.current?.show();
};

export const handleNext = (
  currentIndex: number,
  setCurrentIndex: (currentIndex: number) => void,
  quiz: Quiz
) => {
  if (currentIndex < (quiz?.questions.length || 0) - 1) {
    setCurrentIndex(currentIndex + 1);
  }
};

export const handlePrev = (
  currentIndex: number,
  setCurrentIndex: (currentIndex: number) => void,
  quiz: Quiz
) => {
  if (currentIndex > 0) {
    setCurrentIndex(currentIndex - 1);
  }
};

export const handleSubmit = async (
  answers: quizAnswerType[],
  quiz: Quiz,
  setSubmitting: (submitting: boolean) => void,
  setResult: (result: QuizResultProps) => void,
  elapsed: RefObject<number>,
  startTimeRef: RefObject<number | null>,
  setShowSubmissionModal: (show: boolean) => void
) => {
  if (!quiz) return;
  setSubmitting(true);

  // compute final time and freeze the displayed timer immediately
  const timeSpent = startTimeRef.current
    ? Math.floor((Date.now() - startTimeRef.current) / 1000)
    : elapsed.current;

  // freeze elapsed for parent/submit and stop header's interval by clearing startTimeRef
  elapsed.current = timeSpent;
  const prevStart = startTimeRef.current;
  startTimeRef.current = null;

  try {
    const res = await quizApi.submitQuiz(quiz.sessionId, { answers, timeSpent });
    setResult(res.data.data);
    setShowSubmissionModal(true);
  } catch (err) {
    // restore running timer if submission failed so user can retry
    if (prevStart != null) {
      startTimeRef.current = Date.now() - elapsed.current * 1000;
    }
    handleError(err as string);
  } finally {
    setSubmitting(false);
  }
};

export const handleJumpTo = (
  idx: number,
  setCurrentIndex: (currentIndex: number) => void,
  setShowJumpModal: (show: boolean) => void
) => {
  setCurrentIndex(idx);
  setShowJumpModal(false);
};
