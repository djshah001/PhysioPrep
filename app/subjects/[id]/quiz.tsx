import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, useWindowDimensions, ScrollView, TouchableOpacity} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInRight, FadeInUp } from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import RenderHTML from 'react-native-render-html';
import { ActionSheetRef } from 'react-native-actions-sheet';
import { useAtom } from 'jotai';

// Store & API
import { quizApi } from 'services/api';
import {
  quizAtom,
  loadingQuizAtom,
  errorQuizAtom,
  currentQuizIndexAtom,
  quizAnswersAtom,
} from 'store/quiz';
import {
  handleJumpTo,
  handleNext,
  handlePrev,
  handleSelect,
  handleSubmit,
} from 'lib/QuizHandelers';
import { customHTMLElementModels, renderers, tagsStyles } from 'lib/HtmlRenderers';
import { handleError } from 'lib/utils';
import { QuizResultProps } from 'types/types';

// Components
import { Button } from 'components/ui/button';
import QuizHeader from 'components/quiz/QuizHeader';
import AnswerOption from 'components/quiz/AnswerOption';
import SubmissionModal from 'components/quiz/SubmissionModal';
import JumpToQuestionModal from 'components/quiz/JumpToQuestionModal';
import QuizReview from 'components/questions/QuizReview';
import ExplainSheet from 'components/questions/ExplainSheet';
import colors from 'tailwindcss/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SubjectQuizPage() {
  const { id: subjectId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Atoms
  const [quiz, setQuiz] = useAtom(quizAtom);
  const [loading, setLoading] = useAtom(loadingQuizAtom);
  const [error, setError] = useAtom(errorQuizAtom);
  const [currentIndex, setCurrentIndex] = useAtom(currentQuizIndexAtom);
  const [answers, setAnswers] = useAtom(quizAnswersAtom);

  // Local State
  const [submitting, setSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [result, setResult] = useState<QuizResultProps | null>(null);
  const [showJumpModal, setShowJumpModal] = useState(false);
  
  // Refs
  const elapsed = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const explainRef = useRef<ActionSheetRef>(null);

  // Fetch Quiz
  useEffect(() => {
    if (!subjectId) return;
    setLoading(true);
    setError(null);

    const fetchQuiz = async () => {
      try {
        const res = await quizApi.startSubjectQuiz(subjectId as string);
        setQuiz(res.data.data);
        setAnswers([]);
        setCurrentIndex(0);
        elapsed.current = 0;
        startTimeRef.current = Date.now();
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
    // eslint-disable-next-line
  }, [subjectId]);

  // Loading State
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-4 font-medium text-slate-500">Loading Quiz...</Text>
      </View>
    );
  }

  // Error State
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-6">
        <View className="bg-red-50 p-4 rounded-full mb-4">
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        </View>
        <Text className="mb-2 text-lg font-bold text-slate-800">Unable to load quiz</Text>
        <Text className="mb-6 text-center text-slate-500">{error}</Text>
        <Button title="Try Again" onPress={() => router.replace('/subjects')} className="bg-slate-800" textClassName="text-white" />
      </View>
    );
  }

  if (!quiz) return null;

  // Review Mode
  if (showReview && result) {
    const reviewQuestions = quiz.questions.map((question, i) => ({
      question,
      isCorrect: answers[i]?.selectedAnswer === quiz.correctAnswers[i],
      userAnswer: answers[i],
    }));
    return (
      <QuizReview
        key={quiz.sessionId}
        xpEarned={result.xpEarned}
        totalTime={elapsed.current}
        reviewQuestions={reviewQuestions}
        userAnswers={answers}
        onBack={() => router.back()}
      />
    );
  }

  const q = quiz.questions[currentIndex];

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-100" >
      {/* Sticky Header */}
      <View className="relative z-20 bg-white border-b border-slate-200 shadow-sm">
        <View className="px-4 py-3 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()} className="p-1">
                <Ionicons name="close" size={24} color={colors.slate[500]} />
            </TouchableOpacity>
            <Text className="font-bold text-slate-700 text-lg">Subject Quiz</Text>
            <View className="w-6" /> 
        </View>
        <QuizHeader
            current={currentIndex}
            total={quiz.questions.length}
            startTime={startTimeRef.current}
            elapsed={elapsed}
            showTimer={false} // Count up timer integrated in header or hidden
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {/* Question Card */}
        <Animated.View 
            key={currentIndex} 
            entering={FadeInRight} 
            className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200 mb-6"
        >
            <View className="flex-row justify-between mb-4">
                <Text className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                    Question {currentIndex + 1}
                </Text>
                {/* Optional: Add difficulty or topic tag here */}
            </View>
            
            <RenderHTML
                contentWidth={width - 88}
                source={{ html: q.textHtml as string }}
                customHTMLElementModels={customHTMLElementModels}
                renderers={renderers}
                tagsStyles={{
                    ...tagsStyles,
                    p: { fontSize: 18, lineHeight: 28, color: '#1e293b', marginBottom: 10 },
                    img: { borderRadius: 12, marginVertical: 10 }
                }}
                defaultTextProps={{ selectable: false }}
            />
        </Animated.View>

        {/* Answer Options */}
        <View className="gap-3">
            {q.options.map((opt: any, idx: number) => (
                <Animated.View 
                    key={`${currentIndex}-${idx}`} 
                    entering={FadeInUp.delay(idx * 50)}
                >
                    <AnswerOption
                        text={opt.text}
                        selected={answers[currentIndex]?.selectedAnswer === idx}
                        onPress={() => handleSelect(
                            idx, answers, currentIndex, setAnswers, 
                            explainRef as React.RefObject<ActionSheetRef>, quiz
                        )}
                        disabled={submitting || answers[currentIndex] != null}
                        correctAnswer={answers[currentIndex] != null ? opt.isCorrect : undefined}
                    />
                </Animated.View>
            ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View className="absolute bottom-0 w-full bg-white border-t border-slate-200 px-6 pt-4 pb-8 flex-row items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        
        {/* Previous */}
        <TouchableOpacity 
            onPress={() => handlePrev(currentIndex, setCurrentIndex, quiz)}
            disabled={currentIndex === 0 || submitting}
            className={`p-3 rounded-full bg-slate-100 border border-slate-200 ${currentIndex === 0 ? 'opacity-50' : ''}`}
        >
            <Ionicons name="chevron-back" size={24} color={colors.slate[600]} />
        </TouchableOpacity>

        {/* Overview / Jump */}
        <TouchableOpacity 
            onPress={() => setShowJumpModal(true)}
            disabled={submitting}
            className="flex-row items-center bg-slate-100 px-5 py-3 rounded-2xl border border-slate-200"
        >
            <MaterialCommunityIcons name="view-grid-outline" size={20} color={colors.slate[600]} />
            <Text className="ml-2 font-semibold text-slate-700">Map</Text>
        </TouchableOpacity>

        {/* Next / Submit */}
        {currentIndex === quiz.questions.length - 1 ? (
            <Button
                title={submitting ? 'Submitting...' : 'Submit'}
                onPress={() =>
                  handleSubmit(
                    answers,
                    quiz,
                    setSubmitting,
                    setResult,
                    elapsed,
                    startTimeRef,
                    setShowSubmissionModal
                  )
                }
                rightIcon={'checkmark-outline'}
                disabled={submitting || answers.length < quiz.questions.length}
                className="bg-green-600 p-3 rounded-full shadow-lg shadow-green-200"
            />
        ) : (
            <TouchableOpacity 
                onPress={() => handleNext(currentIndex, setCurrentIndex, quiz)}
                disabled={submitting}
                className="bg-indigo-600 p-3 rounded-full shadow-lg shadow-indigo-200"
            >
                <Ionicons name="chevron-forward" size={24} color="white" />
            </TouchableOpacity>
        )}
      </View>

      {/* Modals & Sheets */}
      <JumpToQuestionModal
        visible={showJumpModal}
        currentIndex={currentIndex}
        totalQuestions={quiz.questions.length}
        onJump={(idx) => handleJumpTo(idx, setCurrentIndex, setShowJumpModal)}
        onClose={() => setShowJumpModal(false)}
        submitting={submitting}
        // answers={answers} // Pass answers to visualize progress
      />

      <SubmissionModal
        visible={!!result && showSubmissionModal}
        onClose={() => {
          setShowSubmissionModal(false);
          setShowReview(true);
        }}
        score={result?.score || 0}
        total={result?.totalQuestions || 0}
        time={elapsed.current}
      />

      <ExplainSheet 
        ref={explainRef} 
        title="Explanation" 
        html={q.explanationHtml as string} 
      />
    </SafeAreaView>
  );
}