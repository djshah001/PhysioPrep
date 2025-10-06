import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Colors } from 'constants/Colors';
import { GoogleSignInButton, AuthDivider } from '../../components/auth/GoogleSignInButton';
import Animated, {
  FadeInDown,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useAtom } from 'jotai';
import { isLoadingAtom, isLoggedInAtom } from '../../store/auth';
import colors from 'tailwindcss/colors';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const [isLoading] = useAtom(isLoadingAtom);
  const [isLoggedIn] = useAtom(isLoggedInAtom);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/home');
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    try {
      setError('');
      scale.value = withSpring(0.95);
      await login(email, password);
      scale.value = withSpring(1);
    } catch (error: any) {
      scale.value = withSpring(1);
      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          error.response.data?.errors?.[0]?.msg ||
          'Login failed. Please check your credentials.';
        setError(errorMessage);
      } else if (error.request) {
        setError('No response from server. Please check your internet connection.');
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again.');
      }
      console.error('Login error:', error);
    }
  };

  return (
    <LinearGradient
      // colors={[ colors.emerald[200],colors.amber[100]]}
      colors={[colors.violet[400], colors.rose[300]]}
      className="flex-1">
      <StatusBar barStyle="dark-content" translucent backgroundColor={'transparent'} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            minHeight: height,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 justify-around gap-2 px-6 py-12">
            <Animated.View entering={FadeInDown.delay(200).springify()} className="">
              <Text className="mb-4 text-5xl font-extrabold text-black shadow-xl shadow-purple-500 ">
                PhysioPrep
              </Text>
              <Text className="text-3xl font-bold text-neutral-800">Learn Like Never Before</Text>
              <Text className="text-base leading-5 text-purple-300">
                Sign in to continue your learning journey
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
              

              <Animated.View entering={FadeInDown.delay(500).springify()} className="gap-2">
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

              <Animated.View entering={FadeInDown.delay(600).springify()} className="">
                <View className="relative">
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-3/4 ">
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={24}
                      color={Colors.grey}
                    />
                  </TouchableOpacity>
                  {/* <TouchableOpacity
                    onPress={() => router.push('/forgot-password' as string)}
                    className="px-2">
                    <Text className="text-sm font-medium text-primary">Forgot Password?</Text>
                  </TouchableOpacity> */}
                </View>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(700).springify()}>
                <Button
                  title={isLoading ? 'Signing in...' : 'Sign In'}
                  onPress={handleLogin}
                  disabled={isLoading}
                  className=" rounded-2xl bg-primary/90 py-4"
                />
              </Animated.View>

               {/* Divider */}
              <Animated.View entering={FadeInDown.delay(800).springify()}>
                <AuthDivider />
              </Animated.View>

              {/* Google Sign-In Button */}
              <Animated.View entering={FadeInDown.delay(900).springify()}>
                <GoogleSignInButton
                  mode="signin"
                  onError={(error) => setError(error)}
                  disabled={isLoading}
                />
              </Animated.View>

             

              {/* <Animated.View
                entering={FadeInDown.delay(1000).springify()}
                className="mt-8 flex-row justify-center text-center">
                <Text className="text-center text-base text-neutral-700">
                  Don&apos;t have an account?{'  '}
                </Text>
                <Link href="/register" asChild>
                  <Text className="text-center text-base font-bold text-primary">Sign Up</Text>
                </Link>
              </Animated.View> */}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
