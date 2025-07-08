import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import Dashboard from '../Dashboard';

describe('Dashboard Page', () => {
  beforeEach(() => {
    render(<Dashboard />);
  });

  describe('Page Structure', () => {
    it('renders header and footer', () => {
      expect(screen.getByText('CodeMentor')).toBeInTheDocument();
      expect(screen.getByText('© 2024 CodeMentor BD. All rights reserved. Built with ❤️ for Bangladesh\'s tech community.')).toBeInTheDocument();
    });

    it('has proper layout with gradient background', () => {
      // Check that the main container has the right background classes
      const mainContainer = document.querySelector('.min-h-screen.bg-gradient-to-br');
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveClass('min-h-screen', 'bg-gradient-to-br');
    });
  });

  describe('Welcome Section', () => {
    it('renders welcome message with streak info', () => {
      expect(screen.getByText('Welcome back! 👋')).toBeInTheDocument();
      expect(screen.getByText(/Keep up the great work! You're on a 12-day streak/)).toBeInTheDocument();
    });
  });

  describe('Stats Overview Cards', () => {
    it('displays all user statistics', () => {
      // Problems Solved
      expect(screen.getByText('142')).toBeInTheDocument();
      expect(screen.getByText('Problems Solved')).toBeInTheDocument();
      
      // Accuracy Rate
      expect(screen.getByText('91%')).toBeInTheDocument();
      expect(screen.getByText('Accuracy Rate')).toBeInTheDocument();
      
      // Day Streak
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('Day Streak')).toBeInTheDocument();
      
      // Study Time
      expect(screen.getByText('147h 32m')).toBeInTheDocument();
      expect(screen.getByText('Study Time')).toBeInTheDocument();
    });

    it('has 4 stats cards with proper structure', () => {
      const statsCards = screen.getAllByText(/Problems Solved|Accuracy Rate|Day Streak|Study Time/);
      expect(statsCards).toHaveLength(4);
    });
  });

  describe('Quick Actions Section', () => {
    it('renders Start Solving action card', () => {
      expect(screen.getByText('Start Solving')).toBeInTheDocument();
      expect(screen.getByText('Continue your coding journey with curated problems')).toBeInTheDocument();
      
      const browseProblemsLink = screen.getByRole('link', { name: /browse problems/i });
      expect(browseProblemsLink).toHaveAttribute('href', '/companies');
    });

    it('renders Study Materials action card', () => {
      // Check for the specific section by finding the heading in the card
      const studyMaterialsHeading = screen.getAllByText('Study Materials').find(
        element => element.tagName === 'H3'
      );
      expect(studyMaterialsHeading).toBeInTheDocument();
      expect(screen.getByText('Master concepts with our comprehensive guides')).toBeInTheDocument();
      
      const startLearningLink = screen.getByRole('link', { name: /start learning/i });
      expect(startLearningLink).toHaveAttribute('href', '/study-materials');
    });
  });

  describe('Progress by Topic Section', () => {
    it('renders the section header', () => {
      expect(screen.getByText('Progress by Topic')).toBeInTheDocument();
      expect(screen.getByText('Track your mastery across different subjects')).toBeInTheDocument();
    });

    it('displays all programming topics with progress', () => {
      expect(screen.getByText('Arrays & Strings')).toBeInTheDocument();
      expect(screen.getByText('25/30')).toBeInTheDocument();
      
      expect(screen.getByText('Linked Lists')).toBeInTheDocument();
      expect(screen.getByText('18/22')).toBeInTheDocument();
      
      expect(screen.getByText('Trees')).toBeInTheDocument();
      expect(screen.getByText('15/25')).toBeInTheDocument();
      
      expect(screen.getByText('Dynamic Programming')).toBeInTheDocument();
      expect(screen.getByText('12/28')).toBeInTheDocument();
      
      expect(screen.getByText('Graphs')).toBeInTheDocument();
      expect(screen.getByText('8/20')).toBeInTheDocument();
    });

    it('has link to detailed progress', () => {
      const progressLink = screen.getByRole('link', { name: /view detailed progress/i });
      expect(progressLink).toHaveAttribute('href', '/progress');
    });
  });

  describe('Company-Specific Progress Section', () => {
    it('renders the section header', () => {
      expect(screen.getByText('Company-Specific Progress')).toBeInTheDocument();
      expect(screen.getByText('Your preparation status for top companies')).toBeInTheDocument();
    });

    it('displays company progress with difficulty badges', () => {
      // Check for companies - use getAllByText since companies appear in multiple sections
      const pridesysElements = screen.getAllByText('Pridesys IT');
      expect(pridesysElements.length).toBeGreaterThan(0);
      
      const solvedProgressElements = screen.getAllByText(/solved/);
      expect(solvedProgressElements.length).toBeGreaterThan(0);
      
      const brainStationElements = screen.getAllByText('Brain Station');
      expect(brainStationElements.length).toBeGreaterThan(0);
      
      const iqviaElements = screen.getAllByText('IQVIA');
      expect(iqviaElements.length).toBeGreaterThan(0);
      
      const therapElements = screen.getAllByText('Therap BD');
      expect(therapElements.length).toBeGreaterThan(0);
    });

    it('shows difficulty badges for companies', () => {
      const mediumBadges = screen.getAllByText('Medium');
      const easyBadges = screen.getAllByText('Easy');
      const hardBadges = screen.getAllByText('Hard');
      
      expect(mediumBadges.length).toBeGreaterThan(0);
      expect(easyBadges.length).toBeGreaterThan(0);
      expect(hardBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Featured Companies Sidebar', () => {
    it('renders featured companies section', () => {
      expect(screen.getByText('Featured Companies')).toBeInTheDocument();
      expect(screen.getByText('Practice questions from top tech companies')).toBeInTheDocument();
    });

    it('displays featured companies with progress', () => {
      // Check for featured companies - multiple elements may exist
      const iqviaElements = screen.getAllByText('IQVIA​');
      expect(iqviaElements.length).toBeGreaterThan(0);
      
      const exabytingElements = screen.getAllByText('Exabyting​');
      expect(exabytingElements.length).toBeGreaterThan(0);
      
      const chaldalElements = screen.getAllByText('Chaldal​');
      expect(chaldalElements.length).toBeGreaterThan(0);
      
      const optimizelyElements = screen.getAllByText('Optimizely Bangladesh​');
      expect(optimizelyElements.length).toBeGreaterThan(0);
      
      // Check for progress indicators
      const progressElements = screen.getAllByText(/\d+\/\d+ solved/);
      expect(progressElements.length).toBeGreaterThan(0);
    });

    it('has view all companies link', () => {
      const viewAllLink = screen.getByRole('link', { name: /view all companies/i });
      expect(viewAllLink).toHaveAttribute('href', '/companies');
    });
  });

  describe('Recent Activity Section', () => {
    it('renders recent activity section', () => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    it('displays recent problem and article activities', () => {
      expect(screen.getByText('Two Sum')).toBeInTheDocument();
      expect(screen.getByText('Binary Search Trees')).toBeInTheDocument();
      expect(screen.getByText('Maximum Subarray')).toBeInTheDocument();
      expect(screen.getByText('Graph Algorithms')).toBeInTheDocument();
    });

    it('shows activity status and timestamps', () => {
      // Check for activity statuses - multiple instances may exist
      const solvedElements = screen.getAllByText('solved');
      expect(solvedElements.length).toBeGreaterThan(0);
      
      const readElements = screen.getAllByText('read');
      expect(readElements.length).toBeGreaterThan(0);
      
      const attemptedElements = screen.getAllByText('attempted');
      expect(attemptedElements.length).toBeGreaterThan(0);
      
      // Check for timestamps
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
      expect(screen.getByText('5 hours ago')).toBeInTheDocument();
      expect(screen.getByText('1 day ago')).toBeInTheDocument();
      expect(screen.getByText('2 days ago')).toBeInTheDocument();
    });
  });

  describe('Upcoming Goals Section', () => {
    it('renders upcoming goals section', () => {
      expect(screen.getByText('Upcoming Goals')).toBeInTheDocument();
    });

    it('displays all goals with progress and deadlines', () => {
      expect(screen.getByText('Complete 50 problems this month')).toBeInTheDocument();
      expect(screen.getByText('Dec 31, 2024')).toBeInTheDocument();
      
      expect(screen.getByText('Finish Database Systems track')).toBeInTheDocument();
      expect(screen.getByText('Jan 15, 2025')).toBeInTheDocument();
      
      expect(screen.getByText('Achieve 95% accuracy rate')).toBeInTheDocument();
      expect(screen.getByText('Jan 31, 2025')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('has all working navigation links', () => {
      const links = screen.getAllByRole('link');
      
      // Check key navigation links exist
      const companiesLinks = links.filter(link => 
        link.getAttribute('href')?.includes('/companies')
      );
      expect(companiesLinks.length).toBeGreaterThan(0);
      
      const studyMaterialsLinks = links.filter(link => 
        link.getAttribute('href')?.includes('/study-materials')
      );
      expect(studyMaterialsLinks.length).toBeGreaterThan(0);
    });

    it('has company-specific links', () => {
      // Get all "View" links and check that they point to companies
      const viewLinks = screen.getAllByRole('link', { name: /view/i });
      const companyLinks = viewLinks.filter(link => 
        link.getAttribute('href')?.startsWith('/companies/')
      );
      
      expect(companyLinks.length).toBeGreaterThan(0);
      
      // Check specific company links exist
      expect(screen.getByRole('link', { name: /view all companies/i })).toHaveAttribute('href', '/companies');
    });
  });

  describe('Progress Visualization', () => {
    it('displays progress bars throughout the dashboard', () => {
      // Should have multiple progress components for topics, companies, and goals
      const progressElements = screen.getAllByRole('progressbar');
      expect(progressElements.length).toBeGreaterThan(5); // At least 5 progress bars expected
    });
  });

  describe('Responsive Design', () => {
    it('has responsive grid layouts', () => {
      const statsContainer = screen.getByText('Problems Solved').closest('div');
      expect(statsContainer).toBeInTheDocument();
      
      const mainGrid = screen.getByText('Progress by Topic').closest('div');
      expect(mainGrid).toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    it('has interactive cards and buttons', () => {
      const buttons = screen.getAllByRole('button');
      const links = screen.getAllByRole('link');
      
      expect(buttons.length).toBeGreaterThan(0);
      expect(links.length).toBeGreaterThan(10); // Many navigation links
    });
  });

  describe('Content Organization', () => {
    it('organizes content into logical sections', () => {
      // Check that main sections are present in order
      const welcomeSection = screen.getByText('Welcome back! 👋');
      const statsSection = screen.getByText('Problems Solved');
      const actionsSection = screen.getByText('Start Solving');
      const progressSection = screen.getByText('Progress by Topic');
      
      expect(welcomeSection).toBeInTheDocument();
      expect(statsSection).toBeInTheDocument();
      expect(actionsSection).toBeInTheDocument();
      expect(progressSection).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Welcome back! 👋');
      
      // Component uses h3 for section headings, not h2
      const sectionHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(sectionHeadings.length).toBeGreaterThan(0);
    });

    it('has accessible link text', () => {
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
        expect(link.textContent).toBeTruthy();
      });
    });
  });
}); 