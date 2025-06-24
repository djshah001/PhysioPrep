import React, { useEffect } from 'react';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { TopicForm } from 'components/topics/TopicForm';
import { useSetAtom } from 'jotai';
import { addTopicAtom} from 'store/subject';
import { CustomHeader } from '~/common/CustomHeader';
import { useAuth } from 'hooks/useAuth';
import type { TopicFormValues } from 'types/types';

export default function AddTopicPage() {
  const router = useRouter();
  const navigation = useNavigation();
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const addTopic = useSetAtom(addTopicAtom);
  const { user } = useAuth();

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => <CustomHeader title="Add Topic" showBack />,
    });
  }, [navigation]);

  const handleAdd = async (values: TopicFormValues) => {
    await addTopic({ ...values, subject: subjectId });
    router.back();
  };

  return <TopicForm mode="add" onSubmit={handleAdd} isAdmin={user?.role === 'admin'} />;
}
