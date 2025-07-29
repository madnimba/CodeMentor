import { api } from './api';

export const articleReadApi = {
  markArticleAsRead: async (articleId: number): Promise<void> => {
    await api.post(`/user-article-reads/mark/${articleId}`);
  },

  markArticleAsUnread: async (articleId: number): Promise<void> => {
    await api.delete(`/user-article-reads/${articleId}`);
  },

  hasUserReadArticle: async (articleId: number): Promise<boolean> => {
    const response = await api.get<{ success: boolean; data: boolean }>(`/user-article-reads/check/${articleId}`);
    return response.data.data;
  }
}; 