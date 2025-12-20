import React from 'react';
import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Colors } from 'constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface HeaderIcon {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
  size?: number;
}

interface CustomHeaderProps {
  title: string;
  subtitle?: string;
  leftIcons?: HeaderIcon[];
  rightIcons?: HeaderIcon[];
  textAlign?: 'left' | 'center' | 'right';
  showBack?: boolean;
  onBackPress?: () => void;
  backgroundColor?: string;
  blurIntensity?: number;
  titleColor?: string;
  className?: string;
}

export const HeaderBlurView = ({ height }: { height: number }) => (
  <BlurView
    intensity={80}
    tint="dark"
    // experimentalBlurMethod="dimezisBlurView"
    className="overflow-hidden">
    <View style={{ height }} />
  </BlurView>
);

export function CustomHeader({
  title,
  subtitle,
  leftIcons = [],
  rightIcons = [],
  textAlign = 'center',
  showBack = false,
  onBackPress,
  backgroundColor = Colors.grey6,
  blurIntensity = 40,
  titleColor = Colors.foreground,
  className = '',
}: CustomHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const renderIcon = (icon: HeaderIcon, index: number) => (
    <Pressable
      key={index}
      onPress={icon.onPress}
      className="rounded-full bg-primary/10 p-1"
      hitSlop={8}>
      <Ionicons name={icon.name} size={icon.size || 24} color={icon.color || Colors.foreground} />
    </Pressable>
  );

  return (
    <View
      //  entering={FadeInDown.delay(100).springify()}
      style={{ paddingTop: insets.top + 8 }}
      className="flex-row items-center border-b border-neutral-200 bg-white px-6 py-4">
      {showBack && (
        <TouchableOpacity
          onPress={handleBackPress}
          className="mr-4 rounded-full bg-neutral-100 p-2">
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
      )}
      <View className="flex-1">
        <Text className="text-2xl font-bold text-neutral-800">{title}</Text>
        {subtitle && <Text className="text-sm text-neutral-500">{subtitle}</Text>}
      </View>
    </View>
  );
}
