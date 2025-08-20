import React from 'react';
import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Topic } from 'types/types';

interface TopicCardProps {
  topic: Topic;
  subjectId: string;
  isAdmin?: boolean;
  onTakeQuiz: () => void;
  onTakeTest: () => void;
  onViewDetails?: () => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  isAdmin,
  onTakeQuiz,
  onTakeTest,
  onViewDetails,
}) => {
  // console.log(JSON.stringify(topic, null, 2));
  return (
    <TouchableOpacity onPress={onViewDetails} className="mb-4">
      <View className="flex-row items-center justify-between rounded-2xl bg-white p-3 shadow">
        <View className="flex-1 flex-row items-center gap-4">
          <View className='w-12 h-12 items-center justify-center rounded-xl bg-sky-400 shadow-lg shadow-blue-800'>
            <Text className="text-2xl text-white">{topic.topicName[0]}</Text>
          </View>
          <Text className="text-xl font-semibold text-neutral-600 shadow-lg shadow-neutral-500">{topic.topicName}</Text>
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
