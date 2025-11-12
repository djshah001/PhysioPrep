import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useAtom } from 'jotai';

import { proUpgradeSheetVisibleAtom } from '../../store/pro';
import ProBadge from './ProBadge';

interface LockedFeatureProps {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'small' | 'medium' | 'large';
  variant?: 'overlay' | 'card' | 'inline';
  showUpgradeButton?: boolean;
  onUpgradePress?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const LockedFeature: React.FC<LockedFeatureProps> = ({
  title,
  description,
  icon = 'lock-closed',
  size = 'medium',
  variant = 'overlay',
  showUpgradeButton = true,
  onUpgradePress,
  className = '',
  children,
}) => {
  const [, setProUpgradeSheetVisible] = useAtom(proUpgradeSheetVisibleAtom);

  const handleUpgradePress = () => {
    if (onUpgradePress) {
      onUpgradePress();
    } else {
      setProUpgradeSheetVisible(true);
    }
  };

  // Size configurations
  const sizeConfig = {
    small: {
      container: 'p-3',
      title: 'text-sm font-semibold',
      description: 'text-xs',
      icon: 20,
      button: 'px-2 py-1 text-xs',
    },
    medium: {
      container: 'p-4',
      title: 'text-base font-semibold',
      description: 'text-sm',
      icon: 24,
      button: 'px-3 py-1.5 text-sm',
    },
    large: {
      container: 'p-6',
      title: 'text-lg font-bold',
      description: 'text-base',
      icon: 32,
      button: 'px-4 py-2 text-base',
    },
  };

  const config = sizeConfig[size];

  if (variant === 'overlay') {
    return (
      <View className={`relative ${className}`}>
        {/* Content (blurred/disabled) */}
        <View className="opacity-30">
          {children}
        </View>

        {/* Overlay */}
        <Animated.View
          entering={FadeIn.delay(200)}
          className="absolute inset-0 bg-black/60 rounded-xl items-center justify-center"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)']}
            className="w-full h-full rounded-xl items-center justify-center"
          >
            <Animated.View entering={ZoomIn.delay(400)} className="items-center">
              <View className="bg-gray-700 rounded-full p-3 mb-3">
                <Ionicons name={icon} size={config.icon} color="#FBBF24" />
              </View>
              <Text className={`text-white text-center mb-1 ${config.title}`}>
                {title}
              </Text>
              {description && (
                <Text className={`text-gray-300 text-center mb-4 ${config.description}`}>
                  {description}
                </Text>
              )}
              {showUpgradeButton && (
                <TouchableOpacity
                  onPress={handleUpgradePress}
                  className="bg-yellow-500 rounded-lg flex-row items-center space-x-2"
                  style={{ paddingHorizontal: 16, paddingVertical: 8 }}
                >
                  <MaterialCommunityIcons name="crown" size={16} color="white" />
                  <Text className="text-white font-bold">Upgrade to Pro</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </View>
    );
  }

  if (variant === 'card') {
    return (
      <Animated.View entering={FadeIn.delay(200)} className={`bg-gray-800/50 rounded-xl border border-gray-700 ${config.container} ${className}`}>
        <View className="flex-row items-start space-x-3">
          <View className="bg-gray-700 rounded-full p-2">
            <Ionicons name={icon} size={config.icon} color="#FBBF24" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center space-x-2 mb-1">
              <Text className={`text-white ${config.title}`}>{title}</Text>
              <ProBadge size="small" variant="lock" text="PRO" />
            </View>
            {description && (
              <Text className={`text-gray-400 mb-3 ${config.description}`}>
                {description}
              </Text>
            )}
            {showUpgradeButton && (
              <TouchableOpacity
                onPress={handleUpgradePress}
                className={`bg-yellow-500 rounded-lg self-start flex-row items-center space-x-1 ${config.button}`}
              >
                <MaterialCommunityIcons name="crown" size={12} color="white" />
                <Text className="text-white font-bold">Upgrade</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>
    );
  }

  // Inline variant
  return (
    <Animated.View entering={FadeIn.delay(200)} className={`flex-row items-center space-x-2 ${className}`}>
      <Ionicons name={icon} size={16} color="#FBBF24" />
      <Text className="text-gray-400 text-sm">{title}</Text>
      <ProBadge size="small" variant="lock" text="PRO" showText={false} />
      {showUpgradeButton && (
        <TouchableOpacity onPress={handleUpgradePress}>
          <Text className="text-yellow-400 text-sm font-semibold">Upgrade</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export default LockedFeature;
