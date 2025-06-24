import React, { useState } from 'react';
import { View, ScrollView, Text, Pressable, Alert, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from 'services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from 'constants/Colors';

import { Input } from '~/ui/input';
import { Button } from '~/ui/button';
import { AxiosError } from 'axios';
import { handleError } from 'lib/utils';

interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export default function AddQuestionPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState({
    text: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ] as QuestionOption[],
    explanation: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    tier: 'free' as 'free' | 'premium',
  });

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...question.options];
    newOptions[index] = { ...newOptions[index], text };
    setQuestion({ ...question, options: newOptions });
  };

  const handleCorrectOption = (index: number) => {
    const newOptions = question.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setQuestion({ ...question, options: newOptions });
  };

  const handleSubmit = async () => {
    if (!question.text || question.options.some((opt) => !opt.text) || !question.explanation) {
      alert('Please fill in all fields');
      return;
    }

    if (!question.options.some((opt) => opt.isCorrect)) {
      alert('Please select a correct answer');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/questions`, { ...question, subject: id });
      router.back();
    } catch (error) {
      handleError(error as AxiosError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
        <ScrollView
          className="p-6"
          contentContainerStyle={{ paddingBottom: 50 }}
          keyboardShouldPersistTaps="handled">
          <View className="mb-6">
            <Text className="mb-2 text-lg font-semibold text-foreground">Question Text</Text>
            <Input
              className="rounded-xl bg-card/50 p-4 text-foreground"
              placeholder="Enter your question"
              placeholderTextColor={Colors.foreground + '80'}
              value={question.text}
              onChangeText={(text) => setQuestion({ ...question, text })}
              multiline
            />
          </View>

          <View className="mb-6">
            <Text className="mb-2 text-lg font-semibold text-foreground">Options</Text>
            {question.options.map((option, index) => (
              <View key={index} className="mb-4">
                <View className="flex-row items-center">
                  <Pressable
                    onPress={() => handleCorrectOption(index)}
                    className="mr-2 h-6 w-6 items-center justify-center rounded-full border border-primary">
                    {option.isCorrect && <View className="h-3 w-3 rounded-full bg-primary" />}
                  </Pressable>
                  <Input
                    className="flex-1 rounded-xl bg-card/50 p-4 text-foreground"
                    placeholder={`Option ${index + 1}`}
                    placeholderTextColor={Colors.foreground + '80'}
                    value={option.text}
                    onChangeText={(text) => handleOptionChange(index, text)}
                  />
                </View>
              </View>
            ))}
          </View>

          <View className="mb-6">
            <Text className="mb-2 text-lg font-semibold text-foreground">Explanation</Text>
            <Input
              className="rounded-xl bg-card/50 p-4 text-foreground"
              placeholder="Explain the correct answer"
              placeholderTextColor={Colors.foreground + '80'}
              value={question.explanation}
              onChangeText={(text) => setQuestion({ ...question, explanation: text })}
              multiline
            />
          </View>

          <View className="mb-6">
            <Text className="mb-2 text-lg font-semibold text-foreground">Difficulty</Text>
            <View className="flex-row gap-2">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <Pressable
                  key={diff}
                  onPress={() => setQuestion({ ...question, difficulty: diff })}
                  className={`flex-1 rounded-xl p-4 ${
                    question.difficulty === diff
                      ? 'bg-primary'
                      : 'border  bg-foreground/50'
                  }`}>
                  <Text
                    className={`text-center font-medium ${
                      question.difficulty === diff ? 'text-white' : 'text-secondary'
                    }`}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="mb-6">
            <Text className="mb-2 text-lg font-semibold text-foreground">Tier</Text>
            <View className="flex-row gap-2">
              {(['free', 'premium'] as const).map((tier) => (
                <Pressable
                  key={tier}
                  onPress={() => setQuestion({ ...question, tier })}
                  className={`flex-1 rounded-xl p-4 ${
                    question.tier === tier ? 'bg-primary shadow-lg shadow-primary' : 'bg-foreground/50'
                  }`}>
                  <Text
                    className={`text-center font-medium ${
                      question.tier === tier ? 'text-white' : 'text-foreground'
                    }`}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View className="border-t border-primary/50 bg-background px-4 py-2 ">
        <Button
          //   className="rounded-full"
          title="Submit"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
        />
      </View>
    </SafeAreaView>
  );
}
