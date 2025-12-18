import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import api from '../../services/api'; // Using raw api for specific route

const InputField = ({ label, value, onChange, placeholder, secure = false }: any) => {
    const [showPassword, setShowPassword] = useState(false);
    
    return (
        <View className="mb-5">
            <Text className="text-sm font-semibold text-neutral-700 mb-2 ml-1">{label}</Text>
            <View className="flex-row items-center bg-white border border-neutral-200 rounded-2xl px-4 py-3.5 focus:border-indigo-500">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput 
                    value={value}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    secureTextEntry={secure && !showPassword}
                    className="flex-1 ml-3 text-neutral-900 font-medium"
                />
                {secure && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.current || !form.new || !form.confirm) {
        return Alert.alert('Error', 'Please fill in all fields');
    }
    if (form.new !== form.confirm) {
        return Alert.alert('Error', 'New passwords do not match');
    }
    if (form.new.length < 6) {
        return Alert.alert('Error', 'Password must be at least 6 characters');
    }

    try {
        setLoading(true);
        // Using the route we defined: router.put("/profile/password")
        await api.put('/users/profile/password', {
            currentPassword: form.current,
            newPassword: form.new
        });
        
        Alert.alert('Success', 'Password updated successfully', [
            { text: 'OK', onPress: () => router.back() }
        ]);
    } catch (error: any) {
        Alert.alert('Error', error.response?.data?.errors?.[0]?.msg || 'Failed to update password');
    } finally {
        setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      <View className="px-6 py-4 flex-row items-center border-b border-neutral-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-neutral-100 rounded-full">
            <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-neutral-900">Security</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 p-6">
            <Animated.View entering={FadeInDown.delay(100).springify()}>
                <View className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex-row">
                    <Ionicons name="shield-checkmark" size={24} color="#D97706" />
                    <Text className="flex-1 ml-3 text-amber-800 text-sm leading-5">
                        Choose a strong password with at least 6 characters. We recommend combining letters, numbers, and symbols.
                    </Text>
                </View>

                <InputField 
                    label="Current Password"
                    placeholder="Enter current password"
                    value={form.current}
                    onChange={(t: string) => setForm({...form, current: t})}
                    secure
                />

                <InputField 
                    label="New Password"
                    placeholder="Enter new password"
                    value={form.new}
                    onChange={(t: string) => setForm({...form, new: t})}
                    secure
                />

                <InputField 
                    label="Confirm New Password"
                    placeholder="Re-enter new password"
                    value={form.confirm}
                    onChange={(t: string) => setForm({...form, confirm: t})}
                    secure
                />
            </Animated.View>
        </ScrollView>

        <View className="p-6 bg-white border-t border-neutral-200">
            <TouchableOpacity 
                onPress={handleSubmit}
                disabled={loading}
                className="w-full bg-indigo-600 rounded-2xl py-4 shadow-lg shadow-indigo-200 items-center justify-center"
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-lg">Update Password</Text>
                )}
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}