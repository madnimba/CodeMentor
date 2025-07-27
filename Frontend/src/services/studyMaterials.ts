import { api } from './api';

export interface Track {
  id: number;
  name: string;
  progress: number;
}

export interface Topic {
  id: number;
  name: string;
  progress: number;
  subtopics: Subtopic[];
}

export interface Subtopic {
  id: number;
  name: string;
  isRead: boolean;
}

export interface JobRole {
  id: number;
  name: string;
  category?: string;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  trackId: number;
  topicId: number;
  subtopicId?: number;
  jobRoleIds?: number[];
  questionIds?: number[];
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

  async createArticle(request: CreateArticleRequest): Promise<Article> {
    const response = await api.post('/articles', request, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data.data;
  }
}; 