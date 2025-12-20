import React, { RefObject, useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from 'tailwindcss/colors';
import { Timer } from '~/ui/Timer';

// --- Sub-Component: Animated Time Badge ---
const TimeBadge = ({
  seconds,
  isCountdown = false,
}: {
  seconds: number;
  isCountdown?: boolean;
}) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeString = `${minutes}:${secs.toString().padStart(2, '0')}`;

  const isUrgent = isCountdown && seconds < 60; // Less than 1 minute
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isUrgent) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUrgent]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View
        className={`flex-row items-center rounded-2xl border px-4 py-2 ${
          isUrgent ? 'border-red-100 bg-red-50' : 'border-slate-200 bg-slate-50'
        }`}>
        <MaterialCommunityIcons
          name={isCountdown ? 'timer-outline' : 'clock-outline'}
          size={18}
          color={isUrgent ? colors.red[500] : colors.slate[500]}
        />
        <Text
          className={`ml-2 font-mono text-base font-bold ${
            isUrgent ? 'text-red-600' : 'text-slate-700'
          }`}
          style={{ fontVariant: ['tabular-nums'] }} // Prevents jitter
        >
          {timeString}
        </Text>
      </View>
    </Animated.View>
  );
};

type HeaderProps = {
  current: number;
  total: number;
  startTime?: number | null;
  elapsed: RefObject<number>;
  duration?: number;
  onExpire?: () => void;
  showTimer?: boolean;
  showTimeDisplay?: boolean;
};

export default function QuizHeader({
  current,
  total,
  startTime,
  elapsed,
  duration,
  onExpire,
  showTimer = false,
  showTimeDisplay = true,
}: HeaderProps) {
  const [seconds, setSeconds] = useState<number>(() => {
    if (startTime && startTime > 0) {
      return Math.floor((Date.now() - startTime) / 1000);
    }
    return elapsed?.current ?? 0;
  });

  // --- Animations ---
  const progressWidth = useSharedValue(0);
  const targetProgress = ((current + 1) / total) * 100;

  useEffect(() => {
    progressWidth.value = withSpring(targetProgress, {
      damping: 50,
      stiffness: 90,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetProgress]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // --- Timer Logic ---
  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;
    if (startTime && startTime > 0) {
      const update = () => {
        const s = Math.floor((Date.now() - startTime) / 1000);
        if (elapsed) elapsed.current = s;
        setSeconds(s);
      };
      update();
      id = setInterval(update, 1000);
    } else {
      setSeconds(elapsed?.current ?? 0);
    }
    return () => {
      if (id) clearInterval(id);
    };
  }, [startTime, elapsed]);

  return (
    <View className="z-50 border-b border-slate-100 bg-white px-6 py-6 shadow-sm shadow-neutral-600">
      {/* Top Row: Counter & Timer */}
      <View className="mb-5 flex-row items-center justify-between">
        {/* Question Counter */}
        <View className="flex-row items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5">
          <Text className="mr-1 text-sm font-bold uppercase tracking-wide text-indigo-600">
            Question
          </Text>
          <View className="mx-1 h-3 w-[1px] bg-indigo-200" />
          <Text className="text-lg font-black text-indigo-900">
            {current + 1}
            <Text className="text-sm font-medium text-indigo-400">/{total}</Text>
          </Text>
        </View>

        {/* Timer Display */}
        {showTimeDisplay && (
          <TimeBadge
            seconds={showTimer && duration ? duration - seconds : seconds}
            isCountdown={!!(showTimer && duration)}
          />
        )}
      </View>

      {/* Progress Bar Container */}
      <View className="h-3 w-full overflow-hidden rounded-full border border-slate-200/50 bg-slate-100">
        <Animated.View
          style={[animatedProgressStyle, { height: '100%', borderRadius: 99, overflow: 'hidden' }]}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']} // Indigo-500 to Violet-500
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />

          {/* Shine Effect Overlay */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: 'rgba(255,255,255,0.4)',
            }}
          />
        </Animated.View>
      </View>

      {/* Logic-only Timer (Hidden) */}
      {showTimer && duration && (
        <View className="hidden">
          <Timer duration={duration} onExpire={onExpire} />
        </View>
      )}
    </View>
  );
}
