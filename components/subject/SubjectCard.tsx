import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Subject } from 'types/types';

import { router } from 'expo-router';
import { ProgressBar } from '~/ProgressBar';
import colors from 'tailwindcss/colors';

interface SubjectCardProps {
  subject: Subject;
  index: number;
  isAdmin: boolean;
}

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

export const SubjectCard = ({ subject, index, isAdmin }: SubjectCardProps) => {
  const { _id, name, description, stats, color, userStats } = subject;
  const colorIndex = index % subjectColors.length;
  const [primaryColor, secondaryColor] = subjectColors[colorIndex];
  // console.log(JSON.stringify(subject,null,2))

  return (
    <Animated.View entering={FadeInRight.delay(index * 80).springify()} className="mb-4 ">
      <LinearGradient
        colors={[primaryColor, secondaryColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="relative overflow-hidden rounded-3xl p-5 ">
        <View className="flex-1 shadow-md shadow-neutral-600">
          <View className="flex-row items-start justify-between">
            <Pressable
              onPress={() =>
                router.push({
                  pathname: `subjects/${_id}`,
                  params: { primaryColor, secondaryColor },
                })
              }
              className="flex-1 p-1">
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <Text className="text-2xl font-bold capitalize text-white">{name[0]}</Text>
              </View>
              <View>
                <Text className="text-xl font-extrabold text-white" numberOfLines={1}>
                  {name}
                </Text>
                <View className="">
                  <View className="mb-1 flex-row items-center justify-between gap-2">
                    {/* <Text className=" text-xs text-white "> Progress</Text> */}
                    <ProgressBar
                      value={
                        stats.totalQuestions === 0
                          ? 0
                          : (userStats.correctlyAnsweredQuestions / stats.totalQuestions) * 100
                      }
                      color={colors.indigo[500]}
                      className="flex-1"
                    />
                    <Text className=" text-sm text-white ">
                      {stats.totalQuestions === 0
                        ? 0
                        : (
                            (userStats.correctlyAnsweredQuestions / stats.totalQuestions) *
                            100
                          ).toFixed(0)}
                      %
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};
