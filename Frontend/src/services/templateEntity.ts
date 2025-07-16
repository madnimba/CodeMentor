// src/services/templateEntity.ts
import { api } from './api';

// Types for the template entity
export interface TemplateEntity {
  id: number;
  name: string;
  description?: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: number;
  createdByUsername: string;
  displayName: string;
}

export interface CreateTemplateEntityRequest {
  name: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isActive?: boolean;
}

export interface TemplateEntitySearchParams {
  name?: string;
  status?: string;
  page?: number;
  size?: number;
}

// API functions for template entities
export const templateEntityService = {
  /**
   * Create a new template entity
   */
  async create(data: CreateTemplateEntityRequest): Promise<TemplateEntity> {
    const response = await api.post('/template-entities', data);
    return response.data.data;
  },

  /**
   * Get template entity by ID
   */
  async getById(id: number): Promise<TemplateEntity> {
    const response = await api.get(`/template-entities/${id}`);
    return response.data.data;
  },

  /**
   * Get all template entities with pagination
   */
  async getAll(params?: TemplateEntitySearchParams): Promise<{
    content: TemplateEntity[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.name) queryParams.append('name', params.name);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());

    const response = await api.get(`/template-entities?${queryParams.toString()}`);
    return response.data.data;
  },

  /**
   * Search template entities by name
   */
  async search(name: string, page = 0, size = 10): Promise<{
    content: TemplateEntity[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
  }> {
    const response = await api.get(`/template-entities/search?name=${encodeURIComponent(name)}&page=${page}&size=${size}`);
    return response.data.data;
  },

  /**
   * Get template entities by status
   */
  async getByStatus(status: string): Promise<TemplateEntity[]> {
    const response = await api.get(`/template-entities/status/${status}`);
    return response.data.data;
  },

  /**
   * Update template entity
   */
  async update(id: number, data: CreateTemplateEntityRequest): Promise<TemplateEntity> {
    const response = await api.put(`/template-entities/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete template entity
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/template-entities/${id}`);
  },
}; 