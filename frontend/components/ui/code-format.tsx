import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';

interface CodeFormatProps {
  children: string;
  language?: string;
  className?: string;
  isMath?: boolean;
}

const CodeFormat: React.FC<CodeFormatProps> = ({
  children,
  language = 'typescript',
  className,
  isMath = false
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children.trim())
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      })
      .catch(err => {
        console.error('Failed to copy code to clipboard:', err);
      });
  };

  // Handle mathematical expressions
  if (isMath) {
    return (
      <div className="my-4 p-3 bg-gray-100 rounded-md border border-gray-300 font-mono text-sm overflow-x-auto dark:bg-gray-800 dark:border-gray-700">
        <div className="text-center">{children}</div>
      </div>
    );
  }

  // Detect language from className if provided (markdown code blocks use className format: "language-javascript")
  const languageMatch = className?.match(/language-(\w+)/);
  const detectedLanguage = languageMatch ? languageMatch[1] : language;

  return (
    <div className={cn("my-4 rounded-md overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-200">
        <span className="text-xs font-medium">{detectedLanguage.toUpperCase()}</span>
        <button 
          onClick={copyToClipboard}
          className="text-gray-300 hover:text-white transition-colors focus:outline-none"
          title="Copy code to clipboard"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={detectedLanguage}
        style={atomDark}
        customStyle={{ 
          margin: 0,
          borderRadius: '0 0 0.375rem 0.375rem',
        }}
        wrapLongLines={true}
      >
        {children.trim()}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeFormat;