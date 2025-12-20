import { atom } from 'jotai';

export type FavoriteSubject = {
  id: string;
  name: string;
  slug?: string | null;
  color?: string | null;
  attempts: number;
  correct?: number;
};

export type RecentActivityItem = {
  id: string;
  subjectName: string;
  subjectColor: string;
  isCorrect: boolean;
  timeSpent: number;
  createdAt: string;
};

export type BadgeDetails = {
  name: string;
  icon: string;
  color: string;
  description?: string;
};

export type UserHomeStats = {
  totalQuestions: number;
  totalCorrectlyAnswered: number;
  totalQuestionAttempts: number;

  // Gamification Data from Methods
  xp: number;
  level: number;
  currentBadge: BadgeDetails; // { name: "Master", icon: "💎", ... }

  // Pro Subscription Data
  isPro: boolean;
  proExpiresAt: string | null;
  proActivatedAt: string | null;

  // Progress Bar Data
  xpToNextLevel: number; // e.g., 500
  xpInCurrentLevel: number; // e.g., 250
  levelProgressPercent: number; // e.g., 50
  hasLeveledUp: boolean; // e.g., true

  currentStreak: number;
  accuracyPercentage: number; // e.g., 90
  questionsAnsweredToday: number;
  averageScore: number; // e.g., 90
  favoriteSubjects: FavoriteSubject[];
  questionsSolvedPerSubject:  {
      id: string;
      name: string;
      color: string;
      solved: number;
      totalQuestions: number;
    }[];
  recentActivity: RecentActivityItem[];
};

export const homeStatsAtom = atom<UserHomeStats | null>(null);
export const dailyQuestionVisibleAtom = atom<boolean>(false);
