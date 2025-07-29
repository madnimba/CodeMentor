import { api } from './api';

export interface Company {
  id: number;
  name: string;
  description: string;
  totalQuestions: number;
  solvedQuestions: number;
  logoUrl?: string;
  country?: string;
}

export interface CompanyQuestion {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  year: number;
  position: string;
  isCoding: boolean;
  status: string;
  tags: string[];
  solution?: string;
  importanceTag?: string;
}

export interface CompanyStats {
  id: number;
  name: string;
  description: string;
  totalQuestions: number;
  solvedQuestions: number;
  progressPercentage: number;
  logoUrl?: string;
  country?: string;
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

export const companiesService = {
  async getAllCompanies(): Promise<Company[]> {
    const response = await api.get('/companies');
    return response.data;
  },

  async getAllCompaniesPaginated(page: number = 0, size: number = 10): Promise<PaginatedResponse<Company>> {
    const response = await api.get(`/companies/paginated?page=${page}&size=${size}`);
    return response.data;
  },

  async searchCompanies(searchTerm?: string, page: number = 0, size: number = 10): Promise<PaginatedResponse<Company>> {
    const params = new URLSearchParams();
    if (searchTerm) params.append('searchTerm', searchTerm);
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    const response = await api.get(`/companies/search?${params.toString()}`);
    return response.data;
  },

  async getCompanyById(id: number): Promise<Company> {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  async getFeaturedCompanies(): Promise<CompanyStats[]> {
    const response = await api.get('/companies/featured');
    return response.data;
  },

  // Company Questions
  async getCompanyQuestions(companyId: number, page: number = 0, size: number = 10): Promise<PaginatedResponse<CompanyQuestion>> {
    const response = await api.get(`/companies/${companyId}/questions/paginated?page=${page}&size=${size}`);
    return response.data;
  },

  async searchCompanyQuestions(
    companyId: number,
    searchTerm?: string,
    isCoding?: boolean,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<CompanyQuestion>> {
    const params = new URLSearchParams();
    if (searchTerm) params.append('searchTerm', searchTerm);
    if (isCoding !== undefined) params.append('isCoding', isCoding.toString());
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    const response = await api.get(`/companies/${companyId}/questions/search?${params.toString()}`);
    return response.data;
  },

  async getCompanyQuestionsWithFilters(
    companyId: number,
    searchTerm?: string,
    trackId?: number,
    topicId?: number,
    subtopicId?: number,
    difficulty?: string,
    year?: number,
    isCoding?: boolean,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<CompanyQuestion>> {
    const params = new URLSearchParams();
    if (searchTerm) params.append('searchTerm', searchTerm);
    if (trackId) params.append('trackId', trackId.toString());
    if (topicId) params.append('topicId', topicId.toString());
    if (subtopicId) params.append('subtopicId', subtopicId.toString());
    if (difficulty) params.append('difficulty', difficulty);
    if (year) params.append('year', year.toString());
    if (isCoding !== undefined) params.append('isCoding', isCoding.toString());
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    const response = await api.get(`/companies/${companyId}/questions/filter?${params.toString()}`);
    return response.data;
  }
}; 