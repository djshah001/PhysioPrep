import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { Link, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Colors } from "constants/Colors";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useAtom } from "jotai";
import { isLoadingAtom, isLoggedInAtom } from "../../store/auth";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [isLoggedIn] = useAtom(isLoggedInAtom);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/home');
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    try {
      setError("");
      scale.value = withSpring(0.95);
      await login(email, password);
      scale.value = withSpring(1);
    } catch (error: any) {
      scale.value = withSpring(1);
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           error.response.data?.errors?.[0]?.msg || 
                           "Login failed. Please check your credentials.";
        setError(errorMessage);
      } else if (error.request) {
        setError("No response from server. Please check your internet connection.");
      } else {
        setError(error.message || "An unexpected error occurred. Please try again.");
      }
      console.error('Login error:', error);
    }
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <LinearGradient
      colors={[Colors.background, Colors.grey6]}
      className="flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className=""
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            minHeight: height,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 py-12 gap-2 justify-around">
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              className=""
            >
              <Text className="text-5xl font-bold text-primary mb-3">
                PhysioPrep
              </Text>
              <Text className="text-3xl font-bold text-white mb-3">
                Welcome Back
              </Text>
              <Text className="text-base text-gray-300">
                Sign in to continue your learning journey
              </Text>
            </Animated.View>

            {error ? (
              <Animated.View
                entering={FadeInDown.delay(400).springify()}
                className="bg-red-500/10 p-4 rounded-lg mb-8 border border-red-500/20"
              >
                <Text className="text-red-500 text-base text-center">
                  {error}
                </Text>
              </Animated.View>
            ) : null}

            <View className="gap-6">
              <Animated.View
                entering={FadeInDown.delay(600).springify()}
                className="gap-2"
              >
                <Text className="text-sm font-medium text-white ml-1">
                  Email
                </Text>
                <BlurView
                  intensity={20}
                  tint="dark"
                  className="rounded-xl overflow-hidden"
                >
                  <Input
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    className="bg-white/5 border-gray-700 px-4 py-3"
                  />
                </BlurView>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(800).springify()}
                className="gap-2"
              >
                <Text className="text-sm font-medium text-white ml-1">
                  Password
                </Text>
                <BlurView
                  intensity={20}
                  tint="dark"
                  className="rounded-xl overflow-hidden"
                >
                  <View className="relative">
                    <Input
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      className="bg-white/5 border-gray-700 px-4 py-3 pr-12"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={24}
                        color={Colors.grey}
                      />
                    </TouchableOpacity>
                  </View>
                </BlurView>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/forgot-password" as any)}
                  className="px-2 py-1"
                >
                  <Text className="text-primary text-sm font-medium">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(1000).springify()}
                className=""
              >
                <Animated.View style={buttonAnimatedStyle}>
                  <Button
                    title={isLoading ? "Signing in..." : "Sign In"}
                    onPress={handleLogin}
                    disabled={isLoading}
                    className="bg-primary/90 py-4 rounded-xl"
                  />
                </Animated.View>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(1400).springify()}
                className="flex-row justify-center mt-8 text-center"
              >
                <Text className="text-gray-300 text-sm text-center">
                  Don&apos;t have an account?{" "}
                </Text>
                <Link href="/(auth)/register" asChild>
                  <Text className="text-primary text-sm font-medium text-center">
                    Sign Up
                  </Text>
                </Link>
              </Animated.View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
