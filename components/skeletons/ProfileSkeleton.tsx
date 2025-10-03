import React from 'react';
import { View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { cn } from 'lib/utils';

const SkeletonBlock = ({ className }: { className?: string }) => (
  <View className={cn('animate-pulse rounded-md bg-card/50', className)} />
);

export const ProfileSkeleton = () => {
  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-32">
        {/* Enhanced Profile Header Skeleton */}
        <Animated.View entering={FadeInDown.delay(100).springify()} className="mb-6">
          <LinearGradient
            colors={['#1F2937', '#374151', '#4B5563']}
            className="rounded-3xl p-4 shadow-2xl overflow-hidden"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <View className="flex-row items-center">
              {/* Avatar skeleton with gradient background */}
              <View className="mr-6 h-24 w-24 overflow-hidden rounded-full border-2 border-white/20 shadow-lg">
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6', '#EC4899']}
                  className="flex-1 items-center justify-center">
                  <SkeletonBlock className="h-8 w-8 rounded-full bg-white/40" />
                </LinearGradient>
              </View>

              <View className="flex-1">
                {/* Name skeleton */}
                <SkeletonBlock className="mb-1 h-6 w-32 bg-white/40" />
                {/* Email skeleton */}
                <SkeletonBlock className="mb-3 h-4 w-40 bg-gray-300/40" />

                {/* Status badges skeleton */}
                <View className="flex-row flex-wrap items-center">
                  <View className="mb-2 mr-3 rounded-full bg-gray-500/20 px-4 py-2">
                    <SkeletonBlock className="h-4 w-12 bg-gray-400/40" />
                  </View>
                  <View className="mb-2 mr-3 rounded-full bg-purple-500/20 px-4 py-2">
                    <SkeletonBlock className="h-4 w-10 bg-purple-400/40" />
                  </View>
                  <View className="mb-2 rounded-full bg-green-500/20 px-4 py-2">
                    <SkeletonBlock className="h-4 w-14 bg-green-400/40" />
                  </View>
                </View>
              </View>
            </View>

            {/* Premium expiry skeleton */}
            <View className="mt-4 border-t border-gray-600/50 pt-4">
              <SkeletonBlock className="h-3 w-48 bg-gray-400/40" />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Enhanced Statistics Section Skeleton */}
        <Animated.View entering={FadeInDown.delay(300).springify()} className="mb-6">
          <View className="mb-4 flex-row items-center justify-between">
            <SkeletonBlock className="h-6 w-24 bg-neutral-800/40" />
            <View className="flex-row items-center rounded-full bg-blue-500/20 px-3 py-1">
              <SkeletonBlock className="mr-1 h-4 w-16 bg-blue-400/40" />
              <SkeletonBlock className="h-4 w-4 rounded-full bg-blue-400/40" />
            </View>
          </View>

          <View className="flex-row flex-wrap gap-3">
            {[
              { colors: ['#10B981', '#059669'] },
              { colors: ['#22D3EE', '#06B6D4'] },
              { colors: ['#6366F1', '#8B5CF6'] },
              { colors: ['#F59E0B', '#D97706'] },
              { colors: ['#EF4444', '#DC2626'] },
              { colors: ['#A78BFA', '#7C3AED'] },
            ].map((item, i) => (
              <View key={i} className="mb-1 min-w-[45%] flex-1">
                <LinearGradient colors={item.colors as any} className="rounded-2xl p-4 shadow-lg overflow-hidden">
                  <View className="mb-2 flex-row items-center justify-between">
                    <SkeletonBlock className="h-6 w-6 rounded-full bg-white/40" />
                    <SkeletonBlock className="h-6 w-8 bg-white/40" />
                  </View>
                  <SkeletonBlock className="h-4 w-20 bg-white/30" />
                </LinearGradient>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Enhanced Account Settings Section Skeleton */}
        <Animated.View entering={FadeInDown.delay(500).springify()} className="mb-6">
          <SkeletonBlock className="mb-4 h-6 w-36 bg-neutral-800/40" />
          <View className="gap-2">
            {[
              { colors: ['#6366F1', '#8B5CF6'] },
              { colors: ['#F59E0B', '#EF4444'] },
              { colors: ['#10B981', '#059669'] },
              { colors: ['#EF4444', '#DC2626'] },
            ].map((item, i) => (
              <LinearGradient
                key={i}
                colors={item.colors as any}
                className="flex-row items-center p-5 overflow-hidden rounded-2xl"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <SkeletonBlock className="h-6 w-6 rounded-full bg-white/40" />
                </View>
                <View className="flex-1">
                  <SkeletonBlock className="mb-1 h-5 w-32 bg-white/40" />
                  <SkeletonBlock className="h-3 w-40 bg-white/30" />
                </View>
                <View className="h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <SkeletonBlock className="h-4 w-4 rounded-full bg-white/40" />
                </View>
              </LinearGradient>
            ))}
          </View>
        </Animated.View>

        {/* Enhanced Logout Button Skeleton */}
        <Animated.View entering={FadeInDown.delay(1000).springify()}>
          <View className="flex-row items-center justify-center rounded-2xl border-2 border-red-500/30 bg-red-500/20 p-5 shadow-lg">
            <SkeletonBlock className="mr-2 h-5 w-12 bg-red-100/40" />
            <SkeletonBlock className="h-4 w-4 rounded-full bg-red-100/40" />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};
