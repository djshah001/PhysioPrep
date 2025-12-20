import { useRef, useState, useMemo } from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn, FadeInUp, } from 'react-native-reanimated';
import RenderHTML from 'react-native-render-html';
import type { ActionSheetRef } from 'react-native-actions-sheet';
import colors from 'tailwindcss/colors';

// Custom Components & Utils
import ExplainSheet from 'components/questions/ExplainSheet';
import { customHTMLElementModels, renderers, tagsStyles } from 'lib/HtmlRenderers';
import { Button } from '~/ui/button';

// --- Types ---
export type TestReviewItem = {
  question: {
    _id: string;
    textHtml: string;
    options: { text: string; isCorrect: boolean }[];
    explanationHtml?: string;
  };
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
};

export interface TestReviewProps {
  score: number;
  totalQuestions: number;
  correct: number;
  timeSpent?: number;
  items: TestReviewItem[];
  onBack: () => void;
  onRetake: () => void;
}

// --- Helpers ---
const formatSeconds = (seconds: number = 0) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

const getGradeInfo = (score: number) => {
  if (score >= 90) return { label: 'Excellent!', color: 'text-emerald-600', icon: 'trophy' };
  if (score >= 70) return { label: 'Great Job!', color: 'text-blue-600', icon: 'medal' };
  if (score >= 50) return { label: 'Good Effort', color: 'text-amber-600', icon: 'thumb-up' };
  return { label: 'Keep Practicing', color: 'text-slate-600', icon: 'book-open-page-variant' };
};

// --- Sub-Components ---

const StatCard = ({ icon, label, value, color }: any) => (
  <View className="flex-1 items-center justify-center rounded-2xl bg-slate-50 p-4 border border-slate-100">
    <View className={`mb-2 rounded-full p-2 ${color.bg}`}>
      <MaterialCommunityIcons name={icon} size={24} color={color.text} />
    </View>
    <Text className="text-xl font-bold text-slate-800">{value}</Text>
    <Text className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</Text>
  </View>
);

const QuestionReviewCard = ({ 
  item, 
  index, 
  width, 
  onExplain 
}: { 
  item: TestReviewItem; 
  index: number; 
  width: number;
  onExplain: (html: string) => void;
}) => {
  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).springify().damping(12)}
      className="mb-4 rounded-3xl bg-white p-5 shadow-sm border border-slate-100"
    >
      {/* Header: Status Badge */}
      <View className="flex-row items-center justify-between mb-4 border-b border-slate-50 pb-3">
        <Text className="text-xs font-bold text-slate-400 uppercase">Question {index + 1}</Text>
        <View className={`flex-row items-center px-3 py-1 rounded-full ${item.isCorrect ? 'bg-emerald-100' : 'bg-rose-100'}`}>
          <MaterialCommunityIcons 
            name={item.isCorrect ? "check-circle" : "close-circle"} 
            size={16} 
            color={item.isCorrect ? colors.emerald[600] : colors.rose[600]} 
          />
          <Text className={`ml-1 text-xs font-bold ${item.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
            {item.isCorrect ? 'Correct' : 'Incorrect'}
          </Text>
        </View>
      </View>

      {/* Question Text */}
      <View className="mb-6">
        <RenderHTML
          contentWidth={width - 80}
          source={{ html: item.question.textHtml as string }}
          customHTMLElementModels={customHTMLElementModels}
          tagsStyles={tagsStyles}
          renderers={renderers}
          renderersProps={{
            img: { enableExperimentalPercentWidth: true },
          }}
        />
      </View>

      {/* Options */}
      <View className="gap-3 mb-4">
        {item.question.options.map((opt, oIdx) => {
          const isSelected = item.selectedAnswer === oIdx;
          const isCorrectAnswer = item.correctAnswer === oIdx;
          
          let containerStyle = 'bg-white border-slate-200';
          let iconName = 'checkbox-blank-circle-outline';
          let iconColor = 'black';
          let textColor = 'text-slate-600';

          if (isCorrectAnswer) {
            containerStyle = 'bg-emerald-50 border-emerald-500';
            iconName = 'check-circle';
            iconColor = colors.emerald[500];
            textColor = 'text-emerald-800 font-medium';
          } else if (isSelected && !item.isCorrect) {
            containerStyle = 'bg-rose-50 border-rose-500';
            iconName = 'close-circle';
            iconColor = colors.rose[500];
            textColor = 'text-rose-800 font-medium';
          } else if (isSelected) {
             // Selected and correct (handled by first if, but purely selected state)
             containerStyle = 'border-slate-400';
          }

          return (
            <View 
              key={oIdx} 
              className={`flex-row items-center p-4 rounded-xl border ${containerStyle}`}
            >
              <MaterialCommunityIcons name={iconName as any} size={20} color={iconColor} />
              <Text className={`ml-3 flex-1 text-sm ${textColor}`}>
                {opt.text}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Explanation Button */}
      {item.question.explanationHtml && (
        <Button
          title="View Explanation "
          onPress={() => onExplain(item.question.explanationHtml!)}
          className="mt-5 rounded-xl bg-green-500 shadow-md shadow-green-200"
          textClassName="text-white font-bold"
          leftIcon="bulb-outline"
          leftIconColor={colors.neutral[50]}
        />
      )}
    </Animated.View>
  );
};

// --- Main Component ---

export default function TestReview({
  score,
  totalQuestions,
  correct,
  timeSpent = 0,
  items,
  onBack,
  onRetake,
}: TestReviewProps) {
  const explainRef = useRef<ActionSheetRef>(null);
  const [selectedHtml, setSelectedHtml] = useState<string>('');
  const { width } = useWindowDimensions();
  const grade = useMemo(() => getGradeInfo(score), [score]);

  const handleOpenExplain = (html: string) => {
    setSelectedHtml(html);
    explainRef.current?.show();
  };

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <Animated.View entering={ZoomIn.duration(500)} className="mb-8 items-center">
          <Text className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Result Summary</Text>
          <Text className={`text-4xl font-black ${grade.color} mb-1`}>{grade.label}</Text>
          <Text className="text-slate-500">You completed the test!</Text>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View entering={FadeInDown.delay(100)} className="flex-row gap-3 mb-8">
          <StatCard 
            icon="percent" 
            label="Score" 
            value={`${score}%`} 
            color={{ bg: 'bg-indigo-100', text: colors.indigo[600] }} 
          />
          <StatCard 
            icon="target" 
            label="Correct" 
            value={`${correct}/${totalQuestions}`} 
            color={{ bg: 'bg-emerald-100', text: colors.emerald[600] }} 
          />
          <StatCard 
            icon="clock-outline" 
            label="Time" 
            value={formatSeconds(timeSpent)} 
            color={{ bg: 'bg-amber-100', text: colors.amber[600] }} 
          />
        </Animated.View>

        {/* List Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-slate-800">Detailed Review</Text>
          <View className="bg-slate-200 px-3 py-1 rounded-full">
            <Text className="text-xs font-bold text-slate-600">{items.length} Questions</Text>
          </View>
        </View>

        {/* Question Items */}
        {items.map((item, idx) => (
          <QuestionReviewCard 
            key={item.question._id} 
            index={idx} 
            item={item} 
            width={width}
            onExplain={handleOpenExplain}
          />
        ))}

      </ScrollView>

      {/* Sticky Footer */}
      <Animated.View 
        entering={FadeInUp.delay(500)} 
        className="absolute bottom-0 w-full bg-white border-t border-slate-200 p-5 flex-row items-center justify-between shadow-lg"
      >
        <Button 
          title="Go To Subjects" 
          onPress={onBack} 
          className="flex-1 bg-slate-100 border border-slate-200"
          textClassName="text-slate-600 font-bold"
          leftIcon="apps"
          leftIconColor={colors.slate[600]}
        />
        <Button 
          title="Retake Test" 
          onPress={onRetake} 
          className="flex-1 bg-indigo-600 shadow-md shadow-indigo-200"
          textClassName="text-white font-bold"
          rightIcon="refresh"
        />
      </Animated.View>

      {/* Helper Sheet */}
      <ExplainSheet 
        ref={explainRef} 
        title="Explanation" 
        html={selectedHtml} 
      />
    </View>
  );
}