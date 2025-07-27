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

export const companiesService = {
  async getAllCompanies(): Promise<Company[]> {
    const response = await api.get('/companies');
    return response.data;
  },

  async getCompanyById(id: number): Promise<Company> {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  }
}; 