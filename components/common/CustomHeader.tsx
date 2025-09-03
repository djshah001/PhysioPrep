import React from 'react';
import { View, Text, Pressable } from 'react-native';
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
      style={[{ paddingTop: insets.top }]}
      className={`${className} bg-white px-2 py-1 shadow-lg shadow-neutral-700`}>
      <View className="overflow-hidden">
        <View className="h-14 flex-row items-center px-4">
          {(leftIcons.length > 0 || showBack) && (
            <View className="flex-1 flex-row items-center">
              {showBack && (
                <Pressable onPress={handleBackPress} className="mr-2 mt-1" hitSlop={8}>
                  <Ionicons name="chevron-back" size={24} color={Colors.primary} />
                </Pressable>
              )}
              {leftIcons.map((icon, index) => renderIcon(icon, index))}
            </View>
          )}

          <Text className="text-center text-2xl font-bold text-primary" numberOfLines={1}>
            {title}
          </Text>

          <View className="flex-1 flex-row items-center justify-end gap-2">
            {rightIcons.map((icon, index) => renderIcon(icon, index))}
          </View>
        </View>
      </View>
    </View>
  );
}
