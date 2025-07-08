import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';

describe('Input Component', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<Input />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md');
    });

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text here" />);
      
      const input = screen.getByPlaceholderText('Enter text here');
      expect(input).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Input className="custom-input" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });
  });

  describe('Input Types', () => {
    it('renders as text input by default', () => {
      render(<Input />);
      
      const input = screen.getByRole('textbox');
      // Input defaults to text type when no type is specified
      const type = input.getAttribute('type');
      expect(type === null || type === 'text').toBe(true);
    });

    it('renders as password input', () => {
      render(<Input type="password" />);
      
      const input = screen.getByDisplayValue('') || document.querySelector('input[type="password"]');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders as email input', () => {
      render(<Input type="email" data-testid="email-input" />);
      
      const input = screen.getByTestId('email-input');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders as number input', () => {
      render(<Input type="number" data-testid="number-input" />);
      
      const input = screen.getByTestId('number-input');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('renders as search input', () => {
      render(<Input type="search" data-testid="search-input" />);
      
      const input = screen.getByTestId('search-input');
      expect(input).toHaveAttribute('type', 'search');
    });
  });

  describe('Value and onChange', () => {
    it('displays initial value', () => {
      render(<Input value="initial value" onChange={() => {}} />);
      
      const input = screen.getByDisplayValue('initial value');
      expect(input).toBeInTheDocument();
    });

    it('calls onChange when typing', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(<Input onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      
      expect(handleChange).toHaveBeenCalledTimes(4); // Called for each character
    });

    it('updates value when controlled', async () => {
      const user = userEvent.setup();
      let value = '';
      const handleChange = vi.fn((e) => {
        value = e.target.value;
      });
      
      const { rerender } = render(<Input value={value} onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'a');
      
      // Rerender with new value
      rerender(<Input value="a" onChange={handleChange} />);
      
      expect(screen.getByDisplayValue('a')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Input disabled />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('is focusable when enabled', () => {
      render(<Input />);
      
      const input = screen.getByRole('textbox');
      input.focus();
      expect(input).toHaveFocus();
    });

    it('is not focusable when disabled', async () => {
      const user = userEvent.setup();
      render(<Input disabled />);
      
      const input = screen.getByRole('textbox');
      
      // Try to focus disabled input
      await user.click(input);
      expect(input).not.toHaveFocus();
    });

    it('handles required attribute', () => {
      render(<Input required />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('handles readonly attribute', () => {
      render(<Input readOnly />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });
  });

  describe('HTML Attributes', () => {
    it('passes through HTML attributes', () => {
      render(
        <Input 
          name="username"
          id="username-input"
          data-testid="custom-input"
          maxLength={50}
          minLength={3}
        />
      );
      
      const input = screen.getByTestId('custom-input');
      expect(input).toHaveAttribute('name', 'username');
      expect(input).toHaveAttribute('id', 'username-input');
      expect(input).toHaveAttribute('maxlength', '50');
      expect(input).toHaveAttribute('minlength', '3');
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();
      
      render(<Input ref={ref} />);
      
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Keyboard Interactions', () => {
    it('responds to Enter key', async () => {
      const user = userEvent.setup();
      const handleKeyDown = vi.fn();
      
      render(<Input onKeyDown={handleKeyDown} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, '{Enter}');
      
      expect(handleKeyDown).toHaveBeenCalled();
    });

    it('responds to Escape key', async () => {
      const user = userEvent.setup();
      const handleKeyDown = vi.fn();
      
      render(<Input onKeyDown={handleKeyDown} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, '{Escape}');
      
      expect(handleKeyDown).toHaveBeenCalled();
    });

    it('responds to Tab key for focus management', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <Input data-testid="first-input" />
          <Input data-testid="second-input" />
        </div>
      );
      
      const firstInput = screen.getByTestId('first-input');
      const secondInput = screen.getByTestId('second-input');
      
      firstInput.focus();
      expect(firstInput).toHaveFocus();
      
      await user.tab();
      expect(secondInput).toHaveFocus();
    });
  });

  describe('Focus and Blur Events', () => {
    it('calls onFocus when focused', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      
      render(<Input onFocus={handleFocus} />);
      
      const input = screen.getByRole('textbox');
      await user.click(input);
      
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when focus is lost', async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();
      
      render(
        <div>
          <Input onBlur={handleBlur} data-testid="input" />
          <button>Other element</button>
        </div>
      );
      
      const input = screen.getByTestId('input');
      const button = screen.getByRole('button');
      
      await user.click(input);
      await user.click(button);
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has correct role for text input', () => {
      render(<Input />);
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('supports aria-label', () => {
      render(<Input aria-label="Username input" />);
      
      const input = screen.getByLabelText('Username input');
      expect(input).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <div>
          <Input aria-describedby="input-help" />
          <div id="input-help">Help text</div>
        </div>
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'input-help');
    });

    it('supports aria-invalid for error states', () => {
      render(<Input aria-invalid="true" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('File Input Special Case', () => {
    it('handles file input type', () => {
      render(<Input type="file" data-testid="file-input" />);
      
      const input = screen.getByTestId('file-input');
      expect(input).toHaveAttribute('type', 'file');
    });

    it('applies file-specific styles', () => {
      render(<Input type="file" />);
      
      const input = screen.getByDisplayValue('') || document.querySelector('input[type="file"]');
      expect(input).toHaveClass('file:border-0', 'file:bg-transparent');
    });
  });
}); 