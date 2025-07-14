'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { Components } from 'react-markdown';
import { FileText, BookOpen, List } from 'lucide-react';

interface ContentViewProps {
  content: any;
}

const ContentView: React.FC<ContentViewProps> = ({ content }) => {
  // Generate comprehensive markdown from the ebook structure
  const generateCompleteEbookMarkdown = (data: any): string => {
    if (!data) return 'No content available';
    
    let markdown = '';
    
    // Title, subtitle, and tagline
    if (data.title) {
      markdown += `# ${data.title}\n\n`;
    }
    
    if (data.subtitle) {
      markdown += `## ${data.subtitle}\n\n`;
    }
    
    if (data.tagline) {
      markdown += `*${data.tagline}*\n\n`;
    }
    
    markdown += `---\n\n`;
    
    // Publication details
    if (data.publication_details) {
      markdown += `## Publication Information\n\n`;
      const pub = data.publication_details;
      
      if (pub.publisher) markdown += `**Publisher:** ${pub.publisher}\n\n`;
      if (pub.publication_date) markdown += `**Publication Date:** ${pub.publication_date}\n\n`;
      if (pub.version) markdown += `**Version:** ${pub.version}\n\n`;
      if (pub.audience) markdown += `**Target Audience:** ${pub.audience}\n\n`;
      if (pub.formats_available && Array.isArray(pub.formats_available)) {
        markdown += `**Available Formats:** ${pub.formats_available.join(', ')}\n\n`;
      }
      if (pub.keywords && Array.isArray(pub.keywords)) {
        markdown += `**Keywords:** ${pub.keywords.join(', ')}\n\n`;
      }
    }
    
    // Table of Contents
    if (data.table_of_contents && Array.isArray(data.table_of_contents)) {
      markdown += `## Table of Contents\n\n`;
      data.table_of_contents.forEach((item: any, index: number) => {
        markdown += `${index + 1}. [${item.title}](#${item.id})\n`;
      });
      markdown += '\n';
    }
    
    // Introduction
    if (data.introduction) {
      markdown += `## ${data.introduction.heading || 'Introduction'}\n\n`;
      
      if (data.introduction.content && Array.isArray(data.introduction.content)) {
        data.introduction.content.forEach((item: any) => {
          if (typeof item === 'string') {
            markdown += `${item}\n\n`;
          } else if (typeof item === 'object') {
            if (item.type === 'heading') {
              markdown += `${'#'.repeat(item.level + 1)} ${item.text}\n\n`;
            } else if (item.type === 'key_takeaway') {
              markdown += `> **Key Takeaway:** ${item.text}\n\n`;
            } else if (item.type === 'real_world_example') {
              markdown += `### ${item.title || 'Example'}\n\n${item.text}\n\n`;
            }
          }
        });
      }
    }
    
    // Chapters
    if (data.chapters && Array.isArray(data.chapters)) {
      data.chapters.forEach((chapter: any, chapterIndex: number) => {
        markdown += `# Chapter ${chapterIndex + 1}: ${chapter.title}\n\n`;
        
        if (chapter.goal) {
          markdown += `**Chapter Goal:** ${chapter.goal}\n\n`;
        }
        
        // Chapter sections
        if (chapter.sections && Array.isArray(chapter.sections)) {
          chapter.sections.forEach((section: any) => {
            markdown += `## ${section.heading}\n\n`;
            
            // Process section content
            if (section.content && Array.isArray(section.content)) {
              section.content.forEach((item: any) => {
                if (typeof item === 'string') {
                  markdown += `${item}\n\n`;
                } else if (typeof item === 'object') {
                  if (item.type === 'heading') {
                    markdown += `${'#'.repeat(item.level + 1)} ${item.text}\n\n`;
                  } else if (item.type === 'key_takeaway') {
                    markdown += `> **Key Takeaway:** ${item.text}\n\n`;
                  } else if (item.type === 'case_study' || item.type === 'real_world_example') {
                    markdown += `### ${item.title || 'Case Study'}\n\n${item.text || item.content}\n\n`;
                  } else if (item.type === 'code_block') {
                    markdown += `\`\`\`${item.language || ''}\n${Array.isArray(item.content) ? item.content.join('\n') : item.content}\n\`\`\`\n\n`;
                  } else if (item.type === 'prompt_practice') {
                    markdown += `### ${item.title}\n\n`;
                    if (item.scenario) markdown += `**Scenario:** ${item.scenario}\n\n`;
                    if (item.instructions && Array.isArray(item.instructions)) {
                      markdown += `**Instructions:**\n`;
                      item.instructions.forEach((instruction: string) => {
                        markdown += `${instruction}\n`;
                      });
                      markdown += '\n';
                    }
                    if (item.aim) markdown += `**Aim:** ${item.aim}\n\n`;
                  }
                }
              });
            } else if (typeof section.content === 'string') {
              markdown += `${section.content}\n\n`;
            }
            
            // Process subsections
            if (section.subsections && Array.isArray(section.subsections)) {
              section.subsections.forEach((subsection: any) => {
                markdown += `### ${subsection.heading}\n\n`;
                
                if (subsection.content && Array.isArray(subsection.content)) {
                  subsection.content.forEach((item: any) => {
                    if (typeof item === 'string') {
                      markdown += `${item}\n\n`;
                    } else if (typeof item === 'object') {
                      // Handle various content types like above
                      if (item.type === 'heading') {
                        markdown += `${'#'.repeat(item.level + 1)} ${item.text}\n\n`;
                      } else if (item.type === 'key_takeaway') {
                        markdown += `> **Key Takeaway:** ${item.text}\n\n`;
                      } else if (item.type === 'case_study') {
                        markdown += `#### ${item.title}\n\n${item.content}\n\n`;
                      }
                    }
                  });
                }
              });
            }
          });
        }
        
        // Key takeaways for the chapter
        if (chapter.key_takeaways && Array.isArray(chapter.key_takeaways)) {
          markdown += `## Key Takeaways\n\n`;
          chapter.key_takeaways.forEach((takeaway: string) => {
            markdown += `- ${takeaway}\n`;
          });
          markdown += '\n';
        }
        
        markdown += `---\n\n`; // Chapter separator
      });
    }
    
    // Conclusion
    if (data.conclusion) {
      markdown += `# ${data.conclusion.heading || 'Conclusion'}\n\n`;
      
      if (data.conclusion.content && Array.isArray(data.conclusion.content)) {
        data.conclusion.content.forEach((item: any) => {
          if (typeof item === 'string') {
            markdown += `${item}\n\n`;
          } else if (typeof item === 'object') {
            if (item.type === 'heading') {
              markdown += `${'#'.repeat(item.level + 1)} ${item.text}\n\n`;
            }
          }
        });
      }
    }
    
    // Appendices
    if (data.appendices) {
      markdown += `# ${data.appendices.heading || 'Appendices'}\n\n`;
      
      if (data.appendices.content && Array.isArray(data.appendices.content)) {
        data.appendices.content.forEach((item: any) => {
          if (typeof item === 'string') {
            markdown += `${item}\n\n`;
          }
        });
      }
      
      if (data.appendices.sections && Array.isArray(data.appendices.sections)) {
        data.appendices.sections.forEach((section: any, index: number) => {
          markdown += `## ${section.heading}\n\n`;
          
          if (section.content && Array.isArray(section.content)) {
            section.content.forEach((item: any) => {
              if (typeof item === 'string') {
                markdown += `${item}\n\n`;
              }
            });
          }
        });
      }
    }
    
    return markdown;
  };

  // Use raw content directly but handle final_response wrapper
  const markdownContent = React.useMemo(() => {
    // Extract actual content from final_response wrapper if it exists
    const actualContent = content?.final_response || content;
    console.log('ContentView processing content:', content);
    console.log('ContentView extracted actualContent:', actualContent);
    
    // First priority: use markdown_document if it exists
    if (actualContent?.markdown_document) {
      return actualContent.markdown_document;
    }
    
    // Second priority: check for main_body.markdown_document (course format)
    if (actualContent?.main_body?.markdown_document) {
      return actualContent.main_body.markdown_document;
    }
    
    // Generate comprehensive markdown from ebook structure
    if (actualContent?.title) {
      return generateCompleteEbookMarkdown(actualContent);
    }
    
    return 'No content available for display';
  }, [content]);

  // Custom components for ReactMarkdown with clean white/grey styling
  const components: Components = {
    h1: ({ children, ...props }: any) => (
      <h1 {...props} className="text-4xl font-bold mb-8 mt-0 text-gray-800 border-b-2 border-gray-200 pb-4">
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 {...props} className="text-3xl font-semibold mb-6 mt-8 text-gray-700">
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 {...props} className="text-2xl font-medium mb-4 mt-6 text-gray-600">
        {children}
      </h3>
    ),
    h4: ({ children, ...props }: any) => (
      <h4 {...props} className="text-xl font-medium mb-3 mt-5 text-gray-600">
        {children}
      </h4>
    ),
    h5: ({ children, ...props }: any) => (
      <h5 {...props} className="text-lg font-medium mb-2 mt-4 text-gray-600">
        {children}
      </h5>
    ),
    h6: ({ children, ...props }: any) => (
      <h6 {...props} className="text-base font-medium mb-2 mt-3 text-gray-600">
        {children}
      </h6>
    ),
    p: ({ children, ...props }: any) => (
      <p {...props} className="mb-4 leading-relaxed text-gray-700 text-base">
        {children}
      </p>
    ),
    ul: ({ children, ...props }: any) => (
      <ul {...props} className="list-disc ml-6 mb-4 space-y-2">
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol {...props} className="list-decimal ml-6 mb-4 space-y-2">
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li {...props} className="text-gray-700 leading-relaxed">
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote {...props} className="border-l-4 border-blue-300 pl-4 italic text-gray-600 my-6 bg-blue-50 py-4 pr-4 rounded-r">
        {children}
      </blockquote>
    ),
    code: ({ node, inline, className, children, ...props }: any) => {
      return inline ? (
        <code {...props} className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
          {children}
        </code>
      ) : (
        <code {...props} className={`${className} block`}>
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }: any) => (
      <pre {...props} className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-sm font-mono overflow-x-auto my-6">
        {children}
      </pre>
    ),
    hr: ({ ...props }: any) => (
      <hr {...props} className="my-8 border-t-2 border-gray-200" />
    ),
    strong: ({ children, ...props }: any) => (
      <strong {...props} className="font-semibold text-gray-800">
        {children}
      </strong>
    ),
    em: ({ children, ...props }: any) => (
      <em {...props} className="italic text-gray-700">
        {children}
      </em>
    ),
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto mb-6">
        <table {...props} className="min-w-full border-collapse border border-gray-300">
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }: any) => (
      <th {...props} className="border border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold text-gray-700">
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td {...props} className="border border-gray-300 px-4 py-2 text-gray-700">
        {children}
      </td>
    ),
    a: ({ children, href, ...props }: any) => (
      <a {...props} href={href} className="text-blue-600 underline hover:text-blue-800 transition-colors">
        {children}
      </a>
    ),
  };

  return (
    <div className="h-full overflow-auto bg-white">
      <div className="p-8 max-w-4xl mx-auto">
        {markdownContent && markdownContent.trim() !== '' && markdownContent !== 'No content available for display' ? (
          <div className="prose prose-gray max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]}
              components={components}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[60vh] text-gray-500">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No Content Available</p>
              <p className="text-sm mt-2">Content is being processed or not yet available</p>
              {/* Debug info in development */}
              {process.env.NODE_ENV === 'development' && content && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800 text-sm">
                    Debug: Show raw content structure
                  </summary>
                  <pre className="text-xs mt-2 bg-gray-100 p-3 rounded max-w-md overflow-auto text-left max-h-64">
                    {JSON.stringify(content?.final_response || content, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentView;