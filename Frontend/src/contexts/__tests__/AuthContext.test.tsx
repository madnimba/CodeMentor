import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../AuthContext';
import * as authService from '../../services/auth';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock auth service
vi.mock('../../services/auth', () => ({
  authService: {
    signIn: vi.fn(),
    signUp: vi.fn(),
    googleSignIn: vi.fn(),
    googleSignUp: vi.fn(),
  },
}));

// Test component to access the context
const TestComponent = () => {
  const auth = useAuth();
  
  const handleSignIn = async () => {
    try {
      await auth.signIn({ username: 'test', password: 'test' });
    } catch (error) {
      // Expected in error tests
    }
  };

  const handleSignUp = async () => {
    try {
      await auth.signUp({ email: 'test@test.com', username: 'test', password: 'test' });
    } catch (error) {
      // Expected in error tests
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await auth.googleSignIn('mock-token');
    } catch (error) {
      // Expected in error tests
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await auth.googleSignUp('mock-token');
    } catch (error) {
      // Expected in error tests
    }
  };
  
  return (
    <div>
      <div data-testid="user">{auth.user ? JSON.stringify(auth.user) : 'null'}</div>
      <div data-testid="loading">{auth.loading.toString()}</div>
      <button data-testid="sign-in" onClick={handleSignIn}>
        Sign In
      </button>
      <button data-testid="sign-up" onClick={handleSignUp}>
        Sign Up
      </button>
      <button data-testid="google-sign-in" onClick={handleGoogleSignIn}>
        Google Sign In
      </button>
      <button data-testid="google-sign-up" onClick={handleGoogleSignUp}>
        Google Sign Up
      </button>
      <button data-testid="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    </div>
  );
};

const TestComponentWithoutProvider = () => {
  const auth = useAuth();
  return <div>{auth.user ? auth.user.token : 'null'}</div>;
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Provider Setup', () => {
    it('provides auth context to children', () => {
      renderWithProvider(<TestComponent />);
      
      expect(screen.getByTestId('user')).toBeInTheDocument();
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('throws error when useAuth is used outside provider', () => {
      // Suppress console.error for this test
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponentWithoutProvider />);
      }).toThrow('useAuth must be used within an AuthProvider');
      
      spy.mockRestore();
    });
  });

  describe('Initial State', () => {
    it('starts with loading true and no user when no token in localStorage', async () => {
      renderWithProvider(<TestComponent />);
      
      // After initialization, loading should be false and user should be null
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toHaveTextContent('null');
      });
    });

    it('initializes with user when token exists in localStorage', async () => {
      localStorage.setItem('token', 'existing-token');
      
      renderWithProvider(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toHaveTextContent('"token":"existing-token"');
      });
    });
  });

  describe('Sign In', () => {
    it('successfully signs in user', async () => {
      const mockResponse = { token: 'new-token', user: { id: 1, username: 'testuser' } };
      vi.mocked(authService.authService.signIn).mockResolvedValue(mockResponse);
      
      renderWithProvider(<TestComponent />);
      
      // Wait for initial loading to finish
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
      
      const signInButton = screen.getByTestId('sign-in');
      await act(async () => {
        signInButton.click();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockResponse));
      });
      
      expect(localStorage.getItem('token')).toBe('new-token');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('handles sign in error', async () => {
      const mockError = new Error('Invalid credentials');
      vi.mocked(authService.authService.signIn).mockRejectedValue(mockError);
      
      renderWithProvider(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
      
      const signInButton = screen.getByTestId('sign-in');
      
      await act(async () => {
        signInButton.click();
      });
      
      // User should remain null after failed sign in
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('Sign Up', () => {
    it('successfully signs up user without auto sign in', async () => {
      vi.mocked(authService.authService.signUp).mockResolvedValue(undefined);
      
      renderWithProvider(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
      
      const signUpButton = screen.getByTestId('sign-up');
      await act(async () => {
        signUpButton.click();
      });
      
      await waitFor(() => {
        expect(authService.authService.signUp).toHaveBeenCalledWith({
          email: 'test@test.com',
          username: 'test',
          password: 'test'
        });
      });
      
      // User should remain null after sign up (no auto sign in)
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(localStorage.getItem('token')).toBeNull();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('handles sign up error', async () => {
      const mockError = new Error('Username already exists');
      vi.mocked(authService.authService.signUp).mockRejectedValue(mockError);
      
      renderWithProvider(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
      
      const signUpButton = screen.getByTestId('sign-up');
      
      await act(async () => {
        signUpButton.click();
      });
      
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });

  describe('Google Sign In', () => {
    it('successfully signs in with Google', async () => {
      const mockResponse = { token: 'google-token', user: { id: 1, email: 'test@gmail.com' } };
      vi.mocked(authService.authService.googleSignIn).mockResolvedValue(mockResponse);
      
      renderWithProvider(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
      
      const googleSignInButton = screen.getByTestId('google-sign-in');
      await act(async () => {
        googleSignInButton.click();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockResponse));
      });
      
      expect(localStorage.getItem('token')).toBe('google-token');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('handles Google sign in error', async () => {
      const mockError = new Error('Google sign in failed');
      vi.mocked(authService.authService.googleSignIn).mockRejectedValue(mockError);
      
      renderWithProvider(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
      
      const googleSignInButton = screen.getByTestId('google-sign-in');
      
      await act(async () => {
        googleSignInButton.click();
      });
      
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });

  describe('Google Sign Up', () => {
    it('successfully signs up with Google and auto signs in', async () => {
      const mockResponse = { token: 'google-signup-token', user: { id: 1, email: 'test@gmail.com' } };
      vi.mocked(authService.authService.googleSignUp).mockResolvedValue(mockResponse);
      
      renderWithProvider(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
      
      const googleSignUpButton = screen.getByTestId('google-sign-up');
      await act(async () => {
        googleSignUpButton.click();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockResponse));
      });
      
      expect(localStorage.getItem('token')).toBe('google-signup-token');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('handles Google sign up error', async () => {
      const mockError = new Error('Google sign up failed');
      vi.mocked(authService.authService.googleSignUp).mockRejectedValue(mockError);
      
      renderWithProvider(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
      
      const googleSignUpButton = screen.getByTestId('google-sign-up');
      
      await act(async () => {
        googleSignUpButton.click();
      });
      
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });

  describe('Sign Out', () => {
    it('successfully signs out user', async () => {
      // First set up a signed in user
      localStorage.setItem('token', 'existing-token');
      
      renderWithProvider(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('"token":"existing-token"');
      });
      
      const signOutButton = screen.getByTestId('sign-out');
      await act(async () => {
        signOutButton.click();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
      });
      
      expect(localStorage.getItem('token')).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith('/auth');
    });

    it('works when no user is signed in', async () => {
      renderWithProvider(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
      
      const signOutButton = screen.getByTestId('sign-out');
      await act(async () => {
        signOutButton.click();
      });
      
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(mockNavigate).toHaveBeenCalledWith('/auth');
    });
  });

  describe('LocalStorage Integration', () => {
    it('stores token in localStorage on successful authentication', async () => {
      const mockResponse = { token: 'test-token' };
      vi.mocked(authService.authService.signIn).mockResolvedValue(mockResponse);
      
      renderWithProvider(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
      
      const signInButton = screen.getByTestId('sign-in');
      await act(async () => {
        signInButton.click();
      });
      
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('test-token');
      });
    });

    it('removes token from localStorage on sign out', async () => {
      localStorage.setItem('token', 'existing-token');
      
      renderWithProvider(<TestComponent />);
      
      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('existing-token');
      });
      
      const signOutButton = screen.getByTestId('sign-out');
      await act(async () => {
        signOutButton.click();
      });
      
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('Navigation Integration', () => {
    it('navigates to dashboard after successful sign in', async () => {
      const mockResponse = { token: 'test-token' };
      vi.mocked(authService.authService.signIn).mockResolvedValue(mockResponse);
      
      renderWithProvider(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
      
      const signInButton = screen.getByTestId('sign-in');
      await act(async () => {
        signInButton.click();
      });
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('navigates to auth page after sign out', async () => {
      localStorage.setItem('token', 'existing-token');
      
      renderWithProvider(<TestComponent />);
      
      const signOutButton = screen.getByTestId('sign-out');
      await act(async () => {
        signOutButton.click();
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/auth');
    });
  });
}); 