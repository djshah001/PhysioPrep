import React, { useEffect, useState, useRef } from 'react';
import { Text, View, StyleSheet, ViewStyle } from 'react-native';

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
    return () => { mounted.current = false; };
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

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  return (
    <View style={[styles.container, style]} className={className}>
      <Text style={styles.text}>{formatted}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
    letterSpacing: 1,
  },
}); 