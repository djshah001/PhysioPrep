import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';

// Placeholder function - replace with your actual API call
async function deleteAccount(password: string) {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (password === 'fail') {
        reject({ response: { data: { message: 'Invalid password' } } });
      } else {
        resolve(true);
      }
    }, 1000);
  });
}

export default function DeleteAccount() {
  const router = useRouter();
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    setError('');

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    try {
      await deleteAccount(password);
      await logout();
      router.replace('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setIsModalVisible(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold text-red-600 mb-4">
          Delete Account
        </Text>

        <Text className="text-base text-gray-600 mb-6">
          This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
        </Text>

        {error ? (
          <View className="bg-red-100 p-4 rounded-lg mb-4">
            <Text className="text-red-700 text-center">{error}</Text>
          </View>
        ) : null}

        <View className="mb-4">
          <Text className="text-sm text-gray-700 mb-1">Enter your password to confirm</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base text-black bg-white"
            placeholder="Enter your password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          className={`bg-red-600 rounded-lg py-3 ${isLoading ? 'opacity-50' : ''}`}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text className="text-white text-base font-semibold text-center">
            {isLoading ? 'Deleting...' : 'Delete Account'}
          </Text>
        </TouchableOpacity>

        <Modal
          visible={isModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center p-4">
            <View className="bg-white rounded-xl p-6 w-full max-w-sm">
              <Text className="text-xl font-bold text-black mb-4">
                Confirm Account Deletion
              </Text>
              <Text className="text-base text-gray-600 mb-6">
                Are you absolutely sure you want to delete your account? This action cannot be undone.
              </Text>
              <View className="flex-row justify-end space-x-3">
                <TouchableOpacity
                  className="px-4 py-2"
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text className="text-gray-600 font-medium">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-red-600 px-4 py-2 rounded-lg"
                  onPress={handleConfirmDelete}
                >
                  <Text className="text-white font-medium">Delete Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
} 