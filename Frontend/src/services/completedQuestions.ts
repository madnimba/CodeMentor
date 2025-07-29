import { api } from './api';

export interface MarkQuestionCompletedRequest {
  questionId: number;
}

export const completedQuestionsApi = {
  // Mark a question as completed
  markQuestionCompleted: async (request: MarkQuestionCompletedRequest): Promise<void> => {
    await api.post('/completed-questions/mark', request);
  },

  // Check if user has completed a question
  hasUserCompletedQuestion: async (questionId: number): Promise<boolean> => {
    const response = await api.get<{ success: boolean; data: boolean }>(`/completed-questions/check/${questionId}`);
    return response.data.data;
  },

  // Remove completion status for a question
  removeQuestionCompletion: async (questionId: number): Promise<void> => {
    await api.delete(`/completed-questions/${questionId}`);
  }
}; 