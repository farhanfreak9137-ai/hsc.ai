import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { preprocessMathText } from '../utils/mathPreprocessor';

export { preprocessMathText };

interface MathRendererProps {
  content?: string | null;
  className?: string;
  inline?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = '',
  inline = false,
}) => {
  const processedContent = useMemo(() => preprocessMathText(content), [content]);

  if (!processedContent) return null;

  return (
    <div
      className={`prose max-w-none dark:prose-invert text-inherit leading-relaxed font-bengali ${
        inline ? 'inline-block' : ''
      } ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={{
          p: ({ children }) => (
            <span className={`mb-1.5 last:mb-0 ${inline ? 'inline' : 'block'}`}>
              {children}
            </span>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-inherit">{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-2 pl-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-2 pl-2">{children}</ol>
          ),
          code: ({ children }) => (
            <code className="bg-slate-100 dark:bg-slate-800 text-emerald-800 dark:text-emerald-400 font-mono text-sm px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 pl-3 py-1.5 my-2 text-slate-700 dark:text-slate-300 italic rounded-r">
              {children}
            </blockquote>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
