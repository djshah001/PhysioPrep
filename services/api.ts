import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Topic, Subject, quizAnswerType } from 'types/types';
import { router } from 'expo-router';

const API_URL = 'http://10.75.7.172:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log(error.response?.data);
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized) or 403 (Forbidden) and we haven't already tried to refresh
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        console.log('Token expired, attempting refresh...');

        // Get refresh token from storage
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh endpoint
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        console.log('Token refreshed successfully');

        // Update tokens in AsyncStorage
        await Promise.all([
          AsyncStorage.setItem('token', accessToken),
          AsyncStorage.setItem('refreshToken', newRefreshToken),
        ]);

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // Clear all auth data
        await Promise.all([
          AsyncStorage.removeItem('token'),
          AsyncStorage.removeItem('refreshToken'),
          AsyncStorage.removeItem('user'),
          AsyncStorage.removeItem('isLoggedIn'),
        ]);

        // You can emit an event or use a callback to handle logout in your app
        // For example, you might want to navigate to login screen
        // This depends on your app's navigation setup

        router.replace('/login');

        return Promise.reject(refreshError);
      }
    }

    // await Promise.all([
    //   AsyncStorage.removeItem('token'),
    //   AsyncStorage.removeItem('refreshToken'),
    //   AsyncStorage.removeItem('user'),
    //   AsyncStorage.removeItem('isLoggedIn'),
    // ]);
    // router.replace('/login');
    return Promise.reject(error);
  }
);

export const healthApi = {
  getHealth: () => api.get('/health'),
};

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),

  getCurrentUser: () => api.get('/auth/me'),

  logout: () => api.post('/auth/logout'),

  // Add refresh endpoint
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),

  // Google OAuth endpoints
  googleAuth: (token: string) => api.post('/auth/google', { token }),

  linkGoogleAccount: (token: string) => api.post('/auth/google/link', { token }),
};

export const dashboardApi = {
  getProgress: () => api.get('/dashboard/progress'),
  getUpcomingQuizzes: () => api.get('/dashboard/upcoming-quizzes'),
  getQuickStats: () => api.get('/dashboard/quick-stats'),
};

export const quizApi = {
  getQuizById: (id: string) => api.get(`/quizzes/${id}`),
  getQuizQuestions: (id: string) => api.get(`/quizzes/${id}/questions`),
  startSubjectQuiz: (subjectId: string) => api.post(`/quizzes/subject/${subjectId}/start`),
  startTopicQuiz: (topicId: string) => api.post(`/quizzes/topic/${topicId}/start`),
  submitQuiz: (quizId: string, data: { answers: quizAnswerType[]; timeSpent?: number }) =>
    api.post(`/quizzes/submit`, data),
};

export const subjectApi = {
  getSubjects: () => api.get('/subjects'),
  getSubjectById: (id: string) => api.get(`/subjects/${id}`),
  getTopics: (subjectId: string) => api.get(`/subjects/${subjectId}/topics`),
};

export type TopicWithSubjectResponse = {
  topic: Topic;
  subject: Subject;
};

export const topicApi = {
  getAll: () => api.get('/topics'),
  getById: (id: string) => api.get(`/topics/${id}`),
  create: (data: any) =>
    api.post<{ success: boolean; data: TopicWithSubjectResponse }>('/topics', data),
  update: (id: string, data: any) =>
    api.put<{ success: boolean; data: TopicWithSubjectResponse }>(`/topics/${id}`, data),
  delete: (id: string) =>
    api.delete<{ success: boolean; data: { msg: string; subject: Subject } }>(`/topics/${id}`),
};

export const questionApi = {
  getByTopic: (topicId: string, params?: Record<string, any>) =>
    api.get(`/questions/topic/${topicId}`, { params }),
  getById: (id: string) => api.get(`/questions/${id}`),
  create: (data: any) => api.post('/questions', data),
  update: (id: string, data: any) => api.put(`/questions/${id}`, data),
  delete: (id: string) => api.delete(`/questions/${id}`),
};

export const testApi = {
  startComprehensive: (data: {
    count: number;
    duration: number;
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  }) => api.post('/tests/comprehensive/start', data),
  submitComprehensive: (data: {
    sessionId: string;
    answers: { questionId: string; selectedAnswer: number }[];
    timeSpent?: number;
  }) => api.post('/tests/comprehensive/submit', data),
};

export default api;
