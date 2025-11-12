import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

interface ProBadgeProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'crown' | 'star' | 'premium' | 'lock';
  text?: string;
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

const ProBadge: React.FC<ProBadgeProps> = ({
  size = 'medium',
  variant = 'crown',
  text = 'PRO',
  showText = true,
  animated = true,
  className = '',
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      container: 'px-2 py-1 rounded-md',
      text: 'text-xs font-bold',
      icon: 12,
    },
    medium: {
      container: 'px-3 py-1.5 rounded-lg',
      text: 'text-sm font-bold',
      icon: 14,
    },
    large: {
      container: 'px-4 py-2 rounded-xl',
      text: 'text-base font-bold',
      icon: 16,
    },
  };

  // Variant configurations
  const variantConfig = {
    crown: {
      icon: 'crown' as const,
      gradient: ['#FFD700', '#FFA500'],
      textColor: 'text-white',
    },
    star: {
      icon: 'star' as const,
      gradient: ['#667eea', '#764ba2'],
      textColor: 'text-white',
    },
    premium: {
      icon: 'diamond' as const,
      gradient: ['#FF6B6B', '#FF8E53'],
      textColor: 'text-white',
    },
    lock: {
      icon: 'lock-closed' as const,
      gradient: ['#374151', '#4B5563'],
      textColor: 'text-gray-300',
    },
  };

  const config = sizeConfig[size];
  const variantStyle = variantConfig[variant];

  const BadgeContent = () => (
    <LinearGradient
      colors={variantStyle.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={`${config.container} flex-row items-center space-x-1 ${className}`}
    >
      <Ionicons
        name={variantStyle.icon}
        size={config.icon}
        color="white"
      />
      {showText && (
        <Text className={`${config.text} ${variantStyle.textColor}`}>
          {text}
        </Text>
      )}
    </LinearGradient>
  );

  if (animated) {
    return (
      <Animated.View entering={variant === 'lock' ? FadeIn.delay(200) : ZoomIn.delay(300)}>
        <BadgeContent />
      </Animated.View>
    );
  }

  return <BadgeContent />;
};

export default ProBadge;
