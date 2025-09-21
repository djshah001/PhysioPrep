import React from 'react';
import { View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from 'lib/utils';
import colors from 'tailwindcss/colors';

const SkeletonBlock = ({ className }: { className?: string }) => (
  <View className={cn('animate-pulse rounded-md bg-card/50', className)} />
);

export const ProfileSkeleton = () => {
  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="p-6 pb-32">
        {/* Header skeleton */}
        <LinearGradient
          colors={[colors.neutral[400], colors.white]}
          className="mb-6 rounded-3xl p-4">
          <View className="flex-row items-center">
            <SkeletonBlock className="mr-6 h-24 w-24 rounded-full" />
            <View className="flex-1">
              <SkeletonBlock className="mb-2 h-6 w-1/2" />
              <SkeletonBlock className="h-4 w-3/4" />
              <View className="mt-3 flex-row gap-2">
                <SkeletonBlock className="h-8 w-24 rounded-full" />
                <SkeletonBlock className="h-8 w-24 rounded-full" />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Stats grid skeleton */}
        <View className="mb-6">
          <View className="mb-4 flex-row items-center justify-between">
            <SkeletonBlock className="h-6 w-32" />
            <SkeletonBlock className="h-9 w-28 rounded-full" />
          </View>

          <View className="flex-row flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View key={i} className="mb-1 min-w-[45%] flex-1">
                <SkeletonBlock className="h-20 rounded-2xl" />
              </View>
            ))}
          </View>
        </View>

        {/* Account menu skeleton */}
        <View className="mb-6">
          <SkeletonBlock className="mb-4 h-6 w-40" />
          <View className="flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className="mb-3 h-20 animate-pulse rounded-2xl bg-card/50" />
            ))}
          </View>
        </View>

        {/* Logout skeleton */}
        <View>
          <SkeletonBlock className="h-16 rounded-2xl" />
        </View>
      </ScrollView>
    </View>
  );
};
