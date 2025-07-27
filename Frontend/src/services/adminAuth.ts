import { api } from './api';

const API_URL = '/admin';

interface AdminSignInRequest {
  username: string;
  password: string;
}

interface AdminAuthResponse {
  token: string;
}

class AdminAuthService {
  async signIn(data: AdminSignInRequest): Promise<AdminAuthResponse> {
    const response = await api.post(`${API_URL}/auth/signin`, data);
    return response.data.data;
  }

  async signOut(): Promise<void> {
    const token = localStorage.getItem('adminToken');
    if (token) {
      await api.post(`${API_URL}/auth/signout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  }
}

export const adminAuthService = new AdminAuthService(); 