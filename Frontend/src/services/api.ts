// src/services/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "/api/v1", // Updated with correct context path
  withCredentials: true, // if you use cookies/session
});

// Add a request interceptor to include the authorization header
api.interceptors.request.use(
  (config) => {
    // Don't send Authorization header for public endpoints
    const publicEndpoints = ['/auth', '/companies', '/articles'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.startsWith(endpoint)
    );
    
    if (!isPublicEndpoint) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.message);
    if (error.response?.status === 401) {
      // Token is invalid or expired, redirect to login
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);