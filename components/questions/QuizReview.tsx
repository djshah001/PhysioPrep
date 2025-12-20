import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn, FadeInUp } from 'react-native-reanimated';
import RenderHTML from 'react-native-render-html';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Hooks & Utils
import { useProAccess } from '../../hooks/useProAccess';
import { useXPEarningActivity, formatXPDisplay } from '../../hooks/useXPLevel';
import { useForeground } from '~/useForground';
import { customHTMLElementModels, renderers, tagsStyles } from 'lib/HtmlRenderers';
import colors from 'tailwindcss/colors';

// Components
import { Button } from '../ui/button';
import { CustomHeader } from '~/common/CustomHeader';
import { Question, quizAnswerType } from 'types/types';

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
  xpEarned?: number;
}

const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-3904519861823527/4809014719';

// --- Helper Components ---

const StatCard = ({ icon, label, value, color }: any) => (
  <View
    className={`flex-1 items-center justify-center rounded-2xl border border-slate-100 bg-white p-4 shadow-sm`}>
    <View className={`mb-2 rounded-full p-2 ${color.bg}`}>
      <MaterialCommunityIcons name={icon} size={24} color={color.text} />
    </View>
    <Text className="text-xl font-bold text-slate-800">{value}</Text>
    <Text className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</Text>
  </View>
);

const formatSeconds = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

// --- Main Component ---

const QuizReview = ({
  reviewQuestions,
  userAnswers,
  onBack,
  totalTime,
  xpEarned,
}: QuizReviewProps) => {
  const { width } = useWindowDimensions();
  const { shouldShowAds } = useProAccess();
  const bannerRef = useRef<BannerAd>(null);
  const { onXPEarned } = useXPEarningActivity();

  // Stats Logic
  const correctCount = reviewQuestions.reduce((sum, q) => sum + (q.isCorrect ? 1 : 0), 0);
  const incorrectCount = reviewQuestions.length - correctCount;
  const score = Math.round((correctCount / reviewQuestions.length) * 100);
  const calculatedXP = xpEarned || correctCount * 10 + (score >= 80 ? 20 : 0);

  useEffect(() => {
    onXPEarned();
  }, [onXPEarned]);

  useForeground(() => {
    if (shouldShowAds()) bannerRef.current?.load();
  });

  return (
    <View className="flex-1 bg-slate-50">
      <CustomHeader title="Quiz Results" showBack />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}>
        {/* --- Summary Header --- */}
        <Animated.View entering={ZoomIn.duration(500)} className="mb-6">
          <View className="mb-6 items-center">
            <Text className="mb-1 text-sm font-bold uppercase tracking-widest text-slate-400">
              Performance
            </Text>
            <Text
              className={`text-4xl font-black ${score >= 80 ? 'text-emerald-600' : 'text-slate-800'}`}>
              {score}%
            </Text>
            <Text className="mt-1 font-medium text-slate-500">
              You earned{' '}
              <Text className="font-bold text-amber-500">+{formatXPDisplay(calculatedXP)} XP</Text>
            </Text>
          </View>

          {/* Stats Grid */}
          <View className="mb-6 flex-row gap-3">
            <StatCard
              icon="check-circle-outline"
              label="Correct"
              value={correctCount}
              color={{ bg: 'bg-emerald-100', text: colors.emerald[600] }}
            />
            <StatCard
              icon="close-circle-outline"
              label="Incorrect"
              value={incorrectCount}
              color={{ bg: 'bg-rose-100', text: colors.rose[600] }}
            />
            <StatCard
              icon="clock-outline"
              label="Time"
              value={formatSeconds(totalTime)}
              color={{ bg: 'bg-indigo-100', text: colors.indigo[600] }}
            />
          </View>

          {shouldShowAds() && (
            <View className="mb-6 items-center">
              <BannerAd ref={bannerRef} unitId={adUnitId} size={BannerAdSize.BANNER} />
            </View>
          )}
        </Animated.View>

        {/* --- Review List --- */}
        <View className="mb-4">
          <Text className="mb-4 ml-1 text-lg font-bold text-slate-800">Detailed Review</Text>

          {reviewQuestions.map((qObj, idx) => {
            const q = qObj.question;
            const userIdx =
              typeof qObj.userAnswer?.selectedAnswer === 'number'
                ? qObj.userAnswer.selectedAnswer
                : userAnswers[idx];
            const isCorrect = qObj.isCorrect;

            return (
              <Animated.View
                key={idx}
                entering={FadeInDown.delay(idx * 100)
                  .springify()
                  .damping(14)}
                className="mb-6 overflow-hidden rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm">
                {/* Question Header */}
                <View className="mb-4 flex-row items-start justify-between border-b border-slate-50 pb-3">
                  <Text className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold uppercase text-slate-400">
                    Q{idx + 1}
                  </Text>
                  <View
                    className={`flex-row items-center rounded-full px-2 py-1 ${isCorrect ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                    <MaterialCommunityIcons
                      name={isCorrect ? 'check' : 'close'}
                      size={14}
                      color={isCorrect ? colors.emerald[600] : colors.rose[600]}
                    />
                    <Text
                      className={`ml-1 text-xs font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </Text>
                  </View>
                </View>

                {/* Question Text */}
                <View className="mb-4">
                  <RenderHTML
                    contentWidth={width - 72}
                    source={{ html: q.textHtml as string }}
                    customHTMLElementModels={customHTMLElementModels}
                    renderers={renderers}
                    tagsStyles={{
                      ...tagsStyles,
                      p: { fontSize: 16, lineHeight: 24, color: '#1e293b', marginBottom: 0 },
                    }}
                    systemFonts={['System']}
                    defaultTextProps={{ selectable: false }}
                  />
                </View>

                {/* Options */}
                <View className="gap-2">
                  {q.options.map((opt, oIdx) => {
                    const isUser = userIdx === oIdx;
                    const isOptionCorrect = opt.isCorrect;

                    let containerStyle = 'bg-slate-50 border-slate-100';
                    let textStyle = 'text-slate-600';
                    let iconName = 'checkbox-blank-circle-outline';
                    let iconColor = '#6366F1';

                    if (isOptionCorrect) {
                      containerStyle = 'bg-emerald-50 border-emerald-200';
                      textStyle = 'text-emerald-800 font-medium';
                      iconName = 'check-circle';
                      iconColor = colors.emerald[500];
                    } else if (isUser && !isOptionCorrect) {
                      containerStyle = 'bg-rose-50 border-rose-200';
                      textStyle = 'text-rose-800 font-medium';
                      iconName = 'close-circle';
                      iconColor = colors.rose[500];
                    }

                    return (
                      <View
                        key={oIdx}
                        className={`flex-row items-center rounded-xl border p-3 ${containerStyle}`}>
                        <MaterialCommunityIcons
                          name={iconName as any}
                          size={20}
                          color={iconColor}
                        />
                        <Text className={`ml-3 flex-1 text-sm ${textStyle}`}>{opt.text}</Text>
                        {isUser && !isOptionCorrect && (
                          <Text className="ml-2 text-[10px] font-bold uppercase text-rose-500">
                            You
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      {onBack && (
        <Animated.View
          entering={FadeInUp.delay(500)}
          className="absolute bottom-0 w-full bg-white border-t border-slate-100 p-5 shadow-lg shadow-neutral-600">
          <Button
            title="Return to Dashboard"
            onPress={onBack}
            // className="bg-rose-600 shadow-md shadow-rose-300"
            textClassName="text-white font-bold"
            rightIcon="arrow-forward"
          />
        </Animated.View>
      )}
      {/* Sticky Footer */}
    </View>
  );
};

export default QuizReview;
