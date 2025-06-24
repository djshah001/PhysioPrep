import React from 'react';
import { Text } from 'react-native';

export const HelloWave: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Text className={className}>
      👋
    </Text>
  );
};
