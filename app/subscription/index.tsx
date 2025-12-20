import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useAtom } from 'jotai';

// Store & Hooks
import { usePaymentProcessing } from '../../services/payment';
import { proStatusAtom, paymentProcessingAtom } from '../../store/pro';
import { userAtom } from '../../store/auth';
import ProButton from '~/ui/ProButton';
import { SuccessView } from '~/pro/ProUpgradeSheet';

// Constants
const BENEFITS = [
  { icon: 'infinity', title: 'Unlimited Quizzes', desc: 'Practice without limits' },
  { icon: 'robot-outline', title: 'AI Explanations', desc: 'Deep dive into every answer' },
  { icon: 'chart-line', title: 'Advanced Analytics', desc: 'Track your mastery & progress' },
  { icon: 'shield-check-outline', title: 'Ad-Free Experience', desc: 'Zero distractions' },
  { icon: 'star-outline', title: 'Priority Support', desc: 'Get help faster' },
];

// --- Components ---

const BenefitRow = ({ item, index }: { item: typeof BENEFITS[0]; index: number }) => (
  <Animated.View 
    entering={FadeInDown.delay(index * 100 + 300).springify()} 
    className="flex-row items-center mb-5 bg-white/5 p-4 rounded-2xl border border-white/5"
  >
    <View className="h-10 w-10 rounded-full bg-amber-500/20 items-center justify-center mr-4">
      <MaterialCommunityIcons name={item.icon as any} size={20} color="#FBBF24" />
    </View>
    <View className="flex-1">
        <Text className="text-base font-bold text-white mb-0.5">{item.title}</Text>
        <Text className="text-xs text-gray-400">{item.desc}</Text>
    </View>
  </Animated.View>
);


export default function SubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // State
  const [user, setUser] = useAtom(userAtom);
  const [, setProStatus] = useAtom(proStatusAtom);
  const [paymentLoading, setPaymentLoading] = useAtom(paymentProcessingAtom);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const { processPayment } = usePaymentProcessing();

  const handlePurchase = async () => {
    try {
      setPaymentLoading(true);
      const result = await processPayment(); // Logic handled in hook

      if (result.success) {
        const now = new Date();
        setProStatus({
            isPro: true,
            isProActive: true,
            hasProAccess: true,
            proActivatedAt: now,
            proExpiresAt: null,
        });
        if (user) {
            setUser({ ...user, isPro: true, isProActive: true, hasProAccess: true, proActivatedAt: now.toISOString() });
        }
        setPaymentSuccess(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleClose = () => {
    if (paymentSuccess) {
        // Navigate back or reset
        if (router.canGoBack()) router.back();
        else router.replace('/');
    } else {
        router.back();
    }
  };

  return (
    <View className="flex-1 bg-[#0F172A]">
      <StatusBar barStyle="light-content" />
      
      {/* Background Ambience */}
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop' }}
        className="absolute top-0 w-full h-[600px] opacity-20"
        blurRadius={50}
      />
      <LinearGradient
        colors={['transparent', '#0F172A']}
        className="absolute top-0 w-full h-[600px]"
      />

      <SafeAreaView className="flex-1">
        {paymentSuccess ? (
            <SuccessView onClose={handleClose} />
        ) : (
            <>
                {/* Header */}
                <View className="px-6 py-2 flex-row justify-between items-center z-10">
                    <TouchableOpacity 
                        onPress={() => router.back()} 
                        className="h-10 w-10 bg-white/10 rounded-full items-center justify-center backdrop-blur-md"
                    >
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text className="font-bold text-gray-400 text-xs uppercase tracking-widest">Restore Purchase</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    className="flex-1" 
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero Section */}
                    <Animated.View entering={FadeInDown.delay(100).springify()} className="items-center mt-6 mb-10">
                        <View className="h-24 w-24 bg-amber-500/10 rounded-[32px] items-center justify-center mb-6 border border-amber-500/20 shadow-2xl shadow-amber-500/20 transform rotate-3">
                            <MaterialCommunityIcons name="crown" size={48} color="#FBBF24" />
                        </View>
                        <Text className="text-4xl font-black text-white text-center mb-3 tracking-tight">
                            Unlock <Text className="text-amber-400">Pro</Text> Access
                        </Text>
                        <Text className="text-lg text-gray-400 text-center px-4 leading-7">
                            Supercharge your learning with unlimited access to premium tools.
                        </Text>
                    </Animated.View>

                    {/* Benefits List */}
                    <View className="mb-8">
                        {BENEFITS.map((item, index) => (
                            <BenefitRow key={index} item={item} index={index} />
                        ))}
                    </View>
                </ScrollView>

                {/* Sticky Footer */}
                <Animated.View 
                    entering={FadeInUp.delay(800).springify()}
                    className="absolute bottom-0 left-0 right-0 p-6 bg-[#0F172A]/90 border-t border-white/5 backdrop-blur-xl"
                    style={{ paddingBottom: insets.bottom + 20 }}
                >
                    <ProButton 
                        text={paymentLoading ? 'Processing...' : 'Upgrade Now • $49.99'}
                        subtext="One-time payment. Lifetime access."
                        variant="gold"
                        size="large"
                        onPress={handlePurchase}
                        disabled={paymentLoading}
                        className="shadow-2xl shadow-amber-500/20"
                    />
                    <Text className="text-center text-gray-600 text-[10px] mt-4">
                        Secured by Stripe. No subscription, just one payment.
                    </Text>
                </Animated.View>
            </>
        )}
      </SafeAreaView>
    </View>
  );
}