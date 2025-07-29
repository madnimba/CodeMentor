// src/services/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "/api/v1", // Updated with correct context path
  withCredentials: true, // if you use cookies/session
});


/*export const api = axios.create({
  baseURL: "http://localhost:8080/api/v1", // Updated with correct context path
  withCredentials: true, // if you use cookies/session
});*/

// Add a request interceptor to include the authorization header
api.interceptors.request.use(
  (config) => {
    // Don't send Authorization header for public endpoints (GET requests only)
    const publicEndpoints = ['/auth'];
    const publicGetEndpoints = ['/articles'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.startsWith(endpoint)
    );
    const isPublicGetEndpoint = config.method?.toLowerCase() === 'get' && 
      publicGetEndpoints.some(endpoint => config.url?.startsWith(endpoint));
    
    // Check if it's an admin endpoint
    const isAdminEndpoint = config.url?.startsWith('/admin');
    
    let token = null;
    if (!isPublicEndpoint && !isPublicGetEndpoint) {
      // For admin endpoints, use admin token, otherwise use regular token
      token = isAdminEndpoint 
        ? localStorage.getItem('adminToken') 
        : localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    console.log('API Request:', config.method?.toUpperCase(), config.url, {
      isAdminEndpoint,
      hasToken: !!token,
      headers: config.headers
    });
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
      // Check if it's an admin endpoint
      const isAdminEndpoint = error.config?.url?.startsWith('/admin');
      if (isAdminEndpoint) {
        // Admin token is invalid or expired, redirect to admin login
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/auth';
      } else {
        // Regular token is invalid or expired, redirect to login
        localStorage.removeItem('token');
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);