import React, { forwardRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import ActionSheet, { ActionSheetRef, registerSheet, ScrollView } from 'react-native-actions-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAtom } from 'jotai';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { proFeaturesAtom, proFeaturesLoadingAtom, PRO_BENEFITS } from '../../store/pro';
import { getProFeatures } from '../../actions/pro';
import ProButton from '../ui/ProButton';

interface ProUpgradeSheetProps {
  title?: string;
  subtitle?: string;
  showComparison?: boolean;
}

const ProUpgradeSheet = forwardRef<ActionSheetRef, ProUpgradeSheetProps>(
  (
    {
      title = 'Upgrade to Pro',
      subtitle = 'Unlock premium features and enhance your learning experience',
      showComparison = true,
    },
    ref
  ) => {
    const [proFeatures, setProFeatures] = useAtom(proFeaturesAtom);
    const [loading, setLoading] = useAtom(proFeaturesLoadingAtom);
    const insets = useSafeAreaInsets();

    // Load pro features when sheet opens
    useEffect(() => {
      const loadFeatures = async () => {
        if (proFeatures.length === 0) {
          try {
            setLoading(true);
            const features = await getProFeatures();
            console.log('Features:', JSON.stringify(features, null, 2));
            setProFeatures(features);
          } catch (error) {
            console.error('Failed to load pro features:', error);
          } finally {
            setLoading(false);
          }
        }
      };

      loadFeatures();
    }, []);

    const handleUpgrade = () => {
      // TODO: Implement payment flow when ready
      Alert.alert(
        'Coming Soon!',
        'Pro subscription with payment integration will be available soon. Stay tuned!',
        [{ text: 'OK' }]
      );
    };

    const handleClose = () => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.hide();
      }
    };

    return (
      <ActionSheet
        ref={ref}
        snapPoints={[50, 90]}
        // gestureEnabled
        // backgroundInteractionEnabled={false}
        initialSnapIndex={1}
        containerStyle={{
          backgroundColor: '#0F0F0F',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding:20,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 8,
        }}
        indicatorStyle={{
          backgroundColor: '#1F2937',
          width: 40,
        }}
        safeAreaInsets={insets}
        elevation={5}>
        {/* <View className=" px-6 pb-6"> */}
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(100)} className="mb-6 items-center">
            <View className="mb-4 w-full flex-row items-center justify-between">
              <View className="w-8" />
              <View className="flex-row items-center space-x-2">
                <MaterialCommunityIcons name="crown" size={24} color="#FFD700" />
                <Text className="text-xl font-bold text-white">{title}</Text>
              </View>
              <TouchableOpacity onPress={handleClose} className="p-2">
                <MaterialCommunityIcons name="close" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <Text className="text-center text-sm text-gray-400">{subtitle}</Text>
          </Animated.View>

          <ScrollView showsVerticalScrollIndicator={false} className="">
            {/* Pro Benefits */}
            <Animated.View entering={FadeInDown.delay(200)} className="mb-6 ">
              <Text className="mb-4 text-lg font-bold text-white">Pro Benefits</Text>
              <View className="space-y-3 gap-2 flex-1">
                {PRO_BENEFITS.map((benefit, index) => (
                  <Animated.View
                    key={benefit.title}
                    entering={FadeInDown.delay(300 + index * 100)}
                    className={`flex-row items-center rounded-xl p-4 ${
                      benefit.highlight
                        ? 'border border-yellow-500/20 bg-yellow-500/10'
                        : 'bg-gray-800/50'
                    }`}>
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-700">
                      <Text className="text-lg">{benefit.icon}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-white">{benefit.title}</Text>
                      <Text className="text-sm text-gray-400">{benefit.description}</Text>
                    </View>
                    {benefit.highlight && (
                      <View className="rounded-full bg-yellow-500 px-2 py-1">
                        <Text className="text-xs font-bold text-black">Popular</Text>
                      </View>
                    )}
                  </Animated.View>
                ))}
              </View>
            </Animated.View>

            {/* Comparison Table */}
            {showComparison && (
              <Animated.View entering={FadeInDown.delay(600)} className="mb-6">
                <Text className="mb-4 text-lg font-bold text-white">Free vs Pro</Text>
                <View className="overflow-hidden rounded-xl bg-gray-800/50 border border-gray-700">
                  {/* Table Header */}
                  <View className="flex-row bg-gray-700/50">
                    <View className="flex-1 p-4 border-r border-gray-700">
                      <Text className="font-semibold text-white">Feature</Text>
                    </View>
                    <View className="w-24 p-3 border-r border-gray-700 items-center justify-center">
                      <Text className="font-semibold text-gray-400 text-center">Free</Text>
                    </View>
                    <View className="w-24 p-3 items-center justify-center">
                      <Text className="font-semibold text-yellow-400 text-center">Pro</Text>
                    </View>
                  </View>
                  {/* Table Rows */}
                  {[
                    { feature: 'Quiz Attempts', free: '5/day', pro: 'Unlimited' },
                    { feature: 'Advertisements', free: 'Yes', pro: 'None' },
                    { feature: 'Comprehensive Tests', free: 'No', pro: 'Yes' },
                    { feature: 'Priority Support', free: 'No', pro: 'Yes' },
                    { feature: 'Advanced Analytics', free: 'Basic', pro: 'Detailed' },
                    { feature: 'Offline Access', free: 'No', pro: 'Yes' },
                  ].map((row, index) => (
                    <View
                      key={row.feature}
                      className={`flex-row items-center ${index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/10'}`}>
                      <View className="flex-1 p-3 border-r border-gray-700">
                        <Text className="text-white "> {row.feature}</Text>
                      </View>
                      <View className="w-24 p-3 border-r border-gray-700 items-center justify-center">
                        <Text className="text-sm text-gray-400 text-center" numberOfLines={1}>{row.free}</Text>
                      </View>
                      <View className="w-24 p-3 items-center justify-center">
                        <Text className="text-sm font-semibold text-yellow-400 text-center">{row.pro}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}
          </ScrollView>

          {/* Upgrade Button */}
          <Animated.View entering={FadeInUp.delay(800)} className="mt-4">
            <ProButton size="large" text="Upgrade to Pro" onPress={handleUpgrade} />
            <Text className="mt-2 text-center text-xs text-gray-500">
              Payment integration coming soon
            </Text>
          </Animated.View>

          <View className="h-16" />
        {/* </View> */}

      </ActionSheet>
    );
  }
);

ProUpgradeSheet.displayName = 'ProUpgradeSheet';

registerSheet('pro-upgrade-sheet', ProUpgradeSheet);

export default ProUpgradeSheet;
