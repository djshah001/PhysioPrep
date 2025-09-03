export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface SubjectStats {
  totalTopics: number;
  totalQuestions: number;
  freeQuestions: number;
  premiumQuestions: number;
  totalQuizzes: number;
  totalTests: number;
}

export interface QuestionDistribution {
  free: number;
  premium: number;
}

export interface TopicStats {
  totalQuestions: number;
  freeQuestions: number;
  premiumQuestions: number;
  activeQuestions: number;
  inactiveQuestions: number;
  averageDifficulty: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  totalAttempts: number;
  averageScore: number;
  completionRate: number;
  popularityScore: number;
  lastActivityDate: string;
}

export interface Topic {
  _id: string;
  topicName: string;
  descriptionJson: string;
  descriptionHtml: string;
  subject: Subject; // subject _id
  isActive: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  questionCount?: number; // for UI
  stats?: TopicStats;
}

export interface Subject {
  id: string;
  _id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
  color: string;
  isActive: boolean;
  order: number;
  categories: Category[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  stats: SubjectStats;
  userStats: UserStats;
  questionDistribution: QuestionDistribution;
  topics: Topic[]; // populated topics
  __v: number;
}

export interface correctAnswers {
  text: string;
  isCorrect: boolean;
  _id: string;
}

export interface Quiz {
  sessionId: string; // Simple session ID
  subject: Subject;
  totalQuestions: number;
  questions: Question[];
  correctAnswers: number[];
  createdAt: string;
  timeLimit: number; // 10 minutes in milliseconds
  mode: 'subject-quiz' | 'topic-quiz';
}

export interface Question {
  _id: string;
  text: string;
  options: { _id?: string; text: string; isCorrect: boolean }[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tier: 'free' | 'premium';
  topic: Topic; // topic _id
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  subject?: Subject; // subject _id
  explanationJson?: string;
  explanationHtml?: string;
  usageCount?: number;
  correctAnswerCount?: number;
  averageTimeSpent?: number;
  lastAttemptDate?: string;
}

export interface quizAnswerType {
  questionId: string;
  selectedAnswer: number;
}

export type TopicFormValues = {
  topicName: string;
  description: string;
  isActive?: boolean;
};

export interface QuestionFormValues {
  text: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tier: 'free' | 'premium';
}

// API Response Types
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  errors: { msg: string; field?: string }[];
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  _id: string;
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

export interface UserPreferences {
  notifications: boolean;
  dailyReminder: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface UserStats {
  totalQuizzesTaken: number;
  totalTestsTaken: number;
  totalQuestionsAnswered: number;
  correctlyAnsweredQuestions: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

// Dashboard Types
export interface DashboardProgress {
  totalQuizzes: number;
  totalTests: number;
  averageScore: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'quiz' | 'test';
  subject: string;
  score: number;
  date: string;
}

export interface UpcomingQuiz {
  id: string;
  subject: string;
  topic?: string;
  scheduledDate: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuickStats {
  todayQuizzes: number;
  weeklyProgress: number;
  currentStreak: number;
  totalPoints: number;
}

// Quiz and Test Types
export interface QuizSubmissionData {
  answers: number[];
  timeSpent?: number;
}

export interface TestSubmissionData {
  answers: number[];
  timeSpent?: number;
}

export interface TestStartData {
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
}

// Topic API Types
export interface TopicCreateData {
  topicName: string;
  description: string;
  subject: string;
  isActive?: boolean;
  isPremium?: boolean;
}

export interface TopicUpdateData {
  topicName?: string;
  description?: string;
  isActive?: boolean;
  isPremium?: boolean;
}

export interface TopicWithSubjectResponse {
  topic: Topic;
  subject: Subject;
}

export interface TopicDeleteResponse {
  msg: string;
  subject: Subject;
}

// Question API Types
export interface QuestionCreateData {
  text: string;
  options: { text: string; isCorrect: boolean }[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tier: 'free' | 'premium';
  topic: string;
}

export interface QuestionUpdateData {
  text?: string;
  options?: { text: string; isCorrect: boolean }[];
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tier?: 'free' | 'premium';
  isActive?: boolean;
}

export interface QuestionQueryParams {
  page?: number;
  limit?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  tier?: 'free' | 'premium';
  isActive?: boolean;
}
