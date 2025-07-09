import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import LiveCoding from '../LiveCoding';
import { api } from '@/services/api';

// Mock the API
vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

// Mock react-router-dom
const mockUseParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => mockUseParams(),
  };
});

// Mock Monaco Editor
const mockOnChange = vi.fn();
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <div data-testid="monaco-editor">
      <textarea
        data-testid="code-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}));

const mockQuestionData = {
  id: 1,
  title: 'Two Sum',
  description: '<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>',
  difficulty: 'Easy',
  importanceTag: 'Must Know',
  solution: 'function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n}',
  tags: ['Array', 'Hash Table'],
};

describe('LiveCoding Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows loading message while fetching question', async () => {
      mockUseParams.mockReturnValue({ companyId: '1', questionId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<LiveCoding />);

      expect(screen.getByText('Loading question...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when API call fails', async () => {
      mockUseParams.mockReturnValue({ companyId: '1', questionId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockRejectedValue(new Error('Failed to fetch question'));

      render(<LiveCoding />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load question.')).toBeInTheDocument();
      });
    });

    it('shows error when question data is not found', async () => {
      mockUseParams.mockReturnValue({ companyId: '1', questionId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: null });

      render(<LiveCoding />);

      await waitFor(() => {
        expect(screen.getByText('Question not found.')).toBeInTheDocument();
      });
    });
  });

  describe('Missing Parameters', () => {
    it('does not make API call when companyId is missing', () => {
      mockUseParams.mockReturnValue({ questionId: '1' });
      
      const mockGet = vi.mocked(api.get);
      
      render(<LiveCoding />);

      expect(mockGet).not.toHaveBeenCalled();
    });

    it('does not make API call when questionId is missing', () => {
      mockUseParams.mockReturnValue({ companyId: '1' });
      
      const mockGet = vi.mocked(api.get);
      
      render(<LiveCoding />);

      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe('Successful Data Load', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ companyId: '1', questionId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: mockQuestionData });
    });

    it('renders header and footer', async () => {
      render(<LiveCoding />);

      await waitFor(() => {
        expect(screen.getByText('CodeMentor')).toBeInTheDocument();
        expect(screen.getByText('© 2024 CodeMentor BD. All rights reserved. Built with ❤️ for Bangladesh\'s tech community.')).toBeInTheDocument();
      });
    });

    it('displays back navigation to questions', async () => {
      render(<LiveCoding />);

      await waitFor(() => {
        const backLink = screen.getByRole('link', { name: /back to questions/i });
        expect(backLink).toHaveAttribute('href', '/companies/1');
      });
    });

    it('shows difficulty badge with correct styling', async () => {
      render(<LiveCoding />);

      await waitFor(() => {
        const difficultyBadge = screen.getByText('Easy');
        expect(difficultyBadge).toHaveClass('bg-green-500/20', 'text-green-400', 'border-green-500/30');
      });
    });

    it('displays question description', async () => {
      render(<LiveCoding />);

      await waitFor(() => {
        expect(screen.getByText('Description')).toBeInTheDocument();
        // Check for content rendered as HTML
        expect(screen.getByText(/Given an array of integers/)).toBeInTheDocument();
      });
    });

    it('renders code editor with initial code', async () => {
      render(<LiveCoding />);

      await waitFor(() => {
        expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
        expect(screen.getByText('Code Editor')).toBeInTheDocument();
      });

      const codeTextarea = screen.getByTestId('code-textarea');
      expect(codeTextarea).toHaveValue('// Write your solution here\nfunction solution() {\n    // Your code goes here\n}');
    });

    it('has Run Code and Submit buttons', async () => {
      render(<LiveCoding />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /run code/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
      });
    });
  });

  describe('Code Editor Interaction', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ companyId: '1', questionId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: mockQuestionData });
    });

    it('allows code editing', async () => {
      const user = userEvent.setup();
      render(<LiveCoding />);

      await waitFor(() => {
        expect(screen.getByTestId('code-textarea')).toBeInTheDocument();
      });

      const codeTextarea = screen.getByTestId('code-textarea');
      await user.clear(codeTextarea);
      await user.type(codeTextarea, 'console.log("Hello, world!");');

      expect(codeTextarea).toHaveValue('console.log("Hello, world!");');
    });

    it('updates code state when editor content changes', async () => {
      const user = userEvent.setup();
      render(<LiveCoding />);

      await waitFor(() => {
        expect(screen.getByTestId('code-textarea')).toBeInTheDocument();
      });

      const codeTextarea = screen.getByTestId('code-textarea');
      await user.clear(codeTextarea);
      await user.type(codeTextarea, 'const result = 42;');

      expect(codeTextarea).toHaveValue('const result = 42;');
    });
  });

  describe('Difficulty Badge Styling', () => {
    it('applies correct styling for Easy difficulty', async () => {
      mockUseParams.mockReturnValue({ companyId: '1', questionId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: { ...mockQuestionData, difficulty: 'Easy' } });

      render(<LiveCoding />);

      await waitFor(() => {
        const badge = screen.getByText('Easy');
        expect(badge).toHaveClass('bg-green-500/20', 'text-green-400', 'border-green-500/30');
      });
    });

    it('applies correct styling for Medium difficulty', async () => {
      mockUseParams.mockReturnValue({ companyId: '1', questionId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: { ...mockQuestionData, difficulty: 'Medium' } });

      render(<LiveCoding />);

      await waitFor(() => {
        const badge = screen.getByText('Medium');
        expect(badge).toHaveClass('bg-yellow-500/20', 'text-yellow-400', 'border-yellow-500/30');
      });
    });

    it('applies correct styling for Hard difficulty', async () => {
      mockUseParams.mockReturnValue({ companyId: '1', questionId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: { ...mockQuestionData, difficulty: 'Hard' } });

      render(<LiveCoding />);

      await waitFor(() => {
        const badge = screen.getByText('Hard');
        expect(badge).toHaveClass('bg-red-500/20', 'text-red-400', 'border-red-500/30');
      });
    });
  });

  describe('API Integration', () => {
    it('calls the correct API endpoint', async () => {
      mockUseParams.mockReturnValue({ companyId: '123', questionId: '456' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: mockQuestionData });

      render(<LiveCoding />);

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith('/companies/123/questions/456');
      });
    });

    it('handles API response data correctly', async () => {
      mockUseParams.mockReturnValue({ companyId: '1', questionId: '1' });
      
      const customQuestionData = {
        id: 999,
        title: 'Custom Problem',
        description: '<p>This is a custom problem description.</p>',
        difficulty: 'Medium',
        solution: 'function customSolution() { return 42; }',
      };

      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: customQuestionData });

      render(<LiveCoding />);

      await waitFor(() => {
        // Check for title as heading or text
        expect(screen.getByText(/custom problem/i)).toBeInTheDocument();
        expect(screen.getByText('Medium')).toBeInTheDocument();
        expect(screen.getByText(/This is a custom problem description/)).toBeInTheDocument();
      });
    });
  });

  describe('Button Interactions', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ companyId: '1', questionId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: mockQuestionData });
    });

    it('renders Run Code button with correct styling', async () => {
      render(<LiveCoding />);

      await waitFor(() => {
        const runButton = screen.getByRole('button', { name: /run code/i });
        expect(runButton).toHaveClass('bg-purple-600', 'hover:bg-purple-700');
      });
    });

    it('renders Submit button with correct styling', async () => {
      render(<LiveCoding />);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /submit/i });
        expect(submitButton).toHaveClass('bg-green-600', 'hover:bg-green-700');
      });
    });

    it('buttons are clickable', async () => {
      const user = userEvent.setup();
      render(<LiveCoding />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /run code/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
      });

      const runButton = screen.getByRole('button', { name: /run code/i });
      const submitButton = screen.getByRole('button', { name: /submit/i });

      await user.click(runButton);
      await user.click(submitButton);

      // Buttons should be clickable without errors
      expect(runButton).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Layout and Responsive Design', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ companyId: '1', questionId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: mockQuestionData });
    });

    it('has proper layout structure', async () => {
      render(<LiveCoding />);

      await waitFor(() => {
        // Check that the main container has the right background classes
        const mainContainer = document.querySelector('.min-h-screen.bg-gradient-to-br');
        expect(mainContainer).toBeInTheDocument();
        expect(mainContainer).toHaveClass('min-h-screen', 'bg-gradient-to-br');
      });
    });

    it('has two-column layout for large screens', async () => {
      render(<LiveCoding />);

      await waitFor(() => {
        const gridContainer = screen.getByText('Description').closest('.grid');
        expect(gridContainer).toHaveClass('grid-cols-1', 'lg:grid-cols-2');
      });
    });
  });

  describe('HTML Content Rendering', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ companyId: '1', questionId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: mockQuestionData });
    });

    it('renders question description as HTML', async () => {
      render(<LiveCoding />);

      await waitFor(() => {
        // Check that HTML content is rendered properly
        expect(screen.getByText(/Given an array of integers/)).toBeInTheDocument();
        expect(screen.getByText('nums')).toBeInTheDocument();
        const targetElements = screen.getAllByText('target');
        expect(targetElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ companyId: '1', questionId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: mockQuestionData });
    });

    it('has proper heading hierarchy', async () => {
      render(<LiveCoding />);

      await waitFor(() => {
        const headings = screen.getAllByRole('heading');
        expect(headings.length).toBeGreaterThan(0);
      });
    });

    it('has accessible buttons with descriptive text', async () => {
      render(<LiveCoding />);

      await waitFor(() => {
        const runButton = screen.getByRole('button', { name: /run code/i });
        const submitButton = screen.getByRole('button', { name: /submit/i });

        expect(runButton.textContent).toMatch(/run code/i);
        expect(submitButton.textContent).toMatch(/submit/i);
      });
    });

    it('has accessible navigation links', async () => {
      render(<LiveCoding />);

      await waitFor(() => {
        const backLink = screen.getByRole('link', { name: /back to questions/i });
        expect(backLink).toHaveAttribute('href', '/companies/1');
        expect(backLink.textContent).toBeTruthy();
      });
    });

    it('has proper labels and structure', async () => {
      render(<LiveCoding />);

      await waitFor(() => {
        expect(screen.getByText('Description')).toBeInTheDocument();
        expect(screen.getByText('Code Editor')).toBeInTheDocument();
      });
    });
  });

  describe('Monaco Editor Configuration', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ companyId: '1', questionId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: mockQuestionData });
    });

    it('renders Monaco editor component', async () => {
      render(<LiveCoding />);

      await waitFor(() => {
        expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
      });
    });

    it('has appropriate editor height', async () => {
      render(<LiveCoding />);

      await waitFor(() => {
        const editorContainer = screen.getByTestId('monaco-editor').closest('.h-\\[400px\\]');
        expect(editorContainer).toBeInTheDocument();
      });
    });
  });
}); 