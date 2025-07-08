import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import Article from '../Article';
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

const mockArticlesData = [
  {
    id: 1,
    title: 'Introduction to Arrays',
    content: `# Arrays in Programming

Arrays are one of the fundamental data structures in computer science.

## What is an Array?

An array is a collection of elements stored at contiguous memory locations.

### Basic Operations

Arrays support several basic operations:
- Insertion
- Deletion
- Traversal

\`\`\`
function traverse(arr) {
  for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);
  }
}
\`\`\`

Arrays are essential for many algorithms.`,
    topicName: 'Data Structures',
    subtopicName: 'Arrays',
    isApproved: true,
    createdByUsername: 'john_doe',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    title: 'Advanced Array Techniques',
    content: `# Advanced Array Operations

This article covers advanced techniques for working with arrays.

## Two Pointer Technique

The two-pointer technique is useful for many array problems.

## Sliding Window

Sliding window is another powerful technique.`,
    topicName: 'Data Structures',
    subtopicName: 'Arrays',
    isApproved: false,
    createdByUsername: 'jane_smith',
    createdAt: '2024-01-14T14:20:00Z',
  },
];

describe('Article Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows loading spinner while fetching articles', async () => {
      mockUseParams.mockReturnValue({ subtopicId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<Article />);

      expect(screen.getByText('Loading article(s)...')).toBeInTheDocument();
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('renders header and footer during loading', () => {
      mockUseParams.mockReturnValue({ subtopicId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockImplementation(() => new Promise(() => {}));

      render(<Article />);

      expect(screen.getByText('CodeMentor')).toBeInTheDocument();
      expect(screen.getByText('© 2024 CodeMentor BD. All rights reserved. Built with ❤️ for Bangladesh\'s tech community.')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when API call fails', async () => {
      mockUseParams.mockReturnValue({ subtopicId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockRejectedValue(new Error('Failed to fetch articles'));

      render(<Article />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load article(s)')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Retry');
      expect(retryButton).toBeInTheDocument();
    });

    it('reloads page when retry button is clicked', async () => {
      const user = userEvent.setup();
      mockUseParams.mockReturnValue({ subtopicId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockRejectedValue(new Error('Failed to fetch articles'));

      // Mock window.location.reload
      const reloadMock = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
      });

      render(<Article />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load article(s)')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);

      expect(reloadMock).toHaveBeenCalled();
    });
  });

  describe('No SubtopicId Parameter', () => {
    it('shows no articles when subtopicId is missing', () => {
      mockUseParams.mockReturnValue({});
      
      render(<Article />);

      expect(screen.getByText('No articles found for this subtopic.')).toBeInTheDocument();
    });

    it('renders back button even when no subtopicId', () => {
      mockUseParams.mockReturnValue({});
      
      render(<Article />);

      const backLink = screen.getByRole('link', { name: /back to study materials/i });
      expect(backLink).toHaveAttribute('href', '/study-materials');
    });
  });

  describe('Successful Data Load', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ subtopicId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: { data: mockArticlesData } });
    });

    it('renders back navigation to study materials', async () => {
      render(<Article />);

      await waitFor(() => {
        const backLink = screen.getByRole('link', { name: /back to study materials/i });
        expect(backLink).toHaveAttribute('href', '/study-materials');
      });
    });

    it('displays all articles for the subtopic', async () => {
      render(<Article />);

      await waitFor(() => {
        expect(screen.getByText('Introduction to Arrays')).toBeInTheDocument();
        expect(screen.getByText('Advanced Array Techniques')).toBeInTheDocument();
      });
    });

    it('shows article metadata correctly', async () => {
      render(<Article />);

      await waitFor(() => {
        // Check author information
        expect(screen.getByText('john_doe')).toBeInTheDocument();
        expect(screen.getByText('jane_smith')).toBeInTheDocument();

        // Check dates
        expect(screen.getByText('2024-01-15')).toBeInTheDocument();
        expect(screen.getByText('2024-01-14')).toBeInTheDocument();
      });
    });

    it('displays topic and subtopic badges', async () => {
      render(<Article />);

      await waitFor(() => {
        const dataStructuresBadges = screen.getAllByText('Data Structures');
        expect(dataStructuresBadges.length).toBe(2); // One for each article

        const arraysBadges = screen.getAllByText('Arrays');
        expect(arraysBadges.length).toBe(2); // One for each article
      });
    });

    it('shows approval status badges', async () => {
      render(<Article />);

      await waitFor(() => {
        const approvedBadges = screen.getAllByText('Approved');
        expect(approvedBadges.length).toBe(1); // Only one article is approved
      });
    });
  });

  describe('Content Rendering', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ subtopicId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: { data: mockArticlesData } });
    });

    it('renders markdown-style content with proper formatting', async () => {
      render(<Article />);

      await waitFor(() => {
        // Check for h1 headings
        expect(screen.getByText('Arrays in Programming')).toBeInTheDocument();
        expect(screen.getByText('Advanced Array Operations')).toBeInTheDocument();

        // Check for h2 headings
        expect(screen.getByText('What is an Array?')).toBeInTheDocument();
        expect(screen.getByText('Two Pointer Technique')).toBeInTheDocument();

        // Check for h3 headings
        expect(screen.getByText('Basic Operations')).toBeInTheDocument();

        // Check for regular paragraphs
        expect(screen.getByText('Arrays are one of the fundamental data structures in computer science.')).toBeInTheDocument();
        expect(screen.getByText('An array is a collection of elements stored at contiguous memory locations.')).toBeInTheDocument();
      });
    });

    it('renders code blocks properly', async () => {
      render(<Article />);

      await waitFor(() => {
        // Check for code content
        expect(screen.getByText(/function traverse/)).toBeInTheDocument();
        expect(screen.getByText(/console.log/)).toBeInTheDocument();
      });
    });

    it('handles different heading levels correctly', async () => {
      render(<Article />);

      await waitFor(() => {
        // Check that headings are rendered with appropriate HTML elements
        const h1Elements = screen.getAllByRole('heading', { level: 1 });
        const h2Elements = screen.getAllByRole('heading', { level: 2 });
        const h3Elements = screen.getAllByRole('heading', { level: 3 });

        expect(h1Elements.length).toBeGreaterThan(0);
        expect(h2Elements.length).toBeGreaterThan(0);
        expect(h3Elements.length).toBeGreaterThan(0);
      });
    });

    it('renders multiple articles with proper spacing', async () => {
      render(<Article />);

      await waitFor(() => {
        // Both articles should be rendered
        expect(screen.getByText('Introduction to Arrays')).toBeInTheDocument();
        expect(screen.getByText('Advanced Array Techniques')).toBeInTheDocument();

        // Articles should be separated (though exact spacing is hard to test)
        const articles = screen.getAllByRole('heading', { level: 1 });
        expect(articles.length).toBe(4); // 2 main titles + 2 content h1s
      });
    });
  });

  describe('Upvote Functionality', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ subtopicId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: { data: mockArticlesData } });
    });

    it('shows initial upvote count', async () => {
      render(<Article />);

      await waitFor(() => {
        const upvoteButtons = screen.getAllByText(/42 Upvotes/);
        expect(upvoteButtons.length).toBe(2); // One for each article
      });
    });

    it('increments upvote count when button is clicked', async () => {
      const user = userEvent.setup();
      render(<Article />);

      await waitFor(() => {
        expect(screen.getAllByText(/42 Upvotes/)).toHaveLength(2);
      });

      const upvoteButtons = screen.getAllByRole('button', { name: /upvotes/i });
      await user.click(upvoteButtons[0]);

      // Only the first button should show increased count
      const upvoteTexts = screen.getAllByText(/\d+ Upvotes/);
      expect(upvoteTexts.some(button => button.textContent === '43 Upvotes')).toBe(true);
      expect(upvoteTexts.some(button => button.textContent === '42 Upvotes')).toBe(true);
    });

    it('prevents multiple upvotes on the same article', async () => {
      const user = userEvent.setup();
      render(<Article />);

      await waitFor(() => {
        expect(screen.getAllByText(/42 Upvotes/)).toHaveLength(2);
      });

      const upvoteButtons = screen.getAllByRole('button', { name: /upvotes/i });
      
      // Click the same button multiple times
      await user.click(upvoteButtons[0]);
      await user.click(upvoteButtons[0]);
      await user.click(upvoteButtons[0]);

      // Should only increment once
      const upvoteTextsAfter = screen.getAllByText(/\d+ Upvotes/);
      expect(upvoteTextsAfter.some(button => button.textContent === '43 Upvotes')).toBe(true);
      expect(screen.queryByText('44 Upvotes')).not.toBeInTheDocument();
      expect(screen.queryByText('45 Upvotes')).not.toBeInTheDocument();
    });

    it('changes button styling after upvoting', async () => {
      const user = userEvent.setup();
      render(<Article />);

      await waitFor(() => {
        expect(screen.getAllByText(/42 Upvotes/)).toHaveLength(2);
      });

      const upvoteButtons = screen.getAllByRole('button', { name: /upvotes/i });
      const firstButton = upvoteButtons[0];

      // Check initial styling (should not have upvoted styles)
      expect(firstButton).toHaveClass('text-slate-200');

      await user.click(firstButton);

      // Check updated styling after upvote
      expect(firstButton).toHaveClass('bg-purple-600/20', 'border-purple-500/50', 'text-purple-300');
    });

    it('allows upvoting different articles independently', async () => {
      const user = userEvent.setup();
      render(<Article />);

      await waitFor(() => {
        expect(screen.getAllByText(/42 Upvotes/)).toHaveLength(2);
      });

      const upvoteButtons = screen.getAllByRole('button', { name: /upvotes/i });
      
      // Upvote both articles
      await user.click(upvoteButtons[0]);
      await user.click(upvoteButtons[1]);

      // Both should show incremented counts
      await waitFor(() => {
        const upvoteCounts = screen.getAllByText('43 Upvotes');
        expect(upvoteCounts).toHaveLength(2);
      });
    });
  });

  describe('Empty State', () => {
    it('shows no articles message when API returns empty array', async () => {
      mockUseParams.mockReturnValue({ subtopicId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: { data: [] } });

      render(<Article />);

      await waitFor(() => {
        expect(screen.getByText('No articles found for this subtopic.')).toBeInTheDocument();
      });
    });

    it('still shows navigation when no articles found', async () => {
      mockUseParams.mockReturnValue({ subtopicId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: { data: [] } });

      render(<Article />);

      await waitFor(() => {
        const backLink = screen.getByRole('link', { name: /back to study materials/i });
        expect(backLink).toHaveAttribute('href', '/study-materials');
      });
    });
  });

  describe('API Integration', () => {
    it('calls the correct API endpoint with subtopicId', async () => {
      mockUseParams.mockReturnValue({ subtopicId: '123' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: { data: [] } });

      render(<Article />);

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith('/articles/by-subtopic/123');
      });
    });

    it('does not make API call when subtopicId is missing', () => {
      mockUseParams.mockReturnValue({});
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: { data: [] } });

      render(<Article />);

      expect(mockGet).not.toHaveBeenCalled();
    });

    it('handles API response data structure correctly', async () => {
      mockUseParams.mockReturnValue({ subtopicId: '1' });
      
      const testArticle = {
        id: 1,
        title: 'Test Article',
        content: 'Test content',
        topicName: 'Test Topic',
        subtopicName: 'Test Subtopic',
        isApproved: true,
        createdByUsername: 'testuser',
        createdAt: '2024-01-01T00:00:00Z',
      };

      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: { data: [testArticle] } });

      render(<Article />);

      await waitFor(() => {
        expect(screen.getByText('Test Article')).toBeInTheDocument();
        expect(screen.getByText('Test content')).toBeInTheDocument();
        expect(screen.getByText('Test Topic')).toBeInTheDocument();
        expect(screen.getByText('Test Subtopic')).toBeInTheDocument();
        expect(screen.getByText('testuser')).toBeInTheDocument();
      });
    });
  });

  describe('Badge Styling', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ subtopicId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: { data: mockArticlesData } });
    });

    it('applies correct styling to different badge types', async () => {
      render(<Article />);

      await waitFor(() => {
        // Topic badges should have purple styling
        const topicBadges = screen.getAllByText('Data Structures');
        topicBadges.forEach(badge => {
          expect(badge).toHaveClass('bg-purple-500/20', 'text-purple-300', 'border-purple-500/30');
        });

        // Subtopic badges should have pink styling
        const subtopicBadges = screen.getAllByText('Arrays');
        subtopicBadges.forEach(badge => {
          expect(badge).toHaveClass('bg-pink-500/20', 'text-pink-300', 'border-pink-500/30');
        });

        // Approved badges should have green styling
        const approvedBadges = screen.getAllByText('Approved');
        approvedBadges.forEach(badge => {
          expect(badge).toHaveClass('bg-green-500/20', 'text-green-400', 'border-green-500/30');
        });
      });
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ subtopicId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: { data: mockArticlesData } });
    });

    it('has proper layout structure', async () => {
      render(<Article />);

      await waitFor(() => {
        // Check that the main container has the right background classes
        const mainContainer = document.querySelector('.min-h-screen.bg-gradient-to-br');
        expect(mainContainer).toBeInTheDocument();
        expect(mainContainer).toHaveClass('min-h-screen', 'bg-gradient-to-br');
      });
    });

    it('uses responsive text sizing for titles', async () => {
      render(<Article />);

      await waitFor(() => {
        // Find article title headings (not content headings)
        const articleTitles = screen.getAllByText(/Introduction to Arrays|Advanced Array Techniques/);
        articleTitles.forEach(title => {
          expect(title).toHaveClass('text-4xl', 'md:text-5xl', 'font-bold', 'text-white');
        });
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseParams.mockReturnValue({ subtopicId: '1' });
      
      const mockGet = vi.mocked(api.get);
      mockGet.mockResolvedValue({ data: { data: mockArticlesData } });
    });

    it('has proper heading hierarchy', async () => {
      render(<Article />);

      await waitFor(() => {
        const h1Elements = screen.getAllByRole('heading', { level: 1 });
        const h2Elements = screen.getAllByRole('heading', { level: 2 });
        const h3Elements = screen.getAllByRole('heading', { level: 3 });

        expect(h1Elements.length).toBeGreaterThan(0);
        expect(h2Elements.length).toBeGreaterThan(0);
        expect(h3Elements.length).toBeGreaterThan(0);
      });
    });

    it('has accessible buttons with descriptive text', async () => {
      render(<Article />);

      await waitFor(() => {
        const upvoteButtons = screen.getAllByRole('button', { name: /upvotes/i });
        upvoteButtons.forEach(button => {
          expect(button.textContent).toMatch(/\d+ Upvotes/);
        });
      });
    });

    it('has accessible navigation links', async () => {
      render(<Article />);

      await waitFor(() => {
        const backLink = screen.getByRole('link', { name: /back to study materials/i });
        expect(backLink).toHaveAttribute('href', '/study-materials');
        expect(backLink.textContent).toBeTruthy();
      });
    });
  });
}); 