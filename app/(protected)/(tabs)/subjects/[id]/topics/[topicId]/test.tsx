import React from 'react';
import { View, Text } from 'react-native';
import { CustomHeader } from 'components/common/CustomHeader';

export default function TopicTestPage() {
  // TODO: Fetch/generate test questions for this topic
  return (
    <View className="flex-1 bg-background">
      <CustomHeader title="Topic Test" showBack />
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg text-foreground">Test for this topic coming soon!</Text>
      </View>
    </View>
  );
} 