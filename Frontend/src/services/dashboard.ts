import { api } from './api';

export interface TopicProgress {
  topicName: string;
  articlesRead: number;
  totalArticles: number;
  questionsSolved: number;
  totalQuestions: number;
  progress: number;
  // Legacy fields for backward compatibility
  solved: number;
  total: number;
}

export const dashboardService = {
  async getTopicProgress(): Promise<TopicProgress[]> {
    const response = await api.get('/dashboard/topic-progress');
    return response.data;
  },

  async getOverallProgress(): Promise<TopicProgress> {
    const response = await api.get('/dashboard/overall-progress');
    return response.data;
  }
}; 