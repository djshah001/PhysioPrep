import { cn } from 'lib/utils';
import React, { useEffect, useState, useRef } from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


interface TimerProps {
  duration: number; // in seconds
  onExpire?: () => void;
  onTick?: (timeLeft: number) => void;
  className?: string;
  style?: ViewStyle;
}

export const Timer: React.FC<TimerProps> = ({ duration, onExpire, onTick, className, style }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire?.();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        const next = t - 1;
        if (onTick && mounted.current) onTick(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, onExpire, onTick]);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const formatted = ` ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  return (
    <View
      className={cn(
        'min-w-16 flex-row items-center justify-center',
        className
      )}>
        <Ionicons name="timer-outline" size={20} color="#EF4444" />
        <Text className="ml-1 text-base font-semibold text-red-500">{formatted}</Text>
    </View>
  );
};
