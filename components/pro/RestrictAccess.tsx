import React, { useRef } from 'react';
import { View, Text, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ActionSheetRef } from 'react-native-actions-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ProButton from 'components/ui/ProButton';
import ProUpgradeSheet from 'components/pro/ProUpgradeSheet';
import { useProAccess } from 'hooks/useProAccess';
import Gradients from '~/Gradients';

interface RestrictAccessProps {
  title?: string;
  subtitle?: string;
  featureName?: string;
  backButtonText?: string;
  upgradeButtonText?: string;
}

// --- Sub-Components ---

const BenefitItem = ({
  icon,
  title,
  desc,
  delay,
  color,
}: {
  icon: string;
  title: string;
  desc: string;
  delay: number;
  color: string;
}) => (
  <Animated.View
    entering={FadeInUp.delay(delay).springify()}
    className="mb-4 flex-row items-center rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
    <View
      className="mr-4 h-12 w-12 items-center justify-center rounded-full"
      style={{ backgroundColor: `${color}15` }} // 15% opacity of the color
    >
      <MaterialCommunityIcons name={icon as any} size={24} color={color} />
    </View>
    <View className="flex-1">
      <Text className="mb-0.5 text-base font-bold text-slate-800">{title}</Text>
      <Text className="text-xs leading-4 text-slate-500">{desc}</Text>
    </View>
  </Animated.View>
);

// --- Main Component ---

export function RestrictAccess({
  title = 'Pro Feature',
  subtitle = 'Unlock your full potential with PhysioPrep Pro.',
  featureName = 'This feature',
  backButtonText = 'Maybe Later',
  upgradeButtonText = 'Unlock Access',
}: RestrictAccessProps) {
  const router = useRouter();
  const proUpgradeSheetRef = useRef<ActionSheetRef>(null);
  const { canAccessComprehensiveTests } = useProAccess();
  const insets = useSafeAreaInsets();

  // If accessible, render nothing
  if (canAccessComprehensiveTests()) return null;

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />

      {/* Decorative Background Blob */}
      <View className="absolute left-0 right-0 top-0 h-[400px] overflow-hidden">
        <View className="absolute -right-[100px] -top-[100px] h-[400px] w-[400px] rounded-full bg-amber-100/50 blur-3xl" />
        <View className="absolute -left-[100px] top-[50px] h-[300px] w-[300px] rounded-full bg-orange-100/40 blur-3xl" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 150 }}
        // className="flex-1"
        showsVerticalScrollIndicator={false}>
        {/* --- Hero Section --- */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="items-center px-6 pb-8 pt-16">
          <View className="relative mb-8">
            {/* Soft Glow Behind Icon */}
            <View className="absolute -inset-8 rounded-full bg-amber-200/40 blur-2xl" />

            <LinearGradient
              colors={Gradients[4]}
              className="h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white shadow-xl shadow-orange-500/10">
              <MaterialCommunityIcons name="lock-outline" size={48} color="white" />
            </LinearGradient>

            {/* Floating Badge */}
            <View className="absolute -bottom-3 right-5 flex-row items-center rounded-full border border-slate-100 bg-white px-3 py-1 shadow-sm">
              <MaterialCommunityIcons name="star" size={16} color="#F59E0B" />
              <Text className="ml-1 text-sm font-bold text-slate-700">Pro</Text>
            </View>
          </View>

          <Text className="mb-3 text-center text-3xl font-black tracking-tight text-slate-900">
            {title}
          </Text>
          <Text className="max-w-xs px-4 text-center text-base leading-6 text-slate-500">
            {featureName} is locked. Upgrade to Pro to access this and much more.
          </Text>
        </Animated.View>

        {/* --- Benefits List --- */}
        <View className="px-6">
          <Text className="mb-4 ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">
            What you get
          </Text>

          <BenefitItem
            icon="infinity"
            title="Unlimited Access"
            desc="No limits on quizzes or tests."
            color="#3B82F6" // Blue
            delay={300}
          />
          <BenefitItem
            icon="brain"
            title="Smart Explanations"
            desc="AI-powered insights for every question."
            color="#8B5CF6" // Violet
            delay={400}
          />
          <BenefitItem
            icon="chart-line"
            title="Deep Analytics"
            desc="Track your progress over time."
            color="#10B981" // Emerald
            delay={500}
          />
        </View>
      </ScrollView>
      {/* --- Sticky Footer Actions --- */}
      <Animated.View
        entering={FadeInUp.delay(800)}
        className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-white/90 p-6"
        style={{ paddingBottom: insets.bottom + 10 }}>
        <ProButton
          size="large"
          variant="gold" // Gold stands out beautifully on white
          text={upgradeButtonText}
          subtext="Starting at $49.99 / lifetime"
          onPress={() => proUpgradeSheetRef.current?.show()}
          className="mb-3 shadow-lg shadow-orange-500/20"
        />

        <TouchableOpacity onPress={() => router.back()} className="items-center py-3">
          <Text className="text-sm font-semibold text-slate-500">{backButtonText}</Text>
        </TouchableOpacity>
      </Animated.View>


      {/* --- Upgrade Sheet --- */}
      <ProUpgradeSheet ref={proUpgradeSheetRef} />
    </View>
  );
}
