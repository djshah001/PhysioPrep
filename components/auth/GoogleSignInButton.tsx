import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useAuth } from '../../hooks/useAuth';
import { isGoogleAuthConfigured } from '../../services/googleAuth';
import colors from 'tailwindcss/colors';

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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleGoogleSignIn = async () => {
    if (!isGoogleAuthConfigured()) {
      Alert.alert('Config Error', 'Google Sign-In is not configured.');
      return;
    }

    try {
      scale.value = withSpring(0.95);
      setIsLoading(true);
      const result = await googleSignIn();
      if (result.success) {
        onSuccess?.();
      } else {
        const errorMessage = result.error || 'Google sign-in failed';
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
      scale.value = withSpring(1);
    }
  };

  if (!isGoogleAuthConfigured()) return null;

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={handleGoogleSignIn}
        disabled={disabled || isLoading}
        className={`
          flex-row items-center justify-center rounded-2xl
          bg-white border-t border-white/20
          py-3.5 px-4 shadow-lg shadow-black/20
          ${disabled || isLoading ? 'opacity-60' : 'opacity-100'}
        `}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.slate[900]} />
        ) : (
          <>
            <Ionicons name="logo-google" size={20} color="#EA4335" />
            <Text className="ml-3 text-base font-bold text-slate-800">
              {buttonText}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Updated Divider for Dark Glass Theme
export const AuthDivider: React.FC = () => {
  return (
    <View className="my-6 flex-row items-center justify-center opacity-80">
      <View className="h-[1px] flex-1 bg-white/20" />
      <Text className="mx-4 text-xs font-bold text-slate-300 uppercase tracking-widest">
        Or continue with
      </Text>
      <View className="h-[1px] flex-1 bg-white/20" />
    </View>
  );
};

export default GoogleSignInButton;