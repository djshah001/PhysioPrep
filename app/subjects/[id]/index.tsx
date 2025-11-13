import { useEffect } from 'react';
import { View, ScrollView, Text, RefreshControl } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '~/useAuth';
import { Colors } from 'constants/Colors';
import { CustomHeader } from 'components/common/CustomHeader';
import { useAtom, useSetAtom } from 'jotai';
import { TopicCard } from 'components/ui/TopicCard'; // NEW: create this component
import { Button } from 'components/ui/button';
import { fetchSubjectAtom, loadingAtom, subjectAtom } from 'store/subject';
import { SubjectDetailSkeleton } from 'components/skeletons/SubjectDetailSkeleton';
import colors from 'tailwindcss/colors';
import { ProgressBar } from '~/ProgressBar';
import {
  rewardedAdLoadedAtom,
  initializeRewardedAdAtom,
  loadRewardedAdAtom,
  showRewardedAdAtom,
} from 'store/rewardedAd';
import Chip from '~/ui/Chip';

export default function SubjectDetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [subject] = useAtom(subjectAtom);
  const [loading] = useAtom(loadingAtom);
  const fetchSubject = useSetAtom(fetchSubjectAtom);

  // Use shared rewarded ad state
  const [rewardedAdLoaded] = useAtom(rewardedAdLoadedAtom);
  const initializeRewardedAd = useSetAtom(initializeRewardedAdAtom);
  const loadRewardedAd = useSetAtom(loadRewardedAdAtom);
  const showRewardedAd = useSetAtom(showRewardedAdAtom);

  useEffect(() => {
    if (id) fetchSubject(id as string, false);
  }, [id, fetchSubject]);

  useEffect(() => {
    // Initialize the shared rewarded ad
    const cleanup = initializeRewardedAd();
    return cleanup;
  }, [initializeRewardedAd]);

  useFocusEffect(() => {
    // Load ad when screen comes into focus
    loadRewardedAd();
  });

  const onRefresh = () => {
    if (id) fetchSubject(id as string, true);
  };

  if (loading || !subject) {
    return <SubjectDetailSkeleton />;
  }

  const handleSubjectQuiz = async () => {
    await showRewardedAd();
    router.push(`/subjects/${subject._id}/quiz`);
  };

  // console.log('subject:',JSON.stringify(subject, null, 2));

  const progress =
    (subject.userStats?.correctlyAnsweredQuestions ?? 0) / (subject.stats?.totalQuestions || 1);

  // console.log(JSON.stringify(subject.topics, null, 2));
  return (
    <View className="flex-1 bg-neutral-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        contentContainerClassName="pb-32">
        {/* Subject Details Card */}

        <CustomHeader title={subject?.name as string} showBack />

        <View className="mt-3 p-4">
          <View
            // colors={[primaryColor as string, secondaryColor as string]}
            className="overflow-hidden rounded-3xl bg-slate-50 p-6 shadow-lg shadow-neutral-700">
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

            <View className="mt-6 gap-2 ">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-neutral-800">Your Progress </Text>
                <Text className="text-lg font-semibold text-neutral-800">
                  {Math.round(progress * 100)}%
                </Text>
              </View>
              <ProgressBar value={Math.round(progress * 100)} color={colors.green[400]} />
            </View>
            {/* Quiz/Test Buttons */}
            {/* <View className="mt-6 flex-row gap-4 "> */}
            <Button
              title="Start The Quiz "
              rightIcon="play-outline"
              onPress={() => handleSubjectQuiz()}
              className="mt-6 flex-1 rounded-2xl bg-lime-500 shadow-md"
              textClassName="text-white text-lg font-bold"
              disabled={!rewardedAdLoaded}
              loading={!rewardedAdLoaded}
            />
            {/* <Button
                title="Comprehensive Test"
                rightIcon="clipboard-outline"
                onPress={() => router.push(`/subjects/comprehensive-test`)}
                className="flex-1 rounded-3xl bg-neutral-900 shadow-md"
                textClassName="text-white text-lg font-bold"
              /> */}
            {/* </View> */}
          </View>
        </View>

        {/* Topics List */}
        <View className="px-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-semibold text-neutral-800">Topics Covered</Text>
          </View>
          <View className="flex flex-row flex-wrap gap-3">
            {subject.topics && subject.topics.length > 0 ? (
              subject.topics.map((topic, index) => (
                <TopicCard
                  key={topic._id}
                  index={index}
                  topic={topic}
                  subjectId={subject._id}
                  isAdmin={user?.role === 'admin'}
                  onTakeQuiz={() => router.push(`/topics/${topic._id}/quiz`)}
                  onViewDetails={() => router.push(`/topics/${topic._id}`)}
                />
              ))
            ) : (
              <Text className="mt-8 text-center text-foreground/60">
                No topics found for this subject.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
      {/* Floating Action Button for subject-wise quiz/test */}
    </View>
  );
}


