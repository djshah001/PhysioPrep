import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from 'lib/utils';

const Chip = ({
  iconName,
  iconColor,
  label,
  textClassName,
  className,
}: {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  textStyle?: string;
  className?: string;
  textClassName?: string;
}) => {
  return (
    <View
      className={cn(
        'flex-row items-center rounded-full bg-white/90 px-3 py-1.5 shadow-md',
        className
      )}>
      <Ionicons name={iconName} size={16} color={iconColor} />
      <Text className={cn('ml-2 text-sm font-medium text-neutral-700', textClassName)}>
        {label}
      </Text>
    </View>
  );
};

export default Chip;
