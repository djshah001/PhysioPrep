export const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_URL || 'https://physioprep-server-942466930755.us-south1.run.app';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  REFRESH: '/api/auth/refresh',
  
  // User endpoints
  PROFILE: '/api/users/profile',
  STATS: '/api/users/me/stats',
  
  // Pro endpoints
  PRO_STATUS: '/api/pro/status',
  PRO_FEATURES: '/api/pro/features',
  
  // Stripe endpoints
  CREATE_PAYMENT_INTENT: '/api/stripe/create-payment-intent',
  CONFIRM_PAYMENT: '/api/stripe/confirm-payment',
  PAYMENT_HISTORY: '/api/stripe/payment-history',
  STRIPE_CONFIG: '/api/stripe/config',
  
  // Subject endpoints
  SUBJECTS: '/api/subjects',
  
  // Question endpoints
  QUESTIONS: '/api/questions',
  
  // Quiz endpoints
  QUIZZES: '/api/quizzes',
  
  // Test endpoints
  TESTS: '/api/tests',
  
  // Topic endpoints
  TOPICS: '/api/topics',
  
  // Daily question endpoints
  DAILY_QUESTIONS: '/api/daily-questions',
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
};
