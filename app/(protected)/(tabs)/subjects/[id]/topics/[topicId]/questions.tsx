import { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useAtom, useSetAtom } from 'jotai';
import { CustomHeader } from 'components/common/CustomHeader';
import { QuestionCard } from 'components/questions/QuestionCard';
import { QuestionsSkeleton } from 'components/skeletons/QuestionsSkeleton';
import { Button } from 'components/ui/button';
import {
  questionsAtom,
  loadingQuestionsAtom,
  errorQuestionsAtom,
  fetchQuestionsByTopicAtom,
  paginationAtom,
  resetQuestionsAtom,
} from 'store/question';
import { useAuth } from 'hooks/useAuth';
import { Colors } from 'constants/Colors';
import { SimpleSelect } from 'components/ui/SimpleSelect';
import { Input } from 'components/ui/input';
import { FlatList } from 'react-native-gesture-handler';

const DIFFICULTY_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
];
const TIER_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Free', value: 'free' },
  { label: 'Premium', value: 'premium' },
];

export default function TopicQuestionsPage() {
  const { topicId, topicName } = useLocalSearchParams<{ topicId: string; topicName: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [questions] = useAtom(questionsAtom);
  const [loading] = useAtom(loadingQuestionsAtom);
  const [error] = useAtom(errorQuestionsAtom);
  const [pagination] = useAtom(paginationAtom);
  const fetchQuestions = useSetAtom(fetchQuestionsByTopicAtom);
  const resetQuestions = useSetAtom(resetQuestionsAtom);
  const navigation = useNavigation();

  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [tier, setTier] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch first page on mount or when filters/search change
  useEffect(() => {
    if (!topicId) return;
    setInitialLoad(true);
    resetQuestions();
    fetchQuestions({ topicId, page: 1, search, difficulty, tier });
    setInitialLoad(false);
  }, [topicId, search, difficulty, tier, fetchQuestions, resetQuestions]);

  // Set navigation header
  useEffect(() => {
    navigation.setOptions({
      header: () => <CustomHeader title={`Questions for ${topicName}`} showBack />,
      headerShown: true,
    });
  }, [navigation, topicName]);

  // Infinite scroll: fetch next page
  const handleEndReached = useCallback(() => {
    if (!loading && pagination?.hasNextPage && topicId && !initialLoad) {
      fetchQuestions({
        topicId,
        page: (pagination.currentPage || 1) + 1,
        search,
        difficulty,
        tier,
        append: true,
      });
    }
  }, [loading, pagination, topicId, search, difficulty, tier, fetchQuestions, initialLoad]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    if (!topicId) return;
    await resetQuestions();
    await fetchQuestions({ topicId, page: 1, search, difficulty, tier });
  }, [topicId, search, difficulty, tier, fetchQuestions, resetQuestions]);

  // Render item
  const renderItem = ({ item, index }: any) => (
    <QuestionCard key={item._id} question={item} index={index} />
  );

  // Footer loading spinner
  const ListFooterComponent = () =>
    loading && pagination?.hasNextPage ? (
      <View className="py-6">
        <ActivityIndicator color={Colors.primary} />
      </View>
    ) : null;

  return (
    <View className="flex-1 bg-background">
      {initialLoad && loading ? (
        <QuestionsSkeleton />
      ) : error ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-red-500">{error}</Text>
          <Button title="Retry" onPress={onRefresh} className="mt-4" />
        </View>
      ) : (
        <>
          <View className="p-6 pb-2">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-foreground">
                {pagination?.totalQuestions ?? 0} Question
                {(pagination?.totalQuestions ?? 0) === 1 ? '' : 's'}
              </Text>
              {user?.role === 'admin' && (
                <Button
                  title="Add Question"
                  leftIcon="add"
                  onPress={() => router.push(`/subjects/_/topics/${topicId}/add-question`)}
                  className="bg-primary px-3 py-2"
                />
              )}
            </View>
            {/* Admin-only search and filters */}
            {user?.role === 'admin' && (
              <View className=" flex-col gap-3">
                <Input
                  placeholder="Search questions..."
                  value={search}
                  onChangeText={setSearch}
                  className="bg-card"
                />
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <SimpleSelect
                      label="Difficulty"
                      value={difficulty}
                      options={DIFFICULTY_OPTIONS}
                      onSelect={setDifficulty}
                    />
                  </View>
                  <View className="flex-1">
                    <SimpleSelect
                      label="Tier"
                      value={tier}
                      options={TIER_OPTIONS}
                      onSelect={setTier}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
          <FlatList
            data={questions}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ padding: 24, paddingBottom: 96 }}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={ListFooterComponent}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={onRefresh}
                tintColor={Colors.primary}
              />
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              loading ? (
                <QuestionsSkeleton />
              ) : (
                <View className="mt-20 flex-1 items-center justify-center">
                  <Text className="text-lg text-foreground/60">No questions found.</Text>
                  <Text className="text-sm text-foreground/50">Be the first to add one!</Text>
                </View>
              )
            }
          />
        </>
      )}
    </View>
  );
}
