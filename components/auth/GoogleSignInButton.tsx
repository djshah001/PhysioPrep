import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useAuth } from '../../hooks/useAuth';
import { isGoogleAuthConfigured } from '../../services/googleAuth';

interface GoogleSignInButtonProps {
  mode?: 'signin' | 'signup';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  mode = 'signin',
  onSuccess,
  onError,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { googleSignIn } = useAuth();
  const scale = useSharedValue(1);

  const buttonText = mode === 'signin' ? 'Continue with Google' : 'Sign up with Google';

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handleGoogleSignIn = async () => {
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

      const result = await googleSignIn();
      // console.log('Google sign-in result:', result);

      if (result.success) {
        onSuccess?.();
      } else {
        const errorMessage = result.error || 'Google sign-in failed';
        onError?.(errorMessage);
        Alert.alert('Sign-In Failed', errorMessage);
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
        onPress={handleGoogleSignIn}
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
          {isLoading ? 'Signing in...' : buttonText}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Auth Divider Component
export const AuthDivider: React.FC = () => {
  return (
    <View className="my-6 flex-row items-center">
      <View className="h-px flex-1 bg-white/20" />
      <Text className="mx-4 text-sm text-white/60">or</Text>
      <View className="h-px flex-1 bg-white/20" />
    </View>
  );
};

export default GoogleSignInButton;
