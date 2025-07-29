import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
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
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('StudyMaterials Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders basic layout elements', () => {
    const mockGetAllTracks = vi.mocked(studyMaterialService.getAllTracks);
    const mockGetAllJobRoles = vi.mocked(studyMaterialService.getAllJobRoles);
    mockGetAllTracks.mockImplementation(() => new Promise(() => {})); // Never resolves
    mockGetAllJobRoles.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<StudyMaterials />);

    expect(screen.getByText('CodeMentor')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    const mockGetAllTracks = vi.mocked(studyMaterialService.getAllTracks);
    const mockGetAllJobRoles = vi.mocked(studyMaterialService.getAllJobRoles);
    mockGetAllTracks.mockImplementation(() => new Promise(() => {})); // Never resolves
    mockGetAllJobRoles.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<StudyMaterials />);

    expect(screen.getByText('Loading study materials...')).toBeInTheDocument();
  });

  it('renders page title', async () => {
    const mockGetAllTracks = vi.mocked(studyMaterialService.getAllTracks);
    const mockGetTopicsByTrackId = vi.mocked(studyMaterialService.getTopicsByTrackId);
    const mockGetAllJobRoles = vi.mocked(studyMaterialService.getAllJobRoles);

    mockGetAllTracks.mockResolvedValue([]);
    mockGetTopicsByTrackId.mockResolvedValue([]);
    mockGetAllJobRoles.mockResolvedValue([]);

    render(<StudyMaterials />);

    // Wait for loading to complete and check title appears
    await vi.waitFor(() => {
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Study Materials');
    });
  });
}); 