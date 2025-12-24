import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
// Removed: import { LinearGradient } from 'expo-linear-gradient'; // Replaced by custom AnimatedGradient
import { LinearGradient } from 'expo-linear-gradient'; // Kept for static overlay if needed, but mainly we use Reanimated for background
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  // FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { useAtom } from 'jotai';
import { BlurView } from 'expo-blur';

// Hooks & Store
import { useAuth } from '../hooks/useAuth';
import { isLoadingAtom, isLoggedInAtom } from '../store/auth';

// Components
import { Button } from 'components/ui/button';
import { GoogleSignInButton, AuthDivider } from '../components/auth/GoogleSignInButton';
import colors from 'tailwindcss/colors';


// --- Helper: Animated Background Blob ---
const AnimatedBlob = ({
  delay = 0,
  duration = 5000,
  style,
}: {
  delay?: number;
  duration?: number;
  style: any;
}) => {
  const tY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    tY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-20, { duration: duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: duration, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.1, { duration: duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: duration, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: tY.value }, { scale: scale.value }],
  }));

  return <Animated.View style={[style, animatedStyle]} />;
};

// --- Helper: Animated Gradient Background ---
const AnimatedGradientBackground = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 10000, easing: Easing.linear }),
      -1,
      true // Reverse direction to make it smooth
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    // Interpolate between your chosen colors: violet -> fuchsia -> orange
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 0.5, 1],
      [colors.violet[600], colors.fuchsia[500], colors.orange[400]]
    );

    return {
      flex: 1,
      backgroundColor,
    };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
      {/* Optional: Static overlay gradient to add depth if needed */}
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)']}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const [isLoading] = useAtom(isLoadingAtom);
  const [isLoggedIn] = useAtom(isLoggedInAtom);

  const errorShake = useSharedValue(0);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/(tabs)');
    }
  }, [isLoggedIn]);

  const triggerShake = () => {
    errorShake.value = withSequence(
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      triggerShake();
      return;
    }

    try {
      setError('');
      await login(email, password);
    } catch (error: any) {
      triggerShake();
      if (error.response) {
        setError(error.response.data?.message || 'Login failed. Please check your credentials.');
      } else if (error.request) {
        setError('Server unreachable. Check your internet.');
      } else {
        setError(error.message || 'An unexpected error occurred.');
      }
    }
  };

  const errorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: errorShake.value }],
  }));

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. Dynamic Background Layer */}
      <View style={StyleSheet.absoluteFill}>
        {/* Replaced static LinearGradient with AnimatedGradientBackground */}
        <AnimatedGradientBackground />

        {/* Breathing Blobs */}
        <AnimatedBlob
          delay={0}
          duration={2000}
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 250,
            height: 250,
            borderRadius: 125,
            opacity: 0.4,
            backgroundColor: colors.fuchsia[600],
            blurRadius: 50,
          }}
        />
        <AnimatedBlob
          delay={1000}
          duration={5000}
          style={{
            position: 'absolute',
            top: '40%',
            left: -60,
            width: 300,
            height: 300,
            borderRadius: 150,
            opacity: 0.3,
            backgroundColor: colors.orange[500],
          }}
        />
        <AnimatedBlob
          delay={2000}
          duration={4000}
          style={{
            position: 'absolute',
            bottom: -50,
            right: 20,
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: colors.rose[600],
            opacity: 0.5,
          }}
        />
      </View>

      {/* 2. Content Layer */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View className="px-6 py-10">
            {/* Logo Header */}
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              className="mb-10 items-center">
              <BlurView
                intensity={20}
                tint="systemUltraThinMaterial"
                experimentalBlurMethod="dimezisBlurView"
                className="mb-4 h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-white/30 bg-white/20 shadow-lg backdrop-blur-md">
                <MaterialCommunityIcons name="human-walker" size={40} color={colors.green[500]} />
              </BlurView>
              <Text className="text-center text-4xl font-bold tracking-tight text-white">
                PhysioPrep
              </Text>
              <Text className="mt-2 text-center text-lg text-purple-100 opacity-90">
                Empowering your path to physiotherapy excellence.
              </Text>
            </Animated.View>

            {/* Glassmorphism Card */}
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <BlurView
                intensity={10}
                tint="systemUltraThinMaterialLight"
                experimentalBlurMethod="dimezisBlurView"
                className="overflow-hidden rounded-3xl border border-white/50"
                style={{ borderRadius: 32, overflow: 'hidden' }}>
                <View className="border border-white/10 bg-white/10 p-8">
                  <Text className="mb-6 text-center text-2xl font-bold text-white">Sign In</Text>

                  {/* Error Alert */}
                  {error ? (
                    <Animated.View
                      style={[errorStyle]}
                      className="mb-5 flex-row items-center rounded-xl border border-red-500/30 bg-red-500/20 p-3">
                      <Ionicons name="alert-circle" size={20} color={colors.red[300]} />
                      <Text className="ml-2 flex-1 text-sm font-medium text-red-100">{error}</Text>
                    </Animated.View>
                  ) : null}

                  <View className="gap-5">
                    {/* Email */}
                    <View>
                      <Text className="mb-2 ml-1 text-xs font-medium uppercase tracking-wider text-slate-300">
                        Email
                      </Text>
                      <View className="h-14 flex-row items-center rounded-2xl border border-white/10 bg-black/70 px-4 transition-all focus:border-indigo-400 focus:bg-black/30">
                        <Ionicons name="mail" size={20} color={colors.slate[400]} />
                        <TextInput
                          className="ml-3 flex-1 text-base font-medium text-white"
                          placeholder="john@example.com"
                          placeholderTextColor={colors.slate[500]}
                          value={email}
                          onChangeText={setEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>
                    </View>

                    {/* Password */}
                    <View>
                      <Text className="mb-2 ml-1 text-xs font-medium uppercase tracking-wider text-slate-300">
                        Password
                      </Text>
                      <View className="h-14 flex-row items-center rounded-2xl border border-white/10 bg-black/70 px-4 transition-all focus:border-indigo-400 focus:bg-black/30">
                        <Ionicons name="lock-closed" size={20} color={colors.slate[400]} />
                        <TextInput
                          className="ml-3 flex-1 text-base font-medium text-white"
                          placeholder="••••••••"
                          placeholderTextColor={colors.slate[500]}
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                          <Ionicons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color={colors.slate[400]}
                          />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        onPress={() => router.push('/forgot-password')}
                        className="mt-3 self-end">
                        <Text className="text-sm font-semibold text-indigo-300">
                          Forgot Password?
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Login Button */}
                    <View className="mt-2">
                      <Button
                        title={isLoading ? 'Verifying...' : 'Sign In'}
                        onPress={handleLogin}
                        disabled={isLoading}
                        className="h-14 w-full rounded-2xl border-t border-white/20 bg-indigo-500 shadow-lg shadow-indigo-900/50"
                        textClassName="text-white font-bold text-lg"
                      />
                    </View>

                    <AuthDivider />

                    <GoogleSignInButton
                      mode="signin"
                      onError={(err) => setError(err)}
                      disabled={isLoading}
                    />
                  </View>
                </View>
              </BlurView>
            </Animated.View>

            {/* Footer */}
            {/* <Animated.View
              entering={FadeInUp.delay(600).springify()}
              className="mt-8 flex-row items-center justify-center">
              <Text className="text-base text-slate-400">New here? </Text>
              <Link href="/register" asChild>
                <TouchableOpacity>
                  <Text className="text-base font-bold text-white underline decoration-indigo-500 decoration-2">
                    Create an account
                  </Text>
                </TouchableOpacity>
              </Link>
            </Animated.View> */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
