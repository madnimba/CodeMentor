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
  testcases: TestcaseResponse[];
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

export const questionService = {
  async createQuestion(request: CreateQuestionRequest): Promise<Question> {
    const response = await api.post('/questions', request, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data.data;
  }
}; 