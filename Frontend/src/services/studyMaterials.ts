import { api } from './api';

export interface Track {
  id: number;
  name: string;
  progress: number;
}

export interface Topic {
  id: number;
  name: string;
  trackId: number;
  progress: number;
  subtopics: Subtopic[];
}

export interface Subtopic {
  id: number;
  name: string;
  topicId: number;
  isRead: boolean;
  articleSlug: string;
}

export interface JobRole {
  id: number;
  name: string;
  description: string;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  trackId: number;
  topicId: number;
  subtopicId?: number;
  jobRoleIds: number[];
}

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
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const studyMaterialService = {
  async getAllTracks(): Promise<Track[]> {
    const response = await api.get('/articles/tracks');
    return response.data.data;
  },

  async getTopicsByTrackId(trackId: number): Promise<Topic[]> {
    const response = await api.get(`/articles/tracks/${trackId}/topics`);
    return response.data.data;
  },

  async getSubtopicsByTopicId(topicId: number): Promise<Subtopic[]> {
    const response = await api.get(`/articles/topics/${topicId}/subtopics`);
    return response.data.data;
  },

  async getAllJobRoles(): Promise<JobRole[]> {
    const response = await api.get('/articles/job-roles');
    return response.data.data;
  },

  async searchArticles(searchTerm?: string, page: number = 0, size: number = 10): Promise<PaginatedResponse<Article>> {
    const params = new URLSearchParams();
    if (searchTerm) params.append('searchTerm', searchTerm);
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    const response = await api.get(`/articles/search?${params.toString()}`);
    return response.data.data;
  },

  async createArticle(request: CreateArticleRequest): Promise<Article> {
    const response = await api.post('/articles', request, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data.data;
  },

  // Track article read
  async trackArticleRead(articleId: number): Promise<void> {
    await api.post(`/user-article-reads/track/${articleId}`);
  },

  // Check if user has read an article
  async hasUserReadArticle(articleId: number): Promise<boolean> {
    const response = await api.get(`/user-article-reads/check/${articleId}`);
    return response.data.data;
  },

  // Get total articles read by user
  async getTotalArticlesReadByUser(): Promise<number> {
    const response = await api.get('/user-article-reads/total');
    return response.data.data;
  },

  // Get articles read by user for a specific topic
  async getArticlesReadByUserForTopic(topicId: number): Promise<number> {
    const response = await api.get(`/user-article-reads/topic/${topicId}`);
    return response.data.data;
  }
}; 