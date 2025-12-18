import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAtom } from 'jotai';
import { userAtom } from '../../store/auth';
import { updateUserAvatar } from 'actions/user';

// Curated list of cool avatars
const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/notionists/png?seed=Felix',
  'https://api.dicebear.com/7.x/notionists/png?seed=Aneka',
  'https://api.dicebear.com/7.x/notionists/png?seed=Milo',
  'https://api.dicebear.com/7.x/notionists/png?seed=Bella',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/png?seed=Sore',
  'https://api.dicebear.com/7.x/bottts/png?seed=Bot1',
  'https://api.dicebear.com/7.x/bottts/png?seed=Bot2',
];

export default function AvatarScreen() {
  const router = useRouter();
  const [user, setUser] = useAtom(userAtom);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || PRESET_AVATARS[0]);
  const [customUrl, setCustomUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const scale = useSharedValue(1);

  const handleSave = async () => {
    try {
      setSaving(true);
      const avatarToSave = customUrl.trim() || selectedAvatar;
      
      const res = await updateUserAvatar(avatarToSave);
      
      if (res.success) {
        setUser((prev) => prev ? { ...prev, avatar: res.data.avatar } : prev);
        router.back();
      }
    } catch {
      Alert.alert('Error', 'Failed to update avatar');
    } finally {
      setSaving(false);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-neutral-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-neutral-100 rounded-full">
            <Ionicons name="close" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-neutral-900">Choose Avatar</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          disabled={saving}
          className="ml-auto bg-indigo-600 px-4 py-2 rounded-full"
        >
           {saving ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-bold">Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6">
        {/* Preview Section */}
        <View className="items-center mb-8">
            <Animated.View style={animatedStyle} className="relative">
                <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    className="p-1 rounded-full"
                >
                    <Image 
                        source={{ uri: customUrl || selectedAvatar }} 
                        className="h-32 w-32 rounded-full bg-white"
                    />
                </LinearGradient>
                <View className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-sm border border-neutral-100">
                    <Ionicons name="camera" size={20} color="#6366F1" />
                </View>
            </Animated.View>
        </View>

        {/* Custom URL Input */}
        <Animated.View entering={FadeInDown.delay(100).springify()} className="mb-8">
            <Text className="text-sm font-bold text-neutral-600 mb-2 uppercase tracking-wide">Custom Image URL</Text>
            <View className="flex-row items-center bg-white border border-neutral-200 rounded-2xl px-4 py-3">
                <Ionicons name="link-outline" size={20} color="#9CA3AF" />
                <TextInput 
                    value={customUrl}
                    onChangeText={setCustomUrl}
                    placeholder="https://example.com/image.png"
                    className="flex-1 ml-3 text-neutral-800"
                    autoCapitalize="none"
                />
            </View>
        </Animated.View>

        {/* Presets Grid */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Text className="text-sm font-bold text-neutral-600 mb-4 uppercase tracking-wide">Popular Presets</Text>
            <View className="flex-row flex-wrap justify-between">
                {PRESET_AVATARS.map((avatar, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => {
                            setCustomUrl('');
                            setSelectedAvatar(avatar);
                            scale.value = withSpring(1.1, {}, () => { scale.value = withSpring(1); });
                        }}
                        className={`mb-4 w-[23%] aspect-square rounded-2xl p-1 ${selectedAvatar === avatar && !customUrl ? 'bg-indigo-600' : 'bg-transparent'}`}
                    >
                        <Image 
                            source={{ uri: avatar }} 
                            className="h-full w-full rounded-xl bg-neutral-100"
                        />
                        {selectedAvatar === avatar && !customUrl && (
                            <View className="absolute -top-2 -right-2 bg-indigo-600 rounded-full p-1 border-2 border-white">
                                <Ionicons name="checkmark" size={10} color="white" />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}