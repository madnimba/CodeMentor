import { api } from './api';

export interface CreateQuestionRequest {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  importanceTag?: string;
  trackId: number;
  subtopicId?: number;
  companyId?: number;
  isCoding?: boolean;
  question_year?: number;
  testcases: TestcaseRequest[];
}

export interface TestcaseRequest {
  test1: string;
  output1: string;
  test2?: string;
  output2?: string;
  test3?: string;
  output3?: string;
}

export interface Question {
  id: number;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  importanceTag?: string;
  trackId: number;
  trackName: string;
  subtopicId?: number;
  subtopicName?: string;
  createdById: number;
  createdByUsername: string;
  upvotes: number;
  downvotes: number;
  isApproved: boolean;
  isCoding: boolean;
  createdAt: string;
  question_year: number;
  testcases: TestcaseResponse[];
  isCompleted?: boolean; // Whether the current user has completed this question
}

export interface TestcaseResponse {
  id: number;
  test1: string;
  output1: string;
  test2?: string;
  output2?: string;
  test3?: string;
  output3?: string;
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

export const questionService = {
  async createQuestion(request: CreateQuestionRequest): Promise<Question> {
    const response = await api.post('/questions', request, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data.data;
  },

  async getCodingQuestionsPaginated(page: number = 0, size: number = 10): Promise<PaginatedResponse<Question>> {
    const response = await api.get(`/questions/coding/paginated?page=${page}&size=${size}`);
    return response.data.data;
  },

  async searchQuestions(searchTerm?: string, isCoding?: boolean, page: number = 0, size: number = 10): Promise<PaginatedResponse<Question>> {
    const params = new URLSearchParams();
    if (searchTerm) params.append('searchTerm', searchTerm);
    if (isCoding !== undefined) params.append('isCoding', isCoding.toString());
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    const response = await api.get(`/questions/search?${params.toString()}`);
    return response.data.data;
  },

  async getRecommendedQuestions(articleId: number): Promise<Question[]> {
    const response = await api.get(`/articles/${articleId}/recommended-questions`);
    return response.data.data;
  }
}; 