import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useAuth } from 'hooks/useAuth';
import api from 'services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from 'constants/Colors';
import { CustomHeader } from 'components/common/CustomHeader';
import { Question } from 'types/types';
import { RefreshControl } from 'react-native-gesture-handler';

export default function SubjectQuestionsPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          title="All Questions"
          showBack
          rightIcons={
            user?.role === 'admin'
              ? [
                  {
                    name: 'add',
                    onPress: () => router.push(`/subjects/${id}/add-question`),
                    color: Colors.primary,
                  },
                ]
              : []
          }
        />
      ),
    });
  }, [navigation, user, id, router]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/subjects/${id}/questions`);
      setQuestions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [id]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      {loading ? (
        <ScrollView
          className="flex-1 "
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchQuestions}
              tintColor={Colors.primary}
            />
          }>
          <View className="flex-1 items-center justify-center p-6">
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className="mb-6 h-64 w-full animate-pulse rounded-2xl bg-slate-900 p-4">
                <View className="ml-4 mt-4 h-6 rounded bg-primary/40" />
                <View className="mb-4 ml-4 mt-2 h-3 w-1/2 rounded bg-primary/20" />
                <View className="mb-4 gap-1">
                  <View className="ml-4 mt-2 h-3 w-1/3 rounded bg-primary/10" />
                  <View className="ml-4 mt-2 h-3 w-1/3 rounded bg-primary/10" />
                  <View className="ml-4 mt-2 h-3 w-1/3 rounded bg-primary/10" />
                  <View className="ml-4 mt-2 h-3 w-1/3 rounded bg-primary/10" />
                </View>
                <View className="ml-4 mt-2 h-4 rounded bg-primary/50" />
              </View>
            ))}
          </View>
        </ScrollView>
      ) : questions.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-lg text-foreground/60">No questions found for this subject.</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 p-6"
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchQuestions}
              tintColor={Colors.primary}
            />
          }>
          {questions.map((q, idx) => (
            <View
              key={q._id}
              className="mb-6 rounded-2xl border border-primary/60 bg-card p-4 shadow-2xl shadow-primary ">
              <Text className="mb-2 text-base font-semibold text-foreground">
                Q{idx + 1}: {q.text}
              </Text>
              <View className="mb-2">
                {q.options.map((opt, i) => (
                  <Text
                    key={i}
                    className={`ml-2 text-sm ${opt.isCorrect ? 'font-bold text-primary' : 'text-foreground/80'}`}>
                    {String.fromCharCode(65 + i)}. {opt.text}
                  </Text>
                ))}
              </View>
              <Text className="mb-1 text-xs text-foreground/60">
                Difficulty: {q.difficulty} | Tier: {q.tier}
              </Text>
              <Text className="text-xs text-foreground/60">Explanation: {q.explanation}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
