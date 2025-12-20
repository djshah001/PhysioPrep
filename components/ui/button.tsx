import React, { forwardRef } from 'react';
import { Text, ActivityIndicator, Pressable, View, PressableProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { cn } from 'lib/utils'; // Assuming this is tailwind-merge/clsx

// Define Icon type to allow a name string or a custom component
type IconType = keyof typeof Ionicons.glyphMap | React.ReactElement;

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title?: string;
  loading?: boolean;
  className?: string;
  textClassName?: string;
  // Icon Props
  leftIcon?: IconType;
  leftIconSize?: number;
  leftIconColor?: string;
  rightIcon?: IconType;
  rightIconSize?: number;
  rightIconColor?: string;
}

export const Button = forwardRef<View, ButtonProps>(
  (
    {
      title,
      onPress,
      onPressIn,
      onPressOut,
      disabled = false,
      loading = false,
      className,
      textClassName,
      leftIcon,
      leftIconSize = 20,
      leftIconColor = 'white',
      rightIcon,
      rightIconSize = 20,
      rightIconColor = 'white',
      children,
      ...props
    },
    ref
  ) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = (event: any) => {
      if (disabled || loading) return;
      scale.value = withSpring(0.95, { damping: 10, stiffness: 300 });
      onPressIn?.(event);
    };

    const handlePressOut = (event: any) => {
      if (disabled || loading) return;
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
      onPressOut?.(event);
    };

    // Helper to render icons (string name or React Element)
    const renderIcon = (
      icon: IconType | undefined,
      size: number,
      color: string
    ) => {
      if (!icon) return null;
      if (React.isValidElement(icon)) return icon;
      return (
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={size}
          color={color}
        />
      );
    };

    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          ref={ref}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          accessibilityRole="button"
          accessibilityState={{ disabled: disabled || loading, busy: loading }}
          className={cn(
            // Base styles
            'flex-row items-center justify-center gap-2 rounded-xl px-4 py-3',
            // Default styling (can be overridden by className prop)
            'bg-blue-500 shadow-sm',
            // Disabled state
            (disabled || loading) && 'opacity-60',
            className
          )}
          {...props}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={textClassName?.includes('text-') ? undefined : 'white'}
            />
          ) : (
            <>
              {children ? (
                children
              ) : (
                <>
                  {renderIcon(leftIcon, leftIconSize, leftIconColor)}

                  {title && (
                    <Text
                      className={cn(
                        'text-base font-semibold text-white',
                        textClassName
                      )}
                    >
                      {title}
                    </Text>
                  )}

                  {renderIcon(rightIcon, rightIconSize, rightIconColor)}
                </>
              )}
            </>
          )}
        </Pressable>
      </Animated.View>
    );
  }
);

Button.displayName = 'Button';