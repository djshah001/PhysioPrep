import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Topic } from 'types/types';
import Gradients from '~/Gradients';



interface TopicCardProps {
  topic: Topic;
  subjectId: string;
  isAdmin?: boolean;
  index: number;
  onTakeQuiz: () => void;
  onViewDetails?: () => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  isAdmin,
  onTakeQuiz,
  onViewDetails,
  index,
}) => {
  // console.log(JSON.stringify(topic, null, 2));
  return (
    <TouchableOpacity onPress={onViewDetails} className=" w-[48%]">
      <View
        // colors={Gradients[index % Gradients.length]}
        className="flex-row rounded-2xl bg-white p-6 shadow overflow-hidden">
        <View className="flex-1 items-center gap-2">
          <LinearGradient
            colors={Gradients[index % Gradients.length]}
            className="h-14 w-14 items-center justify-center rounded-2xl shadow-lg shadow-neutral-800 overflow-hidden">
            <Text className="text-3xl font-extrabold text-white">{topic.topicName[0]}</Text>
          </LinearGradient>
          <Text
            className="text-center text-2xl font-bold text-neutral-800 shadow-lg shadow-neutral-500"
            numberOfLines={1}
            adjustsFontSizeToFit>
            {topic.topicName}
          </Text>
          <Text className="text-sm text-neutral-600">{topic.stats?.totalQuestions} Questions</Text>
          {/* <View className="mt-1 flex-row flex-wrap gap-2">
            <Pressable
              onPress={onTakeQuiz}
              accessibilityLabel="Take Topic Quiz"
              className="flex-row items-center gap-1 rounded-full bg-primary/10 px-3 py-2">
              <Ionicons name="school-outline" size={20} color="#6366F1" />
              <Text className="ml-1 text-base font-medium text-primary">Quiz</Text>
            </Pressable>
            <Pressable
              onPress={onTakeTest}
              accessibilityLabel="Take Topic Test"
              className="flex-row items-center gap-1 rounded-full bg-green-100 px-3 py-2">
              <Ionicons name="clipboard-outline" size={18} color="#10B981" />
              <Text className=" text-base font-medium text-green-700">Test</Text>
            </Pressable>
            {onViewDetails && (
              <Pressable
                onPress={onViewDetails}
                accessibilityLabel="View Topic Details"
                className="flex-row items-center gap-1 rounded-full bg-blue-100 px-3 py-2">
                <Ionicons name="information-circle-outline" size={18} color="#3B82F6" />
                <Text className="text-base font-medium text-blue-700">Details</Text>
              </Pressable>
            )}
          </View> */}
        </View>
      </View>
    </TouchableOpacity>
  );
};
