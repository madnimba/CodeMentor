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
  }
}; 