// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { authService } from '../auth';
// import axios from 'axios';

// // Mock axios
// vi.mock('axios');
// const mockedAxios = axios as jest.Mocked<typeof axios>;

// describe('authService', () => {
//   beforeEach(() => {
//     vi.clearAllMocks();
//   });

//   describe('signUp', () => {
//     it('should make a POST request to signup endpoint', async () => {
//       const mockResponse = { data: { token: 'test-token' } };
//       mockedAxios.post.mockResolvedValue(mockResponse);

//       const signUpData = {
//         email: 'test@example.com',
//         username: 'testuser',
//         password: 'password123',
//       };

//       const result = await authService.signUp(signUpData);

//       expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/auth/signup', signUpData);
//       expect(result).toEqual({ token: 'test-token' });
//     });
//   });

//   describe('signIn', () => {
//     it('should make a POST request to signin endpoint', async () => {
//       const mockResponse = { data: { token: 'test-token' } };
//       mockedAxios.post.mockResolvedValue(mockResponse);

//       const signInData = {
//         username: 'testuser',
//         password: 'password123',
//       };

//       const result = await authService.signIn(signInData);

//       expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/auth/signin', signInData);
//       expect(result).toEqual({ token: 'test-token' });
//     });
//   });
// }); 