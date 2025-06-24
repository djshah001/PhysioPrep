import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../hooks/useAuth';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const scale = useSharedValue(1);

  const menuItems = [
    {
      title: 'Account Settings',
      description: 'Manage your account preferences',
      icon: '⚙️',
      action: () => router.push('/(tabs)/settings' as any),
      colors: ['#FF6B6B', '#FF8E8E'] as const,
    },
    {
      title: 'Learning Stats',
      description: 'View your progress and achievements',
      icon: '📊',
      action: () => router.push('/(tabs)/stats' as any),
      colors: ['#00FFFF', '#00CCCC'] as const,
    },
    {
      title: 'Study History',
      description: 'Track your learning journey',
      icon: '📚',
      action: () => router.push('/(tabs)/history' as any),
      colors: ['#FFD700', '#FFA500'] as const,
    },
    {
      title: 'Notifications',
      description: 'Manage your notification preferences',
      icon: '🔔',
      action: () => router.push('/(tabs)/notifications' as any),
      colors: ['#9C27B0', '#BA68C8'] as const,
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
          {/* Profile Header */}
          <Animated.View 
            entering={FadeInDown.delay(200).springify()}
            className="items-center mb-8"
          >
            <View className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] justify-center items-center mb-4">
              <Text className="text-4xl font-bold text-white">
                {user?.name?.[0]?.toUpperCase() || 'S'}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-white mb-1">{user?.name || 'Student'}</Text>
            <Text className="text-base text-gray-300">{user?.email || 'student@example.com'}</Text>
          </Animated.View>

          {/* Quick Stats */}
          <Animated.View 
            entering={FadeInDown.delay(400).springify()}
            className="mb-8"
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF8E8E']}
              className="rounded-2xl p-6"
            >
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-white">85%</Text>
                  <Text className="text-sm text-white/80">Average Score</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-white">12</Text>
                  <Text className="text-sm text-white/80">Quizzes Taken</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-white">7</Text>
                  <Text className="text-sm text-white/80">Day Streak</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Menu Items */}
          <Animated.View 
            entering={FadeInDown.delay(600).springify()}
            className="mb-8"
          >
            <Text className="text-xl font-bold text-white mb-4">Menu Options ⚡</Text>
            <View className="space-y-4">
              {menuItems.map((item, index) => (
                <Animated.View
                  key={item.title}
                  entering={FadeInRight.delay(800 + index * 200).springify()}
                  style={buttonAnimatedStyle}
                >
                  <TouchableOpacity
                    onPress={item.action}
                    className="h-20 rounded-2xl overflow-hidden"
                  >
                    <LinearGradient
                      colors={item.colors}
                      className="flex-1 p-4 flex-row items-center"
                    >
                      <Text className="text-2xl mr-4">{item.icon}</Text>
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-white mb-1">{item.title}</Text>
                        <Text className="text-sm text-white/80">{item.description}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={24} color="white" />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Logout Button */}
          <Animated.View 
            entering={FadeInDown.delay(1600).springify()}
          >
            <TouchableOpacity
              onPress={logout}
              className="bg-red-500/20 p-4 rounded-2xl flex-row items-center justify-center"
            >
              <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
              <Text className="text-red-500 font-bold ml-2">Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 