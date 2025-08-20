import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Button } from 'components/ui/button';

export default function JumpToQuestionModal({
  visible,
  currentIndex,
  totalQuestions,
  onJump,
  onClose,
  submitting,
}: {
  visible: boolean;
  currentIndex: number;
  totalQuestions: number;
  onJump: (idx: number) => void;
  onClose: () => void;
  submitting?: boolean;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/40">
        <View className="w-11/12 max-w-md rounded-2xl bg-white p-6">
          <Text className="mb-4 text-xl font-bold text-primary">Jump to Question</Text>
          <View className="flex-row flex-wrap justify-center">
            {Array.from({ length: totalQuestions }).map((_, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => onJump(idx)}
                className={`m-1 h-10 w-10 items-center justify-center rounded-full border ${currentIndex === idx ? 'border-primary bg-primary' : 'border-gray-300 bg-gray-100'}`}
                disabled={submitting}
              >
                <Text className={`text-base font-bold ${currentIndex === idx ? 'text-white' : 'text-gray-900'}`}>{idx + 1}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button title="Close" onPress={onClose} className="mt-4" />
        </View>
      </View>
    </Modal>
  );
} 