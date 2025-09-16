import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';

export interface UserPreferences {
  notifications: boolean;
  dailyReminder: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface UserStats {
  totalQuizzesTaken: number;
  totalTestsTaken: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isPremium: boolean;
  isPremiumActive: boolean;
  isEmailVerified: boolean;
  preferences: UserPreferences;
  stats: UserStats;
  avatar: string | null;
  premiumExpiry: string | null;
  provider?: 'local' | 'google';
  createdAt: string;
  updatedAt: string;
}

// Atoms
export const userAtom = atomWithStorage<User|null>("User",null);
export const tokenAtom = atomWithStorage<string|null>("token","");
export const refreshTokenAtom = atomWithStorage<string|null>("refreshToken","");
export const isLoggedInAtom = atomWithStorage<boolean>("isLoggedIn",false);
export const isLoadingAtom = atomWithStorage<boolean>("isLoading",false);

// Hooks
export const useUser = () => useAtom(userAtom);
export const useToken = () => useAtom(tokenAtom);
export const useIsLoggedIn = () => useAtom(isLoggedInAtom);
