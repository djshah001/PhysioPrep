import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from 'constants/Colors';

interface InputProps extends TextInputProps {
  className?: string;
  label?: string;
  maxLength?: number;
  showCount?: boolean;
  blurIntensity?: number;
  blurTint?: 'light' | 'dark' | 'default';
}

export function Input({
  className = '',
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
      className={`border rounded-xl px-4 py-3 text-base text-white border-white ${className}`}
      placeholderTextColor={Colors.white2}
      value={value}
      maxLength={maxLength}
      {...props}
    />
  );

  if (!label) return InputComponent;

  return (
    <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-6">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-lg font-medium text-foreground">{label}</Text>
        {maxLength && showCount && (
          <Text className="text-sm text-foreground/60">
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
      <BlurView
        intensity={blurIntensity}
        tint={blurTint}
        className="overflow-hidden rounded-xl border border-foreground/10">
        {InputComponent}
      </BlurView>
    </Animated.View>
  );
} 