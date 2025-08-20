import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import colors from 'tailwindcss/colors';
import { cn } from 'lib/utils';

interface InputProps extends TextInputProps {
  inputClassName?: string;
  containerClassName?: string;
  label?: string;
  maxLength?: number;
  showCount?: boolean;
  blurIntensity?: number;
  blurTint?: 'light' | 'dark' | 'default';
}

export function Input({
  containerClassName,
  inputClassName,
  label,
  maxLength,
  showCount = true,
  blurIntensity = 50,
  blurTint = 'light',
  value = '',
  ...props
}: InputProps) {
  const InputComponent = (
    <TextInput
      className={cn(
        `rounded-xl border border-neutral-500 px-4 py-4 text-base text-neutral-600 `,
      )}
      placeholderTextColor={colors.neutral[500]}
      value={value}
      maxLength={maxLength}
      {...props}
    />
  );

  return (
    <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-6">
      {label && (
        <View className="flex-row items-center justify-between">
          <Text className="ml-2 text-base font-semibold text-neutral-700">{label}</Text>
          {maxLength && showCount && (
            <Text className="text-sm text-neutral-500/60">
              {value.length}/{maxLength}
            </Text>
          )}
        </View>
      )}
      <BlurView
        intensity={blurIntensity}
        tint={blurTint}
        // experimentalBlurMethod="dimezisBlurView"
        className={cn("overflow-hidden rounded-xl border border-foreground/10",containerClassName)}>
        {InputComponent}
      </BlurView>
    </Animated.View>
  );
}
