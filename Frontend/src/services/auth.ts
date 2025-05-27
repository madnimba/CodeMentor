import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
}

export const authService = {
  async signUp(data: AuthRequest): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/signup`, data);
    return response.data;
  },

  async signIn(data: AuthRequest): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/signin`, data);
    return response.data;
  },
}; 