import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Subject } from 'types/types';

import { router } from 'expo-router';

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
    <Animated.View entering={FadeInRight.delay(index * 100).springify()} className="mb-4">
      <LinearGradient
        colors={[primaryColor, secondaryColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="relative overflow-hidden rounded-3xl p-4  shadow-lg shadow-neutral-700">
        <View className="flex-1">
          <View className="flex-row items-start justify-between">
            <Pressable
              onPress={() =>
                router.push({
                  pathname: `subjects/${_id}`,
                  params: { primaryColor, secondaryColor },
                })
              }
              className="flex-1 p-1">
              <View className="mb-2 h-12 w-12 items-center justify-center  rounded-full bg-white/30 ">
                <Text className="m-1 text-3xl capitalize text-white">{name[0]}</Text>
              </View>
              <View>
                <View>
                  <Text className=" text-xl font-bold text-white" numberOfLines={1}>
                    {name}
                  </Text>
                  {/* <Text className="text-sm text-white/80" numberOfLines={2}>
                {description}
              </Text> */}
                  {/* <Text className=" text-sm text-white/80">
                    Total Topics: {stats?.totalTopics ?? 0}
                  </Text> */}
                  <Text className=" text-sm text-white/80">
                    Total Questions: {stats?.totalQuestions ?? 0}
                  </Text>
                  <Text className=" text-sm text-white/80">
                    Correctly Answered : {userStats?.correctlyAnsweredQuestions ?? 0}
                  </Text>
                </View>
              </View>
            </Pressable>
          </View>

          {/* <View className="mt-4 flex-row gap-2">
            <Button
              title="Practice"
              onPress={() => router.push(`/quiz/start?subject=${_id}`)}
              className="flex-1 flex-row items-center justify-center rounded-full bg-white/30 p-3 shadow-xl shadow-slate-600 "
              leftIcon="school-outline"
              textClassName="text-white font-semibold text-base ml-1"
            />

            <Button
              title="Test"
              onPress={() => router.push(`/subjects/${_id}/add-question`)}
              className="flex-1 flex-row items-center justify-center rounded-full bg-rose-500 p-3  shadow-xl shadow-rose-200"
              rightIcon="clipboard-outline"
              rightIconSize={17}
              textClassName="text-white font-semibold text-base"
            />
          </View> */}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};
