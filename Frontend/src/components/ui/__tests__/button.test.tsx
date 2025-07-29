import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../button';

describe('Button Component', () => {
  it('renders children correctly', () => {
    render(<Button>Test Button</Button>);
    
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('renders as button element', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
}); 