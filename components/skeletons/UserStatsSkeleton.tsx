import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const SkeletonBlock = ({ width = 'w-full', height = 'h-4', className = '' }: { 
  width?: string; 
  height?: string; 
  className?: string; 
}) => (
  <Animated.View 
    className={`${width} ${height} bg-neutral-300/60 rounded-lg ${className}`}
    entering={FadeInDown.delay(100).springify()}
  />
);

export default function UserStatsSkeleton() {
  return (
    <View className="flex-1 bg-neutral-50">
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.delay(100).springify()} 
        className="px-6 py-4 bg-white border-b border-neutral-200"
      >
        <SkeletonBlock width="w-48" height="h-8" className="mb-2" />
        <SkeletonBlock width="w-32" height="h-4" />
      </Animated.View>

      {/* Main Statistics Cards */}
      <Animated.View 
        entering={FadeInDown.delay(200).springify()} 
        className="px-6 py-4"
      >
        <SkeletonBlock width="w-40" height="h-6" className="mb-4" />
        
        {/* 6 Stats Cards in 2x3 Grid */}
        <View className="flex-row flex-wrap gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} className="w-[48%] overflow-hidden rounded-2xl">
              <LinearGradient
                colors={['#F3F4F6', '#E5E7EB']}
                className="p-4 h-24"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <SkeletonBlock width="w-8" height="h-8" className="mb-2 rounded-full" />
                <SkeletonBlock width="w-16" height="h-6" className="mb-1" />
                <SkeletonBlock width="w-20" height="h-4" />
              </LinearGradient>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Performance Breakdown */}
      <Animated.View 
        entering={FadeInDown.delay(300).springify()} 
        className="px-6 py-4"
      >
        <SkeletonBlock width="w-48" height="h-6" className="mb-4" />
        
        {/* Performance Cards */}
        <View className="gap-3">
          {[1, 2, 3].map((i) => (
            <View key={i} className="overflow-hidden rounded-2xl">
              <LinearGradient
                colors={['#F9FAFB', '#F3F4F6']}
                className="p-4"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <SkeletonBlock width="w-32" height="h-5" />
                  <SkeletonBlock width="w-16" height="h-5" />
                </View>
                <SkeletonBlock width="w-full" height="h-2" className="rounded-full mb-2" />
                <View className="flex-row justify-between">
                  <SkeletonBlock width="w-20" height="h-4" />
                  <SkeletonBlock width="w-24" height="h-4" />
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Recent Activity */}
      <Animated.View 
        entering={FadeInDown.delay(400).springify()} 
        className="px-6 py-4"
      >
        <SkeletonBlock width="w-36" height="h-6" className="mb-4" />
        
        {/* Activity Items */}
        <View className="gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} className="flex-row items-center p-3 bg-white rounded-xl">
              <SkeletonBlock width="w-10" height="h-10" className="rounded-full mr-3" />
              <View className="flex-1">
                <SkeletonBlock width="w-32" height="h-4" className="mb-1" />
                <SkeletonBlock width="w-24" height="h-3" />
              </View>
              <SkeletonBlock width="w-16" height="h-6" className="rounded-full" />
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Subject Performance */}
      <Animated.View 
        entering={FadeInDown.delay(500).springify()} 
        className="px-6 py-4"
      >
        <SkeletonBlock width="w-44" height="h-6" className="mb-4" />
        
        {/* Subject Cards */}
        <View className="flex-row flex-wrap gap-3">
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className="w-[48%] overflow-hidden rounded-2xl">
              <LinearGradient
                colors={['#FEF3C7', '#FDE68A']}
                className="p-4 h-28"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <SkeletonBlock width="w-6" height="h-6" className="mb-2 rounded-full" />
                <SkeletonBlock width="w-20" height="h-4" className="mb-2" />
                <SkeletonBlock width="w-16" height="h-3" className="mb-1" />
                <SkeletonBlock width="w-24" height="h-3" />
              </LinearGradient>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}
