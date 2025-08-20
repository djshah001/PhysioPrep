import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { QuestionForm } from 'components/questions/QuestionForm';
import { CustomHeader } from 'components/common/CustomHeader';
import { updateQuestionAtom, loadingQuestionsAtom } from 'store/question';
import { Question, QuestionFormValues } from 'types/types';
import { questionApi } from 'services/api';
import { Colors } from 'constants/Colors';
import { handleError } from 'lib/utils';
import { AxiosError } from 'axios';

export default function EditQuestionPage() {
  const router = useRouter();
  const { questionId } = useLocalSearchParams<{ questionId: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  const updateQuestion = useSetAtom(updateQuestionAtom);
  const loading = useAtomValue(loadingQuestionsAtom);

  useEffect(() => {
    if (!questionId) return;
    const fetchQuestion = async () => {
      try {
        setIsFetching(true);
        const res = await questionApi.getById(questionId);
        setQuestion(res.data.data);
      } catch (err) {
        handleError(err as AxiosError);
        router.back();
      } finally {
        setIsFetching(false);
      }
    };
    fetchQuestion();
  }, [questionId, router]);

  const handleEditQuestion = async (values: QuestionFormValues) => {
    if (!questionId) return;
    await updateQuestion({ questionId, data: values });
  };

  if (isFetching || !question) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const initialValues: QuestionFormValues = {
    text: question.text,
    options: question.options,
    explanation: question.explanation,
    difficulty: question.difficulty,
    tier: question.tier,
  };

  return (
    <View className="flex-1 bg-background">
      <CustomHeader title="Edit Question" showBack />
      <QuestionForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleEditQuestion}
        loading={loading}
      />
    </View>
  );
} 