'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import type { Components } from 'react-markdown';

interface ContentViewProps {
  content: any;
}

const ContentView: React.FC<ContentViewProps> = ({ content }) => {
  // Use the markdown_document field from API or generate from JSON if not available
  const markdownContent = content?.markdown_document || '';
  
  // Custom components for ReactMarkdown using the proper type
  const components: Components = {
    // Custom handling for headings
    h1: ({ node, children, ...props }: any) => {
      const text = Array.isArray(children) 
        ? children.join('') 
        : String(children || '');
        
      // Check if it starts with numbering or is a special heading
      const hasNumbering = /^\d+(\.\d+)*\.?\s+/.test(text);
      
      return (
        <h1 {...props} className={`text-2xl ${hasNumbering ? 'font-bold' : ''}`}>
          {children}
        </h1>
      );
    },
    h2: ({ node, children, ...props }: any) => {
      const text = Array.isArray(children) 
        ? children.join('') 
        : String(children || '');
        
      // Check if it starts with numbering or is a special heading like "Overview" or "Executive Summary"
      const hasNumbering = /^\d+(\.\d+)*\.?\s+/.test(text);
      const isSpecial = text.includes('Overview') || text.includes('Executive Summary');
      
      return (
        <h2 {...props} className={`text-xl ${hasNumbering || isSpecial ? 'font-bold' : ''}`}>
          {children}
        </h2>
      );
    },
    h3: ({ node, children, ...props }: any) => {
      const text = Array.isArray(children) 
        ? children.join('') 
        : String(children || '');
        
      // Check if it starts with numbering
      const hasNumbering = /^\d+(\.\d+)*\.?\s+/.test(text);
      
      return (
        <h3 {...props} className={`text-lg ${hasNumbering ? 'font-bold' : ''}`}>
          {children}
        </h3>
      );
    },
    h4: ({ node, children, ...props }: any) => {
      const text = Array.isArray(children) 
        ? children.join('') 
        : String(children || '');
        
      // Check if it starts with numbering
      const hasNumbering = /^\d+(\.\d+)*\.?\s+/.test(text);
      
      return (
        <h4 {...props} className={`text-base ${hasNumbering ? 'font-bold' : ''}`}>
          {children}
        </h4>
      );
    }
  };
  
  return (
    <div className="h-full overflow-auto">
      <div className="p-4">
        <div className="prose prose-headings:font-medium prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-strong:font-bold prose-a:text-blue-600 max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]} 
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={components}
          >
            {markdownContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ContentView;
