import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Pro feature interface
export interface ProFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'experience' | 'learning' | 'assessment' | 'support' | 'analytics' | 'access';
}

// Pro status interface
export interface ProStatus {
  isPro: boolean;
  isProActive: boolean;
  proExpiresAt: Date | null;
  proActivatedAt: Date | null;
  hasProAccess: boolean;
  // Legacy premium support
  isPremium: boolean;
  isPremiumActive: boolean;
  premiumExpiry: Date | null;
}

//paymwnt process loading state
export const paymentProcessingAtom = atom(false);

// Pro features list atom
export const proFeaturesAtom = atom<ProFeature[]>([]);

// Pro status atom - stored in AsyncStorage for persistence
export const proStatusAtom = atomWithStorage<ProStatus | null>('proStatus', null);

// Loading states
export const proStatusLoadingAtom = atom<boolean>(false);
export const proFeaturesLoadingAtom = atom<boolean>(false);

// Error states
export const proStatusErrorAtom = atom<string | null>(null);
export const proFeaturesErrorAtom = atom<string | null>(null);

// Computed atoms
export const isProActiveAtom = atom<boolean>((get) => {
  const proStatus = get(proStatusAtom);
  return proStatus?.isProActive || false;
});

export const hasProAccessAtom = atom<boolean>((get) => {
  const proStatus = get(proStatusAtom);
  return proStatus?.hasProAccess || false;
});

export const proExpiryDateAtom = atom<Date | null>((get) => {
  const proStatus = get(proStatusAtom);
  return proStatus?.proExpiresAt ? new Date(proStatus.proExpiresAt) : null;
});

// Pro features by category
export const proFeaturesByCategoryAtom = atom<Record<string, ProFeature[]>>((get) => {
  const features = get(proFeaturesAtom);
  return features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, ProFeature[]>);
});

// Pro upgrade sheet visibility
export const proUpgradeSheetVisibleAtom = atom<boolean>(false);

// Pro button animation state
export const proButtonAnimatingAtom = atom<boolean>(false);

// Quiz attempt limits for free users
export const QUIZ_ATTEMPT_LIMITS = {
  FREE_DAILY_LIMIT: 5,
  FREE_TOPIC_LIMIT: 3,
  FREE_SUBJECT_LIMIT: 2,
} as const;

// Pro feature IDs for easy reference
export const PRO_FEATURE_IDS = {
  NO_ADS: 'no_ads',
  UNLIMITED_QUIZZES: 'unlimited_quizzes',
  COMPREHENSIVE_TESTS: 'comprehensive_tests',
  PRIORITY_SUPPORT: 'priority_support',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  OFFLINE_ACCESS: 'offline_access',
} as const;

// Helper function to check if user has specific pro feature
export const hasProFeatureAtom = atom(null, (get, set, featureId: string) => {
  const hasProAccess = get(hasProAccessAtom);
  const features = get(proFeaturesAtom);
  
  if (!hasProAccess) return false;
  
  return features.some(feature => feature.id === featureId);
});

// Pro benefits for display
export const PRO_BENEFITS = [
  {
    title: 'Ad-Free Experience',
    description: 'Study without interruptions',
    icon: '🚫',
    highlight: true,
  },
  {
    title: 'Unlimited Practice',
    description: 'Take quizzes as many times as you want',
    icon: '♾️',
    highlight: true,
  },
  {
    title: 'Comprehensive Tests',
    description: 'Full-length practice exams',
    icon: '📋',
    highlight: true,
  },
  {
    title: 'Priority Support',
    description: 'Get help when you need it',
    icon: '⚡',
    highlight: false,
  },
  {
    title: 'Advanced Analytics',
    description: 'Detailed progress insights',
    icon: '📊',
    highlight: false,
  },
  {
    title: 'Offline Access',
    description: 'Study anywhere, anytime',
    icon: '📱',
    highlight: false,
  },
] as const;
