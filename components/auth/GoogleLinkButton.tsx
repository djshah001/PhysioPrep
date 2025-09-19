import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useAuth } from '../../hooks/useAuth';
import { isGoogleAuthConfigured } from '../../services/googleAuth';

interface GoogleLinkButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export const GoogleLinkButton: React.FC<GoogleLinkButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { linkGoogleAccount } = useAuth();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handleGoogleLink = async () => {
    if (!isGoogleAuthConfigured()) {
      Alert.alert(
        'Configuration Error',
        'Google Sign-In is not properly configured. Please contact support.'
      );
      return;
    }

    try {
      scale.value = withSpring(0.95);
      setIsLoading(true);

      const result = await linkGoogleAccount();

      if (result.success) {
        onSuccess?.();
        Alert.alert('Success', 'Google account linked successfully!');
      } else {
        const errorMessage = result.error || 'Failed to link Google account';
        onError?.(errorMessage);
        Alert.alert('Link Failed', errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      onError?.(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
      scale.value = withSpring(1);
    }
  };

  if (!isGoogleAuthConfigured()) {
    return null; // Don't render if Google Auth is not configured
  }

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={handleGoogleLink}
        disabled={disabled || isLoading}
        className={`
          flex-row items-center justify-center rounded-2xl border-2 border-white/20 
          bg-white px-6 py-4  shadow-md shadow-white/20
          ${disabled || isLoading ? 'opacity-50' : 'opacity-100'}
        `}
        activeOpacity={0.8}>
        <View className="mr-3">
          <Ionicons name="logo-google" size={24} color="#4285F4" />
        </View>
        <Text className="text-center text-base font-semibold text-neutral-800">
          {isLoading ? 'Linking...' : 'Link Google Account'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default GoogleLinkButton;
