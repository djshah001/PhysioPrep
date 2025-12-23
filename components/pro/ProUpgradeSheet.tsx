import React, { forwardRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import ActionSheet, { ActionSheetRef, registerSheet, ScrollView } from 'react-native-actions-sheet';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAtom } from 'jotai';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// Store & Actions
import { paymentProcessingAtom } from '../../store/pro';
import { usePaymentProcessing } from '../../services/payment';
import ProButton from '../ui/ProButton';
import { Button } from '~/ui/button';

// --- Constants & Data ---

const PRO_BENEFITS_LIST = [
  {
    icon: 'infinity',
    title: 'Unlimited Quizzes',
    desc: 'Practice without limits.',
  },
  {
    icon: 'robot-outline',
    title: 'AI Explanations',
    desc: 'Deep dive into every answer.',
  },
  {
    icon: 'chart-line',
    title: 'Advanced Stats',
    desc: 'Track mastery & weak points.',
  },
  {
    icon: 'shield-check-outline',
    title: 'Ad-Free Experience',
    desc: 'Zero distractions.',
  },
];

const COMPARISON_DATA = [
  { feature: 'Daily Questions', free: '5', pro: 'Unlimited' },
  { feature: 'Detailed Explanations', free: 'Basic', pro: 'In-Depth' },
  { feature: 'Performance History', free: '7 Days', pro: 'Lifetime' },
  { feature: 'Ads', free: 'Yes', pro: 'None' },
];

interface ProUpgradeSheetProps {
  title?: string;
}

// --- Sub-Components ---

const BenefitCard = ({ item, index }: { item: (typeof PRO_BENEFITS_LIST)[0]; index: number }) => (
  <Animated.View
    entering={FadeInDown.delay(index * 100).springify()}
    className="mb-3 w-[48%] rounded-2xl border border-white/10 bg-white/5 p-4">
    <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
      <MaterialCommunityIcons name={item.icon as any} size={20} color="#FBBF24" />
    </View>
    <Text className="mb-1 text-sm font-bold text-white">{item.title}</Text>
    <Text className="text-xs leading-4 text-gray-400">{item.desc}</Text>
  </Animated.View>
);

const ComparisonRow = ({ item, index }: { item: (typeof COMPARISON_DATA)[0]; index: number }) => (
  <View className={`flex-row px-4 py-3 ${index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}`}>
    <Text className="flex-1 text-sm font-medium text-gray-300">{item.feature}</Text>
    <Text className="w-20 text-center text-sm text-gray-500">{item.free}</Text>
    <Text className="w-20 text-center text-sm font-bold text-amber-400">{item.pro}</Text>
  </View>
);

// --- Small Sparkle Component ---
const Sparkle = ({ delay, style }: { delay: number; style: any }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSequence(withTiming(1, { duration: 400 }), withTiming(0, { duration: 400 }))
    );
    opacity.value = withDelay(
      delay,
      withSequence(withTiming(1, { duration: 400 }), withTiming(0, { duration: 400 }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      <MaterialCommunityIcons name="star-four-points" size={24} color="#FBBF24" />
    </Animated.View>
  );
};

// --- Main Success View ---
export const SuccessView = ({ onClose }: { onClose: () => void }) => {
  // Animation Values
  const glowRotation = useSharedValue(0);
  const iconScale = useSharedValue(0);

  useEffect(() => {
    // 1. Rotating Glow
    glowRotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );

    // 2. Icon Pop
    iconScale.value = withSequence(
      withTiming(1.2, { duration: 400, easing: Easing.out(Easing.back(1.5)) }),
      withTiming(1, { duration: 200 })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${glowRotation.value}deg` }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      {/* --- Icon Section --- */}
      <View className="relative mb-8 items-center justify-center">
        {/* Sparkles (Decorative) */}
        <Sparkle delay={100} style={{ position: 'absolute', top: -20, left: -20 }} />
        <Sparkle delay={300} style={{ position: 'absolute', top: 10, right: -30 }} />
        <Sparkle delay={500} style={{ position: 'absolute', bottom: -20, left: 10 }} />

        {/* Rotating Glow Background */}
        <Animated.View style={[glowStyle, { position: 'absolute' }]}>
          <LinearGradient
            colors={['rgba(34, 197, 94, 0)', 'rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0)']}
            className="h-44 w-44"
            style={{ borderRadius: 200, overflow: 'hidden' }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        {/* Main Icon Circle */}
        <Animated.View style={iconStyle}>
          <LinearGradient
            colors={['#22C55E', '#15803d']} // Green-500 to Green-700
            className="h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-[#0F172A] shadow-2xl shadow-green-500/50">
            <Ionicons name="checkmark" size={56} color="white" style={{ fontWeight: '900' }} />

            {/* Crown Badge Overlay */}
          </LinearGradient>
          <View className="absolute -right-2 -top-2 rounded-full border-2 border-[#0F172A] bg-amber-400 p-1.5">
            <MaterialCommunityIcons name="crown" size={20} color="#78350F" />
          </View>
        </Animated.View>
      </View>

      {/* --- Text Content --- */}
      <Animated.View entering={FadeInDown.delay(300).springify()} className="w-full items-center">
        <Text className="mb-2 text-center text-4xl font-black text-white ">
          Welcome to <Text className="text-amber-400">Pro</Text>
        </Text>
        <Text className="mb-8 px-4 text-center text-base leading-6 text-gray-400">
          You&apos;re now part of the PhysioPrep Pro family. You&apos;ve successfully unlocked
          unlimited quizzes, AI insights, and advanced stats.
        </Text>
      </Animated.View>

      {/* --- Features Recap (Optional mini-list) --- */}
      <Animated.View entering={FadeInDown.delay(500).springify()} className="mb-10 flex-row gap-4">
        <View className="items-center">
          <View className="mb-2 rounded-2xl bg-gray-800/50 p-3">
            <MaterialCommunityIcons name="infinity" size={24} color="#22C55E" />
          </View>
          <Text className="text-[10px] font-bold uppercase text-gray-500">Unlimited</Text>
        </View>
        <View className="items-center">
          <View className="mb-2 rounded-2xl bg-gray-800/50 p-3">
            <MaterialCommunityIcons name="robot" size={24} color="#3B82F6" />
          </View>
          <Text className="text-[10px] font-bold uppercase text-gray-500">AI Helper</Text>
        </View>
        <View className="items-center">
          <View className="mb-2 rounded-2xl bg-gray-800/50 p-3">
            <MaterialCommunityIcons name="chart-bar" size={24} color="#F59E0B" />
          </View>
          <Text className="text-[10px] font-bold uppercase text-gray-500">Analytics</Text>
        </View>
      </Animated.View>

      {/* --- CTA Button --- */}
      <Animated.View entering={FadeInDown.delay(700).springify()} className="w-full">
        <Button
          title="Start Learning"
          onPress={onClose}
          className="w-full rounded-2xl bg-green-500 py-4 "
          textClassName="text-white text-lg font-bold tracking-wider"
          leftIcon="bookmarks"
          rightIcon="arrow-forward"
        />
      </Animated.View>
    </View>
  );
};

// --- Main Component ---

const ProUpgradeSheet = forwardRef<ActionSheetRef, ProUpgradeSheetProps>(
  ({ title = 'Unlock Pro' }, ref) => {
    const insets = useSafeAreaInsets();

    // Atoms
    const [paymentLoading, setPaymentLoading] = useAtom(paymentProcessingAtom);

    // Local State
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    const { processPayment } = usePaymentProcessing();

    const handleUpgrade = async () => {
      try {
        setPaymentLoading(true);
        setPaymentError(null);

        // Process payment with Razorpay
        const result = await processPayment();

        if (result.success) {
          // Payment successful - state is already updated in the hook
          // Just trigger success view
          setPaymentSuccess(true);
        } else {
          // Handle payment error
          setPaymentError(result.error || 'Payment failed. Please try again.');
        }
      } catch (error) {
        console.error('Payment error:', error);
        setPaymentError('An unexpected error occurred. Please try again.');
      } finally {
        setPaymentLoading(false);
      }
    };

    const handleClose = () => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.hide();
        // Reset state after a delay to ensure animation finishes
        setTimeout(() => {
          setPaymentSuccess(false);
          setPaymentError(null);
        }, 500);
      }
    };

    return (
      <ActionSheet
        ref={ref}
        snapPoints={[95]}
        initialSnapIndex={0}
        containerStyle={{
          backgroundColor: '#0F172A', // Slate-900
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
        }}
        indicatorStyle={{ backgroundColor: '#334155', width: 40, marginTop: 10 }}
        // gestureEnabled={true}
        
        >
        <View
          style={{
            paddingBottom: insets.bottom + 20,
            height: '100%',
          }}>
          {paymentSuccess ? (
            <SuccessView onClose={handleClose} />
          ) : (
            <>
              {/* Header */}
              <View className="flex-row items-center justify-between px-6 pb-2 mt-2 pt-4">
                <View>
                  <Text className="mb-1 text-xs font-bold uppercase tracking-widest text-amber-400">
                    Premium Access
                  </Text>
                  <Text className="text-2xl font-black text-white">Get {title}</Text>
                </View>
                <TouchableOpacity onPress={handleClose} className="rounded-full bg-white/10 p-2">
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}>
                {/* Hero Gradient Text */}
                <Text className="mb-6 text-sm leading-5 text-gray-400">
                  Supercharge your learning with unlimited access to advanced tools and analytics.
                </Text>

                {/* Benefits Grid */}
                <View className="mb-6 flex-row flex-wrap justify-between">
                  {PRO_BENEFITS_LIST.map((item, index) => (
                    <BenefitCard key={index} item={item} index={index} />
                  ))}
                </View>

                {/* Comparison Table */}
                <Animated.View entering={FadeInUp.delay(400).springify()} className="mb-8">
                  <Text className="mb-3 text-lg font-bold text-white">Plan Comparison</Text>
                  <View className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-900/50">
                    <View className="flex-row bg-gray-800 px-4 py-3">
                      <Text className="flex-1 text-xs font-bold uppercase text-gray-400">
                        Feature
                      </Text>
                      <Text className="w-20 text-center text-xs font-bold uppercase text-gray-400">
                        Free
                      </Text>
                      <Text className="w-20 text-center text-xs font-bold uppercase text-amber-400">
                        Pro
                      </Text>
                    </View>
                    {COMPARISON_DATA.map((item, index) => (
                      <ComparisonRow key={index} item={item} index={index} />
                    ))}
                  </View>
                </Animated.View>
              </ScrollView>

              {/* Sticky Footer */}
              <View className="border-t border-white/5 bg-[#0F172A] px-6 py-4">
                {paymentError && (
                  <View className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                    <Text className="text-center text-sm text-red-400">{paymentError}</Text>
                  </View>
                )}
                <ProButton
                  text={paymentLoading ? 'Processing...' : 'Upgrade Now • ₹4990'}
                  subtext="One-time payment. Lifetime access."
                  variant="gold"
                  size="large"
                  onPress={handleUpgrade}
                  disabled={paymentLoading}
                />
                <Text className="mt-3 text-center text-[10px] text-gray-500">
                  Secured by Razorpay. Restore purchase available in settings.
                </Text>
              </View>
            </>
          )}
        </View>
      </ActionSheet>
    );
  }
);

ProUpgradeSheet.displayName = 'ProUpgradeSheet';
registerSheet('pro-upgrade-sheet', ProUpgradeSheet);

export default ProUpgradeSheet;
