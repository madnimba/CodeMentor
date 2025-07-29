import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import ProblemSelection from '../ProblemSelection';

// Mock react-router-dom
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the API
vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('ProblemSelection Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('renders basic layout elements', () => {
    render(<ProblemSelection />);
    
    expect(screen.getByText('CodeMentor')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<ProblemSelection />);
    
    expect(screen.getByText('Loading coding problems...')).toBeInTheDocument();
  });

  it('has main container with proper styling', () => {
    render(<ProblemSelection />);
    
    const mainContainer = document.querySelector('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
  });
}); 