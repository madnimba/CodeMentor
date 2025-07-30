import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface MarkdownProps {
  content: string;
  className?: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ content, className }) => {
  return (
    <div className={cn("prose prose-invert prose-purple max-w-none", className)}>
      <ReactMarkdown
        components={{
          // Customize code blocks
          code: ({ node, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            return !isInline ? (
              <pre className="bg-slate-900 border border-slate-700 p-4 rounded-lg overflow-x-auto">
                <code className={`${className} text-slate-100`} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-slate-800 px-1.5 py-0.5 rounded text-sm text-slate-100 border border-slate-600" {...props}>
                {children}
              </code>
            );
          },
          // Customize headings
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-white mt-8 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold text-purple-300 mt-6 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-medium text-slate-200 mt-4 mb-2">{children}</h3>
          ),
          // Customize paragraphs
          p: ({ children }) => (
            <p className="text-slate-300 mb-4 leading-relaxed">{children}</p>
          ),
          // Customize lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-slate-300 mb-4 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-slate-300 mb-4 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-slate-300">{children}</li>
          ),
          // Customize blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-purple-500 pl-4 italic text-slate-400 mb-4">
              {children}
            </blockquote>
          ),
          // Customize links
          a: ({ href, children }) => (
            <a href={href} className="text-purple-400 hover:text-purple-300 underline">
              {children}
            </a>
          ),
          // Customize tables
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-slate-600">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-slate-600 px-4 py-2 bg-slate-800 text-white font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-slate-600 px-4 py-2 text-slate-300">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}; 