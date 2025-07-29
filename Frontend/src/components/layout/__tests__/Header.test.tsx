import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import { Header } from '../Header';

// Mock the auth context
const mockSignOut = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the logo and brand name', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      signOut: mockSignOut,
    });

    render(<Header />);
    
    expect(screen.getByText('CodeMentor')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      signOut: mockSignOut,
    });

    render(<Header />);
    
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /study materials/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /companies/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('shows sign in and sign up buttons when user is not logged in', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      signOut: mockSignOut,
    });

    render(<Header />);
    
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows logout button when user is logged in', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, username: 'testuser' },
      signOut: mockSignOut,
    });

    render(<Header />);
    
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
  });
}); 