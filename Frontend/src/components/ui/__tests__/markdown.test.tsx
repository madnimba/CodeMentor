import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { Markdown } from '../markdown';

describe('Markdown Component', () => {
  it('renders basic markdown content', () => {
    const content = '# Hello World\n\nThis is a **bold** text with *italic* text.';
    render(<Markdown content={content} />);
    
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByText('italic')).toBeInTheDocument();
  });

  it('renders code blocks', () => {
    const content = '```javascript\nconst x = 1;\nconsole.log(x);\n```';
    render(<Markdown content={content} />);
    
    // Check that the code block container exists
    const codeBlock = screen.getByText((content, element) => {
      return element?.tagName === 'CODE' && content.includes('const x = 1;');
    });
    expect(codeBlock).toBeInTheDocument();
  });

  it('renders inline code', () => {
    const content = 'Use the `console.log()` function to print output.';
    render(<Markdown content={content} />);
    
    expect(screen.getByText('console.log()')).toBeInTheDocument();
  });

  it('renders lists', () => {
    const content = '- Item 1\n- Item 2\n- Item 3';
    render(<Markdown content={content} />);
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('renders links', () => {
    const content = '[Click here](https://example.com)';
    render(<Markdown content={content} />);
    
    const link = screen.getByText('Click here');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('applies custom className', () => {
    const content = '# Test';
    const { container } = render(<Markdown content={content} className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
}); 