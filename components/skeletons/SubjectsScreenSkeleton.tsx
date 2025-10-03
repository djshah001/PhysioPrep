import { View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from 'lib/utils';

const SkeletonBlock = ({ className }: { className?: string }) => (
  <View className={cn('animate-pulse rounded-md bg-card/50', className)} />
);

// Subject colors from SubjectCard component
const subjectColors = [
  ['#FF6B6B', '#FF8E8E'], // Coral
  ['#4ECDC4', '#6ED7D0'], // Turquoise
  ['#45B7D1', '#6BC5DB'], // Sky Blue
  ['#3498DB', '#5DADE2'], // Blue
  ['#96CEB4', '#B4D9C7'], // Sage
  ['#D4A5A5', '#E5B9B9'], // Rose
  ['#9B59B6', '#B07CC7'], // Purple
  ['#2ECC71', '#3DB27B'], // Green
  ['#E74C3C', '#E95C4E'], // Red
  ['#F1C40F', '#F2C75C'], // Yellow
  ['#E67E22', '#E88E4E'], // Orange
  ['#95A5A6', '#AAB7B8'], // Gray
  ['#FFEEAD', '#FFF4C4'], // Cream
];

export const SubjectsScreenSkeleton = () => {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScrollView className="flex-1 p-6 py-6">
        {/* Search Input Skeleton */}
        <View className="mb-6">
          <View className="mb-3">
            <View className=" rounded-full border border-neutral-400/20 bg-white/80 px-4 shadow-lg justify-center">
              <SkeletonBlock className="h-8 m-3 w-4/5 rounded-full bg-neutral-400/40" />
            </View>
          </View>
        </View>

        {/* Subject Cards Grid Skeleton */}
        <View className="flex flex-row flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
            const colorIndex = (i - 1) % subjectColors.length;
            const [primaryColor, secondaryColor] = subjectColors[colorIndex];
            
            return (
              <View key={i} className={`w-[48%] ${i % 2 !== 0 ? 'mr-3' : ''}`}>
                <Animated.View entering={FadeInRight.delay(i * 80).springify()} className="mb-4">
                  <LinearGradient
                    colors={[`${primaryColor}80`, `${secondaryColor}80`]} // Add transparency for skeleton
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="relative overflow-hidden rounded-3xl p-5">
                    <View className="flex-1 shadow-md shadow-neutral-600/20">
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1 p-1">
                          {/* Avatar skeleton */}
                          <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-white/20">
                            <SkeletonBlock className="h-6 w-6 rounded-full bg-white/40" />
                          </View>
                          
                          <View>
                            {/* Subject name skeleton */}
                            <SkeletonBlock className="mb-2 h-6 w-24 bg-white/40" />
                            
                            {/* Progress section skeleton */}
                            <View className="mb-1 flex-row items-center justify-between gap-2">
                              {/* Progress bar skeleton */}
                              <View className="flex-1 h-2 rounded-full bg-gray-200/60">
                                <SkeletonBlock className="h-2 w-3/5 rounded-full bg-indigo-500/40" />
                              </View>
                              {/* Percentage skeleton */}
                              <SkeletonBlock className="h-4 w-8 bg-white/40" />
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </Animated.View>
              </View>
            );
          })}
        </View>
        
        {/* Bottom spacing */}
        <View className="h-32" />
      </ScrollView>
    </SafeAreaView>
  );
};
