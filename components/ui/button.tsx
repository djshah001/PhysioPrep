import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from 'lib/utils';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
  loading?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap | null;
  leftIconSize?: number;
  leftIconColor?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap | null;
  rightIconSize?: number;
  rightIconColor?: string;
}

export function Button({
  title,
  onPress,
  disabled = false,
  className = '',
  textClassName = '',
  loading = false,
  leftIcon = null,
  leftIconSize = 20,
  leftIconColor = 'white',
  rightIcon = null,
  rightIconSize = 20,
  rightIconColor = 'white',
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        'flex-row items-center justify-center gap-1 rounded-xl bg-primary shadow-xl shadow-primary py-3 px-4',
        disabled ? 'opacity-50' : 'opacity-100',
        className
      )}>
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          {leftIcon && (
            <Ionicons name={leftIcon} size={leftIconSize} color={leftIconColor} className="" />
          )}
          <Text className={cn('text-base font-semibold text-white ', textClassName)}>{title}</Text>
          {rightIcon && (
            <Ionicons name={rightIcon} size={rightIconSize} color={rightIconColor} className="" />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
