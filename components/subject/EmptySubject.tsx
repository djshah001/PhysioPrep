import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from 'constants/Colors';
import { Link } from 'expo-router';

interface EmptySubjectProps {
  type: 'subject' | 'quiz';
  href?: string;
  isAdmin?: boolean;
}

export const EmptySubject = ({ type, href = 'subjects', isAdmin = false }: EmptySubjectProps) => {
  return (
    <View className="flex-1 items-center justify-center p-6 ">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Ionicons
          name={type === 'subject' ? 'book-outline' : 'document-text-outline'}
          size={40}
          color={Colors.primary}
        />
      </View>
      <Text className="mb-2 text-xl font-bold text-primary">
        No {type === 'subject' ? 'Subjects' : 'Quizzes'} Available
      </Text>
      <Text className="text-foreground mb-6 text-center text-base">
        {type === 'subject'
          ? 'Start by adding your first subject to begin learning.'
          : 'No quizzes available for this subject yet.'}
      </Text>
      {isAdmin && (
        <Link href={href}>
          <View className="flex-row items-center rounded-full bg-primary px-6 py-3">
            <Ionicons name="add" size={20} color={Colors.white} />
            <Text className="ml-2 font-semibold text-white">
              Add {type === 'subject' ? 'Subject' : 'Quiz'}
            </Text>
          </View>
        </Link>
      )}
    </View>
  );
};
