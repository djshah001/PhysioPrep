import React from 'react';
import { View, Text } from 'react-native';
import { CustomHeader } from 'components/common/CustomHeader';

export default function TopicQuizPage() {
  // TODO: Fetch/generate quiz questions for this topic
  return (
    <View className="flex-1 bg-background">
      <CustomHeader title="Topic Quiz" showBack />
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg text-foreground">Quiz for this topic coming soon!</Text>
      </View>
    </View>
  );
} 