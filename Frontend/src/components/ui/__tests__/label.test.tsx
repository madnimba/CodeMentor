import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { Label } from '../label';

describe('Label Component', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Label>Label text</Label>);
      
      const label = screen.getByText('Label text');
      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe('LABEL');
      expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none');
    });

    it('applies custom className', () => {
      render(<Label className="custom-label">Label</Label>);
      
      const label = screen.getByText('Label');
      expect(label).toHaveClass('custom-label');
    });

    it('displays label text correctly', () => {
      render(<Label>Username</Label>);
      
      expect(screen.getByText('Username')).toBeInTheDocument();
    });
  });

  describe('HTML Attributes', () => {
    it('passes through HTML attributes', () => {
      render(
        <Label 
          htmlFor="username-input"
          id="username-label"
          data-testid="test-label"
        >
          Username
        </Label>
      );
      
      const label = screen.getByTestId('test-label');
      expect(label).toHaveAttribute('for', 'username-input');
      expect(label).toHaveAttribute('id', 'username-label');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      
      render(<Label ref={ref}>Label with ref</Label>);
      
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Form Association', () => {
    it('associates with input using htmlFor', () => {
      render(
        <div>
          <Label htmlFor="test-input">Test Label</Label>
          <input id="test-input" type="text" />
        </div>
      );
      
      const label = screen.getByText('Test Label');
      const input = screen.getByRole('textbox');
      
      expect(label).toHaveAttribute('for', 'test-input');
      expect(input).toHaveAttribute('id', 'test-input');
    });

    it('can wrap an input element', () => {
      render(
        <Label>
          Wrapped Input
          <input type="text" data-testid="wrapped-input" />
        </Label>
      );
      
      const label = screen.getByText('Wrapped Input');
      const input = screen.getByTestId('wrapped-input');
      
      expect(label).toContainElement(input);
    });
  });

  describe('Accessibility', () => {
    it('maintains label semantics', () => {
      render(<Label htmlFor="accessible-input">Accessible Label</Label>);
      
      const label = screen.getByText('Accessible Label');
      expect(label.tagName).toBe('LABEL');
    });

    it('supports ARIA attributes', () => {
      render(
        <Label 
          aria-label="Screen reader label"
          aria-describedby="help-text"
          data-testid="aria-label"
        >
          Visible Label
        </Label>
      );
      
      const label = screen.getByTestId('aria-label');
      expect(label).toHaveAttribute('aria-label', 'Screen reader label');
      expect(label).toHaveAttribute('aria-describedby', 'help-text');
    });
  });

  describe('Disabled States', () => {
    it('applies peer-disabled styling classes', () => {
      render(<Label>Disabled Label</Label>);
      
      const label = screen.getByText('Disabled Label');
      expect(label).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-70');
    });

    it('works with disabled input', () => {
      render(
        <div>
          <Label htmlFor="disabled-input">Disabled Input Label</Label>
          <input id="disabled-input" type="text" disabled />
        </div>
      );
      
      const label = screen.getByText('Disabled Input Label');
      const input = screen.getByRole('textbox');
      
      expect(label).toBeInTheDocument();
      expect(input).toBeDisabled();
    });
  });

  describe('Complex Content', () => {
    it('renders with nested elements', () => {
      render(
        <Label htmlFor="complex-input">
          <span>Required</span>
          <strong> * </strong>
          <span>Field Name</span>
        </Label>
      );
      
      const label = screen.getByText('Required');
      expect(label.closest('label')).toContainElement(screen.getByText('*'));
      expect(label.closest('label')).toContainElement(screen.getByText('Field Name'));
    });

    it('maintains accessibility with complex content', () => {
      render(
        <div>
          <Label htmlFor="complex-field">
            <span>Email Address</span>
            <span className="required">*</span>
            <small>(required)</small>
          </Label>
          <input id="complex-field" type="email" required />
        </div>
      );
      
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Email Address').closest('label');
      
      expect(label).toHaveAttribute('for', 'complex-field');
      expect(input).toBeRequired();
    });
  });

  describe('Event Handling', () => {
    it('handles onClick events', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      
      render(<Label onClick={handleClick}>Clickable Label</Label>);
      
      const label = screen.getByText('Clickable Label');
      await user.click(label);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles other mouse events', async () => {
      const user = userEvent.setup();
      const handleMouseEnter = vi.fn();
      const handleMouseLeave = vi.fn();
      
      render(
        <Label 
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Hover Label
        </Label>
      );
      
      const label = screen.getByText('Hover Label');
      
      // Use userEvent for better event simulation
      await user.hover(label);
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
      
      await user.unhover(label);
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });
  });
}); 