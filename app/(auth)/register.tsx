import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Colors } from '../../constants/Colors';
import { GoogleSignInButton, AuthDivider } from '../../components/auth/GoogleSignInButton';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { isLoadingAtom } from 'store/auth';
import { useAtom } from 'jotai';
import colors from 'tailwindcss/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const [isLoading] = useAtom(isLoadingAtom);
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
    <LinearGradient colors={[colors.violet[400], colors.rose[300]]} className="flex-1">
      <SafeAreaView className="flex-1 py-8" edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-center ">
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="flex-1 justify-center">
            <View className="flex-1 justify-around px-6">
              <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-12">
                <Text className="mb-3 text-5xl font-bold text-black shadow-xl shadow-purple-500">
                  PhysioPrep
                </Text>
                <Text className=" text-3xl font-bold text-neutral-800">Create Account</Text>
                <Text className="text-base text-purple-300">
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

              <View className="">
                {/* Google Sign-In Button */}
                <Animated.View entering={FadeInDown.delay(600).springify()}>
                  <GoogleSignInButton
                    mode="signup"
                    onError={(error) => setError(error)}
                    disabled={isLoading}
                  />
                </Animated.View>

                {/* Divider */}
                <Animated.View entering={FadeInDown.delay(700).springify()}>
                  <AuthDivider />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(800).springify()} className="gap-2">
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(900).springify()} className="gap-2">
                  <Input
                    label="Email"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(1000).springify()} className="">
                  <View className="relative">
                    <Input
                      label="Password"
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      containerClassName=""
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
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(1100).springify()} className="gap-2">
                  <View className="relative">
                    <Input
                      label="Confirm Password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoComplete="password"
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
                </Animated.View>

                <Animated.View
                  entering={FadeInDown.delay(1200).springify()}
                  // style={buttonAnimatedStyle}
                  className="mt-8">
                  <Animated.View style={buttonAnimatedStyle}>
                    <Button
                      title={isLoading ? 'Creating Account...' : 'Create Account'}
                      onPress={handleRegister}
                      disabled={isLoading}
                      className="rounded-xl bg-primary/90 py-4"
                    />
                    <View className="mt-8 flex-row items-center justify-center self-center">
                      <Text className="text-center text-sm text-neutral-800">
                        Already have an account?{' '}
                      </Text>
                      <Link href="/login" asChild>
                        <Text className="text-center text-base font-bold text-primary">
                          Sign In
                        </Text>
                      </Link>
                    </View>
                  </Animated.View>
                </Animated.View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
