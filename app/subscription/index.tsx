import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const FeatureRow = ({ icon, text, delay }: any) => (
    <Animated.View entering={FadeInDown.delay(delay).springify()} className="flex-row items-center mb-5">
        <View className="h-8 w-8 rounded-full bg-green-100 items-center justify-center mr-4">
            <Ionicons name="checkmark" size={18} color="#10B981" />
        </View>
        <Text className="text-base font-medium text-neutral-800">{text}</Text>
    </Animated.View>
);

export default function SubscriptionScreen() {
  const router = useRouter();

  const handlePurchase = () => {
    // Integrate Stripe/RevenueCat here
    alert('Payment integration pending');
  };

  return (
    <View className="flex-1 bg-white">
        {/* Background Image/Pattern */}
        <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop' }}
            className="absolute top-0 w-full h-[400px] opacity-10"
        />
        <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
            className="absolute top-0 w-full h-[400px]"
        />

        <SafeAreaView className="flex-1">
            <View className="px-6 py-2 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 bg-neutral-100 rounded-full items-center justify-center">
                    <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="font-bold text-neutral-400">RESTORE PURCHASE</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-4">
                <Animated.View entering={FadeInDown.springify()} className="items-center mb-10">
                    <View className="h-20 w-20 bg-indigo-100 rounded-3xl items-center justify-center mb-6 transform rotate-3">
                        <Ionicons name="diamond" size={40} color="#4F46E5" />
                    </View>
                    <Text className="text-4xl font-black text-neutral-900 text-center mb-2">
                        Unlock <Text className="text-indigo-600">Pro</Text> Access
                    </Text>
                    <Text className="text-lg text-neutral-500 text-center px-4">
                        Supercharge your learning with unlimited access to all features.
                    </Text>
                </Animated.View>

                <View className="bg-neutral-50 rounded-3xl p-6 border border-neutral-100 mb-8">
                    <FeatureRow text="Unlimited Practice Questions" delay={100} />
                    <FeatureRow text="Detailed Analytics & Insights" delay={200} />
                    <FeatureRow text="Ad-Free Experience" delay={300} />
                    <FeatureRow text="Priority Support" delay={400} />
                    <FeatureRow text="Offline Mode" delay={500} />
                </View>

                {/* Pricing Card */}
                <Animated.View entering={FadeInUp.delay(600).springify()}>
                    <TouchableOpacity onPress={handlePurchase}>
                        <LinearGradient
                            colors={['#4F46E5', '#4338CA']}
                            start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                            className="p-1 rounded-3xl"
                        >
                            <View className="bg-indigo-600 rounded-[22px] p-5 flex-row items-center justify-between">
                                <View>
                                    <Text className="text-indigo-200 font-medium text-xs uppercase tracking-widest mb-1">Lifetime Access</Text>
                                    <View className="flex-row items-end">
                                        <Text className="text-3xl font-bold text-white">$49.99</Text>
                                        <Text className="text-indigo-200 mb-1 ml-1 text-sm">/ once</Text>
                                    </View>
                                </View>
                                <View className="bg-white px-6 py-3 rounded-xl">
                                    <Text className="text-indigo-600 font-bold">Get Pro</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                    <Text className="text-center text-xs text-neutral-400 mt-4">
                        Secure payment via Apple/Google Pay. Cancel anytime.
                    </Text>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    </View>
  );
}