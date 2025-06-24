import React, { useState } from 'react';
import { View, ScrollView, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from 'constants/Colors';
import { Text } from 'react-native';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from 'services/api';

interface QuizForm {
  title: string;
  description: string;
  timeLimit: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function AddQuizPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [form, setForm] = useState<QuizForm>({
    title: '',
    description: '',
    timeLimit: '30',
    difficulty: 'medium',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      Alert.alert('Error', 'Please enter a quiz title');
      return;
    }

    const timeLimit = parseInt(form.timeLimit);
    if (isNaN(timeLimit) || timeLimit <= 0) {
      Alert.alert('Error', 'Please enter a valid time limit');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/subjects/${id}/quizzes`, {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        timeLimit,
      });
      router.back();
    } catch (error) {
      console.error('Error creating quiz:', error);
      Alert.alert('Error', 'Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScrollView className="flex-1 p-6">
        <View className="mb-6">
          <Text className="text-lg font-medium text-foreground mb-2">
            Quiz Title
          </Text>
          <TextInput
            value={form.title}
            onChangeText={(text) => setForm({ ...form, title: text })}
            placeholder="Enter quiz title"
            placeholderTextColor={Colors.foreground + '60'}
            className="bg-card/50 rounded-xl p-4 text-foreground"
            autoFocus
          />
        </View>

        <View className="mb-6">
          <Text className="text-lg font-medium text-foreground mb-2">
            Description
          </Text>
          <TextInput
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            placeholder="Enter quiz description"
            placeholderTextColor={Colors.foreground + '60'}
            className="bg-card/50 rounded-xl p-4 text-foreground"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View className="mb-6">
          <Text className="text-lg font-medium text-foreground mb-2">
            Time Limit (minutes)
          </Text>
          <TextInput
            value={form.timeLimit}
            onChangeText={(text) => setForm({ ...form, timeLimit: text })}
            placeholder="Enter time limit"
            placeholderTextColor={Colors.foreground + '60'}
            className="bg-card/50 rounded-xl p-4 text-foreground"
            keyboardType="number-pad"
          />
        </View>

        <View className="mb-6">
          <Text className="text-lg font-medium text-foreground mb-2">
            Difficulty
          </Text>
          <View className="flex-row space-x-2">
            {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
              <Pressable
                key={difficulty}
                onPress={() => setForm({ ...form, difficulty })}
                className={`flex-1 py-3 rounded-xl ${
                  form.difficulty === difficulty
                    ? 'bg-primary'
                    : 'bg-card/50'
                }`}
              >
                <Text
                  className={`text-center font-medium capitalize ${
                    form.difficulty === difficulty
                      ? 'text-white'
                      : 'text-foreground'
                  }`}
                >
                  {difficulty}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          className={`bg-primary rounded-xl p-4 items-center ${
            loading ? 'opacity-50' : ''
          }`}
        >
          {loading ? (
            <View className="flex-row items-center">
              <Ionicons
                name="sync"
                size={20}
                color="white"
                className="animate-spin mr-2"
              />
              <Text className="text-white font-medium">Creating...</Text>
            </View>
          ) : (
            <Text className="text-white font-medium">Create Quiz</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
} 