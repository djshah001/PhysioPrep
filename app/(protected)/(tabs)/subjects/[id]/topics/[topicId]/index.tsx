import React, { useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { topicApi } from 'services/api';
import { Button } from 'components/ui/button';
import { CustomHeader } from 'components/common/CustomHeader';
import { useAuth } from 'hooks/useAuth';
import { Colors } from 'constants/Colors';
import { handleError } from 'lib/utils';
import { AxiosError } from 'axios';
import { useAtom, useSetAtom } from 'jotai';
import {
  topicDetailsAtom,
  loadingTopicDetailsAtom,
  errorTopicDetailsAtom,
  fetchTopicDetailsAtom,
} from 'store/subject';
import RenderHtml from 'react-native-render-html';
import colors from 'tailwindcss/colors';
import { customHTMLElementModels, renderers, tagsStyles } from 'lib/HtmlRenderers';

export default function TopicDetailsPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const { id: subjectId, topicId } = useLocalSearchParams<{ id: string; topicId: string }>();
  const { user } = useAuth();

  // Jotai atoms
  const [topic] = useAtom(topicDetailsAtom);
  const [loading] = useAtom(loadingTopicDetailsAtom);
  const [error] = useAtom(errorTopicDetailsAtom);
  const fetchTopicDetails = useSetAtom(fetchTopicDetailsAtom);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      header: () => <CustomHeader title="Topic Details" showBack />,
    });
  }, [navigation]);

  // Fetch topic details
  useEffect(() => {
    if (!topicId) return;
    fetchTopicDetails(topicId);
  }, [topicId, fetchTopicDetails]);

  const handleTakeQuiz = () => {
    if (!topic) return;
    router.push(`/subjects/${subjectId}/topics/${topic._id}/quiz`);
  };

  const handleTakeTest = () => {
    if (!topic) return;
    router.push(`/subjects/${subjectId}/topics/${topic._id}/test`);
  };

  const handleEdit = () => {
    if (!topic) return;
    router.push(`/subjects/${subjectId}/topics/${topic._id}/edit`);
  };

  const handleManageQuestions = () => {
    if (!topic) return;
    router.push({
      pathname: `/subjects/${subjectId}/topics/${topic._id}/questions`,
      params: { topicName: topic.topicName },
    });
  };

  const handleDelete = () => {
    if (!topic) return;

    Alert.alert(
      `Delete "${topic.topicName}"?`,
      'This will delete the topic and all its questions. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await topicApi.delete(topic._id);
              router.back();
            } catch (err) {
              handleError(err as AxiosError);
            }
          },
        },
      ]
    );
  };

  console.log(topic?.descriptionHtml);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text className="mt-4 text-foreground/60">Loading topic details...</Text>
      </View>
    );
  }

  if (error || !topic) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Ionicons name="alert-circle-outline" size={64} color={Colors.destructive} />
        <Text className="mt-4 text-center text-xl font-semibold text-foreground">
          {error || 'Topic not found'}
        </Text>
        <Text className="mt-2 text-center text-foreground/60">
          Unable to load topic details. Please try again.
        </Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          className="mt-6"
          leftIcon="arrow-back-outline"
        />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      <View className="p-6">
        {/* Topic Header */}
        <View className="mb-6 rounded-3xl bg-white p-6 shadow">
          <View className="mb-4 flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="mb-2 text-2xl font-bold text-neutral-800">{topic.topicName}</Text>

              {/* Status Badges */}
              <View className="mb-3 flex-row items-center gap-2">
                <Text
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    topic.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                  {topic.isActive ? 'Active' : 'Inactive'}
                </Text>
                <Text
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    topic.isPremium ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                  {topic.isPremium ? 'Premium' : 'Free'}
                </Text>
              </View>

              {/* Subject Info */}
              <Text className="ml-1 text-base text-neutral-600">
                Subject: {typeof topic.subject === 'object' ? topic.subject.name : topic.subject}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <Button
              title="Take Quiz"
              onPress={handleTakeQuiz}
              className="flex-1 rounded-xl bg-primary/10 py-3"
              leftIcon="school-outline"
              leftIconColor={colors.blue[600]}
              textClassName="text-blue-600"
            />
            <Button
              title="Take Test"
              onPress={handleTakeTest}
              className="flex-1 rounded-xl bg-green-100 py-3"
              rightIcon="clipboard-outline"
              rightIconColor={colors.green[700]}
              textClassName="text-green-700"
            />
          </View>
        </View>

        {/* Enhanced HTML Content Rendering */}
        {topic.descriptionHtml && (
          <View className="mb-4 rounded-3xl bg-white p-4 shadow">
            <Text className="mb-1 ml-2 text-lg font-semibold text-neutral-800">Notes</Text>
            <View className="rounded-2xl bg-neutral-100 p-4">
              <RenderHtml
                contentWidth={width - 80} // Account for padding
                source={{ html: topic.descriptionHtml }}
                customHTMLElementModels={customHTMLElementModels}
                renderers={renderers}
                tagsStyles={tagsStyles}
                systemFonts={['System']}
                enableExperimentalMarginCollapsing={true}
                defaultTextProps={{
                  selectable: true,
                }}
                renderersProps={{
                  img: {
                    enableExperimentalPercentWidth: true,
                  },
                  table: {
                    tableStyleSpecs: {
                      outerBorderWidthPx: 1,
                      rowsBorderWidthPx: 1,
                      columnsBorderWidthPx: 1,
                      borderColor: '#e5e7eb',
                      cellPaddingEm: 0.5,
                      linkColor: '#3b82f6',
                    },
                  },
                }}
                // Ignore problematic elements that don't render properly
                ignoredDomTags={['colgroup', 'col', 'label']}
              />
            </View>
          </View>
        )}

        {/* Statistics Section */}
        {topic.stats && (
          <View className="mb-6 rounded-3xl bg-gray-800 p-6 shadow-lg shadow-neutral-500">
            <Text className="mb-4 text-lg font-semibold text-foreground">Statistics</Text>
            <View className="space-y-3">
              {topic.questionCount !== undefined && (
                <View className="flex-row items-center justify-between">
                  <Text className="text-foreground/70">Total Questions</Text>
                  <Text className="font-semibold text-foreground">{topic.questionCount}</Text>
                </View>
              )}

              <View className="flex-row items-center justify-between">
                <Text className="text-foreground/70">Average Score</Text>
                <Text className="font-semibold text-foreground">
                  {Math.round(topic.stats.averageScore)}%
                </Text>
              </View>

              {topic.stats.completionRate !== undefined && (
                <View className="flex-row items-center justify-between">
                  <Text className="text-foreground/70">Completion Rate</Text>
                  <Text className="font-semibold text-foreground">
                    {Math.round(topic.stats.completionRate)}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Admin Actions */}
        {isAdmin && (
          <View className="mb-6 gap-2 rounded-2xl bg-grey6 p-6 shadow">
            <Text className="mb-4 text-lg font-semibold text-foreground">Admin Actions</Text>
            <View className="gap-2 space-y-3">
              <Pressable
                onPress={handleEdit}
                className="flex-row items-center rounded-xl bg-blue-100 p-4">
                <Ionicons name="create-outline" size={20} color="#3B82F6" />
                <Text className="ml-3 font-medium text-blue-700">Edit Topic</Text>
              </Pressable>

              <Pressable
                onPress={handleManageQuestions}
                className="flex-row items-center rounded-xl bg-purple-100 p-4">
                <Ionicons name="list-circle-outline" size={20} color="#8B5CF6" />
                <Text className="ml-3 font-medium text-purple-700">Manage Questions</Text>
              </Pressable>

              <Pressable
                onPress={handleDelete}
                className="flex-row items-center rounded-xl bg-red-100 p-4">
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                <Text className="ml-3 font-medium text-red-700">Delete Topic</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Topic Metadata */}
        <View className="rounded-2xl bg-grey6 p-6 shadow">
          <Text className="mb-4 text-lg font-semibold text-foreground">Details</Text>
          <View className="space-y-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground/70">Created</Text>
              <Text className="font-medium text-foreground">
                {new Date(topic.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-foreground/70">Last Updated</Text>
              <Text className="font-medium text-foreground">
                {new Date(topic.updatedAt).toLocaleDateString()}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-foreground/70">Topic ID</Text>
              <Text className="font-mono text-sm text-foreground/60">{topic._id}</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
