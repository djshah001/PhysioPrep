import React, { forwardRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity} from 'react-native';
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
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// Store & Actions
import {
  proStatusAtom,
  paymentProcessingAtom,
} from '../../store/pro';
import { usePaymentProcessing } from '../../services/payment';
import { userAtom } from 'store/auth';
import ProButton from '../ui/ProButton';

// --- Constants & Data ---

const PRO_BENEFITS_LIST = [
  { 
    icon: 'infinity', 
    title: 'Unlimited Quizzes', 
    desc: 'Practice without limits.' 
  },
  { 
    icon: 'robot-outline', 
    title: 'AI Explanations', 
    desc: 'Deep dive into every answer.' 
  },
  { 
    icon: 'chart-line', 
    title: 'Advanced Stats', 
    desc: 'Track mastery & weak points.' 
  },
  { 
    icon: 'shield-check-outline', 
    title: 'Ad-Free Experience', 
    desc: 'Zero distractions.' 
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

const BenefitCard = ({ item, index }: { item: typeof PRO_BENEFITS_LIST[0]; index: number }) => (
  <Animated.View 
    entering={FadeInDown.delay(index * 100).springify()}
    className="w-[48%] mb-3 bg-white/5 rounded-2xl p-4 border border-white/10"
  >
    <View className="h-10 w-10 rounded-full bg-amber-500/20 items-center justify-center mb-3">
      <MaterialCommunityIcons name={item.icon as any} size={20} color="#FBBF24" />
    </View>
    <Text className="text-white font-bold text-sm mb-1">{item.title}</Text>
    <Text className="text-gray-400 text-xs leading-4">{item.desc}</Text>
  </Animated.View>
);

const ComparisonRow = ({ item, index }: { item: typeof COMPARISON_DATA[0]; index: number }) => (
  <View className={`flex-row py-3 px-4 ${index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}`}>
    <Text className="flex-1 text-gray-300 text-sm font-medium">{item.feature}</Text>
    <Text className="w-20 text-center text-gray-500 text-sm">{item.free}</Text>
    <Text className="w-20 text-center text-amber-400 font-bold text-sm">{item.pro}</Text>
  </View>
);

// --- Small Sparkle Component ---
const Sparkle = ({ delay, style }: { delay: number; style: any }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(0, { duration: 400 })
    ));
    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 400 }),
      withTiming(0, { duration: 400 })
    ));
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
    <View className="items-center justify-center py-12 px-6">
      
      {/* --- Icon Section --- */}
      <View className="relative items-center justify-center mb-8">
        
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
            className="h-28 w-28 rounded-full items-center justify-center shadow-2xl shadow-green-500/50 border-4 border-[#0F172A] overflow-hidden"
          >
            <Ionicons name="checkmark" size={56} color="white" style={{ fontWeight: '900' }} />
            
            {/* Crown Badge Overlay */}
          </LinearGradient>
            <View className="absolute -top-2 -right-2 bg-amber-400 rounded-full p-1.5 border-2 border-[#0F172A]">
              <MaterialCommunityIcons name="crown" size={20} color="#78350F" />
            </View>
        </Animated.View>
      </View>

      {/* --- Text Content --- */}
      <Animated.View entering={FadeInDown.delay(300).springify()} className="items-center w-full">
        <Text className="text-4xl font-black text-white text-center mb-2 ">
          Welcome to <Text className="text-amber-400">Pro</Text>
        </Text>
        <Text className="text-gray-400 text-center text-base mb-8 leading-6 px-4">
          You&apos;re now part of the PhysioPrep Pro family. You&apos;ve successfully unlocked unlimited quizzes, AI insights, and advanced stats.
        </Text>
      </Animated.View>

      {/* --- Features Recap (Optional mini-list) --- */}
      <Animated.View 
        entering={FadeInDown.delay(500).springify()} 
        className="flex-row gap-4 mb-10"
      >
        <View className="items-center">
          <View className="bg-gray-800/50 p-3 rounded-2xl mb-2">
            <MaterialCommunityIcons name="infinity" size={24} color="#22C55E" />
          </View>
          <Text className="text-gray-500 text-[10px] font-bold uppercase">Unlimited</Text>
        </View>
        <View className="items-center">
          <View className="bg-gray-800/50 p-3 rounded-2xl mb-2">
            <MaterialCommunityIcons name="robot" size={24} color="#3B82F6" />
          </View>
          <Text className="text-gray-500 text-[10px] font-bold uppercase">AI Helper</Text>
        </View>
        <View className="items-center">
          <View className="bg-gray-800/50 p-3 rounded-2xl mb-2">
            <MaterialCommunityIcons name="chart-bar" size={24} color="#F59E0B" />
          </View>
          <Text className="text-gray-500 text-[10px] font-bold uppercase">Analytics</Text>
        </View>
      </Animated.View>

      {/* --- CTA Button --- */}
      <Animated.View entering={FadeInDown.delay(700).springify()} className="w-full">
        <ProButton
          size="large"
          text="Start Learning"
          onPress={onClose}
          variant="indigo"
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
    const [user, setUser] = useAtom(userAtom);
    const [, setProStatus] = useAtom(proStatusAtom);
    const [paymentLoading, setPaymentLoading] = useAtom(paymentProcessingAtom);
    
    // Local State
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    
    const { processPayment } = usePaymentProcessing();

    const handleUpgrade = async () => {
      try {
        setPaymentLoading(true);
        
        // Simulate payment or call actual Stripe
        const result = await processPayment();

        if (result.success) {
          const now = new Date();
          
          // Update Global State
          setProStatus({
            isPro: true,
            isProActive: true,
            hasProAccess: true,
            proActivatedAt: now,
            proExpiresAt: null
          });

          if (user) {
            setUser({
              ...user,
              isPro: true,
              isProActive: true,
              hasProAccess: true,
              proActivatedAt: now.toISOString(),
            });
          }

          // Trigger Success View
          setPaymentSuccess(true);
        } else {
          // Handle error (alert handled in hook or add local state for error text)
        }
      } catch (error) {
        console.error(error);
      } finally {
        setPaymentLoading(false);
      }
    };

    const handleClose = () => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.hide();
        // Reset state after a delay to ensure animation finishes
        setTimeout(() => setPaymentSuccess(false), 500);
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
        gestureEnabled={!paymentSuccess}
      >
        <View 
          style={{ 
            paddingBottom: insets.bottom + 20, 
            height: '100%' 
          }}
        >
          {paymentSuccess ? (
            <SuccessView onClose={handleClose} />
          ) : (
            <>
              {/* Header */}
              <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
                <View>
                  <Text className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-1">Premium Access</Text>
                  <Text className="text-2xl font-black text-white">Get {title}</Text>
                </View>
                <TouchableOpacity 
                  onPress={handleClose} 
                  className="bg-white/10 p-2 rounded-full"
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}
              >
                
                {/* Hero Gradient Text */}
                <Text className="text-gray-400 text-sm mb-6 leading-5">
                  Supercharge your learning with unlimited access to advanced tools and analytics.
                </Text>

                {/* Benefits Grid */}
                <View className="flex-row flex-wrap justify-between mb-6">
                  {PRO_BENEFITS_LIST.map((item, index) => (
                    <BenefitCard key={index} item={item} index={index} />
                  ))}
                </View>

                {/* Comparison Table */}
                <Animated.View entering={FadeInUp.delay(400).springify()} className="mb-8">
                  <Text className="text-white font-bold text-lg mb-3">Plan Comparison</Text>
                  <View className="rounded-2xl border border-gray-700 overflow-hidden bg-gray-900/50">
                    <View className="flex-row bg-gray-800 py-3 px-4">
                      <Text className="flex-1 text-gray-400 text-xs uppercase font-bold">Feature</Text>
                      <Text className="w-20 text-center text-gray-400 text-xs uppercase font-bold">Free</Text>
                      <Text className="w-20 text-center text-amber-400 text-xs uppercase font-bold">Pro</Text>
                    </View>
                    {COMPARISON_DATA.map((item, index) => (
                      <ComparisonRow key={index} item={item} index={index} />
                    ))}
                  </View>
                </Animated.View>

              </ScrollView>

              {/* Sticky Footer */}
              <View className="px-6 py-4 border-t border-white/5 bg-[#0F172A]">
                <ProButton 
                  text={paymentLoading ? 'Processing...' : 'Upgrade Now • $49.99'}
                  subtext="One-time payment. Lifetime access."
                  variant="gold"
                  size="large"
                  onPress={handleUpgrade}
                  disabled={paymentLoading}
                />
                <Text className="text-center text-gray-500 text-[10px] mt-3">
                  Secured by Stripe. Restore purchase available in settings.
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