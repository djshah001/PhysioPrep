import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Link} from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Colors } from '../../constants/Colors';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { isLoadingAtom } from 'store/auth';
import { useAtom } from 'jotai';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const scale = useSharedValue(1);

  const handleRegister = async () => {
    try {
      setError('');
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      scale.value = withSpring(0.95, {}, () => {
        scale.value = withSpring(1);
      });
      await register(name, email, password);
    } catch (error: any) {
      setError(error.response?.data?.errors?.[0]?.msg || 'Registration failed');
    }
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <LinearGradient colors={[Colors.background, Colors.grey6]} className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            minHeight: height,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 justify-around px-6 py-12">
            <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-12">
              <Text className="mb-3 text-5xl font-bold text-primary">PhysioPrep</Text>
              <Text className="mb-3 text-3xl font-bold text-white">Create Account</Text>
              <Text className="text-base text-gray-300">
                Join us to start your learning journey
              </Text>
            </Animated.View>

            {error ? (
              <Animated.View
                entering={FadeInDown.delay(400).springify()}
                className="mb-8 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                <Text className="text-center text-base text-red-500">{error}</Text>
              </Animated.View>
            ) : null}

            <View className="gap-6">
              <Animated.View entering={FadeInDown.delay(600).springify()} className="gap-2">
                <Text className="ml-1 text-sm font-medium text-white">Full Name</Text>
                <BlurView intensity={20} tint="dark" className="overflow-hidden rounded-xl">
                  <Input
                    placeholder="Enter your full name"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    className="border-gray-700 bg-white/5 px-4 py-3"
                  />
                </BlurView>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(800).springify()} className="gap-2">
                <Text className="ml-1 text-sm font-medium text-white">Email</Text>
                <BlurView intensity={20} tint="dark" className="overflow-hidden rounded-xl">
                  <Input
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    className="border-gray-700 bg-white/5 px-4 py-3"
                  />
                </BlurView>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(1000).springify()} className="gap-2">
                <Text className="ml-1 text-sm font-medium text-white">Password</Text>
                <BlurView intensity={20} tint="dark" className="overflow-hidden rounded-xl">
                  <View className="relative">
                    <Input
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      className="border-gray-700 bg-white/5 px-4 py-3 pr-12"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Ionicons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={24}
                        color={Colors.grey}
                      />
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(1200).springify()} className="gap-2">
                <Text className="ml-1 text-sm font-medium text-white">Confirm Password</Text>
                <BlurView intensity={20} tint="dark" className="overflow-hidden rounded-xl">
                  <View className="relative">
                    <Input
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoComplete="password"
                      className="border-gray-700 bg-white/5 px-4 py-3 pr-12"
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={24}
                        color={Colors.grey}
                      />
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(1400).springify()}
                // style={buttonAnimatedStyle}
                className="mt-8">
                <Animated.View style={buttonAnimatedStyle}>
                  <Button
                    title={isLoading ? 'Creating Account...' : 'Create Account'}
                    onPress={handleRegister}
                    disabled={isLoading}
                    className="rounded-xl bg-primary/90 py-4"
                  />
                </Animated.View>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(1600).springify()}
                className="mt-8 flex-row items-center justify-center self-center">
                <Text className="text-center text-sm text-gray-300">Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                  <Text className="text-center text-sm font-medium text-primary">Sign In</Text>
                </Link>
              </Animated.View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
