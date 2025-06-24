import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface ProgressBarProps {
  value: number;
  style?: ViewStyle;
  className?: string;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  style,
  className,
  color = '#007AFF',
}) => {
  const progress = Math.min(Math.max(value, 0), 100);

  return (
    <View style={[styles.container, style]} className={className}>
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
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
}); 