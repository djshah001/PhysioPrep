import React from 'react';
import { View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from 'lib/utils';
import colors from 'tailwindcss/colors';
import { CustomHeader } from '~/common/CustomHeader';

const SkeletonBlock = ({ className }: { className?: string }) => (
  <View className={cn('animate-pulse rounded-md bg-card/50', className)} />
);

export const SubjectDetailSkeleton = () => {
  return (
    <View className="flex-1 bg-background">
      {/* Mock Header */}
      {/* <View className="h-14" /> */}
      <CustomHeader title="Subject Name" showBack />
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-32">
        {/* Subject Details Card Skeleton */}
        <LinearGradient
          colors={[colors.neutral[400], colors.white]}
          className="rounded-3xl p-6 pb-8 overflow-hidden">
          <View className="mb-4 flex-row items-center">
            <SkeletonBlock className="mr-3 h-12 w-12 rounded-full" />
            <SkeletonBlock className="h-7 w-2/3" />
          </View>
          <SkeletonBlock className="mb-2 h-4 w-11/12" />
          <SkeletonBlock className="mb-4 h-4 w-4/5" />
          <View className="mt-2 flex-row gap-4">
            <SkeletonBlock className="h-5 w-24" />
            <SkeletonBlock className="h-5 w-20" />
            <SkeletonBlock className="h-5 w-28" />
          </View>
        </LinearGradient>

        {/* Topics List Skeleton */}
        <View className="p-4">
          <View className="mb-4 flex-row items-center justify-between">
            <SkeletonBlock className="h-6 w-24" />
            <SkeletonBlock className="h-9 w-28 rounded-full" />
          </View>

          {/* Skeleton for TopicCards */}
          <View className="flex-row gap-4 flex-wrap justify-center">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonBlock key={i} className="h-40 w-44 rounded-xl" />
            ))}
          </View>
          
        </View>
      </ScrollView>
    </View>
  );
};
