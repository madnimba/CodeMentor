import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import Auth from '../Auth';

// Mock the auth context
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockGoogleSignIn = vi.fn();
const mockGoogleSignUp = vi.fn();
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
  GoogleSignInButton: ({ onCredential, buttonText }: any) => (
    <button 
      onClick={() => onCredential('mock-token')}
      data-testid="google-signin-button"
    >
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
      googleSignIn: mockGoogleSignIn,
      googleSignUp: mockGoogleSignUp,
    });
    mockSearchParams.get = vi.fn().mockReturnValue(null);
  });

  describe('Page Structure', () => {
    it('renders header and footer', () => {
      render(<Auth />);
      
      expect(screen.getByText('CodeMentor')).toBeInTheDocument();
      expect(screen.getByText('© 2024 CodeMentor BD. All rights reserved. Built with ❤️ for Bangladesh\'s tech community.')).toBeInTheDocument();
    });

    it('renders the welcome message', () => {
      render(<Auth />);
      
      expect(screen.getByText('Welcome to CodeMentor BD')).toBeInTheDocument();
      expect(screen.getByText('Join Bangladesh\'s premier coding community')).toBeInTheDocument();
    });

    it('renders tabs for sign in and sign up', () => {
      render(<Auth />);
      
      expect(screen.getByRole('tab', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /sign up/i })).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('defaults to sign in tab', () => {
      render(<Auth />);
      
      expect(screen.getByRole('tab', { name: /sign in/i })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Enter your credentials to access your account')).toBeInTheDocument();
    });

    it('switches to sign up tab when clicked', async () => {
      const user = userEvent.setup();
      render(<Auth />);
      
      const signUpTab = screen.getByRole('tab', { name: /sign up/i });
      await user.click(signUpTab);
      
      expect(signUpTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Join thousands of developers preparing for their dream jobs')).toBeInTheDocument();
    });

    it('updates URL when tab changes', async () => {
      const user = userEvent.setup();
      render(<Auth />);
      
      const signUpTab = screen.getByRole('tab', { name: /sign up/i });
      await user.click(signUpTab);
      
      expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: 'signup' });
    });

    it('reads initial tab from URL parameters', () => {
      mockSearchParams.get = vi.fn().mockReturnValue('signup');
      render(<Auth />);
      
      expect(screen.getByRole('tab', { name: /sign up/i })).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Sign In Form', () => {
    beforeEach(() => {
      render(<Auth />);
    });

    it('renders sign in form fields', () => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('has password visibility toggle', async () => {
      const user = userEvent.setup();
      
      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg.lucide-eye') || btn.querySelector('svg.lucide-eye-off')
      );
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      if (toggleButton) {
        await user.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');
      }
    });

    it('submits form with valid credentials', async () => {
      const user = userEvent.setup();
      
      const usernameInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      expect(mockSignIn).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
    });

    it('displays error message on sign in failure', async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValue(new Error('Invalid credentials'));
      
      const usernameInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(usernameInput, 'wronguser');
      await user.type(passwordInput, 'wrongpass');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
      });
    });

    it('renders Google sign in button', () => {
      expect(screen.getByTestId('google-signin-button')).toBeInTheDocument();
      expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    });

    it('handles Google sign in', async () => {
      const user = userEvent.setup();
      
      const googleButton = screen.getByTestId('google-signin-button');
      await user.click(googleButton);
      
      expect(mockGoogleSignIn).toHaveBeenCalledWith('mock-token');
    });
  });

  describe('Sign Up Form', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<Auth />);
      
      const signUpTab = screen.getByRole('tab', { name: /sign up/i });
      await user.click(signUpTab);
    });

    it('renders sign up form fields', () => {
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getAllByLabelText(/password/i)).toHaveLength(2); // Password and Confirm Password
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('has password visibility toggles for both password fields', async () => {
      const user = userEvent.setup();
      
      const passwordInputs = screen.getAllByDisplayValue('').filter(input => 
        input.getAttribute('type') === 'password'
      );
      
      expect(passwordInputs).toHaveLength(2);
      
      const toggleButtons = screen.getAllByRole('button').filter(btn => 
        btn.querySelector('svg.lucide-eye') || btn.querySelector('svg.lucide-eye-off')
      );
      
      expect(toggleButtons.length).toBeGreaterThanOrEqual(2);
    });

    it('validates password confirmation', async () => {
      const user = userEvent.setup();
      
      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInputs = screen.getAllByLabelText(/password/i);
      const passwordInput = passwordInputs[0];
      const confirmPasswordInput = passwordInputs[1];
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await user.type(usernameInput, 'newuser');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'differentpassword');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
      
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      
      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInputs = screen.getAllByLabelText(/password/i);
      const passwordInput = passwordInputs[0];
      const confirmPasswordInput = passwordInputs[1];
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await user.type(usernameInput, 'newuser');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);
      
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'newuser',
        password: 'password123',
      });
    });

    it('displays error message on sign up failure', async () => {
      const user = userEvent.setup();
      mockSignUp.mockRejectedValue(new Error('Username already exists'));
      
      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInputs = screen.getAllByLabelText(/password/i);
      const passwordInput = passwordInputs[0];
      const confirmPasswordInput = passwordInputs[1];
      const submitButton = screen.getByRole('button', { name: /create account/i });
      
      await user.type(usernameInput, 'existinguser');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Signup failed. Try a different email or username.')).toBeInTheDocument();
      });
    });

    it('handles Google sign up', async () => {
      const user = userEvent.setup();
      
      const googleButton = screen.getByTestId('google-signin-button');
      await user.click(googleButton);
      
      expect(mockGoogleSignUp).toHaveBeenCalledWith('mock-token');
    });
  });

  describe('Cross-tab Navigation', () => {
    it('has link to switch from sign in to sign up', async () => {
      const user = userEvent.setup();
      render(<Auth />);
      
      const switchLink = screen.getByRole('button', { name: /sign up here/i });
      await user.click(switchLink);
      
      expect(screen.getByRole('tab', { name: /sign up/i })).toHaveAttribute('aria-selected', 'true');
    });

    it('has link to switch from sign up to sign in', async () => {
      const user = userEvent.setup();
      render(<Auth />);
      
      // First switch to sign up
      const signUpTab = screen.getByRole('tab', { name: /sign up/i });
      await user.click(signUpTab);
      
      // Then find and click the switch link
      const switchLink = screen.getByRole('button', { name: /sign in here/i });
      await user.click(switchLink);
      
      expect(screen.getByRole('tab', { name: /sign in/i })).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('User Redirection', () => {
    it('redirects authenticated users to dashboard', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, username: 'testuser' },
        signIn: mockSignIn,
        signUp: mockSignUp,
        googleSignIn: mockGoogleSignIn,
        googleSignUp: mockGoogleSignUp,
      });
      
      render(<Auth />);
      
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Form Validation', () => {
    it('requires all fields in sign in form', async () => {
      const user = userEvent.setup();
      render(<Auth />);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      const usernameInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(usernameInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });

    it('requires all fields in sign up form', async () => {
      const user = userEvent.setup();
      render(<Auth />);
      
      const signUpTab = screen.getByRole('tab', { name: /sign up/i });
      await user.click(signUpTab);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInputs = screen.getAllByLabelText(/password/i);
      
      expect(usernameInput).toBeRequired();
      expect(emailInput).toBeRequired();
      expect(passwordInputs[0]).toBeRequired();
      expect(passwordInputs[1]).toBeRequired();
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      render(<Auth />);
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('has proper ARIA attributes for tabs', () => {
      render(<Auth />);
      
      const signInTab = screen.getByRole('tab', { name: /sign in/i });
      const signUpTab = screen.getByRole('tab', { name: /sign up/i });
      
      expect(signInTab).toHaveAttribute('aria-selected');
      expect(signUpTab).toHaveAttribute('aria-selected');
    });

    it('maintains focus management', async () => {
      const user = userEvent.setup();
      render(<Auth />);
      
      const usernameInput = screen.getByLabelText(/email/i);
      await user.click(usernameInput);
      
      expect(usernameInput).toHaveFocus();
    });
  });
}); 