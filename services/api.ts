import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Topic, Subject, quizAnswerType } from 'types/types';

const API_URL = 'http://10.39.61.172:5000/api';

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

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),

  getCurrentUser: () => api.get('/auth/me'),

  logout: () => api.post('/auth/logout'),
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
  startComprehensive: (data: { count: number; duration: number; difficulty?: 'easy' | 'medium' | 'hard' | 'mixed' }) =>
    api.post('/tests/comprehensive/start', data),
  submitComprehensive: (
    data: { sessionId: string; answers: { questionId: string; selectedAnswer: number }[]; timeSpent?: number }
  ) => api.post('/tests/comprehensive/submit', data),
};

export default api;
