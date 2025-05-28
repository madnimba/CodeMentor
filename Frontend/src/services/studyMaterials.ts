import { api } from './api.ts';

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
  }
}; 