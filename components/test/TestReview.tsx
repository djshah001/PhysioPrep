import React, { useRef, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Button } from 'components/ui/button';
import { Ionicons } from '@expo/vector-icons';
import ExplainSheet from 'components/questions/ExplainSheet';
import type { ActionSheetRef } from 'react-native-actions-sheet';
import colors from 'tailwindcss/colors';

export type TestReviewItem = {
  question: {
    _id: string;
    text: string;
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

const formatSeconds = (seconds: number = 0) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

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
  return (
    <ScrollView className="flex-1 bg-background p-4">
      {/* Summary */}
      <View className="mb-6 rounded-3xl bg-white p-6 shadow">
        <Text className="mb-1 text-2xl font-extrabold text-primary">Test Review</Text>
        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="trophy-outline" size={18} color="#EF4444" />
            <Text className="ml-2 text-base text-neutral-600">
              Score: <Text className="font-bold">{score}%</Text>
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle-outline" size={18} color="#22C55E" />
            <Text className="ml-2 text-base text-neutral-600">
              Correct:{' '}
              <Text className="font-bold">
                {correct}/{totalQuestions}
              </Text>
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="timer-outline" size={18} color="#6366F1" />
            <Text className="ml-2 text-base text-neutral-600">
              Time: <Text className="font-bold">{formatSeconds(timeSpent)}</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Items */}
      {items.map((item, idx) => (
        <View key={item.question._id} className="mb-5 rounded-3xl bg-white p-5 shadow">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="flex-1 text-lg font-bold text-primary">
              {idx + 1}. {item.question.text}
            </Text>
            <View
              className={`ml-3 rounded-full px-2 py-0.5 ${item.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
              <Text
                className={`text-xs font-semibold ${item.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {item.isCorrect ? 'Correct' : 'Incorrect'}
              </Text>
            </View>
          </View>

          {/* Options */}
          {item.question.options.map((opt, oIdx) => {
            const isSelected = item.selectedAnswer === oIdx;
            const isCorrect = item.correctAnswer === oIdx;
            const base = 'mb-2 rounded-xl border px-3 py-2';
            const variant = isCorrect
              ? 'border-green-500 bg-green-50'
              : isSelected
                ? 'border-red-500 bg-red-50'
                : 'border-neutral-200 bg-neutral-50';
            return (
              <View key={oIdx} className={`${base} ${variant}`}>
                <Text
                  className={`${isCorrect ? 'text-green-700' : isSelected ? 'text-red-700' : 'text-neutral-800'} text-base`}>
                  {opt.text}
                </Text>
              </View>
            );
          })}

          {/* Explain button opens ActionSheet/modal */}
          {item.question.explanationHtml ? (
            <View className="mt-3">
              <Button
                title="Explain"
                onPress={() => {
                  setSelectedHtml(item.question.explanationHtml || '');
                  explainRef.current?.show();
                }}
                className="rounded-full bg-amber-300"
                textClassName="text-amber-800 font-semibold"
                leftIcon="bulb-outline"
                leftIconColor={colors.amber[800]}
              />
            </View>
          ) : null}
        </View>
      ))}

      {/* Actions */}
      <View className="mb-10 mt-2 flex-row items-center justify-between">
        <Button title="Back to Subjects" onPress={onBack} className="mr-2 flex-1" />

        {/* Shared Explain Sheet */}
        <ExplainSheet 
        title="Explanation" 
        html={selectedHtml} 
        ref={explainRef}
      />

        <Button
          title="Retake Test"
          onPress={onRetake}
          className="ml-2 flex-1 bg-indigo-500"
          textClassName="text-white"
        />
      </View>
    </ScrollView>
  );
}
