import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { Button } from '../ui/button';
import { Ionicons } from '@expo/vector-icons';
import colors from 'tailwindcss/colors';

import { Question, quizAnswerType } from 'types/types';
import { CustomHeader } from '~/common/CustomHeader';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useRef, useEffect } from 'react';
import { useForeground } from '~/useForground';
import { useProAccess } from '../../hooks/useProAccess';
import { useXPEarningActivity, formatXPDisplay } from '../../hooks/useXPLevel';
import RenderHTML from 'react-native-render-html';
import { customHTMLElementModels, renderers, tagsStyles } from 'lib/HtmlRenderers';

interface QuizReviewProps {
  reviewQuestions: {
    question: Question;
    timeSpent?: number;
    isCorrect?: boolean;
    userAnswer?: quizAnswerType;
  }[];
  userAnswers: quizAnswerType[] | number[];
  onBack?: () => void;
  totalTime: number;
  xpEarned?: number; // XP earned from this quiz
}

const formatSeconds = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-3904519861823527/4809014719';

const QuizReview = ({ reviewQuestions, userAnswers, onBack, totalTime, xpEarned }: QuizReviewProps) => {
  
  // console.log('Total Time:', totalTime);
  // console.log('XP Earned:', xpEarned);

  // Calculate summary
  const correctCount = reviewQuestions.reduce((sum, q) => sum + (q.isCorrect ? 1 : 0), 0);
  const incorrectCount = reviewQuestions.length - correctCount;
  const score = Math.round((correctCount / reviewQuestions.length) * 100);

  // XP and level management
  const { onXPEarned } = useXPEarningActivity();

  // Calculate XP earned based on performance if not provided
  const calculatedXP = xpEarned || (correctCount * 10 + (score >= 80 ? 20 : 0)); // 10 XP per correct + bonus for high score

  const { shouldShowAds } = useProAccess();
  const bannerRef = useRef<BannerAd>(null);

  useForeground(() => {
    if (shouldShowAds()) {
      bannerRef.current?.load();
    }
  });

  // Trigger XP earning when component mounts
  useEffect(() => {
    onXPEarned();
  }, [onXPEarned]);

  const { width } = useWindowDimensions();

  return (
    <View className="flex-1 bg-background">
      <CustomHeader title={` Result Of The Quiz`} showBack />
      <ScrollView className="  p-4">
        {/* Summary */}
        <View className="mb-6 flex-row items-center justify-between rounded-3xl bg-indigo-600 p-4 shadow-xl shadow-indigo-600">
          <View className="flex-1 p-2">
            <Text className="mb-1 text-2xl font-bold text-white">Quiz Review</Text>
            <View className="mb-1 flex-row items-center">
              <Ionicons name="timer-outline" size={18} color={colors.amber[500]} />
              <Text className="ml-2 text-base text-amber-500">
                Total Time: <Text className="font-semibold">{formatSeconds(totalTime)}</Text>
              </Text>
            </View>
            <View className="mb-1 flex-row items-center">
              <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
              <Text className="ml-2 text-base text-green-600">
                Correct: <Text className="font-semibold">{correctCount}</Text>
              </Text>
              <Ionicons name="close-circle" size={18} color="#ef4444" style={{ marginLeft: 12 }} />
              <Text className="ml-2 text-base text-red-500">
                Incorrect: <Text className="font-semibold">{incorrectCount}</Text>
              </Text>
            </View>
            <View className="mb-2 flex-row items-center">
              <Ionicons name="trophy-outline" size={18} color={colors.pink[400]} />
              <Text className="ml-2 text-base text-pink-400">
                Score: <Text className="font-semibold ">{score}%</Text>
              </Text>
            </View>
            <View className="mb-2 flex-row items-center">
              <Ionicons name="star-outline" size={18} color={colors.yellow[400]} />
              <Text className="ml-2 text-base text-yellow-400">
                XP Earned: <Text className="font-semibold">{formatXPDisplay(calculatedXP)}</Text>
              </Text>
            </View>
            {shouldShowAds() && (
              <BannerAd ref={bannerRef} unitId={adUnitId} size={BannerAdSize.MEDIUM_RECTANGLE} />
            )}
          </View>
        </View>

        {/* Questions */}
        {reviewQuestions.map((qObj, idx) => {
          const q = qObj.question;
          const userIdx =
            typeof qObj.userAnswer?.selectedAnswer === 'number'
              ? qObj.userAnswer.selectedAnswer
              : userAnswers[idx];
          const correctIdx = q.options.findIndex((o) => o.isCorrect);
          const isCorrect = qObj.isCorrect ?? userIdx === correctIdx;
          return (
            <View
              key={idx}
              className="mb-6 overflow-hidden rounded-3xl bg-white p-4 shadow-lg shadow-neutral-800 ">
              <View className="mb-2 items-center justify-between p-3">
                <View className=" justify-center text-lg font-bold text-primary ">
                  {/* <Text className="text-2xl font-bold leading-6 ">{idx + 1}. </Text> */}
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
                <View
                  className={`mt-2 self-start rounded-full border px-2 py-1 ${isCorrect ? 'border-green-100 bg-green-100' : 'border-red-100 bg-red-100'}`}>
                  <Text
                    className={`text-xs font-bold ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </Text>
                </View>
              </View>
              {q.options.map((opt, oIdx) => {
                const isUser = userIdx === oIdx;
                const isOptionCorrect = opt.isCorrect;
                return (
                  <View
                    key={oIdx}
                    className={`mb-4 flex-row items-center rounded-xl border px-3 py-2 ${
                      isOptionCorrect
                        ? 'border-green-500 bg-green-50 shadow-lg shadow-green-500'
                        : isUser
                          ? 'border-red-500 bg-red-50 text-red-700 shadow-lg shadow-red-500'
                          : 'border-gray-200 bg-neutral-50'
                    }`}>
                    <Ionicons
                      name={
                        isOptionCorrect
                          ? 'checkmark-circle'
                          : isUser
                            ? 'close-circle'
                            : 'ellipse-outline'
                      }
                      size={18}
                      color={isOptionCorrect ? '#22c55e' : isUser ? '#ef4444' : '#a3a3a3'}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      className={`flex-1 text-base ${isOptionCorrect ? 'text-green-600' : isUser ? 'text-red-800' : 'text-neutral-800'}`}>
                      {opt.text}
                    </Text>
                    {isUser && !isOptionCorrect && (
                      <Text className="ml-2 text-xs text-red-500">Your answer</Text>
                    )}
                    {isOptionCorrect && (
                      <Text className="ml-2 text-xs text-green-600">Correct</Text>
                    )}
                  </View>
                );
              })}
              {/* <View className="mt-2 flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#6366F1" />
                <Text className="ml-2 text-sm text-gray-600">
                  Time Spent:{' '}
                  <Text className="font-semibold">{formatSeconds(qObj.timeSpent || 0)}</Text>
                </Text>
              </View> */}
              {/* <Button
                title="Explain"
                onPress={() => actionSheetRef.current?.open(q.explanationHtml || '')}
                rightIcon={'chevron-forward-outline'}
                className="mx-2 py-2"
              /> */}
            </View>
          );
        })}
      </ScrollView>
      {onBack && (
        <View className="px-6">
          <Button title="Back" onPress={onBack} className="my-4" />
        </View>
      )}

    </View>
  );
};

export default QuizReview;
