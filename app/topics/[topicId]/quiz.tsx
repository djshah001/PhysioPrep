import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { quizApi } from 'services/api';
import { Button } from 'components/ui/button';
import { useAtom } from 'jotai';
import {
  quizAtom,
  loadingQuizAtom,
  errorQuizAtom,
  currentQuizIndexAtom,
  quizAnswersAtom,
} from 'store/quiz';
import QuizHeader from 'components/quiz/QuizHeader';
import AnswerOption from 'components/quiz/AnswerOption';
import SubmissionModal from 'components/quiz/SubmissionModal';
import JumpToQuestionModal from 'components/quiz/JumpToQuestionModal';
import QuizReview from 'components/questions/QuizReview';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import { CustomHeader } from '~/common/CustomHeader';
import { handleError } from 'lib/utils';
import { ScrollView } from 'react-native-gesture-handler';
import { ActionSheetRef } from 'react-native-actions-sheet';
import RenderHTML from 'react-native-render-html';
import { customHTMLElementModels, tagsStyles, renderers } from 'lib/HtmlRenderers';
import {
  handleJumpTo,
  handleNext,
  handlePrev,
  handleSelect,
  handleSubmit,
} from 'lib/QuizHandelers';
import { QuizResultProps } from 'types/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInRight, FadeInUp } from 'react-native-reanimated';
import colors from 'tailwindcss/colors';
import ExplainSheet from '~/questions/ExplainSheet';
export default function TopicQuizPage() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useAtom(quizAtom);
  const [loading, setLoading] = useAtom(loadingQuizAtom);
  const [error, setError] = useAtom(errorQuizAtom);
  const [currentIndex, setCurrentIndex] = useAtom(currentQuizIndexAtom);
  const [answers, setAnswers] = useAtom(quizAnswersAtom);
  const [submitting, setSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [result, setResult] = useState<QuizResultProps | null>(null);
  const elapsed = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const [showJumpModal, setShowJumpModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  // const navigation = useNavigation();
  const explainRef = useRef<ActionSheetRef>(null);
  const { width } = useWindowDimensions();

  // useEffect(() => {
  //   navigation.setOptions({
  //     headerShown: true,
  //     header: () => (
  //       <CustomHeader title={`${result ? 'Result Of The Quiz' : 'Topic Quiz'}`} showBack />
  //     ),
  //   });
  // }, [navigation, result]);

  // Fetch quiz
  useEffect(() => {
    if (!topicId) return;
    setLoading(true);
    setError(null);

    const fetchQuiz = async () => {
      try {
        const res = await quizApi.startTopicQuiz(topicId as string);
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
  }, [topicId]);

  // Timer logic removed from parent to avoid per-second re-renders.
  // Elapsed time for submission will be calculated from startTimeRef.

  // UI
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
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" className="mb-2" />
        <Text className="mb-2 text-lg text-red-500">{error}</Text>
        <Button title="Retry" onPress={() => router.reload()} className="mt-4" />
      </View>
    );
  }
  if (!quiz) return null;

  if (showReview && result) {
    const reviewQuestions = quiz.questions.map((question, i) => ({
      question,
      isCorrect: answers[i].selectedAnswer === quiz.correctAnswers[i],
      userAnswer: answers[i],
    }));
    return (
      <QuizReview
        key={quiz.sessionId}
        xpEarned={result.xpEarned}
        reviewQuestions={reviewQuestions}
        userAnswers={answers}
        totalTime={elapsed.current}
        onBack={() => router.back()}
      />
    );
  }

  const q = quiz.questions[currentIndex];
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-100">
      {/* Sticky Header */}
      <View className="relative z-20 border-b border-slate-200 bg-white shadow-sm">
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Ionicons name="close" size={24} color={colors.slate[500]} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-700">Subject Quiz</Text>
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

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}>
        {/* Question Card */}
        <Animated.View
          key={currentIndex}
          entering={FadeInRight}
          className="mb-6 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <View className="mb-4 flex-row justify-between">
            <Text className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-500">
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
            }}
            defaultTextProps={{ selectable: false }}
          />
        </Animated.View>

        {/* Answer Options */}
        <View className="gap-3">
          {q.options.map((opt: any, idx: number) => (
            <Animated.View key={`${currentIndex}-${idx}`} entering={FadeInUp.delay(idx * 50)}>
              <AnswerOption
                text={opt.text}
                selected={answers[currentIndex]?.selectedAnswer === idx}
                onPress={() =>
                  handleSelect(
                    idx,
                    answers,
                    currentIndex,
                    setAnswers,
                    explainRef as React.RefObject<ActionSheetRef>,
                    quiz
                  )
                }
                disabled={submitting || answers[currentIndex] != null}
                correctAnswer={answers[currentIndex] != null ? opt.isCorrect : undefined}
              />
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View className="absolute bottom-0 w-full flex-row items-center justify-between border-t border-slate-200 bg-white px-6 pb-8 pt-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {/* Previous */}
        <TouchableOpacity
          onPress={() => handlePrev(currentIndex, setCurrentIndex, quiz)}
          disabled={currentIndex === 0 || submitting}
          className={`rounded-full border border-slate-200 bg-slate-100 p-3 ${currentIndex === 0 ? 'opacity-50' : ''}`}>
          <Ionicons name="chevron-back" size={24} color={colors.slate[600]} />
        </TouchableOpacity>

        {/* Overview / Jump */}
        <TouchableOpacity
          onPress={() => setShowJumpModal(true)}
          disabled={submitting}
          className="flex-row items-center rounded-2xl border border-slate-200 bg-slate-100 px-5 py-3">
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
            className="rounded-full bg-green-600 p-3 shadow-lg shadow-green-200"
          />
        ) : (
          <TouchableOpacity
            onPress={() => handleNext(currentIndex, setCurrentIndex, quiz)}
            disabled={submitting}
            className="rounded-full bg-indigo-600 p-3 shadow-lg shadow-indigo-200">
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

      <ExplainSheet ref={explainRef} title="Explanation" html={q.explanationHtml as string} />
    </SafeAreaView>
  );
}
