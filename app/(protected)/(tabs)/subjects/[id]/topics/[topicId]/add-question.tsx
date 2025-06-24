import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { QuestionForm } from 'components/questions/QuestionForm';
import { CustomHeader } from 'components/common/CustomHeader';
import { addQuestionAtom, loadingQuestionsAtom } from 'store/question';
import { QuestionFormValues } from 'types/types';

export default function AddQuestionPage() {
  const router = useRouter();
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const addQuestion = useSetAtom(addQuestionAtom);
  const loading = useAtomValue(loadingQuestionsAtom);

  const handleAddQuestion = async (values: QuestionFormValues) => {
    if (!topicId) return;
    await addQuestion({ ...values, topic: topicId });
    router.back();
  };

  return (
    <View className="flex-1 bg-background">
      <CustomHeader title="Add New Question" showBack />
      <QuestionForm mode="add" onSubmit={handleAddQuestion} loading={loading} />
    </View>
  );
} 