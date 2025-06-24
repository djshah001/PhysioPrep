import { atom, useAtom } from 'jotai';

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
  createdAt: string;
  updatedAt: string;
}

// Atoms
export const userAtom = atom<User | null>(null);
export const tokenAtom = atom<string | null>(null);
export const isLoadingAtom = atom<boolean>(false);
export const isLoggedInAtom = atom<boolean>(false);

// Hooks
export const useUser = () => useAtom(userAtom);
export const useToken = () => useAtom(tokenAtom);
export const useIsLoading = () => useAtom(isLoadingAtom);
export const useIsLoggedIn = () => useAtom(isLoggedInAtom);
