import React, { useEffect } from 'react';
import { View, ScrollView, Text, RefreshControl } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useAuth } from 'hooks/useAuth';
import { Colors } from 'constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CustomHeader } from 'components/common/CustomHeader';
import { useAtom, useSetAtom } from 'jotai';
// NEW: create this atom file for subject detail state
import { FloatingActionButton } from 'components/ui/FloatingActionButton'; // NEW: create this component
import { TopicCard } from 'components/ui/TopicCard'; // NEW: create this component
import { Button } from 'components/ui/button';
import { fetchSubjectAtom, loadingAtom, subjectAtom } from 'store/subject';
import { SubjectDetailSkeleton } from 'components/skeletons/SubjectDetailSkeleton';

export default function SubjectDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [subject] = useAtom(subjectAtom);
  const [loading] = useAtom(loadingAtom);
  const fetchSubject = useSetAtom(fetchSubjectAtom);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      header: () => <CustomHeader title={subject?.name as string} showBack />,
      headerShown: true,
    });
  }, [navigation, subject]);

  useEffect(() => {
    if (id) fetchSubject(id as string);
  }, [id, fetchSubject]);

  const onRefresh = () => {
    if (id) fetchSubject(id as string);
  };

  if (loading || !subject) {
    return <SubjectDetailSkeleton />;
  }

  // console.log('subject:',JSON.stringify(subject, null, 2));

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        contentContainerClassName="pb-32">
        {/* Subject Details Card */}
        <LinearGradient
          colors={[Colors.grey5, Colors.background]}
          className="rounded-b-3xl p-6 pb-8">
          <View className="mb-2 flex-row items-center">
            <Ionicons name={subject.icon as any} size={36} color={subject.color} className="mr-3" />
            <Text className="text-3xl font-bold text-white">{subject.name}</Text>
            {user?.role === 'admin' && (
              <Button
                title="Edit"
                leftIcon="create-outline"
                onPress={() =>
                  router.push({
                    pathname: `/subjects/edit/${id}`,
                    params: {
                      name: subject.name,
                    },
                  })
                }
                className="ml-auto bg-primary px-4 py-2"
              />
            )}
          </View>
          <Text className="mb-2 text-base text-white/80">{subject.description}</Text>
          <View className="mt-2 flex-row gap-4">
            <View className="flex-row items-center">
              <Ionicons name="help-circle-outline" size={18} color={Colors.white} />
              <Text className="ml-1 text-white/90">
                {subject.stats?.totalQuestions ?? 0} Questions
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="star" size={18} color={Colors.yellow} />
              <Text className="ml-1 text-white/90">{subject.stats?.freeQuestions ?? 0} Free</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="lock-closed" size={18} color={Colors.primary} />
              <Text className="ml-1 text-white/90">
                {subject.stats?.premiumQuestions ?? 0} Premium
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Topics List */}
        <View className="p-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-semibold text-foreground">Topics</Text>
            {user?.role === 'admin' && (
              <Button
                title="Add Topic"
                leftIcon="add-circle-outline"
                onPress={() =>
                  router.push({
                    pathname: `/subjects/${subject._id}/topics/add`,
                    params: { subjectId: subject.id },
                  })
                }
                className=" bg-primary px-3 py-2"
              />
            )}
          </View>
          {subject.topics && subject.topics.length > 0 ? (
            subject.topics.map((topic) => (
              <TopicCard
                key={topic._id}
                topic={topic}
                subjectId={subject._id}
                isAdmin={user?.role === 'admin'}
                onTakeQuiz={() => router.push(`/subjects/${subject._id}/topics/${topic._id}/quiz`)}
                onTakeTest={() => router.push(`/subjects/${subject._id}/topics/${topic._id}/test`)}
                onEdit={() => router.push(`/subjects/${subject._id}/topics/${topic._id}/edit`)}
                onDelete={() => {}}
                onManageQuestions={() =>
                  router.push({
                    pathname: `/subjects/${subject._id}/topics/${topic._id}/questions`,
                    params: { topicId: topic._id, topicName: topic.topicName },
                  })
                }
              />
            ))
          ) : (
            <Text className="mt-8 text-center text-foreground/60">
              No topics found for this subject.
            </Text>
          )}
        </View>
      </ScrollView>
      {/* Floating Action Button for subject-wise quiz/test */}
      <FloatingActionButton
        actions={[
          {
            icon: 'help-circle-outline',
            label: 'Take Subject Quiz',
            onPress: () => router.push(`/quiz/start?subject=${subject._id}`),
          },
          {
            icon: 'clipboard-outline',
            label: 'Take Subject Test',
            onPress: () => router.push(`/test/start?subject=${subject._id}`),
          },
        ]}
      />
    </View>
  );
}
