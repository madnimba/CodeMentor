import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/auth';

export interface SignUpRequest {
  email: string;
  username: string;
  password: string;
}

export interface SignInRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export const authService = {
  async signUp(data: SignUpRequest): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/signup`, data);
    return response.data;
  },

  async signIn(data: SignInRequest): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/signin`, data);
    return response.data;
  },
}; 