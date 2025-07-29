import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import Dashboard from '../Dashboard';

describe('Dashboard Page', () => {
  it('renders basic layout elements', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('CodeMentor')).toBeInTheDocument();
  });

  it('renders welcome message', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Welcome back! 👋')).toBeInTheDocument();
  });

  it('has main container with proper styling', () => {
    render(<Dashboard />);
    
    const mainContainer = document.querySelector('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
  });
}); 