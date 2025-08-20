import { memo } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  text: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  // Whether THIS option is the correct answer
  correctAnswer?: boolean;
};

function AnswerOption({ text, selected, onPress, disabled, correctAnswer }: Props) {
  // Determine background based on selection and correctness
  // - Selected and correct => green
  // - Selected and incorrect => red
  // - Selected and unknown => primary
  const bgClass = selected
    ? correctAnswer === true
      ? 'border-green-600 bg-green-500'
      : correctAnswer === false
        ? 'border-red-600 bg-red-500'
        : 'border-primary bg-primary'
    : 'border-gray-200 bg-white shadow-md shadow-neutral-500';

  const textColor = selected ? 'text-white' : 'text-neutral-800';
  const iconColor = selected ? '#fff' : '#6366F1';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled && !selected}
      className={`mb-2 flex-row items-center rounded-xl border px-4 py-3 ${bgClass} ${disabled ? (selected ? 'opacity-100' : 'opacity-60') : ''}`}>
      <Ionicons
        name={selected ? 'radio-button-on' : 'ellipse-outline'}
        size={22}
        color={iconColor}
        style={{ marginRight: 12 }}
      />
      <Text className={`flex-1 text-base ${selected ? 'font-bold' : 'font-semibold'} ${textColor}`}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

// Memoize and ignore onPress identity to prevent unnecessary re-renders
export default memo(AnswerOption, (prev, next) => {
  return (
    prev.text === next.text &&
    prev.selected === next.selected &&
    prev.disabled === next.disabled &&
    prev.correctAnswer === next.correctAnswer
    // Intentionally ignore prev.onPress !== next.onPress
  );
});
