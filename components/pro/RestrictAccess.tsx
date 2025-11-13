import { useRef } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, ZoomIn, FadeInRight } from 'react-native-reanimated';
import { ActionSheetRef } from 'react-native-actions-sheet';
import colors from 'tailwindcss/colors';

import { Button } from 'components/ui/button';
import ProButton from 'components/ui/ProButton';
import ProUpgradeSheet from 'components/pro/ProUpgradeSheet';
import { useProAccess } from 'hooks/useProAccess';
import Chip from '~/ui/Chip';

interface RestrictAccessProps {
  title?: string;
  subtitle?: string;
  featureName?: string;
  benefits?: string[];
  backButtonText?: string;
  upgradeButtonText?: string;
  showFeatureChips?: boolean;
  customFeatureChips?: {
    iconName: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    label: string;
  }[];
}

export function RestrictAccess({
  title = 'Comprehensive Tests',
  subtitle = 'Full-length practice exams to test your knowledge',
  featureName = 'Comprehensive tests',
  benefits = [
    'Full-length comprehensive tests',
    'Customizable test duration and difficulty',
    'Detailed performance analytics',
    'Unlimited quiz attempts',
    'Ad-free experience',
    'Priority support',
  ],
  backButtonText = 'Back to Subjects',
  upgradeButtonText = 'Upgrade to Pro ✨',
  showFeatureChips = true,
  customFeatureChips,
}: RestrictAccessProps) {
  const router = useRouter();
  const proUpgradeSheetRef = useRef<ActionSheetRef>(null);
  const { canAccessComprehensiveTests } = useProAccess();

  // If user has access, don't render the restriction
  if (canAccessComprehensiveTests()) {
    return null;
  }

  return (
    <ScrollView contentContainerClassName="" className="flex-1 p-6 bg-neutral-50">
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100)} className="mb-8">
        <Text className="mb-2 text-center text-3xl font-bold text-neutral-800">{title}</Text>
        <Text className="text-center text-base text-neutral-500">{subtitle}</Text>
      </Animated.View>

      {/* Locked Feature Card */}
      <Animated.View entering={FadeInUp.delay(200)} className="flex-1 justify-center">
        <View className="mb-6 rounded-3xl bg-slate-50 p-6 shadow-lg shadow-neutral-700">
          {/* Lock Icon */}
          <Animated.View entering={ZoomIn.delay(400)} className="mb-6 items-center">
            <LinearGradient
              colors={['#FFD700', '#FFA500', '#FF6B35'] as const}
              className="mb-4 overflow-hidden rounded-full p-4">
              <MaterialCommunityIcons name="crown" size={48} color="white" />
            </LinearGradient>
            <Text className="mb-2 text-center text-3xl font-bold text-neutral-800">
              PhsyioPrep Pro Feature
            </Text>
            <Text className="text-center text-base leading-6 text-neutral-500">
              {featureName} are available exclusively for Pro subscribers
            </Text>
          </Animated.View>

          {/* Feature Statistics */}
          {showFeatureChips && (
            <Animated.View entering={FadeInUp.delay(500)} className="mb-6">
              <View className="flex-row flex-wrap justify-center gap-2">
                {(
                  customFeatureChips || [
                    { iconName: 'book' as const, iconColor: colors.rose[400], label: 'Unlimited Tests' },
                    {
                      iconName: 'timer' as const,
                      iconColor: colors.blue[400],
                      label: 'Custom Duration',
                    },
                    {
                      iconName: 'analytics' as const,
                      iconColor: colors.green[400],
                      label: 'Detailed Analytics',
                    },
                    {
                      iconName: 'infinite' as const,
                      iconColor: colors.purple[400],
                      label: 'Unlimited Access',
                    },
                  ]
                ).map((chip, index) => (
                  <Animated.View key={index} entering={FadeInRight.delay(600 + index * 100)}>
                    <Chip
                      iconName={chip.iconName}
                      iconColor={chip.iconColor}
                      label={chip.label}
                      textClassName="text-neutral-800 font-semibold"
                      className="px-4 py-2 shadow-black/40"
                    />
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Benefits List */}
          <Animated.View entering={FadeInUp.delay(600)} className="mb-8">
            <Text className="mb-4 text-center text-lg font-semibold text-neutral-800">
              What you&apos;ll get with Pro:
            </Text>
            <View className="space-y-3">
              {benefits.map((benefit, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInUp.delay(700 + index * 100)}
                  className="flex-row items-center gap-2 mt-1">
                  <MaterialCommunityIcons name="check-circle" size={20} color={colors.amber[400]} />
                  <Text className="flex-1 text-sm text-neutral-600">{benefit}</Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Upgrade Button */}
          <Animated.View entering={ZoomIn.delay(1000)}>
            <ProButton
              size="large"
              variant="primary"
              text={upgradeButtonText}
              onPress={() => proUpgradeSheetRef.current?.show()}
            />
          </Animated.View>
        </View>

        {/* Back Button */}
        <Animated.View entering={FadeInUp.delay(1200)}>
          <Button
            title={backButtonText}
            onPress={() => router.back()}
            className="border border-neutral-500 bg-neutral-700"
            textClassName="text-neutral-300"
            leftIcon="chevron-back-outline"
          />
        </Animated.View>
      </Animated.View>

<View className="h-32" />

      {/* Pro Upgrade Sheet */}
      <ProUpgradeSheet
        ref={proUpgradeSheetRef}
        title="Unlock Comprehensive Tests"
        subtitle="Get access to full-length practice exams and boost your exam preparation"
      />
    </ScrollView>
  );
}
