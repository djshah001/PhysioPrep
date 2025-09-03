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
  questionId: string;
  subjectId: string | null;
  isCorrect: boolean;
  timeSpent: number;
  attemptedAt: string;
};

export type UserHomeStats = {
  totalCorrectlyAnswered: number;
  totalQuestionAttempts: number;
  currentStreak: number;
  accuracyPercentage: number;
  questionsAnsweredToday: number;
  averageTimePerQuestion: number;
  favoriteSubjects: FavoriteSubject[];
  recentActivity: RecentActivityItem[];
  questionsSolvedPerSubject: any[];
  totalQuestions: number;
};

export const homeStatsAtom = atom<UserHomeStats | null>(null);
export const homeLoadingAtom = atom<boolean>(false);
export const dailyQuestionVisibleAtom = atom<boolean>(false);

