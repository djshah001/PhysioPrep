import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { userAtom } from '../store/auth';
import { hasProAccessAtom, proStatusAtom, QUIZ_ATTEMPT_LIMITS } from '../store/pro';
import { getProStatus } from '../actions/pro';

export interface QuizAttemptInfo {
  hasUnlimitedAttempts: boolean;
  remainingAttempts: number;
  dailyLimit: number;
  canTakeQuiz: boolean;
  isProRequired: boolean;
}

export interface ProAccessInfo {
  hasProAccess: boolean;
  isPro: boolean;
  isProActive: boolean;
  proExpiresAt: Date | null;
  showUpgradePrompt: boolean;
}

export const useProAccess = () => {
  const [user] = useAtom(userAtom);
  const [hasProAccess] = useAtom(hasProAccessAtom);
  const [proStatus, setProStatus] = useAtom(proStatusAtom);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load pro status when user changes
  useEffect(() => {
    const loadProStatus = async () => {
      if (user && !proStatus) {
        try {
          setLoading(true);
          setError(null);
          const status = await getProStatus();
          setProStatus(status);
        } catch (err: any) {
          setError(err.message);
          console.error('Failed to load pro status:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    loadProStatus();
  }, [user, proStatus, setProStatus]);

  const getProAccessInfo = (): ProAccessInfo => {
    return {
      hasProAccess: hasProAccess || user?.hasProAccess || false,
      isPro: proStatus?.isPro || user?.isPro || false,
      isProActive: proStatus?.isProActive || user?.isProActive || false,
      proExpiresAt: proStatus?.proExpiresAt || (user?.proExpiresAt ? new Date(user.proExpiresAt) : null),
      showUpgradePrompt: !hasProAccess && !user?.hasProAccess,
    };
  };

  const getQuizAttemptInfo = (attemptsToday: number = 0, quizType: 'daily' | 'topic' | 'subject' = 'daily'): QuizAttemptInfo => {
    const proInfo = getProAccessInfo();
    
    if (proInfo.hasProAccess) {
      return {
        hasUnlimitedAttempts: true,
        remainingAttempts: -1, // -1 indicates unlimited
        dailyLimit: -1,
        canTakeQuiz: true,
        isProRequired: false,
      };
    }

    // Get limit based on quiz type
    let dailyLimit: number;
    switch (quizType) {
      case 'topic':
        dailyLimit = QUIZ_ATTEMPT_LIMITS.FREE_TOPIC_LIMIT;
        break;
      case 'subject':
        dailyLimit = QUIZ_ATTEMPT_LIMITS.FREE_SUBJECT_LIMIT;
        break;
      default:
        dailyLimit = QUIZ_ATTEMPT_LIMITS.FREE_DAILY_LIMIT;
    }

    const remainingAttempts = Math.max(0, dailyLimit - attemptsToday);
    
    return {
      hasUnlimitedAttempts: false,
      remainingAttempts,
      dailyLimit,
      canTakeQuiz: remainingAttempts > 0,
      isProRequired: remainingAttempts === 0,
    };
  };

  const canAccessComprehensiveTests = (): boolean => {
    const proInfo = getProAccessInfo();
    return proInfo.hasProAccess;
  };

  const shouldShowAds = (): boolean => {
    const proInfo = getProAccessInfo();
    return !proInfo.hasProAccess;
  };

  const getFeatureAccessInfo = (featureId: string) => {
    const proInfo = getProAccessInfo();
    
    const proOnlyFeatures = [
      'comprehensive_tests',
      'unlimited_quizzes',
      'advanced_analytics',
      'offline_access',
      'priority_support'
    ];

    const isProFeature = proOnlyFeatures.includes(featureId);
    
    return {
      hasAccess: !isProFeature || proInfo.hasProAccess,
      isProFeature,
      requiresUpgrade: isProFeature && !proInfo.hasProAccess,
    };
  };

  const refreshProStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await getProStatus();
      setProStatus(status);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to refresh pro status:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    // Status
    loading,
    error,
    
    // Pro access info
    getProAccessInfo,
    getQuizAttemptInfo,
    canAccessComprehensiveTests,
    shouldShowAds,
    getFeatureAccessInfo,
    
    // Actions
    refreshProStatus,
    
    // Computed values for convenience
    hasProAccess: getProAccessInfo().hasProAccess,
    isPro: getProAccessInfo().isPro,
    isProActive: getProAccessInfo().isProActive,
    showUpgradePrompt: getProAccessInfo().showUpgradePrompt,
  };
};
