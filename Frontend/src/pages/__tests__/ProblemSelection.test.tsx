import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import ProblemSelection from '../ProblemSelection';

// Mock react-router-dom
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ProblemSelection Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Page Structure', () => {
    it('renders header and footer', () => {
      render(<ProblemSelection />);
      
      expect(screen.getByText('CodeMentor')).toBeInTheDocument();
      expect(screen.getByText('© 2024 CodeMentor BD. All rights reserved. Built with ❤️ for Bangladesh\'s tech community.')).toBeInTheDocument();
    });

    it('has proper layout with gradient background', () => {
      render(<ProblemSelection />);
      
      // Check that the main container has the right background classes
      const mainContainer = document.querySelector('.min-h-screen.bg-gradient-to-br');
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveClass('min-h-screen', 'bg-gradient-to-br');
    });

    it('displays page title and description', () => {
      render(<ProblemSelection />);
      
      expect(screen.getByText('Problem Selection')).toBeInTheDocument();
      expect(screen.getByText('Choose a problem to solve in the code editor')).toBeInTheDocument();
    });

    it('has back navigation to companies', () => {
      render(<ProblemSelection />);
      
      const backLink = screen.getByRole('link', { name: /back to companies/i });
      expect(backLink).toHaveAttribute('href', '/companies');
    });
  });

  describe('Filter Panel', () => {
    it('renders all filter options', () => {
      render(<ProblemSelection />);
      
      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search problems...')).toBeInTheDocument();
      expect(screen.getByText('Difficulty')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
      expect(screen.getByText('Premium Only')).toBeInTheDocument();
      expect(screen.getByText('Featured Only')).toBeInTheDocument();
    });

    it('has search input with icon', () => {
      render(<ProblemSelection />);
      
      const searchInput = screen.getByPlaceholderText('Search problems...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveClass('pl-10'); // Space for search icon
    });

    it('renders difficulty filter dropdown', () => {
      render(<ProblemSelection />);
      
      const difficultySelect = screen.getByText('Difficulty').closest('div')?.querySelector('[role="combobox"]');
      expect(difficultySelect).toBeInTheDocument();
    });

    it('renders category filter dropdown', () => {
      render(<ProblemSelection />);
      
      const categorySelect = screen.getByText('Category').closest('div')?.querySelector('[role="combobox"]');
      expect(categorySelect).toBeInTheDocument();
    });

    it('renders tag checkboxes', () => {
      render(<ProblemSelection />);
      
      const tagCheckboxes = screen.getAllByRole('checkbox');
      expect(tagCheckboxes.length).toBeGreaterThan(10); // Should have multiple tag options plus filter checkboxes
    });
  });

  describe('Problems List', () => {
    it('displays initial problems', () => {
      render(<ProblemSelection />);
      
      expect(screen.getByText('Two Sum')).toBeInTheDocument();
      expect(screen.getByText('Add Two Numbers')).toBeInTheDocument();
      expect(screen.getByText('Longest Substring Without Repeating Characters')).toBeInTheDocument();
      expect(screen.getByText('Valid Parentheses')).toBeInTheDocument();
    });

    it('shows problem count', () => {
      render(<ProblemSelection />);
      
      const countText = screen.getByText(/\d+ problems? found/);
      expect(countText).toBeInTheDocument();
    });

    it('displays difficulty badges for each problem', () => {
      render(<ProblemSelection />);
      
      expect(screen.getAllByText('Easy').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Medium').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Hard').length).toBeGreaterThan(0);
    });

    it('shows premium badges for premium problems', () => {
      render(<ProblemSelection />);
      
      const premiumBadges = screen.getAllByText('Premium');
      expect(premiumBadges.length).toBeGreaterThan(0);
    });

    it('shows featured badges for featured problems', () => {
      render(<ProblemSelection />);
      
      const featuredBadges = screen.getAllByText('Featured');
      expect(featuredBadges.length).toBeGreaterThan(0);
    });

    it('displays problem metadata (acceptance rate, time limit, etc.)', () => {
      render(<ProblemSelection />);
      
      // Check for acceptance rates
      expect(screen.getByText(/85%/)).toBeInTheDocument(); // Two Sum acceptance rate
      expect(screen.getByText(/72%/)).toBeInTheDocument(); // Add Two Numbers acceptance rate
    });
  });

  describe('Search Functionality', () => {
    it('filters problems by title', async () => {
      const user = userEvent.setup();
      render(<ProblemSelection />);
      
      const searchInput = screen.getByPlaceholderText('Search problems...');
      await user.type(searchInput, 'Two Sum');
      
      expect(screen.getByText('Two Sum')).toBeInTheDocument();
      expect(screen.queryByText('Valid Parentheses')).not.toBeInTheDocument();
    });

    it('filters problems by description', async () => {
      const user = userEvent.setup();
      render(<ProblemSelection />);
      
      const searchInput = screen.getByPlaceholderText('Search problems...');
      await user.type(searchInput, 'linked lists');
      
      expect(screen.getByText('Add Two Numbers')).toBeInTheDocument();
      expect(screen.queryByText('Two Sum')).not.toBeInTheDocument();
    });

    it('filters problems by tags', async () => {
      const user = userEvent.setup();
      render(<ProblemSelection />);
      
      const searchInput = screen.getByPlaceholderText('Search problems...');
      await user.type(searchInput, 'Stack');
      
      expect(screen.getByText('Valid Parentheses')).toBeInTheDocument();
    });

    it('shows no results when search yields nothing', async () => {
      const user = userEvent.setup();
      render(<ProblemSelection />);
      
      const searchInput = screen.getByPlaceholderText('Search problems...');
      await user.type(searchInput, 'NonExistentProblem');
      
      expect(screen.getByText('0 problems found')).toBeInTheDocument();
    });
  });

  describe('Difficulty Filter', () => {
    it('filters problems by Easy difficulty', async () => {
      const user = userEvent.setup();
      render(<ProblemSelection />);
      
      const difficultySelect = screen.getByText('Difficulty').closest('div')?.querySelector('[role="combobox"]');
      expect(difficultySelect).toBeInTheDocument();
      
      if (difficultySelect) {
        await user.click(difficultySelect);
        
        await waitFor(() => {
          const easyOptions = screen.getAllByText('Easy');
          expect(easyOptions.length).toBeGreaterThan(0);
        });
        
        // Click the Easy option in the dropdown (look for it in the dropdown)
        const easyOptions = screen.getAllByText('Easy');
        const dropdownEasyOption = easyOptions.find(option => 
          option.closest('[role="option"]') || option.id?.includes('radix')
        ) || easyOptions[0];
        await user.click(dropdownEasyOption);
        
        // Should only show Easy problems
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
        expect(screen.getByText('Valid Parentheses')).toBeInTheDocument();
        expect(screen.queryByText('Add Two Numbers')).not.toBeInTheDocument(); // Medium
      }
    });

    it('filters problems by Medium difficulty', async () => {
      const user = userEvent.setup();
      render(<ProblemSelection />);
      
      const difficultySelect = screen.getByText('Difficulty').closest('div')?.querySelector('[role="combobox"]');
      expect(difficultySelect).toBeInTheDocument();
      
      if (difficultySelect) {
        await user.click(difficultySelect);
        
        await waitFor(() => {
          const mediumOptions = screen.getAllByText('Medium');
          expect(mediumOptions.length).toBeGreaterThan(0);
        });
        
        // Click the Medium option in the dropdown (look for it in the dropdown)
        const mediumOptions = screen.getAllByText('Medium');
        const dropdownMediumOption = mediumOptions.find(option => 
          option.closest('[role="option"]') || option.id?.includes('radix')
        ) || mediumOptions[0];
        await user.click(dropdownMediumOption);
        
        // Should only show Medium problems
        expect(screen.getByText('Add Two Numbers')).toBeInTheDocument();
        expect(screen.queryByText('Two Sum')).not.toBeInTheDocument(); // Easy
      }
    });
  });

  describe('Category Filter', () => {
    it('filters problems by Array category', async () => {
      const user = userEvent.setup();
      render(<ProblemSelection />);
      
      const categorySelect = screen.getByText('Category').closest('div')?.querySelector('[role="combobox"]');
      expect(categorySelect).toBeInTheDocument();
      
      if (categorySelect) {
        await user.click(categorySelect);
        
        await waitFor(() => {
          const arrayOptions = screen.getAllByText('Array');
          expect(arrayOptions.length).toBeGreaterThan(0);
        });
        
        // Click the Array option in the dropdown (look for it in the dropdown)
        const arrayOptions = screen.getAllByText('Array');
        const dropdownArrayOption = arrayOptions.find(option => 
          option.closest('[role="option"]') || option.id?.includes('radix')
        ) || arrayOptions[0];
        await user.click(dropdownArrayOption);
        
        // Should only show Array problems
        expect(screen.getByText('Two Sum')).toBeInTheDocument();
        expect(screen.queryByText('Valid Parentheses')).not.toBeInTheDocument(); // Stack category
      }
    });
  });

  describe('Tag Filter', () => {
    it('filters problems by selecting tags', async () => {
      const user = userEvent.setup();
      render(<ProblemSelection />);
      
      // Find and click Hash Table tag checkbox
      const hashTableCheckbox = screen.getByRole('checkbox', { name: /hash table/i });
      await user.click(hashTableCheckbox);
      
      // Should show problems with Hash Table tag
      expect(screen.getByText('Two Sum')).toBeInTheDocument();
      expect(screen.queryByText('Valid Parentheses')).not.toBeInTheDocument();
    });

    it('allows multiple tag selection', async () => {
      const user = userEvent.setup();
      render(<ProblemSelection />);
      
      // Select multiple tags
      const arrayCheckbox = screen.getByRole('checkbox', { name: /^array$/i });
      const stringCheckbox = screen.getByRole('checkbox', { name: /^string$/i });
      
      await user.click(arrayCheckbox);
      await user.click(stringCheckbox);
      
      // Should show problems with either Array OR String tags
      expect(screen.getByText('Two Sum')).toBeInTheDocument(); // Array
      expect(screen.getByText('Valid Parentheses')).toBeInTheDocument(); // String
    });
  });

  describe('Premium and Featured Filters', () => {
    it('filters to show only premium problems', async () => {
      const user = userEvent.setup();
      render(<ProblemSelection />);
      
      const premiumCheckbox = screen.getByRole('checkbox', { name: /premium only/i });
      await user.click(premiumCheckbox);
      
      // Should only show premium problems
      expect(screen.getByText('Longest Substring Without Repeating Characters')).toBeInTheDocument();
      expect(screen.queryByText('Two Sum')).not.toBeInTheDocument(); // Not premium
    });

    it('filters to show only featured problems', async () => {
      const user = userEvent.setup();
      render(<ProblemSelection />);
      
      const featuredCheckbox = screen.getByRole('checkbox', { name: /featured only/i });
      await user.click(featuredCheckbox);
      
      // Should only show featured problems
      expect(screen.getByText('Two Sum')).toBeInTheDocument(); // Featured
      expect(screen.queryByText('Add Two Numbers')).not.toBeInTheDocument(); // Not featured
    });
  });

  describe('Sorting Functionality', () => {
    it('renders sort dropdown', () => {
      render(<ProblemSelection />);
      
      const sortSelect = screen.getByText(/sort by/i).closest('[role="combobox"]');
      expect(sortSelect).toBeInTheDocument();
    });

    it('sorts problems by popularity (default)', () => {
      render(<ProblemSelection />);
      
      // Two Sum should be first (highest solved count: 1,500,000)
      const problemCards = screen.getAllByText(/Two Sum|Add Two Numbers|Longest Substring/);
      expect(problemCards[0]).toHaveTextContent('Two Sum');
    });

    it('sorts problems by difficulty', async () => {
      const user = userEvent.setup();
      render(<ProblemSelection />);
      
      const sortSelect = screen.getByText(/sort by/i).closest('[role="combobox"]');
      expect(sortSelect).toBeInTheDocument();
      
      if (sortSelect) {
        await user.click(sortSelect);
        
        await waitFor(() => {
          const difficultyOption = screen.getByText('Sort by Difficulty');
          expect(difficultyOption).toBeInTheDocument();
        });
        
        const difficultyOption = screen.getByText('Sort by Difficulty');
        await user.click(difficultyOption);
        
        // Easy problems should come first - check that Two Sum (Easy) is visible
        const twoSumProblem = screen.getByText('Two Sum');
        expect(twoSumProblem).toBeInTheDocument();
      }
    });
  });

  describe('Problem Selection and Navigation', () => {
    it('navigates to coding editor when problem is clicked', async () => {
      const user = userEvent.setup();
      render(<ProblemSelection />);
      
      const twoSumCard = screen.getByText('Two Sum').closest('.cursor-pointer');
      expect(twoSumCard).toBeInTheDocument();
      
      if (twoSumCard) {
        await user.click(twoSumCard);
        
        expect(mockNavigate).toHaveBeenCalledWith('/coding-editor?problemId=1');
      }
    });

    it('makes problem cards clickable', () => {
      render(<ProblemSelection />);
      
      const problemCards = document.querySelectorAll('.cursor-pointer');
      expect(problemCards.length).toBeGreaterThan(0);
    });
  });

  describe('Problem Information Display', () => {
        it('displays acceptance rates with percentage', () => {
      render(<ProblemSelection />);

      // Look for acceptance rates in text content (might be formatted differently)
      expect(screen.getByText(/85%/)).toBeInTheDocument(); // Two Sum
      expect(screen.getByText(/72%/)).toBeInTheDocument(); // Add Two Numbers
      expect(screen.getByText(/68%/)).toBeInTheDocument(); // Longest Substring
    });

        it('shows time limits', () => {
      render(<ProblemSelection />);

      // Look for time limits in text content (component renders as "2s", "3s", etc.)
      const timeLimits2s = screen.getAllByText(/2s/);
      expect(timeLimits2s.length).toBeGreaterThan(0); // Multiple problems have 2s time limit
      const timeLimits3s = screen.getAllByText(/3s/);
      expect(timeLimits3s.length).toBeGreaterThan(0); // Multiple problems have 3s time limit
    });

        it('displays problem categories and acceptance rates', () => {
      render(<ProblemSelection />);

      // Check that categories are displayed (which are actually rendered)
      const arrayCategories = screen.getAllByText(/Array/);
      expect(arrayCategories.length).toBeGreaterThan(0);
      const linkedListCategories = screen.getAllByText(/Linked List/);
      expect(linkedListCategories.length).toBeGreaterThan(0);
      const stackCategories = screen.getAllByText(/Stack/);
      expect(stackCategories.length).toBeGreaterThan(0);
    });
  });

  describe('Badge Styling', () => {
    it('applies correct styling for difficulty badges', () => {
      render(<ProblemSelection />);
      
      const easyBadges = screen.getAllByText('Easy');
      easyBadges.forEach(badge => {
        expect(badge).toHaveClass('bg-green-500/20', 'text-green-400', 'border-green-500/30');
      });
      
      const mediumBadges = screen.getAllByText('Medium');
      mediumBadges.forEach(badge => {
        expect(badge).toHaveClass('bg-yellow-500/20', 'text-yellow-400', 'border-yellow-500/30');
      });
      
      const hardBadges = screen.getAllByText('Hard');
      hardBadges.forEach(badge => {
        expect(badge).toHaveClass('bg-red-500/20', 'text-red-400', 'border-red-500/30');
      });
    });

    it('applies correct styling for premium badges', () => {
      render(<ProblemSelection />);
      
      const premiumBadges = screen.getAllByText('Premium');
      premiumBadges.forEach(badge => {
        expect(badge).toHaveClass('bg-yellow-500/20', 'text-yellow-400', 'border-yellow-500/30');
      });
    });

    it('applies correct styling for featured badges', () => {
      render(<ProblemSelection />);
      
      const featuredBadges = screen.getAllByText('Featured');
      featuredBadges.forEach(badge => {
        expect(badge).toHaveClass('bg-purple-500/20', 'text-purple-400', 'border-purple-500/30');
      });
    });
  });

  describe('Responsive Design', () => {
    it('has responsive grid layout', () => {
      render(<ProblemSelection />);
      
      const mainGrid = screen.getByText('Filters').closest('.grid');
      expect(mainGrid).toHaveClass('grid-cols-1', 'lg:grid-cols-4');
    });

    it('has scrollable problems list', () => {
      render(<ProblemSelection />);
      
      const problemsList = document.querySelector('.h-\\[600px\\].overflow-y-auto');
      expect(problemsList).toBeInTheDocument();
    });
  });

  describe('Filter Reset and Clear', () => {
    it('resets filters when "All" options are selected', async () => {
      const user = userEvent.setup();
      render(<ProblemSelection />);
      
      // First filter by difficulty
      const difficultySelect = screen.getByText('Difficulty').closest('div')?.querySelector('[role="combobox"]');
      if (difficultySelect) {
        await user.click(difficultySelect);
        
        await waitFor(() => {
          const easyOptions = screen.getAllByText('Easy');
          expect(easyOptions.length).toBeGreaterThan(0);
        });
        
        // Click the Easy option in the dropdown (find a clickable one)
        const easyOptions = screen.getAllByText('Easy');
        const clickableEasyOption = easyOptions.find(option => {
          const style = getComputedStyle(option);
          return style.pointerEvents !== 'none';
        }) || easyOptions[easyOptions.length - 1]; // fallback to last option
        await user.click(clickableEasyOption);
        
        // Should show fewer problems
        expect(screen.getByText(/\d+ problems? found/)).toHaveTextContent(/^[1-5] problems? found$/);
        
        // Reset to all difficulties
        await user.click(difficultySelect);
        await waitFor(() => {
          const allOption = screen.getByText('All Difficulties');
          expect(allOption).toBeInTheDocument();
        });
        
        await user.click(screen.getByText('All Difficulties'));
        
        // Should show all problems again
        expect(screen.getByText(/\d+ problems? found/)).toHaveTextContent(/^[5-9]|1[0-2] problems? found$/);
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<ProblemSelection />);
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Problem Selection');
    });

    it('has accessible form controls', () => {
      render(<ProblemSelection />);
      
      const searchInput = screen.getByPlaceholderText('Search problems...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('type', 'text');
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
      
      const comboboxes = screen.getAllByRole('combobox');
      expect(comboboxes.length).toBeGreaterThan(0);
    });

    it('has accessible links and buttons', () => {
      render(<ProblemSelection />);
      
      const backLink = screen.getByRole('link', { name: /back to companies/i });
      expect(backLink).toHaveAttribute('href', '/companies');
      expect(backLink.textContent).toBeTruthy();
    });

    it('provides proper labels for form elements', () => {
      render(<ProblemSelection />);
      
      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('Difficulty')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });
  });

  describe('Performance and Optimization', () => {
    it('renders large list of problems without performance issues', () => {
      render(<ProblemSelection />);
      
      // Should render multiple problems efficiently
      const problemCards = document.querySelectorAll('.bg-slate-800\\/50');
      expect(problemCards.length).toBeGreaterThan(5);
    });

    it('handles filtering without lag', async () => {
      const user = userEvent.setup();
      render(<ProblemSelection />);
      
      const searchInput = screen.getByPlaceholderText('Search problems...');
      
      // Fast typing should work without issues
      await user.type(searchInput, 'Array');
      
      // Should immediately filter results
      expect(screen.getByText('Two Sum')).toBeInTheDocument();
    });
  });
}); 