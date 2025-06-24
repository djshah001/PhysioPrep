import { useState, useEffect } from 'react';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { TopicForm } from 'components/topics/TopicForm';
import { useSetAtom } from 'jotai';
import { topicApi } from 'services/api';
import { CustomHeader } from '~/common/CustomHeader';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '~/Colors';
import { handleError } from 'lib/utils';
import { AxiosError } from 'axios';
import { useAuth } from 'hooks/useAuth';
import { Topic } from 'types/types';
import type { TopicFormValues } from 'types/types';
import { updateTopicAtom } from 'store/subject';

export default function EditTopicPage() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const updateTopic = useSetAtom(updateTopicAtom);
  const { user } = useAuth();

  useEffect(() => {
    if (!topicId) return;
    setLoading(true);
    const fetchTopic = async () => {
      try {
        const response = await topicApi.getById(topicId);
        setTopic(response.data.data);
        // console.log('Fetched topic:', response.data.data);
      } catch (error) {
        handleError(error as AxiosError);
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [topicId]);

  useEffect(() => {
    navigation.setOptions({
      header: () => <CustomHeader title={`Edit ${topic?.topicName}`} showBack />,
      headerShown: true,
    });
  }, [navigation, topic?.topicName]);

  const handleEdit = async (values: TopicFormValues) => {
    await updateTopic({ topicId: topicId!, data: values });
    router.back();
  };

  if (!topic || !topicId || loading)
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <ActivityIndicator color={Colors.primary} />
      </View>
    );

  return (
    <TopicForm
      mode="edit"
      initialValues={
        topic
          ? {
              topicName: topic.topicName,
              description: topic.description,
              isActive: topic.isActive,
            }
          : undefined
      }
      onSubmit={handleEdit}
      loading={loading}
      isAdmin={user?.role === 'admin'}
    />
  );
}
