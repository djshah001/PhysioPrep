import { RefObject, useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { ProgressBar } from 'components/ProgressBar';
import { Ionicons } from '@expo/vector-icons';
import colors from 'tailwindcss/colors';

export const TimerDisplay = ({ seconds }: { seconds: number }) => (
  <View className="flex-row items-center">
    <Ionicons name="timer-outline" size={20} color={colors.indigo[500]} />
    <Text className="ml-1 text-base font-semibold text-primary">{`${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`}</Text>
  </View>
);

type HeaderProps = {
  current: number;
  total: number;
  // Prefer startTime for self-updating timer without causing parent re-renders
  startTime?: number | null;
  // Fallback: static elapsed value
  elapsed: RefObject<number>;
};

export default function QuizHeader({ current, total, startTime, elapsed }: HeaderProps) {
  // maintain local seconds state so this header re-renders every second
  const [seconds, setSeconds] = useState<number>(() => {
    if (startTime && startTime > 0) {
      return Math.floor((Date.now() - startTime) / 1000);
    }
    return elapsed?.current ?? 0;
  });

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;

    if (startTime && startTime > 0) {
      const update = () => {
        const s = Math.floor((Date.now() - startTime) / 1000);
        // update ref for parent/submission use
        if (elapsed) elapsed.current = s;
        // update local state so UI updates
        setSeconds(s);
      };
      // initial set then interval
      update();
      id = setInterval(update, 1000);
    } else {
      // no startTime: show whatever is in the ref (static)
      setSeconds(elapsed?.current ?? 0);
    }

    return () => {
      if (id) clearInterval(id);
    };
    // only re-run when startTime reference changes
  }, [startTime, elapsed]);

  return (
    <View className="mb-4 flex-row items-center justify-between">
      <ProgressBar
        value={((current + 1) / total) * 100}
        style={{ flex: 1, marginRight: 12 }}
        color={colors.indigo[500]}
      />
      <TimerDisplay seconds={seconds} />
    </View>
  );
}
