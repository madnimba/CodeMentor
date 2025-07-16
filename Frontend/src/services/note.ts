// src/services/templateEntity.ts
import { api } from './api';

// Types for the note entity
export interface Note {
  id: number;
  noteTitle: string;
  description?: string;
  updatedAt: string;
  createdById: number;
  createdByUsername: string; 
}

export interface CreateNoteRequest {
  noteTitle: string;
  description?: string;
}

export interface NoteSearchParams {
  noteTitle?: string;
  page?: number;
  size?: number;
}

// API functions for template entities
export const noteService = {
  /**
   * Create a new template entity
   */
  async create(data: CreateNoteRequest): Promise<Note> {
    const response = await api.post('/notes', data);
    return response.data.data;
  },

  /**
   * Get template entity by ID
   */
  async getById(id: number): Promise<Note> {
    const response = await api.get(`/notes/${id}`);
    return response.data.data;
  },

  /**
   * Get all template entities with pagination
   */
  async getAll(params?: NoteSearchParams): Promise<{
    content: Note[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.noteTitle) queryParams.append('noteTitle', params.noteTitle);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());

    const response = await api.get(`/notes?${queryParams.toString()}`);
    return response.data.data;
  },

  /**
   * Search template entities by name
   */
  async search(name: string, page = 0, size = 10): Promise<{
    content: Note[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
  }> {
    const response = await api.get(`/notes/search?name=${encodeURIComponent(name)}&page=${page}&size=${size}`);
    return response.data.data;
  },

  /**
   * Get template entities by status
   */
  async getByStatus(status: string): Promise<Note[]> {
    const response = await api.get(`/notes/status/${status}`);
    return response.data.data;
  },

  /**
   * Update template entity
   */
  async update(id: number, data: CreateNoteRequest): Promise<Note> {
    const response = await api.put(`/notes/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete template entity
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/notes/${id}`);
  },
}; 