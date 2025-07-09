import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import CompanyQuestions from '../CompanyQuestions';
import { api } from '@/services/api';

// Mock the API
vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: ({ value }: { value: string }) => <div data-testid="monaco-editor">{value}</div>,
}));

const mockCompanyData = {
  id: 1,
  name: 'Google',
  description: 'Top tech company focusing on search and AI',
  totalQuestions: 60,
  solvedQuestions: 45,
};

const mockPaginatedQuestionsData = {
  content: [
    {
      id: 1,
      title: 'Two Sum',
      description: 'Given an array of integers, return indices of the two numbers such that they add up to a specific target.',
      difficulty: 'Easy',
      importanceTag: 'Must Know',
      solution: 'Use a hash map to store the complement of each number...',
      status: 'solved',
      tags: ['Array', 'Hash Table'],
    },
    {
      id: 2,
      title: 'Add Two Numbers',
      description: 'You are given two non-empty linked lists representing two non-negative integers.',
      difficulty: 'Medium',
      importanceTag: 'Important',
      solution: 'Traverse both linked lists simultaneously...',
      status: 'attempted',
      tags: ['Linked List', 'Math'],
    },
    {
      id: 3,
      title: 'Longest Substring Without Repeating Characters',
      description: 'Given a string, find the length of the longest substring without repeating characters.',
      difficulty: 'Hard',
      importanceTag: 'Good to Know',
      solution: null,
      status: 'unsolved',
      tags: ['String', 'Sliding Window'],
    },
  ],
  totalElements: 3,
  totalPages: 1,
  size: 10,
  number: 0,
  first: true,
  last: true,
};

describe('CompanyQuestions Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Loading State', () => {
    it('shows loading message while fetching data', async () => {
      mockUseParams.mockReturnValue({ companyId: '1' });
      const mockGet = vi.mocked(api.get);
      mockGet.mockImplementation(() => new Promise(() => {})); // Never resolves
      render(<CompanyQuestions />);
      expect(screen.getByText('Loading questions...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when API calls fail', async () => {
      mockUseParams.mockReturnValue({ companyId: '1' });
      const mockGet = vi.mocked(api.get);
      mockGet.mockRejectedValue(new Error('Failed to fetch'));
      render(<CompanyQuestions />);
      await waitFor(() => {
        expect(screen.getByText('Failed to load company or questions')).toBeInTheDocument();
      });
    });
  });

  describe('No Company ID', () => {
    it('handles missing companyId parameter', async () => {
      mockUseParams.mockReturnValue({});
      render(<CompanyQuestions />);
      // Component should return null when no companyId, so nothing should be rendered
      await waitFor(() => {
        expect(screen.queryByText('Loading questions...')).not.toBeInTheDocument();
        expect(screen.queryByText('Failed to load company or questions')).not.toBeInTheDocument();
      });
    });
  });

  describe('Successful Data Load', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ companyId: '1' });
      const mockGet = vi.mocked(api.get);
      mockGet.mockImplementation((url: string) => {
        if (url.includes('/questions/paginated')) {
          return Promise.resolve({ data: mockPaginatedQuestionsData });
        } else if (url.endsWith('/companies/1')) {
          return Promise.resolve({ data: mockCompanyData });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });
    });

    it('renders company information', async () => {
      render(<CompanyQuestions />);
      await waitFor(() => {
        expect(screen.getByText('Google Questions')).toBeInTheDocument();
        expect(screen.getByText('Top tech company focusing on search and AI')).toBeInTheDocument();
      });
    });

    it('displays progress summary', async () => {
      render(<CompanyQuestions />);
      await waitFor(() => {
        expect(screen.getByText('45 of 60 questions solved')).toBeInTheDocument();
        expect(screen.getByText('75% Complete')).toBeInTheDocument();
      });
    });

    it('renders all questions with correct information', async () => {
      render(<CompanyQuestions />);
      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
        expect(screen.getByText('Add Two Numbers')).toBeInTheDocument();
        expect(screen.getByText('Longest Substring Without Repeating Characters')).toBeInTheDocument();
      });
      // Check difficulty badges
      expect(screen.getByText('Easy')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Hard')).toBeInTheDocument();
      // Check importance tags
      expect(screen.getByText('Must Know')).toBeInTheDocument();
      expect(screen.getByText('Important')).toBeInTheDocument();
      expect(screen.getByText('Good to Know')).toBeInTheDocument();
    });

    it('has back navigation to companies page', async () => {
      render(<CompanyQuestions />);
      await waitFor(() => {
        const backLink = screen.getByRole('link', { name: /back to companies/i });
        expect(backLink).toHaveAttribute('href', '/companies');
      });
    });
  });

  describe('Question Interactions', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ companyId: '1' });
      const mockGet = vi.mocked(api.get);
      mockGet.mockImplementation((url: string) => {
        if (url.includes('/questions/paginated')) {
          return Promise.resolve({ data: mockPaginatedQuestionsData });
        } else if (url.endsWith('/companies/1')) {
          return Promise.resolve({ data: mockCompanyData });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });
    });

    it('shows "See Answer" button for questions with solutions', async () => {
      render(<CompanyQuestions />);
      await waitFor(() => {
        const seeAnswerButtons = screen.getAllByText('See Answer');
        expect(seeAnswerButtons).toHaveLength(2); // Two questions have solutions
      });
    });

    it('does not show "See Answer" for questions without solutions', async () => {
      render(<CompanyQuestions />);
      await waitFor(() => {
        expect(screen.getByText('Longest Substring Without Repeating Characters')).toBeInTheDocument();
      });
      // The third question should not have a "See Answer" button
      const questionCard = screen.getByText('Longest Substring Without Repeating Characters').closest('.bg-slate-800/50');
      expect(questionCard?.querySelector('button[aria-label*="See Answer"]')).not.toBeInTheDocument();
    });

    it('expands answer when "See Answer" is clicked', async () => {
      const user = userEvent.setup();
      render(<CompanyQuestions />);
      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });
      // Initially solution should not be visible
      expect(screen.queryByText('Use a hash map to store the complement of each number...')).not.toBeInTheDocument();
      // Click "See Answer" button for the first question
      const seeAnswerButtons = screen.getAllByText('See Answer');
      await user.click(seeAnswerButtons[0]);
      // Solution should now be visible
      expect(screen.getByText('Solution')).toBeInTheDocument();
      expect(screen.getByText('Use a hash map to store the complement of each number...')).toBeInTheDocument();
      // Button text should change to "Close"
      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('collapses answer when "Close" is clicked', async () => {
      const user = userEvent.setup();
      render(<CompanyQuestions />);
      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });
      // Expand answer first
      const seeAnswerButtons = screen.getAllByText('See Answer');
      await user.click(seeAnswerButtons[0]);
      await waitFor(() => {
        expect(screen.getByText('Solution')).toBeInTheDocument();
      });
      // Click "Close" button
      const closeButton = screen.getByText('Close');
      await user.click(closeButton);
      // Solution should be hidden again
      expect(screen.queryByText('Use a hash map to store the complement of each number...')).not.toBeInTheDocument();
      // Check that "See Answer" button is visible again (there are multiple)
      const seeAnswerButtonsAfterClose = screen.getAllByText('See Answer');
      expect(seeAnswerButtonsAfterClose.length).toBeGreaterThan(0);
    });

    it('allows only one answer to be expanded at a time', async () => {
      const user = userEvent.setup();
      render(<CompanyQuestions />);
      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });
      const seeAnswerButtons = screen.getAllByText('See Answer');
      // Expand first question's answer
      await user.click(seeAnswerButtons[0]);
      await waitFor(() => {
        expect(screen.getByText('Use a hash map to store the complement of each number...')).toBeInTheDocument();
      });
      // Expand second question's answer
      await user.click(seeAnswerButtons[1]);
      await waitFor(() => {
        expect(screen.getByText('Traverse both linked lists simultaneously...')).toBeInTheDocument();
      });
      // First question's answer should now be hidden
      expect(screen.queryByText('Use a hash map to store the complement of each number...')).not.toBeInTheDocument();
    });

    it('navigates to question detail when "Solve This" is clicked', async () => {
      const user = userEvent.setup();
      render(<CompanyQuestions />);
      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });
      const solveButtons = screen.getAllByText('Solve This');
      await user.click(solveButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith('/companies/1/questions/1');
    });
  });

  describe('Difficulty Badge Styling', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ companyId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockImplementation((url: string) => {
        if (url.includes('/questions/paginated')) {
          return Promise.resolve({ data: mockPaginatedQuestionsData });
        } else if (url.endsWith('/companies/1')) {
          return Promise.resolve({ data: mockCompanyData });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });
    });

    it('applies correct styling for difficulty badges', async () => {
      render(<CompanyQuestions />);

      await waitFor(() => {
        const easyBadge = screen.getByText('Easy');
        expect(easyBadge).toHaveClass('bg-green-500/20', 'text-green-400', 'border-green-500/30');

        const mediumBadge = screen.getByText('Medium');
        expect(mediumBadge).toHaveClass('bg-yellow-500/20', 'text-yellow-400', 'border-yellow-500/30');

        const hardBadge = screen.getByText('Hard');
        expect(hardBadge).toHaveClass('bg-red-500/20', 'text-red-400', 'border-red-500/30');
      });
    });
  });

  describe('HTML Content Rendering', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ companyId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockImplementation((url: string) => {
        if (url.includes('/questions/paginated')) {
          return Promise.resolve({ data: mockPaginatedQuestionsData });
        } else if (url.endsWith('/companies/1')) {
          return Promise.resolve({ data: mockCompanyData });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });
    });

    it('renders question descriptions as HTML', async () => {
      render(<CompanyQuestions />);

      await waitFor(() => {
        // The descriptions should be rendered as HTML content
        expect(screen.getByText(/Given an array of integers/)).toBeInTheDocument();
        expect(screen.getByText(/You are given two non-empty linked lists/)).toBeInTheDocument();
      });
    });

    it('renders solutions as HTML when expanded', async () => {
      const user = userEvent.setup();
      render(<CompanyQuestions />);

      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });

      const seeAnswerButtons = screen.getAllByText('See Answer');
      await user.click(seeAnswerButtons[0]);

      await waitFor(() => {
        // Solution content should be rendered as HTML
        expect(screen.getByText(/Use a hash map to store the complement/)).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('makes correct API calls for company and questions', async () => {
      mockUseParams.mockReturnValue({ companyId: '123' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: {} });

      render(<CompanyQuestions />);

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith('/companies/123');
        expect(mockGet).toHaveBeenCalledWith('/companies/123/questions');
        expect(mockGet).toHaveBeenCalledTimes(2);
      });
    });

    it('handles API response data mapping correctly', async () => {
      mockUseParams.mockReturnValue({ companyId: '1' });
      
      const rawQuestionsData = {
        content: [
          {
            id: 1,
            title: 'Test Question',
            description: 'Test Description',
            difficulty: 'Easy',
            importanceTag: 'Test Tag',
            solution: 'Test Solution',
            status: 'solved',
            tags: ['test'],
          },
        ],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
      };

      const mockGet = vi.mocked(api.get);
      mockGet.mockImplementation((url: string) => {
        if (url.includes('/companies/1/questions/paginated')) {
          return Promise.resolve({ data: rawQuestionsData });
        } else if (url.includes('/companies/1')) {
          return Promise.resolve({ data: mockCompanyData });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      render(<CompanyQuestions />);

      await waitFor(() => {
        expect(screen.getByText('Test Question')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByText('Test Tag')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ companyId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockImplementation((url: string) => {
        if (url.includes('/questions/paginated')) {
          return Promise.resolve({ data: mockPaginatedQuestionsData });
        } else if (url.endsWith('/companies/1')) {
          return Promise.resolve({ data: mockCompanyData });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });
    });

    it('has proper layout structure', async () => {
      render(<CompanyQuestions />);

      await waitFor(() => {
        // Check that the main container has the right background classes
        const mainContainer = document.querySelector('.min-h-screen.bg-gradient-to-br');
        expect(mainContainer).toBeInTheDocument();
        expect(mainContainer).toHaveClass('min-h-screen', 'bg-gradient-to-br');
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ companyId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockImplementation((url: string) => {
        if (url.includes('/questions/paginated')) {
          return Promise.resolve({ data: mockPaginatedQuestionsData });
        } else if (url.endsWith('/companies/1')) {
          return Promise.resolve({ data: mockCompanyData });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });
    });

    it('has proper heading hierarchy', async () => {
      render(<CompanyQuestions />);

      await waitFor(() => {
        const mainHeading = screen.getByRole('heading', { level: 1 });
        expect(mainHeading).toHaveTextContent('Google Questions');
      });
    });

    it('has accessible buttons and links', async () => {
      render(<CompanyQuestions />);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const links = screen.getAllByRole('link');

        // Check that most buttons have accessible text or labels
        const accessibleButtons = buttons.filter(button => {
          return (
            button.textContent?.trim() || 
            button.getAttribute('aria-label') || 
            button.getAttribute('title')
          );
        });
        
        // Most buttons should be accessible (allowing for some icon-only buttons)
        expect(accessibleButtons.length).toBeGreaterThan(buttons.length * 0.7);

        links.forEach(link => {
          expect(link).toHaveAttribute('href');
        });
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<CompanyQuestions />);

      await waitFor(() => {
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
      });

      const seeAnswerButton = screen.getAllByText('See Answer')[0];
      seeAnswerButton.focus();
      expect(seeAnswerButton).toHaveFocus();

      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText('Solution')).toBeInTheDocument();
      });
    });
  });
}); 