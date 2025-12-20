import React, { useEffect } from 'react';
import { Text, Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAtom } from 'jotai';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Store Imports
import { hasProAccessAtom, proUpgradeSheetVisibleAtom } from '../../store/pro';
import { userAtom } from '../../store/auth';

// --- Configuration ---

type VariantType = 'gold' | 'indigo' | 'black';

interface VariantConfig {
  // Slightly brighter gradients for flat design
  gradient: readonly [string, string];
  // Colored shadow for glow effect
  shadowColor: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const VARIANTS: Record<VariantType, VariantConfig> = {
  gold: {
    gradient: ['#FBBF24', '#EA580C'], // Amber-400 -> Orange-600
    shadowColor: '#F59E0B',
    icon: 'crown',
  },
  indigo: {
    gradient: ['#818CF8', '#4F46E5'], // Indigo-400 -> Indigo-600
    shadowColor: '#6366F1',
    icon: 'star-four-points',
  },
  black: {
    gradient: ['#374151', '#111827'], // Gray-700 -> Gray-900
    shadowColor: '#374151',
    icon: 'lightning-bolt',
  },
};

interface ProButtonProps {
  variant?: VariantType;
  text?: string;
  subtext?: string;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'normal' | 'large';
}

const ProButton: React.FC<ProButtonProps> = ({
  variant = 'gold',
  text = 'UNLOCK PRO',
  subtext,
  onPress,
  disabled = false,
  className = '',
  size = 'normal',
}) => {
  const [user] = useAtom(userAtom);
  const [hasProAccess] = useAtom(hasProAccessAtom);
  const [, setProUpgradeSheetVisible] = useAtom(proUpgradeSheetVisibleAtom);

  const userHasProAccess = user?.hasProAccess || user?.isProActive || hasProAccess;

  // --- Animations ---
  const scale = useSharedValue(1);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (disabled) return;

    // 1. Subtle Breathing
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // 2. Periodic Shimmer
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.linear }),
        withTiming(0, { duration: 0 }),
        withTiming(0, { duration: 3000 }) // Wait 3s
      ),
      -1
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    if (disabled) return;
    if (onPress) {
      onPress();
    } else {
      setProUpgradeSheetVisible(true);
    }
  };

  // --- Animated Styles ---
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.7 : 1,
  }));

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmer.value, [0, 1], [-50, 300]);
    return {
      transform: [{ translateX }, { skewX: '-25deg' }],
      opacity: interpolate(shimmer.value, [0, 0.5, 1], [0, 0.3, 0]),
    };
  });

  if (userHasProAccess) return null;

  const config = VARIANTS[variant];
  const height = size === 'large' ? 56 : 48;
  const borderRadius = 16; // Perfect pill shape

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      className={className}
    >
      <Animated.View 
        style={[
          styles.glowContainer, 
          containerStyle, 
          { shadowColor: config.shadowColor }
        ]}
      >
        <LinearGradient
          colors={config.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }} // Diagonal gradient for more life
          style={[
            styles.gradientBody,
            { height, borderRadius }
          ]}
        >
          
          {/* Shimmer Overlay */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Animated.View style={[styles.shimmer, shimmerStyle]}>
              <LinearGradient
                colors={['transparent', 'white', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </Animated.View>
          </View>

          {/* Centered Content */}
          <View style={styles.contentRow}>
            <MaterialCommunityIcons 
              name={config.icon} 
              size={size === 'large' ? 22 : 18} 
              color="white" 
              style={styles.icon}
            />

            <View style={styles.textContainer}>
                <Text style={[styles.mainText, { fontSize: size === 'large' ? 16 : 14 }]}>
                    {text}
                </Text>
                {subtext && (
                    <Text style={styles.subText}>{subtext}</Text>
                )}
            </View>
          </View>
          
          {/* Glass Edge Border (Inner Ring) */}
          <View style={[styles.glassBorder, { borderRadius }]} pointerEvents="none" />

        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  glowContainer: {
    // Colored glow effect instead of dark shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  gradientBody: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: '50%',
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)', // Subtle white inner border
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centered horizontally
    zIndex: 10,
  },
  icon: {
    marginRight: 8,
    shadowColor: 'black',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  textContainer: {
    alignItems: 'center', // Center text vertically if subtext exists
  },
  mainText: {
    color: 'white',
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
});

export default ProButton;