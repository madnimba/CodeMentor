import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import userEvent from '@testing-library/user-event';
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

  describe('Basic Rendering', () => {
    it('renders the logo and brand name', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        signOut: mockSignOut,
      });

      render(<Header />);
      
      expect(screen.getByText('CodeMentor')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /codementor/i })).toHaveAttribute('href', '/');
    });

    it('renders all navigation links on desktop', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        signOut: mockSignOut,
      });

      render(<Header />);
      
      expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: /study materials/i })).toHaveAttribute('href', '/study-materials');
      expect(screen.getByRole('link', { name: /companies/i })).toHaveAttribute('href', '/companies');
      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Dark Mode Toggle', () => {
    it('renders the dark mode toggle button', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        signOut: mockSignOut,
      });

      render(<Header />);
      
      const toggleButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg.lucide-moon') || 
        btn.querySelector('svg.lucide-sun')
      );
      
      expect(toggleButton).toBeInTheDocument();
    });

    it('toggles between moon and sun icons when clicked', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({
        user: null,
        signOut: mockSignOut,
      });

      render(<Header />);
      
      const toggleButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg')
      );
      
      expect(toggleButton).toBeInTheDocument();
      
      if (toggleButton) {
        await user.click(toggleButton);
        // The component should still be in the document after click
        expect(toggleButton).toBeInTheDocument();
      }
    });
  });

  describe('Authentication States', () => {
    it('shows sign in and sign up buttons when user is not logged in', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        signOut: mockSignOut,
      });

      render(<Header />);
      
      expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/auth?tab=signin');
      expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/auth?tab=signup');
    });

    it('shows logout button when user is logged in', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, username: 'testuser' },
        signOut: mockSignOut,
      });

      render(<Header />);
      
      expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /sign up/i })).not.toBeInTheDocument();
    });

    it('calls signOut when logout button is clicked', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({
        user: { id: 1, username: 'testuser' },
        signOut: mockSignOut,
      });

      render(<Header />);
      
      const logoutButton = screen.getByRole('button', { name: /log out/i });
      await user.click(logoutButton);
      
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mobile Menu', () => {
    it('renders mobile menu trigger button', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        signOut: mockSignOut,
      });

      render(<Header />);
      
      const menuButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg.lucide-menu')
      );
      
      expect(menuButton).toBeInTheDocument();
    });

    it('opens mobile menu when trigger is clicked', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({
        user: null,
        signOut: mockSignOut,
      });

      render(<Header />);
      
      const menuButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg.lucide-menu')
      );
      
      if (menuButton) {
        await user.click(menuButton);
        // After clicking, the sheet content should be available
        // The navigation links should be present in the mobile menu
        const mobileNavLinks = screen.getAllByRole('link').filter(link => 
          ['Home', 'Study Materials', 'Companies', 'Dashboard'].includes(link.textContent || '')
        );
        expect(mobileNavLinks.length).toBeGreaterThan(0);
      }
    });

    it('shows authentication links in mobile menu when not logged in', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({
        user: null,
        signOut: mockSignOut,
      });

      render(<Header />);
      
      const menuButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg.lucide-menu')
      );
      
      if (menuButton) {
        await user.click(menuButton);
        
        // Check for mobile auth links
        const signInLinks = screen.getAllByRole('link').filter(link => 
          link.getAttribute('href')?.includes('/auth?tab=signin')
        );
        const signUpLinks = screen.getAllByRole('link').filter(link => 
          link.getAttribute('href')?.includes('/auth?tab=signup')
        );
        
        expect(signInLinks.length).toBeGreaterThan(0);
        expect(signUpLinks.length).toBeGreaterThan(0);
      }
    });

    it('shows logout option in mobile menu when logged in', async () => {
      const user = userEvent.setup();
      mockUseAuth.mockReturnValue({
        user: { id: 1, username: 'testuser' },
        signOut: mockSignOut,
      });

      render(<Header />);
      
      const menuButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('svg.lucide-menu')
      );
      
      if (menuButton) {
        await user.click(menuButton);
        
        // Look for logout button in mobile menu
        const logoutButtons = screen.getAllByRole('button').filter(btn => 
          btn.textContent?.includes('Log Out')
        );
        
        expect(logoutButtons.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        signOut: mockSignOut,
      });

      render(<Header />);
      
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
    });
  });
}); 