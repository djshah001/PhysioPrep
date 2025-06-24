import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from 'constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Subject } from 'types/types';
import { Menu, MenuOptions, MenuTrigger, MenuOptionsCustomStyle } from 'react-native-popup-menu';
import { PopupMenuOption } from 'components/ui/PopupMenuOption';
import { router } from 'expo-router';
import { useSetAtom } from 'jotai';
import { fetchSubjectsAtom } from 'store/subject';
import api from 'services/api';
import { Button } from '~/ui/button';

interface SubjectCardProps {
  subject: Subject;
  index: number;
  isAdmin: boolean;
}

const subjectColors = [
  ['#FF6B6B', '#FF8E8E'], // Coral
  ['#4ECDC4', '#6ED7D0'], // Turquoise
  ['#45B7D1', '#6BC5DB'], // Sky Blue
  ['#96CEB4', '#B4D9C7'], // Sage
  ['#FFEEAD', '#FFF4C4'], // Cream
  ['#D4A5A5', '#E5B9B9'], // Rose
  ['#9B59B6', '#B07CC7'], // Purple
  ['#3498DB', '#5DADE2'], // Blue
];

const menuOptionStyle = {
  optionsContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  } as MenuOptionsCustomStyle['optionsContainer'],
};

export const SubjectCard = ({ subject, index, isAdmin }: SubjectCardProps) => {
  const { _id, name, description, stats } = subject;
  const colorIndex = index % subjectColors.length;
  const [primaryColor, secondaryColor] = subjectColors[colorIndex];
  const fetchSubjects = useSetAtom(fetchSubjectsAtom);

  const handleDelete = () => {
    Alert.alert(
      `Delete "${name}"?`,
      'This action will permanently delete the subject and all its related data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/subjects/${_id}`);
              await fetchSubjects();
            } catch (err) {
              console.error('Failed to delete subject:', err);
              Alert.alert('Error', 'An error occurred while deleting the subject.');
            }
          },
        },
      ]
    );
  };

  return (
    <Animated.View entering={FadeInRight.delay(index * 100).springify()} className="mb-4">
      <LinearGradient
        colors={[primaryColor, secondaryColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="relative overflow-hidden rounded-2xl p-4">
        <View className="flex-1">
          <View className="flex-row items-start justify-between">
            <Pressable onPress={() => router.push(`subjects/${_id}`)} className="flex-1 pr-2">
              <Text className="mb-1 text-xl font-bold text-white" numberOfLines={1}>
                {name}
              </Text>
              <Text className="text-sm text-white/80" numberOfLines={2}>
                {description}
              </Text>
            </Pressable>
            {isAdmin && (
              <Menu>
                <MenuTrigger>
                  <Ionicons name="ellipsis-vertical" size={22} color={Colors.white} />
                </MenuTrigger>
                <MenuOptions
                  customStyles={menuOptionStyle}
                  renderOptionsContainer={(options: React.ReactNode) => (
                    <BlurView
                      intensity={90}
                      tint="dark"
                      experimentalBlurMethod="dimezisBlurView"
                      style={{ borderRadius: 16, overflow: 'hidden' }}>
                      <View className="py-2">{options}</View>
                    </BlurView>
                  )}>
                  <PopupMenuOption
                    icon="pencil-outline"
                    text="Edit Subject"
                    onSelect={() => router.push(`/subjects/edit/${_id}`)}
                  />
                  <PopupMenuOption
                    icon="trash-outline"
                    text="Delete Subject"
                    color={Colors.destructive}
                    onSelect={handleDelete}
                  />
                </MenuOptions>
              </Menu>
            )}
          </View>

          <Text className="mt-2 text-sm text-white/80">
            Total Questions: {stats?.totalQuestions ?? 0}
          </Text>

          <View className="mt-4 flex-row gap-2">
            <Button
              title="Practice"
              onPress={() => router.push(`/quiz/start?subject=${_id}`)}
              className="flex-1 flex-row items-center justify-center rounded-full bg-white/30 p-3 shadow-xl shadow-slate-600 "
              leftIcon="school-outline"
              textClassName="text-white font-semibold text-base ml-1"
            />

            <Button
              title="Test"
              onPress={() => router.push(`/subjects/${_id}/add-question`)}
              className="flex-1 flex-row items-center justify-center rounded-full bg-rose-500 p-3  shadow-xl shadow-rose-200"
              rightIcon="clipboard-outline"
              rightIconSize={17}
              textClassName="text-white font-semibold text-base"
            />
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};
