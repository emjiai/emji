import React, { useEffect } from 'react';
// Using a simpler approach without external dependencies
// We'll create a basic markdown-like renderer that also supports math equations

interface FormatProps {
  content: string;
  className?: string;
}

const Format: React.FC<FormatProps> = ({ content, className }) => {
  // Simple formatter that adds basic styling and processes code blocks
  const formatText = (text: string) => {
    // First, escape any HTML to prevent XSS attacks
    let processedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
      
    // Process the text with proper formatting
    // Add unique IDs to code blocks for copy functionality
    let codeBlockCount = 0;
    
    // Format code blocks with triple backticks
    processedText = processedText.replace(/```([\w]*)[\s\n]?([\s\S]*?)```/g, (match, language, code) => {
      const codeId = `code-block-${++codeBlockCount}`;
      const langClass = language ? ` language-${language}` : '';
      return `<div class="relative group">
        <button data-copy-target="${codeId}" class="copy-code-btn absolute right-2 top-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Copy code">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <pre class="bg-gray-800 text-white p-4 rounded-md my-4 overflow-x-auto whitespace-pre${langClass}"><code id="${codeId}">${code}</code></pre>
      </div>`;
    });
    
    // Process math equations (inline with $...$ and display mode with $$...$$)
    processedText = processedText.replace(/\$\$([\s\S]*?)\$\$/g, (match, equation) => {
      // For display mode math equations
      return `<div class="math-block bg-blue-50 p-3 my-3 rounded border border-blue-100 font-mono text-center">${equation}</div>`;
    });
    
    processedText = processedText.replace(/\$([^\$\n]+?)\$/g, (match, equation) => {
      // For inline math equations
      return `<span class="math-inline bg-blue-50 px-1 font-mono rounded border border-blue-100">${equation}</span>`;
    });
    
    // Wrap adjacent list items in ul/ol tags
    let inUnorderedList = false;
    let inOrderedList = false;
    
    // Process line by line for lists and other formatting
    processedText = processedText.split('\n').map((line) => {
      // Format inline code with single backticks (after code blocks are processed)
      line = line.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded-sm font-mono">$1</code>');
      
      // Format headers
      if (line.match(/^### /)) {
        return line.replace(/^### (.*)$/, '<h3 class="text-lg font-bold my-3">$1</h3>');
      } else if (line.match(/^## /)) {
        return line.replace(/^## (.*)$/, '<h2 class="text-xl font-bold my-4">$1</h2>');
      } else if (line.match(/^# /)) {
        return line.replace(/^# (.*)$/, '<h1 class="text-2xl font-bold my-5">$1</h1>');
      }
      
      // Format unordered lists
      else if (line.match(/^- /)) {
        const listItem = line.replace(/^- (.*)$/, '<li class="ml-6">$1</li>');
        if (!inUnorderedList) {
          inUnorderedList = true;
          return '<ul class="list-disc my-4">' + listItem;
        }
        return listItem;
      }
      
      // Format ordered lists
      else if (line.match(/^\d+\. /)) {
        const listItem = line.replace(/^\d+\. (.*)$/, '<li class="ml-6">$1</li>');
        if (!inOrderedList) {
          inOrderedList = true;
          return '<ol class="list-decimal my-4">' + listItem;
        }
        return listItem;
      }
      
      // Close list tags when no longer in a list
      else {
        let closingTags = '';
        if (inUnorderedList) {
          closingTags += '</ul>';
          inUnorderedList = false;
        }
        if (inOrderedList) {
          closingTags += '</ol>';
          inOrderedList = false;
        }
        
        // Format blockquotes
        if (line.match(/^> /)) {
          return closingTags + line.replace(/^> (.*)$/, '<blockquote class="border-l-4 border-gray-300 pl-4 my-4 italic">$1</blockquote>');
        }
        
        // Format paragraphs for non-empty lines that aren't already formatted
        else if (line.trim() !== '' && !line.startsWith('<')) {
          return closingTags + `<p class="my-2">${line}</p>`;
        }
        
        // Empty lines or already formatted lines
        else {
          return closingTags + (line.trim() === '' ? '<br />' : line);
        }
      }
    }).join('');
    
    // Close any open lists at the end
    if (inUnorderedList) processedText += '</ul>';
    if (inOrderedList) processedText += '</ol>';
    
    return processedText;
  };

  useEffect(() => {
    // Add event listeners for copy buttons after component mounts
    const copyButtons = document.querySelectorAll('.copy-code-btn');
    
    const handleCopyClick = (e: Event) => {
      const button = e.currentTarget as HTMLButtonElement;
      const targetId = button.getAttribute('data-copy-target');
      const codeElement = document.getElementById(targetId as string);
      
      if (codeElement) {
        // Copy text to clipboard
        navigator.clipboard.writeText(codeElement.textContent || '')
          .then(() => {
            // Show temporary success feedback
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
            setTimeout(() => {
              button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>';
            }, 2000);
          })
          .catch((err) => console.error('Failed to copy:', err));
      }
    };
    
    copyButtons.forEach(button => {
      button.addEventListener('click', handleCopyClick);
    });
    
    // Cleanup event listeners on unmount
    return () => {
      copyButtons.forEach(button => {
        button.removeEventListener('click', handleCopyClick);
      });
    };
  }, [content]); // Re-run when content changes
  
  return (
    <div 
      className={`markdown-content ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: formatText(content) }}
    />
  );
};

export default Format;