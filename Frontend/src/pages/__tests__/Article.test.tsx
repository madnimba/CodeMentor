import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import Article from '../Article';
import { api } from '@/services/api';

// Mock the API
vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

// Mock react-router-dom
const mockUseParams = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => mockUseParams(),
  };
});

describe('Article Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders basic layout elements', () => {
    mockUseParams.mockReturnValue({ subtopicId: '1' });
    const mockGet = vi.mocked(api.get);
    mockGet.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<Article />);

    expect(screen.getByText('CodeMentor')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseParams.mockReturnValue({ subtopicId: '1' });
    const mockGet = vi.mocked(api.get);
    mockGet.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<Article />);

    expect(screen.getByText('Loading article(s)...')).toBeInTheDocument();
  });

  it('handles missing subtopic ID', () => {
    mockUseParams.mockReturnValue({});
    
    render(<Article />);

    expect(screen.getByText('No articles found for this subtopic.')).toBeInTheDocument();
  });
}); 