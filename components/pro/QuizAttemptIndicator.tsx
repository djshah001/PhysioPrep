import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useAtom } from 'jotai';

import { useProAccess, QuizAttemptInfo } from '../../hooks/useProAccess';
import { proUpgradeSheetVisibleAtom } from '../../store/pro';
import ProBadge from './ProBadge';

interface QuizAttemptIndicatorProps {
  attemptsToday: number;
  quizType?: 'daily' | 'topic' | 'subject';
  showUpgradeButton?: boolean;
  className?: string;
}

const QuizAttemptIndicator: React.FC<QuizAttemptIndicatorProps> = ({
  attemptsToday,
  quizType = 'daily',
  showUpgradeButton = true,
  className = '',
}) => {
  const { getQuizAttemptInfo, hasProAccess } = useProAccess();
  const [, setProUpgradeSheetVisible] = useAtom(proUpgradeSheetVisibleAtom);
  
  const attemptInfo: QuizAttemptInfo = getQuizAttemptInfo(attemptsToday, quizType);

  // Don't show indicator if user has pro access
  if (hasProAccess) {
    return (
      <Animated.View entering={FadeIn.delay(200)} className={`flex-row items-center ${className}`}>
        <ProBadge size="small" variant="crown" text="Unlimited" />
      </Animated.View>
    );
  }

  const getStatusColor = () => {
    if (attemptInfo.remainingAttempts === 0) return 'text-red-400';
    if (attemptInfo.remainingAttempts <= 1) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStatusIcon = () => {
    if (attemptInfo.remainingAttempts === 0) return 'lock-closed';
    if (attemptInfo.remainingAttempts <= 1) return 'warning';
    return 'checkmark-circle';
  };

  const handleUpgradePress = () => {
    setProUpgradeSheetVisible(true);
  };

  return (
    <Animated.View entering={FadeIn.delay(200)} className={`${className}`}>
      <View className="bg-gray-800/50 rounded-xl p-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-2">
            <Ionicons
              name={getStatusIcon()}
              size={16}
              color={attemptInfo.remainingAttempts === 0 ? '#F87171' : attemptInfo.remainingAttempts <= 1 ? '#FBBF24' : '#34D399'}
            />
            <View>
              <Text className={`font-semibold ${getStatusColor()}`}>
                {attemptInfo.hasUnlimitedAttempts 
                  ? 'Unlimited Attempts' 
                  : `${attemptInfo.remainingAttempts} attempts left`
                }
              </Text>
              <Text className="text-gray-400 text-xs">
                {attemptInfo.hasUnlimitedAttempts 
                  ? 'Pro subscription active'
                  : `${attemptInfo.dailyLimit} per day limit`
                }
              </Text>
            </View>
          </View>

          {attemptInfo.isProRequired && showUpgradeButton && (
            <Animated.View entering={ZoomIn.delay(400)}>
              <TouchableOpacity
                onPress={handleUpgradePress}
                className="bg-yellow-500 px-3 py-1.5 rounded-lg flex-row items-center space-x-1"
              >
                <Ionicons name="crown" size={12} color="white" />
                <Text className="text-white text-xs font-bold">Upgrade</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {/* Progress bar for remaining attempts */}
        {!attemptInfo.hasUnlimitedAttempts && (
          <View className="mt-2">
            <View className="bg-gray-700 rounded-full h-2">
              <Animated.View
                entering={FadeIn.delay(600)}
                className={`h-2 rounded-full ${
                  attemptInfo.remainingAttempts === 0 
                    ? 'bg-red-500' 
                    : attemptInfo.remainingAttempts <= 1 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                }`}
                style={{
                  width: `${(attemptInfo.remainingAttempts / attemptInfo.dailyLimit) * 100}%`,
                }}
              />
            </View>
            <Text className="text-gray-500 text-xs mt-1">
              {attemptsToday}/{attemptInfo.dailyLimit} used today
            </Text>
          </View>
        )}

        {/* Blocked message */}
        {attemptInfo.isProRequired && (
          <Animated.View entering={FadeIn.delay(800)} className="mt-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
            <Text className="text-red-400 text-xs text-center">
              Daily limit reached. Upgrade to Pro for unlimited attempts!
            </Text>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
};

export default QuizAttemptIndicator;
