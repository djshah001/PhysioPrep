import React, { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAtom } from 'jotai';
import { Ionicons } from '@expo/vector-icons';

import { hasProAccessAtom, proUpgradeSheetVisibleAtom } from '../../store/pro';
import { userAtom } from '../../store/auth';

interface ProButtonProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'minimal';
  onPress?: () => void;
  disabled?: boolean;
  showIcon?: boolean;
  text?: string;
}

const ProButton: React.FC<ProButtonProps> = ({
  size = 'medium',
  variant = 'primary',
  onPress,
  disabled = false,
  showIcon = true,
  text = 'Upgrade to Pro',
}) => {
  const [user] = useAtom(userAtom);
  const [hasProAccess] = useAtom(hasProAccessAtom);
  const [, setProUpgradeSheetVisible] = useAtom(proUpgradeSheetVisibleAtom);

  // Check if user has pro access from user data or pro status
  const userHasProAccess = user?.hasProAccess || user?.isProActive || hasProAccess;

  // Animation values
  const scale = useSharedValue(1);
  const shimmerX = useSharedValue(-100);
  const glowOpacity = useSharedValue(0.3);
  const glowScale = useSharedValue(1);

  // Start animations on mount
  useEffect(() => {
   
    // Glow pulse effect - breathing effect
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 1800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Glow scale effect - subtle size pulsing
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

  }, [ glowOpacity, glowScale, scale]);

  useEffect(() => {
     // Shimmer effect - smooth sweep across button
    shimmerX.value = withRepeat(
      withSequence(
        withTiming(200, { duration: 2500, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
        withTiming(-100, { duration: 0 })
      ),
      -1,
      false
    );

  }, [shimmerX]);

  const handlePress = () => {
    if (disabled) return;

    // Scale animation on press
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    if (onPress) {
      onPress();
    } else {
      // Default action: show upgrade sheet
      setProUpgradeSheetVisible(true);
    }
  };

  // Animated styles
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shimmerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1,
  }));

  // Don't show button if user already has pro access
  if (userHasProAccess) {
    return null;
  }

  // Size configurations
  const sizeConfig = {
    small: {
      container: 'px-3 py-2 rounded-lg',
      text: 'text-xs font-semibold',
      icon: 14,
    },
    medium: {
      container: 'px-5 py-3 rounded-xl',
      text: 'text-sm font-bold',
      icon: 16,
    },
    large: {
      container: 'px-6 py-4 rounded-2xl',
      text: 'text-base font-bold',
      icon: 20,
    },
  };

  // Variant configurations
  const variantConfig = {
    primary: {
      gradient: ['#FFD700', '#FFA500', '#FF6B35'] as const,
      textColor: 'text-white',
      shadowColor: '#FFD700',
    },
    secondary: {
      gradient: ['#667eea', '#764ba2'] as const,
      textColor: 'text-white',
      shadowColor: '#667eea',
    },
    minimal: {
      gradient: ['#1f2937', '#374151'] as const,
      textColor: 'text-yellow-400',
      shadowColor: '#FFD700',
    },
  };

  const config = sizeConfig[size];
  const variantStyle = variantConfig[variant];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Animated.View style={buttonAnimatedStyle}>
        <View style={{ position: 'relative' }}>
          {/* Glow effect */}
          {/* <Animated.View
            style={[
              glowAnimatedStyle,
              {
                position: 'absolute',
                top: -6,
                left: -6,
                right: -6,
                bottom: -6,
                borderRadius: size === 'large' ? 22 : size === 'medium' ? 18 : 14,
              }
            ]}
          >
            <LinearGradient
              colors={variantStyle.gradient}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: size === 'large' ? 22 : size === 'medium' ? 18 : 14,
                shadowColor: variantStyle.gradient[0],
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 8,
              }}
            />
          </Animated.View> */}

          {/* Main button */}
          <LinearGradient
            colors={variantStyle.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: size === 'large' ? 16 : size === 'medium' ? 12 : 8,
              paddingHorizontal: size === 'large' ? 24 : size === 'medium' ? 20 : 16,
              paddingVertical: size === 'large' ? 16 : size === 'medium' ? 12 : 8,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Shimmer overlay */}
            <Animated.View
              style={[
                shimmerAnimatedStyle,
                {
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: 50,
                  transform: [{ skewX: '12deg' }],
                }
              ]}
            >
              <LinearGradient
                colors={['transparent', 'rgba(255, 255, 255, 0.4)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            </Animated.View>

            {/* Button content */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}>
              {showIcon && (
                <Animated.View style={iconAnimatedStyle}>
                  <Ionicons
                    name="diamond"
                    size={config.icon}
                    color="white"
                  />
                </Animated.View>
              )}
              <Text style={{
                color: 'white',
                fontSize: size === 'large' ? 16 : size === 'medium' ? 14 : 12,
                fontWeight: 'bold',
              }}>
                {text}
              </Text>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default ProButton;
