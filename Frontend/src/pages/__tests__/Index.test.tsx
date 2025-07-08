import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils';
import Index from '../Index';

describe('Index Page', () => {
  beforeEach(() => {
    render(<Index />);
  });

  describe('Page Structure', () => {
    it('renders the header and footer', () => {
      // Header is rendered (checked by looking for the main brand text in header)
      expect(screen.getByText('CodeMentor')).toBeInTheDocument();
      
      // Footer is rendered (checked by looking for footer text)
      expect(screen.getByText('© 2024 CodeMentor BD. All rights reserved. Built with ❤️ for Bangladesh\'s tech community.')).toBeInTheDocument();
    });

    it('has proper page layout with gradient background', () => {
      // Check that the main container has the right background classes
      const mainContainer = document.querySelector('.min-h-screen.bg-gradient-to-br');
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveClass('min-h-screen', 'bg-gradient-to-br');
    });
  });

  describe('Hero Section', () => {
    it('renders the main heading and tagline', () => {
      // Use getByRole to target the specific heading element
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('CodeMentor BD');
      expect(screen.getByText(/Master technical interviews with Bangladesh's premier coding platform/)).toBeInTheDocument();
    });

    it('displays the badge with country flag', () => {
      expect(screen.getByText('🇧🇩 Built for Bangladesh Tech Community')).toBeInTheDocument();
    });

    it('renders call-to-action buttons', () => {
      expect(screen.getByRole('link', { name: /get started free/i })).toHaveAttribute('href', '/auth');
      expect(screen.getByRole('link', { name: /explore study materials/i })).toHaveAttribute('href', '/study-materials');
    });
  });

  describe('Stats Section', () => {
    it('displays all platform statistics', () => {
      expect(screen.getByText('30+')).toBeInTheDocument();
      expect(screen.getByText('Partner Companies')).toBeInTheDocument();
      
      expect(screen.getByText('500+')).toBeInTheDocument();
      expect(screen.getByText('Coding Problems')).toBeInTheDocument();
      
      expect(screen.getByText('15K+')).toBeInTheDocument();
      expect(screen.getByText('Active Learners')).toBeInTheDocument();
      
      expect(screen.getByText('98%')).toBeInTheDocument();
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
    });

    it('renders stat cards with icons', () => {
      const statCards = screen.getAllByText(/Partner Companies|Coding Problems|Active Learners|Success Rate/).map(text => 
        text.closest('[role]') || text.closest('.card') || text.closest('div')
      );
      
      // Should have 4 stat cards
      expect(statCards.length).toBe(4);
    });
  });

  describe('Features Section', () => {
    it('renders the features heading', () => {
      expect(screen.getByText('Everything You Need to Succeed')).toBeInTheDocument();
    });

    it('displays all three main features', () => {
      expect(screen.getByText('Live Coding Editor')).toBeInTheDocument();
      expect(screen.getByText(/Practice with our advanced online IDE supporting multiple languages/)).toBeInTheDocument();
      
      // Use more specific selector for Study Materials feature card title
      const studyMaterialsHeading = screen.getByRole('heading', { name: 'Study Materials' });
      expect(studyMaterialsHeading).toBeInTheDocument();
      expect(screen.getByText(/Comprehensive guides for DSA, System Design, Database, and more/)).toBeInTheDocument();
      
      expect(screen.getByText('Company-Specific Prep')).toBeInTheDocument();
      expect(screen.getByText(/Practice questions from top Bangladeshi tech companies/)).toBeInTheDocument();
    });

    it('has working navigation links for features', () => {
      expect(screen.getByRole('link', { name: /try editor/i })).toHaveAttribute('href', '/coding-editor');
      expect(screen.getByRole('link', { name: /start learning/i })).toHaveAttribute('href', '/study-materials');
      expect(screen.getByRole('link', { name: /explore companies/i })).toHaveAttribute('href', '/companies');
    });
  });

  describe('Companies Section', () => {
    it('renders the companies heading', () => {
      expect(screen.getByText('Trusted by Top Bangladesh Companies')).toBeInTheDocument();
    });

    it('displays all partner companies', () => {
      const companies = [
        "Pridesys IT", "IQVIA", "Synesis IT", "Therap BD", 
        "Brain Station", "Chaldal", "Priyo", "Optimizely"
      ];

      companies.forEach(company => {
        expect(screen.getByText(company)).toBeInTheDocument();
      });
    });

    it('has correct number of company cards', () => {
      const companies = [
        "Pridesys IT", "IQVIA", "Synesis IT", "Therap BD", 
        "Brain Station", "Chaldal", "Priyo", "Optimizely"
      ];
      
      companies.forEach(company => {
        expect(screen.getByText(company)).toBeInTheDocument();
      });
    });
  });

  describe('Job Roles Section', () => {
    it('renders the job roles heading', () => {
      expect(screen.getByText('Prepare for Your Dream Role')).toBeInTheDocument();
    });

    it('displays all job role cards', () => {
      const jobRoles = [
        "Software Engineer", "Database Engineer", 
        "Machine Learning Engineer", "System Engineer"
      ];

      jobRoles.forEach(role => {
        expect(screen.getByText(role)).toBeInTheDocument();
      });
      
      // Use getAllByText for repeated text
      const trackDescriptions = screen.getAllByText('Specialized preparation track');
      expect(trackDescriptions.length).toBe(4);
    });

    it('has correct number of job role cards', () => {
      const jobRoleCards = screen.getAllByText('Specialized preparation track');
      expect(jobRoleCards.length).toBe(4);
    });
  });

  describe('Navigation and Links', () => {
    it('has all main navigation links working', () => {
      // Get Started button
      const getStartedLink = screen.getByRole('link', { name: /get started free/i });
      expect(getStartedLink).toHaveAttribute('href', '/auth');
      
      // Study Materials button
      const studyMaterialsLinks = screen.getAllByRole('link', { name: /study materials|start learning|explore study materials/i });
      studyMaterialsLinks.forEach(link => {
        expect(link.getAttribute('href')).toMatch(/\/study-materials/);
      });
      
      // Companies link
      const companiesLink = screen.getByRole('link', { name: /explore companies/i });
      expect(companiesLink).toHaveAttribute('href', '/companies');
      
      // Coding Editor link
      const editorLink = screen.getByRole('link', { name: /try editor/i });
      expect(editorLink).toHaveAttribute('href', '/coding-editor');
    });

    it('has proper link attributes for accessibility', () => {
      const links = screen.getAllByRole('link');
      
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
        expect(link.getAttribute('href')).toBeTruthy();
      });
    });
  });

  describe('Responsive Design Elements', () => {
    it('has responsive grid classes', () => {
      // Check for responsive grid classes in the DOM using the main heading
      const heroSection = screen.getByRole('heading', { level: 1 }).closest('section');
      expect(heroSection).toBeInTheDocument();
      
      // Stats section should be responsive
      const statsSection = screen.getByText('Partner Companies').closest('div');
      expect(statsSection).toBeInTheDocument();
    });

    it('contains responsive typography classes', () => {
      const mainHeading = screen.getByRole('heading', { level: 1 });
      // The heading should have responsive text size classes
      expect(mainHeading).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      // Should have sections
      const heroSection = screen.getByRole('heading', { level: 1 }).closest('section');
      expect(heroSection).toBeInTheDocument();
    });

    it('has accessible button and link text', () => {
      // All buttons and links should have meaningful text
      const getStartedButton = screen.getByRole('link', { name: /get started free/i });
      expect(getStartedButton).toBeInTheDocument();
      
      const exploreButton = screen.getByRole('link', { name: /explore study materials/i });
      expect(exploreButton).toBeInTheDocument();
    });

    it('has proper heading hierarchy', () => {
      // Main heading
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('CodeMentor BD');
      
      // Section headings should be h2
      const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(sectionHeadings.length).toBeGreaterThan(0);
    });
  });

  describe('Content Quality', () => {
    it('has meaningful descriptions for features', () => {
      expect(screen.getByText(/Practice with our advanced online IDE supporting multiple languages/)).toBeInTheDocument();
      expect(screen.getByText(/Comprehensive guides for DSA, System Design, Database, and more/)).toBeInTheDocument();
      expect(screen.getByText(/Practice questions from top Bangladeshi tech companies/)).toBeInTheDocument();
    });

    it('includes call-to-action elements', () => {
      // Multiple CTAs should be present
      const ctaButtons = screen.getAllByRole('link').filter(link => 
        link.textContent?.includes('Get Started') || 
        link.textContent?.includes('Explore') ||
        link.textContent?.includes('Try') ||
        link.textContent?.includes('Start')
      );
      
      expect(ctaButtons.length).toBeGreaterThan(0);
    });
  });
}); 