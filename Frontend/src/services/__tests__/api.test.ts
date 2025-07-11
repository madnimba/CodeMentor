import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    })),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  removeItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('API Service', () => {
  let mockAxiosInstance: any;
  let requestInterceptor: any;
  let responseInterceptor: any;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);

    // Create a mock axios instance
    mockAxiosInstance = {
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    // Mock axios.create to return our mock instance
    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance);

    // Capture the interceptor functions when they're registered
    mockAxiosInstance.interceptors.request.use.mockImplementation((success: any, error: any) => {
      requestInterceptor = { success, error };
    });

    mockAxiosInstance.interceptors.response.use.mockImplementation((success: any, error: any) => {
      responseInterceptor = { success, error };
    });

    // Re-import the api module to trigger the interceptor setup
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('API Configuration', () => {
    it('creates axios instance with correct base configuration', async () => {
      // Import api to trigger axios.create
      await import('../api');

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: '/api/v1',
        withCredentials: true,
      });
    });

    it('sets up request and response interceptors', async () => {
      // Import api to trigger interceptor setup
      await import('../api');

      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('Request Interceptor', () => {
    beforeEach(async () => {
      // Import api to set up interceptors
      await import('../api');
    });

    it('adds Authorization header when token exists in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('test-token');

      const config = { headers: {} };
      const result = requestInterceptor.success(config);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('does not add Authorization header when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const config = { headers: {} };
      const result = requestInterceptor.success(config);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('returns config unchanged when token is empty string', () => {
      localStorageMock.getItem.mockReturnValue('');

      const config = { headers: {} };
      const result = requestInterceptor.success(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('handles request errors', async () => {
      const error = new Error('Request error');
      
      await expect(requestInterceptor.error(error)).rejects.toThrow('Request error');
    });

    it('preserves existing headers', () => {
      localStorageMock.getItem.mockReturnValue('test-token');

      const config = { 
        headers: { 
          'Content-Type': 'application/json',
          'Custom-Header': 'custom-value'
        } 
      };
      const result = requestInterceptor.success(config);

      expect(result.headers['Content-Type']).toBe('application/json');
      expect(result.headers['Custom-Header']).toBe('custom-value');
      expect(result.headers.Authorization).toBe('Bearer test-token');
    });
  });

  describe('Response Interceptor', () => {
    beforeEach(async () => {
      // Import api to set up interceptors
      await import('../api');
      mockLocation.href = '';
    });

    it('returns response unchanged for successful requests', () => {
      const response = { data: { message: 'success' }, status: 200, config: {
    url: '/api/v1/example-endpoint',
  },};
      const result = responseInterceptor.success(response);

      expect(result).toEqual(response);
    });

    it('handles 401 unauthorized errors', async () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };

      // 401 errors should still reject the promise after handling token removal and redirect
      await expect(responseInterceptor.error(error)).rejects.toEqual(error);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(mockLocation.href).toBe('/auth');
    });

    it('does not redirect for non-401 errors', async () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Server error' }
        }
      };

      await expect(responseInterceptor.error(error)).rejects.toEqual(error);
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
      expect(mockLocation.href).toBe('');
    });

    it('handles errors without response object', async () => {
      const error = new Error('Network error');

      await expect(responseInterceptor.error(error)).rejects.toThrow('Network error');
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    });

    it('handles errors with response but no status', async () => {
      const error = {
        response: {
          data: { message: 'Unknown error' }
        }
      };

      await expect(responseInterceptor.error(error)).rejects.toEqual(error);
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    });

    it('clears token and redirects only for 401 status', async () => {
      const error401 = {
        response: { status: 401 }
      };

      const error403 = {
        response: { status: 403 }
      };

      // Test 401 - should reject promise after handling token removal and redirect
      await expect(responseInterceptor.error(error401)).rejects.toEqual(error401);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(mockLocation.href).toBe('/auth');

      // Reset mocks
      vi.clearAllMocks();
      mockLocation.href = '';

      // Test 403 (should not redirect)
      await expect(responseInterceptor.error(error403)).rejects.toEqual(error403);
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
      expect(mockLocation.href).toBe('');
    });
  });

  describe('Token Management', () => {
    beforeEach(async () => {
      await import('../api');
    });

    it('reads token from localStorage on each request', () => {
      localStorageMock.getItem.mockReturnValue('token1');
      
      let config = { headers: {} };
      requestInterceptor.success(config);
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
      expect(config.headers.Authorization).toBe('Bearer token1');

      // Simulate token change
      localStorageMock.getItem.mockReturnValue('token2');
      
      config = { headers: {} };
      requestInterceptor.success(config);
      
      expect(config.headers.Authorization).toBe('Bearer token2');
    });

    it('removes token from localStorage on 401 error', async () => {
      const error = {
        response: { status: 401 }
      };

      // 401 errors should still reject the promise after handling token removal
      await expect(responseInterceptor.error(error)).rejects.toEqual(error);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await import('../api');
    });

    it('maintains error object structure for non-401 errors', async () => {
      const originalError = {
        response: {
          status: 400,
          data: { message: 'Bad request', errors: ['Field is required'] }
        },
        message: 'Request failed with status code 400'
      };

      await expect(responseInterceptor.error(originalError)).rejects.toEqual(originalError);
    });

    it('handles network errors without response', async () => {
      const networkError = {
        message: 'Network Error',
        code: 'NETWORK_ERROR'
      };

      await expect(responseInterceptor.error(networkError)).rejects.toEqual(networkError);
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
    });
  });
}); 