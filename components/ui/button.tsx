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
  leftIcon?: keyof typeof Ionicons.glyphMap | null | React.ReactElement;
  leftIconSize?: number;
  leftIconColor?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap | null | React.ReactElement;
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
        'flex-row items-center justify-center gap-1 rounded-xl bg-primary px-4 py-3 shadow-xl shadow-primary',
        disabled ? 'opacity-50' : 'opacity-100',
        className
      )}>
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          {leftIcon && typeof leftIcon === 'string' ? (
            <Ionicons
              name={typeof leftIcon === 'string' ? leftIcon : 'chevron-forward-outline'}
              size={leftIconSize}
              color={leftIconColor}
              className=""
            />
          ) : (
            leftIcon
          )}
          <Text className={cn('text-base font-semibold leading-6 text-white ', textClassName)}>
            {title}
          </Text>
          {rightIcon && typeof rightIcon === 'string' ? (
            <Ionicons
              name={typeof rightIcon === 'string' ? rightIcon : 'chevron-forward-outline'}
              size={rightIconSize}
              color={rightIconColor}
              className=""
            />
          ) : (
            rightIcon
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
