import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { Footer } from '../Footer';

describe('Footer Component', () => {
  it('renders footer content', () => {
    render(<Footer />);
    
    expect(screen.getByText(/© 2024 CodeMentor BD. All rights reserved./)).toBeInTheDocument();
  });

  it('renders as footer element', () => {
    render(<Footer />);
    
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
}); 