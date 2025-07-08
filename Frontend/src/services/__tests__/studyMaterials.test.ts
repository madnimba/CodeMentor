import { describe, it, expect, vi, beforeEach } from 'vitest';
import { studyMaterialService } from '../studyMaterials';
import { api } from '../api';

// Mock the api module
vi.mock('../api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('StudyMaterials Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllTracks', () => {
    it('fetches all tracks successfully', async () => {
      const mockTracks = [
        { id: 1, name: 'Data Structures & Algorithms', progress: 75 },
        { id: 2, name: 'System Design', progress: 50 },
        { id: 3, name: 'Database Systems', progress: 25 },
      ];

      const mockResponse = {
        data: {
          data: mockTracks,
          message: 'Tracks retrieved successfully'
        },
        status: 200
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await studyMaterialService.getAllTracks();

      expect(api.get).toHaveBeenCalledWith('/articles/tracks');
      expect(result).toEqual(mockTracks);
    });

    it('handles empty tracks list', async () => {
      const mockResponse = {
        data: {
          data: [],
          message: 'No tracks found'
        },
        status: 200
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await studyMaterialService.getAllTracks();

      expect(api.get).toHaveBeenCalledWith('/articles/tracks');
      expect(result).toEqual([]);
    });

    it('handles API errors', async () => {
      const mockError = new Error('Failed to fetch tracks');
      vi.mocked(api.get).mockRejectedValue(mockError);

      await expect(studyMaterialService.getAllTracks()).rejects.toThrow('Failed to fetch tracks');
      expect(api.get).toHaveBeenCalledWith('/articles/tracks');
    });

    it('handles network errors', async () => {
      const networkError = {
        message: 'Network Error',
        code: 'NETWORK_ERROR'
      };
      vi.mocked(api.get).mockRejectedValue(networkError);

      await expect(studyMaterialService.getAllTracks()).rejects.toEqual(networkError);
    });
  });

  describe('getTopicsByTrackId', () => {
    it('fetches topics for a specific track successfully', async () => {
      const trackId = 1;
      const mockTopics = [
        { 
          id: 1, 
          name: 'Arrays', 
          trackId: 1, 
          progress: 80,
          subtopics: [
            { id: 1, name: 'Array Basics', topicId: 1, isRead: true, articleSlug: 'array-basics' },
            { id: 2, name: 'Array Algorithms', topicId: 1, isRead: false, articleSlug: 'array-algorithms' }
          ]
        },
        { 
          id: 2, 
          name: 'Linked Lists', 
          trackId: 1, 
          progress: 60,
          subtopics: [
            { id: 3, name: 'Singly Linked List', topicId: 2, isRead: true, articleSlug: 'singly-linked-list' }
          ]
        },
      ];

      const mockResponse = {
        data: {
          data: mockTopics,
          message: 'Topics retrieved successfully'
        },
        status: 200
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await studyMaterialService.getTopicsByTrackId(trackId);

      expect(api.get).toHaveBeenCalledWith(`/articles/tracks/${trackId}/topics`);
      expect(result).toEqual(mockTopics);
    });

    it('handles different track IDs', async () => {
      const trackId = 5;
      const mockTopics = [
        { id: 10, name: 'Advanced Topic', trackId: 5, progress: 90, subtopics: [] }
      ];

      const mockResponse = {
        data: {
          data: mockTopics,
          message: 'Topics retrieved successfully'
        }
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await studyMaterialService.getTopicsByTrackId(trackId);

      expect(api.get).toHaveBeenCalledWith('/articles/tracks/5/topics');
      expect(result).toEqual(mockTopics);
    });

    it('handles empty topics list for a track', async () => {
      const trackId = 99;
      const mockResponse = {
        data: {
          data: [],
          message: 'No topics found for this track'
        }
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await studyMaterialService.getTopicsByTrackId(trackId);

      expect(api.get).toHaveBeenCalledWith('/articles/tracks/99/topics');
      expect(result).toEqual([]);
    });

    it('handles API errors for invalid track ID', async () => {
      const trackId = -1;
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Track not found' }
        }
      };

      vi.mocked(api.get).mockRejectedValue(mockError);

      await expect(studyMaterialService.getTopicsByTrackId(trackId)).rejects.toEqual(mockError);
      expect(api.get).toHaveBeenCalledWith('/articles/tracks/-1/topics');
    });

    it('handles server errors', async () => {
      const trackId = 1;
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };

      vi.mocked(api.get).mockRejectedValue(serverError);

      await expect(studyMaterialService.getTopicsByTrackId(trackId)).rejects.toEqual(serverError);
    });
  });

  describe('getSubtopicsByTopicId', () => {
    it('fetches subtopics for a specific topic successfully', async () => {
      const topicId = 1;
      const mockSubtopics = [
        { id: 1, name: 'Array Basics', topicId: 1, isRead: true, articleSlug: 'array-basics' },
        { id: 2, name: 'Array Algorithms', topicId: 1, isRead: false, articleSlug: 'array-algorithms' },
        { id: 3, name: 'Multi-dimensional Arrays', topicId: 1, isRead: false, articleSlug: 'multi-dimensional-arrays' },
      ];

      const mockResponse = {
        data: {
          data: mockSubtopics,
          message: 'Subtopics retrieved successfully'
        },
        status: 200
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await studyMaterialService.getSubtopicsByTopicId(topicId);

      expect(api.get).toHaveBeenCalledWith(`/articles/topics/${topicId}/subtopics`);
      expect(result).toEqual(mockSubtopics);
    });

    it('handles different topic IDs', async () => {
      const topicId = 10;
      const mockSubtopics = [
        { id: 20, name: 'Advanced Subtopic', topicId: 10, isRead: true, articleSlug: 'advanced-subtopic' }
      ];

      const mockResponse = {
        data: {
          data: mockSubtopics,
          message: 'Subtopics retrieved successfully'
        }
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await studyMaterialService.getSubtopicsByTopicId(topicId);

      expect(api.get).toHaveBeenCalledWith('/articles/topics/10/subtopics');
      expect(result).toEqual(mockSubtopics);
    });

    it('handles empty subtopics list for a topic', async () => {
      const topicId = 999;
      const mockResponse = {
        data: {
          data: [],
          message: 'No subtopics found for this topic'
        }
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await studyMaterialService.getSubtopicsByTopicId(topicId);

      expect(api.get).toHaveBeenCalledWith('/articles/topics/999/subtopics');
      expect(result).toEqual([]);
    });

    it('handles API errors for invalid topic ID', async () => {
      const topicId = -5;
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Topic not found' }
        }
      };

      vi.mocked(api.get).mockRejectedValue(mockError);

      await expect(studyMaterialService.getSubtopicsByTopicId(topicId)).rejects.toEqual(mockError);
      expect(api.get).toHaveBeenCalledWith('/articles/topics/-5/subtopics');
    });

    it('validates subtopic data structure', async () => {
      const topicId = 1;
      const mockSubtopics = [
        { id: 1, name: 'Valid Subtopic', topicId: 1, isRead: true, articleSlug: 'valid-subtopic' },
        { id: 2, name: 'Another Valid Subtopic', topicId: 1, isRead: false, articleSlug: 'another-valid-subtopic' },
      ];

      const mockResponse = {
        data: {
          data: mockSubtopics
        }
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await studyMaterialService.getSubtopicsByTopicId(topicId);

      // Verify each subtopic has required properties
      result.forEach(subtopic => {
        expect(subtopic).toHaveProperty('id');
        expect(subtopic).toHaveProperty('name');
        expect(subtopic).toHaveProperty('topicId');
        expect(subtopic).toHaveProperty('isRead');
        expect(subtopic).toHaveProperty('articleSlug');
        expect(typeof subtopic.id).toBe('number');
        expect(typeof subtopic.name).toBe('string');
        expect(typeof subtopic.topicId).toBe('number');
        expect(typeof subtopic.isRead).toBe('boolean');
        expect(typeof subtopic.articleSlug).toBe('string');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles network timeouts', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      };

      vi.mocked(api.get).mockRejectedValue(timeoutError);

      await expect(studyMaterialService.getAllTracks()).rejects.toEqual(timeoutError);
      await expect(studyMaterialService.getTopicsByTrackId(1)).rejects.toEqual(timeoutError);
      await expect(studyMaterialService.getSubtopicsByTopicId(1)).rejects.toEqual(timeoutError);
    });

    it('handles unauthorized access', async () => {
      const unauthorizedError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized access' }
        }
      };

      vi.mocked(api.get).mockRejectedValue(unauthorizedError);

      await expect(studyMaterialService.getAllTracks()).rejects.toEqual(unauthorizedError);
      await expect(studyMaterialService.getTopicsByTrackId(1)).rejects.toEqual(unauthorizedError);
      await expect(studyMaterialService.getSubtopicsByTopicId(1)).rejects.toEqual(unauthorizedError);
    });

    it('handles malformed response data', async () => {
      const malformedResponse = {
        data: null,
        status: 200
      };

      vi.mocked(api.get).mockResolvedValue(malformedResponse);

      await expect(studyMaterialService.getAllTracks()).rejects.toThrow();
    });
  });

  describe('API Integration', () => {
    it('makes correct API calls with proper endpoints', async () => {
      const mockResponse = { data: { data: [] } };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      // Test each endpoint
      await studyMaterialService.getAllTracks();
      expect(api.get).toHaveBeenCalledWith('/articles/tracks');

      await studyMaterialService.getTopicsByTrackId(123);
      expect(api.get).toHaveBeenCalledWith('/articles/tracks/123/topics');

      await studyMaterialService.getSubtopicsByTopicId(456);
      expect(api.get).toHaveBeenCalledWith('/articles/topics/456/subtopics');

      expect(api.get).toHaveBeenCalledTimes(3);
    });

    it('passes through API response data correctly', async () => {
      const mockData = [{ id: 1, name: 'Test Track', progress: 50 }];
      const mockResponse = {
        data: {
          data: mockData,
          message: 'Success',
          total: 1
        },
        status: 200,
        statusText: 'OK'
      };

      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await studyMaterialService.getAllTracks();

      // Should return only the data property from response.data
      expect(result).toEqual(mockData);
      expect(result).not.toHaveProperty('message');
      expect(result).not.toHaveProperty('total');
    });
  });
}); 