import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Skeleton component that mirrors the exact BentoHome layout
export default function BentoHomeSkeleton() {
  const SkeletonBlock = ({ className }: { className?: string }) => (
    <View className={`animate-pulse rounded-md bg-card/50 ${className}`} />
  );
  const insets = useSafeAreaInsets();

  return (
    <ScrollView className="flex-1 bg-background p-4" showsVerticalScrollIndicator={false}>
      <View style={{ paddingTop: insets.top, marginBottom: 16 }}>
        <Text className=" font-bold text-blue-500" style={{ fontSize: 32 }}>
          PhysioPrep
        </Text>
      </View>
      {/* Main Bento Grid Skeleton */}
      <View className="flex-1 flex-row gap-2">
        {/* Left: Primary metric card skeleton */}
        <Animated.View entering={FadeInDown.delay(50).springify()} className="flex-1">
          <View className="flex-1 justify-center gap-2 rounded-3xl bg-blue-500 p-5 shadow-lg shadow-slate-600/20">
            <SkeletonBlock className="h-4 w-24 bg-blue-200/40" />
            <View className="flex-row items-baseline gap-1">
              <SkeletonBlock className="h-10 w-16 bg-white/40" />
              <SkeletonBlock className="h-6 w-8 bg-white/40" />
              <SkeletonBlock className="h-6 w-12 bg-white/40" />
            </View>
            <SkeletonBlock className="h-4 w-40 bg-blue-100/40" />
          </View>
        </Animated.View>

        {/* Right: Streak and Daily Question skeleton */}
        <View className="flex-1 gap-2">
          {/* Streak card skeleton */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <View className="gap-2 rounded-3xl bg-rose-500 p-5 shadow-2xl shadow-rose-500/20">
              <SkeletonBlock className="h-4 w-20 bg-rose-100/40" />
              <View className="flex-row items-center gap-2">
                <SkeletonBlock className="h-8 w-8 bg-white/40" />
                <SkeletonBlock className="h-6 w-6 rounded-full bg-white/40" />
              </View>
            </View>
          </Animated.View>

          {/* Daily Question button skeleton */}
          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <View className="rounded-full bg-green-500 px-5 py-4 shadow-lg shadow-black/20">
              <View className="flex-row items-center justify-center gap-2">
                <SkeletonBlock className="h-5 w-24 bg-white/40" />
                <SkeletonBlock className="h-5 w-5 rounded-full bg-white/40" />
              </View>
            </View>
          </Animated.View>
        </View>
      </View>

      {/* Favorite Subjects section skeleton */}
      <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 16 }}>
        <View className="mb-2 flex-row gap-1">
          <SkeletonBlock className="h-4 w-4 rounded-full bg-rose-500/40" />
          <SkeletonBlock className="h-4 w-32 bg-slate-400/40" />
        </View>
        <View className="flex-row flex-wrap gap-3">
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              className="w-[48%] flex-row items-center gap-2 rounded-2xl bg-white/50 p-4 shadow-md shadow-slate-600/20">
              <SkeletonBlock className="h-8 w-8 rounded-full bg-rose-500/40" />
              <SkeletonBlock className="h-5 w-16 bg-slate-700/40" />
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Your Progress section skeleton */}
      <Animated.View entering={FadeInDown.delay(300).springify()} style={{ marginTop: 16 }}>
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row gap-1">
            <SkeletonBlock className="h-4 w-4 rounded-full bg-rose-500/40" />
            <SkeletonBlock className="h-4 w-24 bg-slate-400/40" />
          </View>
          <SkeletonBlock className="h-4 w-16 bg-blue-500/40" />
        </View>

        <View className="gap-3">
          <View className="flex-row flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View
                key={i}
                className="w-[48%] rounded-2xl bg-white/50 p-4 shadow-md shadow-slate-600/20">
                <View className="mb-2 flex-row items-center justify-between">
                  <SkeletonBlock className="h-5 w-20 bg-slate-700/40" />
                  <SkeletonBlock className="h-4 w-10 bg-slate-600/40" />
                </View>
                {/* Progress bar skeleton */}
                <View className="h-2 rounded-full bg-gray-200/60">
                  <SkeletonBlock className="h-2 w-3/5 rounded-full bg-blue-500/40" />
                </View>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Bottom spacing */}
      <View className="h-32" />
    </ScrollView>
  );
}
