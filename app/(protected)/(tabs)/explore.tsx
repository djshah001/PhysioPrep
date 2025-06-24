import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const router = useRouter();
  const scale = useSharedValue(1);

  const featuredContent = [
    {
      id: 1,
      title: 'Anatomy Basics',
      image: 'https://example.com/anatomy.jpg',
      category: 'Anatomy',
      rating: 4.8,
      students: 1200,
      icon: '🧠',
      colors: ['#FF6B6B', '#FF8E8E'] as const,
    },
    {
      id: 2,
      title: 'Physiology Fundamentals',
      image: 'https://example.com/physiology.jpg',
      category: 'Physiology',
      rating: 4.9,
      students: 1500,
      icon: '💪',
      colors: ['#00FFFF', '#00CCCC'] as const,
    },
    {
      id: 3,
      title: 'Clinical Skills',
      image: 'https://example.com/clinical.jpg',
      category: 'Clinical',
      rating: 4.7,
      students: 900,
      icon: '👨‍⚕️',
      colors: ['#FFD700', '#FFA500'] as const,
    },
  ];

  const categories = [
    {
      title: 'Anatomy',
      icon: '🧠',
      color: '#FF6B6B',
      count: 24,
    },
    {
      title: 'Physiology',
      icon: '💪',
      color: '#00FFFF',
      count: 18,
    },
    {
      title: 'Pathology',
      icon: '🔬',
      color: '#FFD700',
      count: 15,
    },
    {
      title: 'Clinical Skills',
      icon: '👨‍⚕️',
      color: '#9C27B0',
      count: 12,
    },
  ];

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]">
      <ScrollView className="flex-1">
        <View className="p-6">
          <Animated.View 
            entering={FadeInDown.delay(200).springify()}
            className="mb-8"
          >
            <Text className="text-3xl font-bold text-white mb-2">Explore 🌟</Text>
            <Text className="text-base text-gray-300">Discover new learning materials</Text>
          </Animated.View>

          {/* Featured Content */}
          <Animated.View 
            entering={FadeInDown.delay(400).springify()}
            className="mb-8"
          >
            <Text className="text-xl font-bold text-white mb-4">Featured Content 🎯</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="space-x-4"
            >
              {featuredContent.map((item, index) => (
                <Animated.View
                  key={item.id}
                  entering={FadeInRight.delay(600 + index * 200).springify()}
                  style={buttonAnimatedStyle}
                >
                  <TouchableOpacity
                    className="w-72 h-48 rounded-2xl overflow-hidden"
                  >
                    <LinearGradient
                      colors={item.colors}
                      className="flex-1 p-4 justify-between"
                    >
                      <View className="flex-row justify-between items-start">
                        <Text className="text-3xl">{item.icon}</Text>
                        <View className="bg-white/20 px-2 py-1 rounded-full">
                          <Text className="text-white text-sm">{item.category}</Text>
                        </View>
                      </View>
                      <View>
                        <Text className="text-xl font-bold text-white mb-1">{item.title}</Text>
                        <View className="flex-row items-center">
                          <Ionicons name="star" size={16} color="#FFD700" />
                          <Text className="text-white/80 ml-1">{item.rating}</Text>
                          <Text className="text-white/80 mx-2">•</Text>
                          <Text className="text-white/80">{item.students} students</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Categories */}
          <Animated.View 
            entering={FadeInDown.delay(800).springify()}
          >
            <Text className="text-xl font-bold text-white mb-4">Categories 📚</Text>
            <View className="flex-row flex-wrap justify-between">
              {categories.map((category, index) => (
                <Animated.View
                  key={category.title}
                  entering={FadeInRight.delay(1000 + index * 200).springify()}
                  style={buttonAnimatedStyle}
                  className="w-[48%] mb-4"
                >
                  <TouchableOpacity
                    className="h-32 rounded-2xl overflow-hidden"
                  >
                    <BlurView intensity={20} tint="dark" className="flex-1 p-4">
                      <View className="flex-1 justify-between">
                        <Text className="text-3xl">{category.icon}</Text>
                        <View>
                          <Text className="text-lg font-bold text-white mb-1">{category.title}</Text>
                          <Text className="text-sm text-gray-300">{category.count} topics</Text>
                        </View>
                      </View>
                    </BlurView>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 