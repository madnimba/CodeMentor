import { api } from './api';

export interface CreateQuestionRequest {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  importanceTag?: string;
  trackId: number;
  subtopicId?: number;
  companyId?: number;
  testcases: TestcaseRequest[];
}

export interface TestcaseRequest {
  input: string;
  expectedOutput: string;
  timeLimitMs?: number;
  isPublic?: boolean;
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
  createdAt: string;
  testcases: TestcaseResponse[];
}

export interface TestcaseResponse {
  id: number;
  input: string;
  expectedOutput: string;
  timeLimitMs: number;
  isPublic: boolean;
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