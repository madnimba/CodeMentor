import { api } from './api';

export interface CreateSubmissionRequest {
  questionId: number;
  code: string;
  language: string;
  status: 'accepted' | 'rejected';
  runtime?: number;
  memory?: number;

}

export interface SubmissionResponse {
  id: number;
  userId: number;
  username: string;
  questionId: number;
  questionTitle: string;
  code: string;
  language: string;
  status: 'accepted' | 'rejected';
  runtime: number | null;
  memory: number | null;
  submittedAt: string;

}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
}

export const submissionsApi = {
  // Submit code and save to database
  submitCode: async (request: CreateSubmissionRequest): Promise<SubmissionResponse> => {
    const response = await api.post<{ success: boolean; data: SubmissionResponse }>('/submissions', request);
    return response.data.data;
  },

  // Get submission by ID
  getSubmissionById: async (id: number): Promise<SubmissionResponse> => {
    const response = await api.get<{ success: boolean; data: SubmissionResponse }>(`/submissions/${id}`);
    return response.data.data;
  },

  // Get all submissions by user
  getSubmissionsByUser: async (userId: number): Promise<SubmissionResponse[]> => {
    const response = await api.get<{ success: boolean; data: SubmissionResponse[] }>(`/submissions/user/${userId}`);
    return response.data.data;
  },

  // Get all submissions by question
  getSubmissionsByQuestion: async (questionId: number): Promise<SubmissionResponse[]> => {
    const response = await api.get<{ success: boolean; data: SubmissionResponse[] }>(`/submissions/question/${questionId}`);
    return response.data.data;
  },

  // Get user submissions for a specific question
  getUserSubmissionsForQuestion: async (userId: number, questionId: number): Promise<SubmissionResponse[]> => {
    const response = await api.get<{ success: boolean; data: SubmissionResponse[] }>(`/submissions/user/${userId}/question/${questionId}`);
    return response.data.data;
  },

  // Get total questions attempted by current user
  getTotalQuestionsAttempted: async (): Promise<number> => {
    const response = await api.get<{ success: boolean; data: number }>('/submissions/stats/attempted');
    return response.data.data;
  },

  // Get total questions solved by current user
  getTotalQuestionsSolved: async (): Promise<number> => {
    const response = await api.get<{ success: boolean; data: number }>('/submissions/stats/solved');
    return response.data.data;
  },

  // Get accuracy rate for current user
  getAccuracyRate: async (): Promise<number> => {
    const response = await api.get<{ success: boolean; data: number }>('/submissions/stats/accuracy');
    return response.data.data;
  },

  // Get streak stats for current user
  getStreakStats: async (): Promise<StreakStats> => {
    const response = await api.get<{ success: boolean; data: StreakStats }>('/submissions/stats/streak');
    return response.data.data;
  }
}; 