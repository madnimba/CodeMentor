import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import Auth from '../Auth';

// Mock the auth context
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  };
});

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Google Sign In Button
vi.mock('@/components/ui/GoogleSignInButton', () => ({
  GoogleSignInButton: ({ buttonText }: any) => (
    <button data-testid="google-signin-button">
      {buttonText}
    </button>
  ),
}));

describe('Auth Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      signIn: mockSignIn,
      signUp: mockSignUp,
    });
    mockSearchParams.get = vi.fn().mockReturnValue(null);
  });

  it('renders basic layout elements', () => {
    render(<Auth />);
    
    expect(screen.getByText('CodeMentor')).toBeInTheDocument();
  });

  it('renders welcome message', () => {
    render(<Auth />);
    
    expect(screen.getByText('Welcome to CodeMentor BD')).toBeInTheDocument();
  });

  it('renders sign in and sign up tabs', () => {
    render(<Auth />);
    
    expect(screen.getByRole('tab', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /sign up/i })).toBeInTheDocument();
  });

  it('redirects authenticated users', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, username: 'testuser' },
      signIn: mockSignIn,
      signUp: mockSignUp,
    });
    
    render(<Auth />);
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
}); 