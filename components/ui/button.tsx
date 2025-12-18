import { Text, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from 'lib/utils';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface ButtonProps {
  title?: string;
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
  children?: React.ReactNode;
  onPressIn?: () => void;
  onPressOut?: () => void;
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
  children,
  onPressIn,
  onPressOut,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={buttonAnimatedStyle}>
      <Pressable
        onPress={() => {
          scale.value = withTiming(0.9, { duration: 120 }, () => {
            scale.value = withTiming(1, { duration: 120 });
          });
          onPress();
        }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        className={cn(
          'flex-row items-center justify-center gap-1 rounded-xl bg-blue-500 px-4 py-3 shadow-xl shadow-blue-500',
          disabled ? 'opacity-50' : 'opacity-100',
          className
        )}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            {/** If children provided, render them verbatim so Button can be used as a wrapper for complex UIs */}
            {children ? (
              children
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
                {title ? (
                  <Text className={cn('text-base font-semibold leading-6 text-white ', textClassName)}>
                    {title}
                  </Text>
                ) : null}
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
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}
