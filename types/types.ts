export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface SubjectStats {
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

export interface Topic {
  _id: string;
  topicName: string;
  description: string;
  subject: Subject ; // subject _id
  isActive: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  questionCount?: number; // for UI
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
  questionDistribution: QuestionDistribution;
  topics: Topic[]; // populated topics
  __v: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Question {
  _id: string;
  text: string;
  options: { text: string; isCorrect: boolean }[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tier: 'free' | 'premium';
  topic: string; // topic _id
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
