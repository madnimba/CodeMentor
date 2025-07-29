import { api } from './api';

const API_URL = '/admin';

// Types
export interface AdminDashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalQuestions: number;
  totalArticles: number;
  unapprovedArticles: number;
  unapprovedQuestions: number;
  activeUsersToday: number;
  newUsersThisWeek: number;
}

export interface AdminUser {
  id: number;
  email: string;
  username: string;
  createdAt: string;
  jobRole: string | null;
  themePreference: string | null;
  languagePreference: string | null;
  isAdmin: boolean;
}

export interface AdminArticle {
  id: number;
  title: string;
  slug: string;
  content: string;
  track: string | null;
  topic: string | null;
  subtopic: string | null;
  createdBy: string | null;
  isApproved: boolean;
  createdAt: string;
  jobRoles: string[];
  questionCount: number;
}

export interface AdminQuestion {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  importanceTag: string | null;
  track: string | null;
  subtopic: string | null;
  createdBy: string | null;
  isApproved: boolean;
  isCoding: boolean;
  createdAt: string;
  testcaseCount: number;
  solutionCount: number;
  companies: string[];
  year: number;
}

export interface AdminCompany {
  id: number;
  name: string;
  logoUrl: string | null;
  country: string | null;
  description: string | null;
  questionCount: number;
}

export interface UpdateUserRequest {
  email: string;
  username: string;
  jobRoleId?: number;
  themePreference?: string;
  languagePreference?: string;
  isAdmin?: boolean;
}

export interface UpdateArticleRequest {
  title: string;
  content: string;
  trackId: number;
  topicId: number;
  subtopicId?: number;
  isApproved?: boolean;
  jobRoleIds?: number[];
  questionIds?: number[];
}

export interface UpdateQuestionRequest {
  title: string;
  description: string;
  difficulty: string;
  importanceTag?: string;
  trackId: number;
  subtopicId?: number;
  isApproved?: boolean;
  isCoding?: boolean;
  year?: number;
  testcases?: Array<{
    input: string;
    expectedOutput: string;
    timeLimitMs: number;
    isPublic: boolean;
  }>;
}

export interface UpdateCompanyRequest {
  name: string;
  logoUrl?: string;
  country?: string;
  description?: string;
}

export interface CreateCompanyRequest {
  name: string;
  logoUrl?: string;
  country?: string;
  description?: string;
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

class AdminService {
  // Dashboard Stats
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await api.get(`${API_URL}/dashboard/stats`);
    return response.data.data;
  }

  // User Management
  async getAllUsers(page: number = 0, size: number = 10): Promise<PaginatedResponse<AdminUser>> {
    const response = await api.get(`${API_URL}/users?page=${page}&size=${size}`);
    return response.data.data;
  }

  async getUserById(id: number): Promise<AdminUser> {
    const response = await api.get(`${API_URL}/users/${id}`);
    return response.data.data;
  }

  async updateUser(id: number, data: UpdateUserRequest): Promise<AdminUser> {
    const response = await api.put(`${API_URL}/users/${id}`, data);
    return response.data.data;
  }

  async deleteUser(id: number): Promise<void> {
    await api.delete(`${API_URL}/users/${id}`);
  }

  // Article Management
  async getAllArticles(page: number = 0, size: number = 10): Promise<PaginatedResponse<AdminArticle>> {
    console.log('AdminService.getAllArticles called with:', { page, size });
    const response = await api.get(`${API_URL}/articles?page=${page}&size=${size}`);
    console.log('AdminService.getAllArticles response:', response.data);
    return response.data.data;
  }

  async getUnapprovedArticles(page: number = 0, size: number = 10): Promise<PaginatedResponse<AdminArticle>> {
    console.log('AdminService.getUnapprovedArticles called with:', { page, size });
    const response = await api.get(`${API_URL}/articles/unapproved?page=${page}&size=${size}`);
    console.log('AdminService.getUnapprovedArticles response:', response.data);
    return response.data.data;
  }

  async getArticleById(id: number): Promise<AdminArticle> {
    const response = await api.get(`${API_URL}/articles/${id}`);
    return response.data.data;
  }

  async updateArticle(id: number, data: UpdateArticleRequest): Promise<AdminArticle> {
    const response = await api.put(`${API_URL}/articles/${id}`, data);
    return response.data.data;
  }

  async deleteArticle(id: number): Promise<void> {
    await api.delete(`${API_URL}/articles/${id}`);
  }

  async approveArticle(id: number): Promise<AdminArticle> {
    const response = await api.post(`${API_URL}/articles/${id}/approve`);
    return response.data.data;
  }

  // Question Management
  async getAllQuestions(page: number = 0, size: number = 10): Promise<PaginatedResponse<AdminQuestion>> {
    console.log('AdminService.getAllQuestions called with:', { page, size });
    const response = await api.get(`${API_URL}/questions?page=${page}&size=${size}`);
    console.log('AdminService.getAllQuestions response:', response.data);
    return response.data.data;
  }

  async getUnapprovedQuestions(page: number = 0, size: number = 10): Promise<PaginatedResponse<AdminQuestion>> {
    console.log('AdminService.getUnapprovedQuestions called with:', { page, size });
    const response = await api.get(`${API_URL}/questions/unapproved?page=${page}&size=${size}`);
    console.log('AdminService.getUnapprovedQuestions response:', response.data);
    return response.data.data;
  }

  async getQuestionById(id: number): Promise<AdminQuestion> {
    const response = await api.get(`${API_URL}/questions/${id}`);
    return response.data.data;
  }

  async updateQuestion(id: number, data: UpdateQuestionRequest): Promise<AdminQuestion> {
    const response = await api.put(`${API_URL}/questions/${id}`, data);
    return response.data.data;
  }

  async deleteQuestion(id: number): Promise<void> {
    await api.delete(`${API_URL}/questions/${id}`);
  }

  async approveQuestion(id: number): Promise<AdminQuestion> {
    const response = await api.post(`${API_URL}/questions/${id}/approve`);
    return response.data.data;
  }

  // Company Management
  async getAllCompanies(page: number = 0, size: number = 10): Promise<PaginatedResponse<AdminCompany>> {
    console.log('AdminService.getAllCompanies called with:', { page, size });
    const response = await api.get(`${API_URL}/companies?page=${page}&size=${size}`);
    console.log('AdminService.getAllCompanies response:', response.data);
    return response.data.data;
  }

  async getCompanyById(id: number): Promise<AdminCompany> {
    const response = await api.get(`${API_URL}/companies/${id}`);
    return response.data.data;
  }

  async createCompany(data: CreateCompanyRequest): Promise<AdminCompany> {
    const response = await api.post(`${API_URL}/companies`, data);
    return response.data.data;
  }

  async updateCompany(id: number, data: UpdateCompanyRequest): Promise<AdminCompany> {
    const response = await api.put(`${API_URL}/companies/${id}`, data);
    return response.data.data;
  }

  async deleteCompany(id: number): Promise<void> {
    await api.delete(`${API_URL}/companies/${id}`);
  }

  async approveAllArticles(): Promise<{ message: string; count: number }> {
    const response = await api.post(`${API_URL}/articles/approve-all`);
    return response.data.data;
  }

  async approveAllQuestions(): Promise<{ message: string; count: number }> {
    const response = await api.post(`${API_URL}/questions/approve-all`);
    return response.data.data;
  }
}

export const adminService = new AdminService(); 