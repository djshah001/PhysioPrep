import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Topic } from 'types/types';
import { PopupMenuOption } from './PopupMenuOption';
import { Menu, MenuTrigger, MenuOptions, MenuOptionsCustomStyle } from 'react-native-popup-menu';
import { BlurView } from 'expo-blur';
import { Colors } from '~/Colors';
import { useSetAtom } from 'jotai';
import { deleteTopicAtom} from 'store/subject';

interface TopicCardProps {
  topic: Topic;
  subjectId: string;
  isAdmin?: boolean;
  onTakeQuiz: () => void;
  onTakeTest: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onManageQuestions?: () => void;
}

const menuOptionStyle = {
  optionsContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  } as MenuOptionsCustomStyle['optionsContainer'],
};

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  isAdmin,
  onTakeQuiz,
  onTakeTest,
  onEdit,
  onDelete,
  onManageQuestions,
}) => {
  const deleteTopic = useSetAtom(deleteTopicAtom);

  const handleDelete = () => {
    Alert.alert(
      `Delete "${topic.topicName}"?`,
      'This will delete the topic and all its questions. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTopic(topic._id);
            // await fetchSubject(topic.subject.id as string); // No longer needed
          },
        },
      ]
    );
  };

  return (
    <View className="mb-4 flex-row items-center justify-between rounded-2xl bg-grey6 p-4 shadow">
      <View className="flex-1">
        <Text className="mb-1 text-xl font-semibold text-foreground">{topic.topicName}</Text>
        <Text className="mb-2 text-foreground/60">{topic.description}</Text>
        {isAdmin && (
          <View className="mb-2 flex-row items-center gap-2">
            <Text
              className={`rounded-full px-3 py-1 text-xs font-bold ${topic.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {topic.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        )}
        <View className="mt-1 flex-row gap-2">
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
          {/* {isAdmin && onManageQuestions && (
            <Pressable
              onPress={onManageQuestions}
              accessibilityLabel="Manage Questions"
              className="flex-row items-center rounded-full bg-orange-100 px-3 py-1"
            >
              <Ionicons name="list-circle-outline" size={18} color="#F59E42" />
              <Text className="ml-1 text-orange-700 font-medium">Questions</Text>
            </Pressable>
          )} */}
        </View>
      </View>
      {isAdmin && (
        <Menu>
          <MenuTrigger>
            <Ionicons name="ellipsis-vertical" size={22} color="#6366F1" />
          </MenuTrigger>
          <MenuOptions
            customStyles={menuOptionStyle}
            renderOptionsContainer={(options: React.ReactNode) => (
              <BlurView
                intensity={90}
                tint="dark"
                experimentalBlurMethod="dimezisBlurView"
                style={{ borderRadius: 16 }}
                className="rounded-2xl bg-slate-800 p-4">
                {options}
              </BlurView>
            )}>
            <PopupMenuOption icon="create-outline" text="Edit" onSelect={onEdit ?? (() => {})} />
            <PopupMenuOption
              icon="list-circle-outline"
              text="Manage Questions"
              onSelect={onManageQuestions ?? (() => {})}
            />

            <PopupMenuOption
              icon="trash-outline"
              text="Delete"
              onSelect={handleDelete}
              color={Colors.destructive}
            />
          </MenuOptions>
        </Menu>
      )}
    </View>
  );
};
