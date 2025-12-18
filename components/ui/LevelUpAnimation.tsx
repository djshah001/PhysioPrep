import { useEffect, useRef } from 'react';
import { View, Text, Dimensions } from 'react-native';
import ActionSheet, {
  ActionSheetRef,
  SheetDefinition,
  SheetProps,
} from 'react-native-actions-sheet';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from './button';

// Screen Dimensions
const { width } = Dimensions.get('window');

// --- Configuration ---
const GRADIENT_COLORS = ['#fbbf24', '#d97706'] as const;
const SHINE_COLORS = [
  'rgba(255,255,255,0)',
  'rgba(255,255,255,0.4)',
  'rgba(255,255,255,0)',
] as const;

// --- Particle Component ---
const Particle = ({
  delay,
  angle,
  distance,
}: {
  delay: number;
  angle: number;
  distance: number;
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    // Reset and fire animation whenever the component mounts (sheet opens)
    progress.value = 0;
    progress.value = withDelay(
      delay,
      withSequence(withSpring(1, { damping: 10, stiffness: 100 }), withTiming(0, { duration: 800 }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => {
    const rad = (angle * Math.PI) / 180;
    const translateX = interpolate(progress.value, [0, 1], [0, Math.cos(rad) * distance]);
    const translateY = interpolate(progress.value, [0, 1], [0, Math.sin(rad) * distance]);

    return {
      opacity: progress.value,
      transform: [{ translateX }, { translateY }, { scale: progress.value }],
    };
  });

  return (
    <Animated.View style={style} className="absolute">
      <MaterialCommunityIcons name="star-four-points" size={24} color="#fcd34d" />
    </Animated.View>
  );
};

// --- Main Component ---

declare module 'react-native-actions-sheet' {
  interface Sheets {
    'level-up-animation': SheetDefinition<{
      payload: {
        visible: boolean;
        newLevel: number;
        onComplete: () => void;
      };
    }>;
  }
}

export default function LevelUpAnimation(props: SheetProps<'level-up-animation'>) {
  const actionSheetRef = useRef<ActionSheetRef>(null);
  // console.log('Level up animation props:', props);

  // Internal Animation Values
  const scale = useSharedValue(0.8);
  const shineTranslate = useSharedValue(-width);

  // Sync 'visible' prop with ActionSheet ref
  useEffect(() => {
    if (props?.payload?.visible) {
      actionSheetRef.current?.show();

      // Trigger internal content animations
      scale.value = withSequence(
        withSpring(1.1, { damping: 10 }),
        withSpring(1, { damping: 12, stiffness: 100 })
      );

      shineTranslate.value = withDelay(
        500,
        withTiming(width, { duration: 1200, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
      );

      // Auto-close timer
      // const timer = setTimeout(() => {
      //   actionSheetRef.current?.hide();
      // }, 3500);

      // return () => clearTimeout(timer);
    } else {
      actionSheetRef.current?.hide();
      // Reset values
      scale.value = 0.8;
      shineTranslate.value = -width;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.payload?.visible]);

  // Animated Styles
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shineTranslate.value }, { skewX: '-20deg' }],
  }));

  return (
    <ActionSheet
      id="level-up-animation"
      ref={actionSheetRef}
      isModal={true}
      onClose={() => props?.payload?.onComplete()}
      gestureEnabled={true}
      containerStyle={{
        backgroundColor: 'transparent',
        alignItems: 'center',
      }}
      indicatorStyle={{ backgroundColor: 'white', opacity: 0.5 }}
      backgroundInteractionEnabled={false}
      snapPoints={[100]}
      initialSnapIndex={0}>
      <View className="flex-1 items-center justify-center py-6">
        {/* Animated Container for bounce effect */}
        <Animated.View style={cardStyle} className="items-center justify-center">
          {/* Back Particles */}
          <View className="absolute inset-0 items-center justify-center">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <Particle key={i} delay={200} angle={angle} distance={150} />
            ))}
          </View>

          {/* Main Card Content */}
          <LinearGradient
            colors={GRADIENT_COLORS}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className=" p-8 items-center justify-center overflow-hidden rounded-3xl border-4 border-yellow-200 shadow-xl"
            style={{ elevation: 10 }}>
            {/* Shine Overlay */}
            <View className="absolute inset-0 overflow-hidden rounded-2xl">
              <Animated.View style={shineStyle} className="h-full w-24">
                <LinearGradient
                  colors={SHINE_COLORS}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1 }}
                />
              </Animated.View>
            </View>

            {/* Content */}
            <MaterialCommunityIcons name="trophy-award" size={72} color="white" />

            <Text className="mt-4 text-3xl font-extrabold text-white shadow-sm">LEVEL UP!</Text>

            <View
              className="mt-3 items-center justify-center rounded-full border border-white/30 bg-white/20"
              style={{ width: width * 0.2, height: width * 0.2 }}>
              <Text className="text-5xl font-black text-white shadow-md">
                {props?.payload?.newLevel}
              </Text>
            </View>

            <Text className="mt-6 text-center text-xl font-bold text-white/90">
              Congratulations! Keep climbing!
            </Text>
            <Button
              title="Continue"
              onPress={() => actionSheetRef.current?.hide()}
              className="mt-6 rounded-2xl bg-red-600 px-8 py-4 shadow-red-500"
              textClassName="leading-5 text-xl"
              // leftIcon="close-outline"
            />

            {/* <Text className="text-5xl font-black text-white shadow-md">{newLevel}</Text> */}
          </LinearGradient>

          {/* Front Particles */}
          <View className="pointer-events-none absolute inset-0 items-center justify-center">
            {[20, 110, 200, 290].map((angle, i) => (
              <Particle key={`front-${i}`} delay={400} angle={angle} distance={180} />
            ))}
          </View>
        </Animated.View>
      </View>
    </ActionSheet>
  );
}

// registerSheet('level-up-animation', LevelUpAnimation);
