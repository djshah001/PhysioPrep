import { cn } from 'lib/utils';
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface ProgressBarProps {
  value: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  style,
  className,
  color = '#6366F1',
}) => {
  const progress = Math.min(Math.max(value, 0), 100);

  return (
    <View style={[styles.container, style]} className={cn('bg-neutral-100', className)}>
      <View
        style={[
          styles.progress,
          { width: `${progress}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
}); 