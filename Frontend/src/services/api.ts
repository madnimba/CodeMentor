// src/services/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "/api/v1", // or your backend URL
  // baseURL: "http://localhost:8080/api/v1",
  withCredentials: true, // if you use cookies/session
});

// Add a request interceptor to include the authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired, redirect to login
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);