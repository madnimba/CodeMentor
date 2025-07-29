import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import NotFound from '../NotFound';

// Mock console.error to avoid noise in tests
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('NotFound', () => {
  it('renders 404 page with correct content', () => {
    render(<NotFound />);
   
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Oops! Page not found')).toBeInTheDocument();
    expect(screen.getByText('Return to Home')).toBeInTheDocument();
  });

  it('has a link to home page', () => {
    render(<NotFound />);
   
    const homeLink = screen.getByRole('link', { name: /return to home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('logs error to console', () => {
    render(<NotFound />);
   
    expect(mockConsoleError).toHaveBeenCalledWith(
      '404 Error: User attempted to access non-existent route:',
      '/'
    );
  });
}); 