import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ChipProps {
  label: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  className?: string;
  textClassName?: string;
  color?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  style,
  textStyle,
  className,
  textClassName,
  color = '#007AFF',
}) => {
  return (
    <View style={[styles.container, { borderColor: color }, style]} className={className}>
      <Text style={[styles.text, { color }, textStyle]} className={textClassName}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 