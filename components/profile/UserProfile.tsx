import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function UserProfile() {
  const router = useRouter();

  const menuItems = [
    {
      title: 'Settings',
      icon: 'settings-outline' as const,
      route: '/(tabs)/profile/settings'
    },
    {
      title: 'Change Password',
      icon: 'lock-closed-outline' as const,
      route: '/(tabs)/profile/password'
    },
    {
      title: 'Statistics',
      icon: 'bar-chart-outline' as const,
      route: '/(tabs)/profile/stats'
    },
    {
      title: 'Delete Account',
      icon: 'trash-outline' as const,
      route: '/(tabs)/profile/delete'
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold text-black mb-6">
          Profile
        </Text>
        <View className="bg-white rounded-xl shadow-sm">
          {menuItems.map((item, index) => (
            <React.Fragment key={item.title}>
              <TouchableOpacity
                className="flex-row items-center px-4 py-3"
                onPress={() => router.push(item.route as any)}
              >
                <Ionicons name={item.icon} size={24} color="#007AFF" />
                <Text className="text-base text-gray-800 ml-3 flex-1">
                  {item.title}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
              {index < menuItems.length - 1 && (
                <View className="h-px bg-gray-200 mx-4" />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
} 