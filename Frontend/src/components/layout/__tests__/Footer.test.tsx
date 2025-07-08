import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { Footer } from '../Footer';

describe('Footer Component', () => {
  beforeEach(() => {
    render(<Footer />);
  });

  describe('Brand Section', () => {
    it('renders the brand logo and name', () => {
      expect(screen.getByText('CodeMentor BD')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /codementor bd/i })).toHaveAttribute('href', '/');
    });

    it('renders the brand description', () => {
      expect(
        screen.getByText("Bangladesh's premier platform for technical interview preparation and coding excellence.")
      ).toBeInTheDocument();
    });
  });

  describe('Quick Links Section', () => {
    it('renders the Quick Links heading', () => {
      expect(screen.getByText('Quick Links')).toBeInTheDocument();
    });

    it('renders all quick navigation links', () => {
      expect(screen.getByRole('link', { name: /practice problems/i })).toHaveAttribute('href', '/problems');
      expect(screen.getByRole('link', { name: /study materials/i })).toHaveAttribute('href', '/study-materials');
      expect(screen.getByRole('link', { name: /companies/i })).toHaveAttribute('href', '/companies');
      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Support Section', () => {
    it('renders the Support heading', () => {
      expect(screen.getByText('Support')).toBeInTheDocument();
    });

    it('renders all support links', () => {
      expect(screen.getByRole('link', { name: /help center/i })).toHaveAttribute('href', '/help');
      expect(screen.getByRole('link', { name: /contact us/i })).toHaveAttribute('href', '/contact');
      expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveAttribute('href', '/privacy');
      expect(screen.getByRole('link', { name: /terms of service/i })).toHaveAttribute('href', '/terms');
    });
  });

  describe('Contact Section', () => {
    it('renders the Contact heading', () => {
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('renders contact information', () => {
      expect(screen.getByText('support@codementorbd.com')).toBeInTheDocument();
      expect(screen.getByText('Dhaka, Bangladesh')).toBeInTheDocument();
    });

    it('renders contact icons', () => {
      // Check for email and location icons using data attributes or text content
      const emailElement = screen.getByText('support@codementorbd.com');
      const locationElement = screen.getByText('Dhaka, Bangladesh');
      
      expect(emailElement.closest('div')).toBeInTheDocument();
      expect(locationElement.closest('div')).toBeInTheDocument();
    });
  });

  describe('Copyright Section', () => {
    it('renders the copyright notice', () => {
      expect(
        screen.getByText('© 2024 CodeMentor BD. All rights reserved. Built with ❤️ for Bangladesh\'s tech community.')
      ).toBeInTheDocument();
    });
  });

  describe('Layout and Structure', () => {
    it('has proper semantic footer structure', () => {
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('renders all main sections', () => {
      // Check that all 4 main sections are present by verifying their headings
      expect(screen.getByText('Quick Links')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText('CodeMentor BD')).toBeInTheDocument();
    });
  });

  describe('Link Functionality', () => {
    it('all links have correct href attributes', () => {
      const links = screen.getAllByRole('link');
      
      // Verify that all links have href attributes
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
        expect(link.getAttribute('href')).toBeTruthy();
      });
    });

    it('has the correct number of navigation links', () => {
      const links = screen.getAllByRole('link');
      // Brand link + 4 quick links + 4 support links = 9 total links
      expect(links.length).toBe(9);
    });
  });

  describe('Styling and CSS Classes', () => {
    it('has proper CSS classes for styling', () => {
      const footer = screen.getByRole('contentinfo');
      
      // Check that the footer has expected classes
      expect(footer).toHaveClass('bg-slate-950');
      expect(footer).toHaveClass('border-t');
      expect(footer).toHaveClass('border-slate-800');
    });
  });
}); 