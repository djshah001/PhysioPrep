import React, { useEffect } from 'react';
import { View, ScrollView, Text, RefreshControl } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useAuth } from 'hooks/useAuth';
import { Colors } from 'constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { CustomHeader } from 'components/common/CustomHeader';
import { useAtom, useSetAtom } from 'jotai';
import { TopicCard } from 'components/ui/TopicCard'; // NEW: create this component
import { Button } from 'components/ui/button';
import { fetchSubjectAtom, loadingAtom, subjectAtom } from 'store/subject';
import { SubjectDetailSkeleton } from 'components/skeletons/SubjectDetailSkeleton';
import colors from 'tailwindcss/colors';

export default function SubjectDetailPage() {
  const { id, primaryColor, secondaryColor } = useLocalSearchParams();
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
    if (id) fetchSubject(id as string,false);
  }, [id, fetchSubject]);

  const onRefresh = () => {
    if (id) fetchSubject(id as string,true);
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

        <View className="mt-3 p-4">
          <View
            // colors={[primaryColor as string, secondaryColor as string]}
            className="overflow-hidden rounded-3xl bg-white p-6 shadow-lg shadow-neutral-700">
            <View className="mb-2 flex-row items-center">
              <View
                // intensity={50}
                className=" h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-rose-500 ">
                <Text className="text-2xl text-white">{subject.name[0]}</Text>
              </View>
              {/* <Ionicons name={subject.icon as any} size={36} color={subject.color} className="mr-3" /> */}
              <Text className=" ml-2 text-3xl font-extrabold text-neutral-800">{subject.name}</Text>
            </View>
            {/* <Text className="mb-2 text-base text-neutral-500">{subject.description}</Text> */}
            <View className=" flex-row flex-wrap gap-2">
              <Chip
                iconName="book"
                iconColor={colors.rose[600]}
                label={`${subject.stats?.totalQuestions ?? 0} Questions`}
              />

              <Chip
                iconName="bookmarks"
                iconColor={colors.blue[400]}
                label={`${subject.stats?.totalTopics ?? 0} Topics`}
              />

              <Chip
                iconName="star"
                iconColor={colors.yellow[400]}
                label={`${subject.stats?.freeQuestions ?? 0} Free`}
              />
              <Chip
                iconName="lock-closed"
                iconColor={colors.blue[400]}
                label={`${subject.stats?.premiumQuestions ?? 0} Premium`}
              />
              <Chip
                iconName="checkmark-circle"
                iconColor={colors.green[400]}
                label={`${subject.userStats?.correctlyAnsweredQuestions ?? 0} Correctly Answered`}
              />
            </View>
            {/* Quiz/Test Buttons */}
            <View className="mt-6 flex-row gap-4">
              <Button
                title="Subject Quiz"
                leftIcon="school-outline"
                onPress={() => router.push(`/subjects/${subject._id}/quiz`)}
                className="flex-1 rounded-3xl bg-indigo-500/80 shadow-md"
                textClassName="text-white text-lg font-bold"
              />
              <Button
                title="Comprehensive Test"
                rightIcon="clipboard-outline"
                onPress={() => router.push(`/subjects/comprehensive-test`)}
                className="flex-1 rounded-3xl bg-neutral-900 shadow-md"
                textClassName="text-white text-lg font-bold"
              />
            </View>
          </View>
        </View>

        {/* Topics List */}
        <View className="px-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-semibold text-neutral-600">Topics</Text>
          </View>
          {subject.topics && subject.topics.length > 0 ? (
            subject.topics.map((topic) => (
              <TopicCard
                key={topic._id}
                topic={topic}
                subjectId={subject._id}
                isAdmin={user?.role === 'admin'}
                onTakeQuiz={() => router.push(`/subjects/${subject._id}/topics/${topic._id}/quiz`)}
                onViewDetails={() => router.push(`/subjects/${subject._id}/topics/${topic._id}`)}
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
    </View>
  );
}

const Chip = ({
  iconName,
  iconColor,
  label,
}: {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
}) => {
  return (
    <View
      // experimentalBlurMethod="dimezisBlurView"
      className="flex-row items-center rounded-xl bg-[#f9589e] px-2.5 py-2 shadow-2xl shadow-rose-500">
      <Ionicons name={iconName} size={14} color={iconColor} />
      <Text className="ml-2 text-xs text-neutral-50">{label}</Text>
    </View>
  );
};
