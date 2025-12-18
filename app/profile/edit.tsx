import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAtom } from 'jotai';
import { User, userAtom } from '../../store/auth';
import { updateUserProfile } from 'actions/user';
import { Image } from 'expo-image';

export default function EditProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useAtom(userAtom);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<Partial<User>>({
    name: '',
    avatar: '',
    email: '',
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await updateUserProfile(form);
      if (res.success) {
        setUser((prev) => prev ? { ...prev, ...form } : prev);
        router.back();
      }
    } catch {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      <View className="flex-row items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 rounded-full bg-neutral-100 p-2">
            <Ionicons name="close" size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-neutral-900">Edit Profile</Text>
        </View>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#6366F1" size="small" />
          ) : (
            <Text className="text-lg font-bold text-indigo-600">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6">
        {/* Avatar Edit Trigger */}
        <View className="mb-8 items-center">
          <TouchableOpacity onPress={() => router.push('/profile/avatar')} className="relative">
            <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-indigo-100 shadow-sm">
              {user?.avatar ? (
                <Image source={{ uri: user?.avatar }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Text className="text-2xl font-bold text-indigo-500">{form?.name?.[0]}</Text>
              )}
            </View>
            <View className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-indigo-600 p-2">
              <Ionicons name="camera" size={14} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="mt-2 font-medium text-indigo-600">Change Photo</Text>
        </View>

        <View className="gap-5">
          <View>
            <Text className="mb-2 ml-1 text-sm font-semibold text-neutral-700">First Name</Text>
            <TextInput
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
              className="rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-neutral-900"
            />
          </View>

          {/* <View>
            <Text className="mb-2 ml-1 text-sm font-semibold text-neutral-700">Last Name</Text>
            <TextInput
              value={form.lastName}
              onChangeText={(t) => setForm({ ...form, lastName: t })}
              className="rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-neutral-900"
            />
          </View> */}

          {/* <View>
            <Text className="mb-2 ml-1 text-sm font-semibold text-neutral-700">Bio</Text>
            <TextInput
              value={form.bio}
              onChangeText={(t) => setForm({ ...form, bio: t })}
              multiline
              numberOfLines={4}
              placeholder="Tell us about yourself..."
              className="h-32 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-neutral-900"
              textAlignVertical="top"
            />
          </View> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
