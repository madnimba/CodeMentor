import { api } from './api';

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  trackId: number;
  trackName: string;
  topicId: number;
  topicName: string;
  subtopicId?: number;
  subtopicName?: string;
  createdById: number;
  createdByUsername: string;
  isApproved: boolean;
  createdAt: string;
  jobRoleIds: number[];
  questionIds: number[];
  isRead: boolean;
  readAt?: string;
}

export const articleService = {
  // Get articles by subtopic ID
  getArticlesBySubtopicId: async (subtopicId: number): Promise<Article[]> => {
    const response = await api.get(`/articles/by-subtopic/${subtopicId}`);
    return response.data.data;
  },

  // Get article by ID
  getArticleById: async (id: number): Promise<Article> => {
    const response = await api.get(`/articles/${id}`);
    return response.data.data;
  },

  // Mark article as read
  markArticleAsRead: async (id: number): Promise<Article> => {
    const response = await api.post(`/articles/${id}/mark-read`);
    return response.data.data;
  },

  // Get articles with filters
  getArticles: async (params?: {
    trackId?: number;
    topicId?: number;
    subtopicId?: number;
    jobRoleId?: number;
    page?: number;
    size?: number;
  }): Promise<{ content: Article[]; totalElements: number; totalPages: number }> => {
    const response = await api.get('/articles', { params });
    return response.data.data;
  }
}; 