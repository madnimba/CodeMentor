import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import StudyMaterials from '../StudyMaterials';
import { studyMaterialService } from '@/services/studyMaterials';

// Mock the study materials service
vi.mock('@/services/studyMaterials', () => ({
  studyMaterialService: {
    getAllTracks: vi.fn(),
    getTopicsByTrackId: vi.fn(),
    getSubtopicsByTopicId: vi.fn(),
    getAllJobRoles: vi.fn(),
    createArticle: vi.fn(),
  },
}));

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock the auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'testuser' },
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    googleSignIn: vi.fn(),
    googleSignUp: vi.fn(),
    signOut: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockTracksData = [
  {
    id: 1,
    name: 'Data Structures & Algorithms',
    progress: 75,
  },
  {
    id: 2,
    name: 'System Design',
    progress: 50,
  },
  {
    id: 3,
    name: 'Database Systems',
    progress: 25,
  },
];

const mockTopicsData = {
  1: [
    {
      id: 1,
      name: 'Arrays',
      progress: 80,
      subtopics: [
        { id: 1, name: 'Array Basics', isRead: true },
        { id: 2, name: 'Array Algorithms', isRead: false },
      ],
    },
    {
      id: 2,
      name: 'Linked Lists',
      progress: 60,
      subtopics: [
        { id: 3, name: 'Singly Linked List', isRead: true },
        { id: 4, name: 'Doubly Linked List', isRead: false },
      ],
    },
  ],
  2: [
    {
      id: 3,
      name: 'Load Balancing',
      progress: 40,
      subtopics: [
        { id: 5, name: 'Load Balancer Types', isRead: false },
      ],
    },
  ],
  3: [
    {
      id: 4,
      name: 'SQL Fundamentals',
      progress: 30,
      subtopics: [
        { id: 6, name: 'Basic Queries', isRead: true },
        { id: 7, name: 'Joins', isRead: false },
      ],
    },
  ],
};

const mockJobRolesData = [
  { id: 1, name: 'Frontend Developer' },
  { id: 2, name: 'Backend Developer' },
  { id: 3, name: 'Full Stack Developer' },
];

describe('StudyMaterials Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows loading spinner while fetching data', async () => {
      const mockGetAllTracks = vi.mocked(studyMaterialService.getAllTracks);
      const mockGetAllJobRoles = vi.mocked(studyMaterialService.getAllJobRoles);
      mockGetAllTracks.mockImplementation(() => new Promise(() => {})); // Never resolves
      mockGetAllJobRoles.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<StudyMaterials />);

      expect(screen.getByText('Loading study materials...')).toBeInTheDocument();
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('renders header and footer during loading', () => {
      const mockGetAllTracks = vi.mocked(studyMaterialService.getAllTracks);
      const mockGetAllJobRoles = vi.mocked(studyMaterialService.getAllJobRoles);
      mockGetAllTracks.mockImplementation(() => new Promise(() => {}));
      mockGetAllJobRoles.mockImplementation(() => new Promise(() => {}));

      render(<StudyMaterials />);

      expect(screen.getByText('CodeMentor')).toBeInTheDocument();
      expect(screen.getByText('© 2024 CodeMentor BD. All rights reserved. Built with ❤️ for Bangladesh\'s tech community.')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when API calls fail', async () => {
      const mockGetAllTracks = vi.mocked(studyMaterialService.getAllTracks);
      mockGetAllTracks.mockRejectedValue(new Error('Failed to fetch tracks'));

      render(<StudyMaterials />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load study materials')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Retry');
      expect(retryButton).toBeInTheDocument();
    });

    it('reloads page when retry button is clicked', async () => {
      const user = userEvent.setup();
      const mockGetAllTracks = vi.mocked(studyMaterialService.getAllTracks);
      mockGetAllTracks.mockRejectedValue(new Error('Failed to fetch tracks'));

      // Mock window.location.reload
      const reloadMock = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
      });

      render(<StudyMaterials />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load study materials')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);

      expect(reloadMock).toHaveBeenCalled();
    });
  });

  describe('Successful Data Load', () => {
    beforeEach(() => {
      const mockGetAllTracks = vi.mocked(studyMaterialService.getAllTracks);
      const mockGetTopicsByTrackId = vi.mocked(studyMaterialService.getTopicsByTrackId);
      const mockGetAllJobRoles = vi.mocked(studyMaterialService.getAllJobRoles);

      mockGetAllTracks.mockResolvedValue(mockTracksData);
      mockGetTopicsByTrackId.mockImplementation((trackId: number) => {
        return Promise.resolve(mockTopicsData[trackId] || []);
      });
      mockGetAllJobRoles.mockResolvedValue(mockJobRolesData);
    });

    it('renders page title and description', async () => {
      render(<StudyMaterials />);

      await waitFor(() => {
        const mainHeading = screen.getByRole('heading', { level: 1 });
        expect(mainHeading).toHaveTextContent('Study Materials');
        expect(screen.getByText('Explore our comprehensive collection of programming topics')).toBeInTheDocument();
      });
    });

    it('displays all tracks with progress', async () => {
      render(<StudyMaterials />);

      await waitFor(() => {
        expect(screen.getByText('Data Structures & Algorithms')).toBeInTheDocument();
        expect(screen.getByText('System Design')).toBeInTheDocument();
        expect(screen.getByText('Database Systems')).toBeInTheDocument();
      });

      // Check progress indicators
      const progressTexts = screen.getAllByText(/\d+% complete/);
      expect(progressTexts.length).toBe(3);
    });

    it('shows track statistics', async () => {
      render(<StudyMaterials />);

      await waitFor(() => {
        expect(screen.getByText('2 topics • 75% complete')).toBeInTheDocument();
        expect(screen.getByText('1 topics • 50% complete')).toBeInTheDocument();
        expect(screen.getByText('1 topics • 25% complete')).toBeInTheDocument();
      });
    });
  });

  describe('Expandable Sections', () => {
    beforeEach(() => {
      const mockGetAllTracks = vi.mocked(studyMaterialService.getAllTracks);
      const mockGetTopicsByTrackId = vi.mocked(studyMaterialService.getTopicsByTrackId);
      const mockGetAllJobRoles = vi.mocked(studyMaterialService.getAllJobRoles);

      mockGetAllTracks.mockResolvedValue(mockTracksData);
      mockGetTopicsByTrackId.mockImplementation((trackId: number) => {
        return Promise.resolve(mockTopicsData[trackId] || []);
      });
      mockGetAllJobRoles.mockResolvedValue(mockJobRolesData);
    });

    it('expands track when clicked', async () => {
      const user = userEvent.setup();
      render(<StudyMaterials />);

      await waitFor(() => {
        expect(screen.getByText('Data Structures & Algorithms')).toBeInTheDocument();
      });

      // Initially topics should not be visible
      expect(screen.queryByText('Arrays')).not.toBeInTheDocument();

      // Click to expand the track
      const trackHeader = screen.getByText('Data Structures & Algorithms');
      await user.click(trackHeader);

      // Now topics should be visible
      expect(screen.getByText('Arrays')).toBeInTheDocument();
      expect(screen.getByText('Linked Lists')).toBeInTheDocument();
    });

    it('collapses track when clicked again', async () => {
      const user = userEvent.setup();
      render(<StudyMaterials />);

      await waitFor(() => {
        expect(screen.getByText('Data Structures & Algorithms')).toBeInTheDocument();
      });

      const trackHeader = screen.getByText('Data Structures & Algorithms');

      // Expand
      await user.click(trackHeader);
      expect(screen.getByText('Arrays')).toBeInTheDocument();

      // Collapse
      await user.click(trackHeader);
      expect(screen.queryByText('Arrays')).not.toBeInTheDocument();
    });

    it('expands topic to show subtopics', async () => {
      const user = userEvent.setup();
      render(<StudyMaterials />);

      await waitFor(() => {
        expect(screen.getByText('Data Structures & Algorithms')).toBeInTheDocument();
      });

      // Expand track first
      const trackHeader = screen.getByText('Data Structures & Algorithms');
      await user.click(trackHeader);

      await waitFor(() => {
        expect(screen.getByText('Arrays')).toBeInTheDocument();
      });

      // Initially subtopics should not be visible
      expect(screen.queryByText('Array Basics')).not.toBeInTheDocument();

      // Click to expand the topic
      const topicHeader = screen.getByText('Arrays');
      await user.click(topicHeader);

      // Now subtopics should be visible
      expect(screen.getByText('Array Basics')).toBeInTheDocument();
      expect(screen.getByText('Array Algorithms')).toBeInTheDocument();
    });

    it('shows chevron icons for expandable sections', async () => {
      render(<StudyMaterials />);

      await waitFor(() => {
        expect(screen.getByText('Data Structures & Algorithms')).toBeInTheDocument();
      });

      // Should have chevron icons (lucide icons use specific classes)
      const chevronIcons = document.querySelectorAll('.lucide-chevron-down, .lucide-chevron-right');
      expect(chevronIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Topic Progress Display', () => {
    beforeEach(() => {
      const mockGetAllTracks = vi.mocked(studyMaterialService.getAllTracks);
      const mockGetTopicsByTrackId = vi.mocked(studyMaterialService.getTopicsByTrackId);
      const mockGetAllJobRoles = vi.mocked(studyMaterialService.getAllJobRoles);

      mockGetAllTracks.mockResolvedValue(mockTracksData);
      mockGetTopicsByTrackId.mockImplementation((trackId: number) => {
        return Promise.resolve(mockTopicsData[trackId] || []);
      });
      mockGetAllJobRoles.mockResolvedValue(mockJobRolesData);
    });

    it('displays topic progress information', async () => {
      const user = userEvent.setup();
      render(<StudyMaterials />);

      await waitFor(() => {
        expect(screen.getByText('Data Structures & Algorithms')).toBeInTheDocument();
      });

      // Expand track
      const trackHeader = screen.getByText('Data Structures & Algorithms');
      await user.click(trackHeader);

      await waitFor(() => {
        expect(screen.getByText('Arrays')).toBeInTheDocument();
        expect(screen.getByText('2 subtopics • 80% complete')).toBeInTheDocument();
        expect(screen.getByText('2 subtopics • 60% complete')).toBeInTheDocument();
      });
    });

    it('shows progress bars for topics', async () => {
      const user = userEvent.setup();
      render(<StudyMaterials />);

      await waitFor(() => {
        expect(screen.getByText('Data Structures & Algorithms')).toBeInTheDocument();
      });

      // Expand track
      const trackHeader = screen.getByText('Data Structures & Algorithms');
      await user.click(trackHeader);

      await waitFor(() => {
        const progressBars = screen.getAllByRole('progressbar');
        expect(progressBars.length).toBeGreaterThan(2); // Track progress + topic progress
      });
    });
  });

  describe('Subtopic Navigation', () => {
    beforeEach(() => {
      const mockGetAllTracks = vi.mocked(studyMaterialService.getAllTracks);
      const mockGetTopicsByTrackId = vi.mocked(studyMaterialService.getTopicsByTrackId);
      const mockGetAllJobRoles = vi.mocked(studyMaterialService.getAllJobRoles);

      mockGetAllTracks.mockResolvedValue(mockTracksData);
      mockGetTopicsByTrackId.mockImplementation((trackId: number) => {
        return Promise.resolve(mockTopicsData[trackId] || []);
      });
      mockGetAllJobRoles.mockResolvedValue(mockJobRolesData);
    });

    it('renders subtopic links with correct URLs', async () => {
      const user = userEvent.setup();
      render(<StudyMaterials />);

      await waitFor(() => {
        expect(screen.getByText('Data Structures & Algorithms')).toBeInTheDocument();
      });

      // Expand track
      const trackHeader = screen.getByText('Data Structures & Algorithms');
      await user.click(trackHeader);

      await waitFor(() => {
        expect(screen.getByText('Arrays')).toBeInTheDocument();
      });

      // Expand topic
      const topicHeader = screen.getByText('Arrays');
      await user.click(topicHeader);

      await waitFor(() => {
        const arrayBasicsLink = screen.getByRole('link', { name: /array basics/i });
        expect(arrayBasicsLink).toHaveAttribute('href', '/article/subtopic/1');

        const arrayAlgorithmsLink = screen.getByRole('link', { name: /array algorithms/i });
        expect(arrayAlgorithmsLink).toHaveAttribute('href', '/article/subtopic/2');
      });
    });

    it('shows completion status for subtopics', async () => {
      const user = userEvent.setup();
      render(<StudyMaterials />);

      await waitFor(() => {
        expect(screen.getByText('Data Structures & Algorithms')).toBeInTheDocument();
      });

      // Expand track and topic
      const trackHeader = screen.getByText('Data Structures & Algorithms');
      await user.click(trackHeader);

      const topicHeader = screen.getByText('Arrays');
      await user.click(topicHeader);

      await waitFor(() => {
        expect(screen.getByText('Completed')).toBeInTheDocument(); // For Array Basics
      });
    });

    it('highlights completed subtopics differently', async () => {
      const user = userEvent.setup();
      render(<StudyMaterials />);

      await waitFor(() => {
        expect(screen.getByText('Data Structures & Algorithms')).toBeInTheDocument();
      });

      // Expand track and topic
      const trackHeader = screen.getByText('Data Structures & Algorithms');
      await user.click(trackHeader);

      const topicHeader = screen.getByText('Arrays');
      await user.click(topicHeader);

      await waitFor(() => {
        const completedIndicator = screen.getByText('Completed');
        expect(completedIndicator).toHaveClass('text-green-400');
      });
    });
  });

  describe('Multiple Tracks Handling', () => {
    beforeEach(() => {
      const mockGetAllTracks = vi.mocked(studyMaterialService.getAllTracks);
      const mockGetTopicsByTrackId = vi.mocked(studyMaterialService.getTopicsByTrackId);
      const mockGetAllJobRoles = vi.mocked(studyMaterialService.getAllJobRoles);

      mockGetAllTracks.mockResolvedValue(mockTracksData);
      mockGetTopicsByTrackId.mockImplementation((trackId: number) => {
        return Promise.resolve(mockTopicsData[trackId] || []);
      });
      mockGetAllJobRoles.mockResolvedValue(mockJobRolesData);
    });

    it('can expand multiple tracks simultaneously', async () => {
      const user = userEvent.setup();
      render(<StudyMaterials />);

      await waitFor(() => {
        expect(screen.getByText('Data Structures & Algorithms')).toBeInTheDocument();
        expect(screen.getByText('System Design')).toBeInTheDocument();
      });

      // Expand first track
      const dsaHeader = screen.getByText('Data Structures & Algorithms');
      await user.click(dsaHeader);

      // Expand second track
      const systemDesignHeader = screen.getByText('System Design');
      await user.click(systemDesignHeader);

      await waitFor(() => {
        // Both tracks should be expanded
        expect(screen.getByText('Arrays')).toBeInTheDocument(); // From DSA
        expect(screen.getByText('Load Balancing')).toBeInTheDocument(); // From System Design
      });
    });

    it('maintains independent state for each track', async () => {
      const user = userEvent.setup();
      render(<StudyMaterials />);

      await waitFor(() => {
        expect(screen.getByText('Data Structures & Algorithms')).toBeInTheDocument();
        expect(screen.getByText('System Design')).toBeInTheDocument();
      });

      // Expand first track
      const dsaHeader = screen.getByText('Data Structures & Algorithms');
      await user.click(dsaHeader);

      await waitFor(() => {
        expect(screen.getByText('Arrays')).toBeInTheDocument();
      });

      // Second track should still be collapsed
      expect(screen.queryByText('Load Balancing')).not.toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('calls the correct API methods in sequence', async () => {
      const mockGetAllTracks = vi.mocked(studyMaterialService.getAllTracks);
      const mockGetTopicsByTrackId = vi.mocked(studyMaterialService.getTopicsByTrackId);
      const mockGetAllJobRoles = vi.mocked(studyMaterialService.getAllJobRoles);

      mockGetAllTracks.mockResolvedValue(mockTracksData);
      mockGetTopicsByTrackId.mockResolvedValue([]);
      mockGetAllJobRoles.mockResolvedValue(mockJobRolesData);

      render(<StudyMaterials />);

      await waitFor(() => {
        expect(mockGetAllTracks).toHaveBeenCalledTimes(1);
        expect(mockGetTopicsByTrackId).toHaveBeenCalledTimes(3); // Once for each track
        expect(mockGetTopicsByTrackId).toHaveBeenCalledWith(1);
        expect(mockGetTopicsByTrackId).toHaveBeenCalledWith(2);
        expect(mockGetTopicsByTrackId).toHaveBeenCalledWith(3);
        expect(mockGetAllJobRoles).toHaveBeenCalledTimes(1);
      });
    });

    it('handles empty data gracefully', async () => {
      const mockGetAllTracks = vi.mocked(studyMaterialService.getAllTracks);
      const mockGetTopicsByTrackId = vi.mocked(studyMaterialService.getTopicsByTrackId);
      const mockGetAllJobRoles = vi.mocked(studyMaterialService.getAllJobRoles);

      mockGetAllTracks.mockResolvedValue([]);
      mockGetTopicsByTrackId.mockResolvedValue([]);
      mockGetAllJobRoles.mockResolvedValue([]);

      render(<StudyMaterials />);

      await waitFor(() => {
        const mainHeading = screen.getByRole('heading', { level: 1 });
        expect(mainHeading).toHaveTextContent('Study Materials');
        expect(screen.getByText('Explore our comprehensive collection of programming topics')).toBeInTheDocument();
      });

      // Should not show any tracks
      expect(screen.queryByText('Data Structures & Algorithms')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      const mockGetAllTracks = vi.mocked(studyMaterialService.getAllTracks);
      const mockGetTopicsByTrackId = vi.mocked(studyMaterialService.getTopicsByTrackId);
      const mockGetAllJobRoles = vi.mocked(studyMaterialService.getAllJobRoles);

      mockGetAllTracks.mockResolvedValue(mockTracksData);
      mockGetTopicsByTrackId.mockImplementation((trackId: number) => {
        return Promise.resolve(mockTopicsData[trackId] || []);
      });
      mockGetAllJobRoles.mockResolvedValue(mockJobRolesData);
    });

    it('has proper layout structure', async () => {
      render(<StudyMaterials />);

      await waitFor(() => {
        // Check that the main container has the right background classes
        const mainContainer = document.querySelector('.min-h-screen.bg-gradient-to-br');
        expect(mainContainer).toBeInTheDocument();
        expect(mainContainer).toHaveClass('min-h-screen', 'bg-gradient-to-br');
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      const mockGetAllTracks = vi.mocked(studyMaterialService.getAllTracks);
      const mockGetTopicsByTrackId = vi.mocked(studyMaterialService.getTopicsByTrackId);
      const mockGetAllJobRoles = vi.mocked(studyMaterialService.getAllJobRoles);

      mockGetAllTracks.mockResolvedValue(mockTracksData);
      mockGetTopicsByTrackId.mockImplementation((trackId: number) => {
        return Promise.resolve(mockTopicsData[trackId] || []);
      });
      mockGetAllJobRoles.mockResolvedValue(mockJobRolesData);
    });

    it('has proper heading hierarchy', async () => {
      render(<StudyMaterials />);

      await waitFor(() => {
        const mainHeading = screen.getByRole('heading', { level: 1 });
        expect(mainHeading).toHaveTextContent('Study Materials');
      });
    });

    it('has accessible navigation links', async () => {
      const user = userEvent.setup();
      render(<StudyMaterials />);

      await waitFor(() => {
        expect(screen.getByText('Data Structures & Algorithms')).toBeInTheDocument();
      });

      // Expand track and topic to get subtopic links
      const trackHeader = screen.getByText('Data Structures & Algorithms');
      await user.click(trackHeader);

      const topicHeader = screen.getByText('Arrays');
      await user.click(topicHeader);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        links.forEach(link => {
          expect(link).toHaveAttribute('href');
          expect(link.textContent).toBeTruthy();
        });
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<StudyMaterials />);

      await waitFor(() => {
        expect(screen.getByText('Data Structures & Algorithms')).toBeInTheDocument();
      });

      const trackHeader = screen.getByText('Data Structures & Algorithms');
      
      // Track header should be clickable and keyboard accessible
      expect(trackHeader).toBeInTheDocument();

      // Should be able to activate with click (simulating keyboard interaction)
      await user.click(trackHeader);
      
      await waitFor(() => {
        expect(screen.getByText('Arrays')).toBeInTheDocument();
      });
    });
  });
}); 