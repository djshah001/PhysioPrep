import { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
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
import { Ionicons } from '@expo/vector-icons';
import { handleError } from 'lib/utils';
import { CustomHeader } from '~/common/CustomHeader';
import { ScrollView } from 'react-native-gesture-handler';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { customHTMLElementModels, renderers, tagsStyles } from 'lib/HtmlRenderers';
import RenderHTML from 'react-native-render-html';
import {
  handleJumpTo,
  handleNext,
  handlePrev,
  handleSelect,
  handleSubmit,
} from 'lib/QuizHandelers';

export default function SubjectQuizPage() {
  const { id: subjectId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useAtom(quizAtom);
  const [loading, setLoading] = useAtom(loadingQuizAtom);
  const [error, setError] = useAtom(errorQuizAtom);
  const [currentIndex, setCurrentIndex] = useAtom(currentQuizIndexAtom);
  const [answers, setAnswers] = useAtom(quizAnswersAtom);
  const [submitting, setSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [result, setResult] = useState<{ score: number; totalQuestions: number } | null>(null);
  const elapsed = useRef(0);
  // Use a ref for start time to avoid re-rendering the whole screen every second
  const startTimeRef = useRef<number | null>(null);
  const navigation = useNavigation();
  const [showJumpModal, setShowJumpModal] = useState(false);
  const explainRef = useRef<ActionSheetRef>(null);
  const { width } = useWindowDimensions();

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => (
        <CustomHeader title={`${result ? 'Result Of The Quiz' : 'Subject Quiz'} `} showBack />
      ),
    });
  }, [navigation, result]);

  // Fetch quiz
  useEffect(() => {
    if (!subjectId) return;
    setLoading(true);
    setError(null);

    const fetchQuiz = async () => {
      try {
        const res = await quizApi.startSubjectQuiz(subjectId as string);
        // console.log(JSON.stringify(res.data.data, null, 2));
        // console.log(res.data.data)
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

  // Timer logic removed from parent to avoid per-second re-renders.
  // Elapsed time for submission will be calculated from startTimeRef.

  // console.log(elapsed.current);

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
        <Button title="Retry" onPress={() => router.dismissAll()} className="mt-4" />
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
        // actionSheetRef={actionSheetRef as React.RefObject<ActionSheetRef>}
        totalTime={elapsed.current}
        reviewQuestions={reviewQuestions}
        userAnswers={answers}
        onBack={() => router.back()}
      />
    );
  }

  // console.log(JSON.stringify(quiz))
  const q = quiz.questions[currentIndex];
  // console.log(q.explanationHtml);
  return (
    <ScrollView contentContainerClassName=" bg-background p-4">
      <QuizHeader
        current={currentIndex}
        total={quiz.questions.length}
        startTime={startTimeRef.current}
        elapsed={elapsed}
      />
      <View className="mb-4 rounded-2xl bg-white p-6 shadow">
        <Text className="mb-2 text-lg font-bold text-primary">
          Question {currentIndex + 1} / {quiz.questions.length}
        </Text>

        <Text className="mb-4 text-lg leading-6 text-neutral-800">{q.text}</Text>
      </View>
      {q.options.map((opt: { text: string; isCorrect: boolean }, idx: number) => (
        <AnswerOption
          key={idx}
          text={opt.text}
          selected={answers[currentIndex]?.selectedAnswer === idx}
          correctAnswer={opt.isCorrect}
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
        />
      ))}

      <View className="mt-6 flex-row items-center justify-between">
        <Button
          title="Previous"
          onPress={() => handlePrev(currentIndex, setCurrentIndex, quiz)}
          disabled={currentIndex === 0 || submitting}
          leftIcon="chevron-back-outline"
          className="mx-2 rounded-2xl py-2"
        />
        {/* <Button
          title="Explain"
          onPress={() => actionSheetRef.current?.show()}
          disabled={answers[currentIndex] == null}
          className="mx-2 py-2"
        /> */}
        <Button
          title="Jump"
          onPress={() => setShowJumpModal(true)}
          disabled={submitting}
          leftIcon="swap-horizontal-outline"
          className="mx-2 rounded-2xl bg-indigo-500 py-2 shadow-xl shadow-indigo-800"
        />
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
            disabled={submitting || answers.length < quiz.questions.length}
            rightIcon="checkmark-outline"
            className="justify-cente items-center rounded-2xl bg-green-500 p-4 py-3 shadow-xl shadow-green-800"
            textClassName="mr-0"
          />
        ) : (
          <Button
            title="Next"
            onPress={() => handleNext(currentIndex, setCurrentIndex, quiz)}
            disabled={submitting}
            rightIcon="chevron-forward-outline"
            className="items-center justify-center rounded-2xl p-4 py-2"
            textClassName="mr-0"
          />
        )}
      </View>
      <JumpToQuestionModal
        visible={showJumpModal}
        currentIndex={currentIndex}
        totalQuestions={quiz.questions.length}
        onJump={(idx) => handleJumpTo(idx, setCurrentIndex, setShowJumpModal)}
        onClose={() => setShowJumpModal(false)}
        submitting={submitting}
      />
      <SubmissionModal
        visible={!!result && showSubmissionModal}
        onClose={() => {
          setShowSubmissionModal(false);
          setShowReview(true); // Automatically show review after submission
        }}
        score={result?.score || 0}
        total={result?.totalQuestions || 0}
        time={elapsed.current}
      />

      <ActionSheet
        ref={explainRef}
        snapPoints={[50, 90]}
        gestureEnabled
        initialSnapIndex={1}
        containerStyle={{
          borderRadius: 16,
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 8,
        }}>
        <View className="px-4 pb-2 pt-3">
          {/* Handle: uncomment if you want a visual grabber */}
          {/* <View className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-300" /> */}
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-neutral-900">Explanation</Text>
            <Button title="Close" onPress={() => explainRef?.current?.hide()} />
          </View>
        </View>
        <ScrollView contentContainerClassName="px-4 pb-6">
          <RenderHTML
            contentWidth={Math.max(320, width - 48)}
            source={{ html: q.explanationHtml as string }}
            customHTMLElementModels={customHTMLElementModels}
            tagsStyles={tagsStyles}
            systemFonts={['System']}
            enableExperimentalMarginCollapsing
            defaultTextProps={{ selectable: false }}
            renderers={renderers}
            renderersProps={{
              img: { enableExperimentalPercentWidth: true },
              table: {
                tableStyleSpecs: {
                  outerBorderWidthPx: 1,
                  rowsBorderWidthPx: 1,
                  columnsBorderWidthPx: 1,
                  borderColor: '#e5e7eb',
                  cellPaddingEm: 0.5,
                  linkColor: '#3b82f6',
                },
              },
            }}
          />
        </ScrollView>
        <View className="mb-40" />
      </ActionSheet>
    </ScrollView>
  );
}
