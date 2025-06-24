import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

// Placeholder async function for changing password
async function changePassword({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (currentPassword === 'fail') reject({ response: { data: { message: 'Current password is incorrect' } } });
      else resolve(true);
    }, 1000);
  });
}

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      setSuccess('Password changed successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white justify-center px-6"
    >
      <View className="w-full max-w-md mx-auto">
        <Text className="text-2xl font-bold text-black mb-6 text-center">Change Password</Text>
        {error ? (
          <Text className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">{error}</Text>
        ) : null}
        {success ? (
          <Text className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-center">{success}</Text>
        ) : null}
        <View className="mb-4">
          <Text className="text-sm text-gray-700 mb-1">Current Password</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base text-black bg-white"
            placeholder="Enter current password"
            placeholderTextColor="#888"
            secureTextEntry
            value={formData.currentPassword}
            onChangeText={v => handleChange('currentPassword', v)}
            autoCapitalize="none"
          />
        </View>
        <View className="mb-4">
          <Text className="text-sm text-gray-700 mb-1">New Password</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base text-black bg-white"
            placeholder="Enter new password"
            placeholderTextColor="#888"
            secureTextEntry
            value={formData.newPassword}
            onChangeText={v => handleChange('newPassword', v)}
            autoCapitalize="none"
          />
        </View>
        <View className="mb-6">
          <Text className="text-sm text-gray-700 mb-1">Confirm New Password</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base text-black bg-white"
            placeholder="Confirm new password"
            placeholderTextColor="#888"
            secureTextEntry
            value={formData.confirmPassword}
            onChangeText={v => handleChange('confirmPassword', v)}
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity
          className={`bg-blue-500 rounded-lg py-3 ${loading ? 'opacity-50' : ''}`}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text className="text-white text-base font-semibold text-center">
            {loading ? 'Changing...' : 'Change Password'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
} 