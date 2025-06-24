import { View } from 'react-native';

const SkeletonBlock = ({ className }: { className?: string }) => (
  <View className={`animate-pulse rounded-md bg-card/50 ${className}`} />
);

export const QuestionsSkeleton = () => {
  return (
    <View className="p-6">
      {/* Skeleton for Header and Add Button */}
      <View className="mb-6 flex-row items-center justify-between">
        <SkeletonBlock className="h-7 w-32" />
        <SkeletonBlock className="h-10 w-32 rounded-full" />
      </View>

      {/* Skeleton for QuestionCards */}
      {[1, 2, 3, 4].map((i) => (
        <View key={i} className="mb-4 h-40 animate-pulse rounded-xl bg-card/50" />
      ))}
    </View>
  );
}; 