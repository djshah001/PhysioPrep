import { View, Text, Modal } from 'react-native';
import { Button } from 'components/ui/button';
import { Ionicons } from '@expo/vector-icons';

export default function SubmissionModal({
  visible,
  onClose,
  score,
  total,
  time,
}: {
  visible: boolean;
  onClose: () => void;
  score: number;
  total: number;
  time: number;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/40">
        <View className="w-11/12 max-w-md items-center rounded-2xl bg-white p-6">
          {score >= 40 ? (
            <Ionicons name="trophy-outline" size={48} color="#f59e42" className="mb-2" />
          ) : (
            <Ionicons name="close-circle" size={48} color="#ef4444" className="mb-2" />
          )}
          <Text className="mb-2 text-2xl font-bold text-primary">Quiz Complete!</Text>
          <Text className="mb-1 text-lg">
            Score:{' '}
            <Text className={`font-bold ${score >= 40 ? 'text-green-600' : 'text-red-600'}`}>
              {score}%
            </Text>
          </Text>
          <Text className="mb-1 text-lg">
            Time:{' '}
            <Text className="font-bold">
              {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
            </Text>
          </Text>
          <Button
            title="Review Answers"
            onPress={onClose}
            className=""
            textClassName="text-lg"
            leftIcon="filter-circle-sharp"
          />
        </View>
      </View>
    </Modal>
  );
}
