import React from 'react';
import { View, Text } from 'react-native';
import { Question } from 'types/types';

interface QuestionCardProps {
  question: Question;
  index: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, index }) => {
  return (
    <View className="mb-4 rounded-xl bg-card p-4 shadow-md">
      <View className="flex-row justify-between">
        <Text className="mb-2 flex-1 text-base font-semibold text-primary">
          Q{index + 1}: {question.text}
        </Text>
      </View>
      <View className="mb-2">
        {question.options.map((opt, i) => (
          <View key={i} className="mb-1 flex-row items-center">
            <View
              className={`mr-2 h-4 w-4 rounded-full border ${
                opt.isCorrect ? 'border-green-600 bg-green-500' : 'border-border bg-background'
              }`}
            />
            <Text className="text-foreground">{opt.text}</Text>
          </View>
        ))}
      </View>
      {question.explanation && (
        <Text className="mt-2 text-xs italic text-muted">
          <Text className="font-bold">Explanation:</Text> {question.explanation}
        </Text>
      )}
      <View className="mt-2 flex-row items-center justify-end gap-4">
        <Text className="rounded-full bg-grey2 px-2 py-1 text-xs capitalize text-foreground">
          {question.difficulty}
        </Text>
        <Text
          className={`rounded-full px-2 py-1 text-xs capitalize ${
            question.tier === 'premium' ? 'bg-primary/20 text-primary' : 'bg-green-500/20 text-green-500'
          }`}>
          {question.tier}
        </Text>
      </View>
    </View>
  );
}; 