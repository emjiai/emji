'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import type { Components } from 'react-markdown';
import { FileText, BookOpen, List } from 'lucide-react';

interface ContentViewProps {
  content: any;
}

// Type definitions for better TypeScript support
interface Topic {
  topic_id: string;
  topic_title: string;
  content: string;
}

interface Lesson {
  lesson_id: string;
  lesson_title: string;
  timeBlock?: string;
  objectives?: string[];
  activities?: string[];
  materials?: string[];
  assessment?: string;
  homework?: string;
  category?: string;
  color?: string;
  topics?: Topic[];
}

interface Module {
  module_id: string;
  module_title: string;
  module_description?: string;
  lessons: Lesson[];
}

const ContentView: React.FC<ContentViewProps> = ({ content }) => {
  // Helper function to parse table of contents string into structured format
  const parseTableOfContentsString = (tocString: string): Module[] => {
    const lines = tocString.split(/(?=Module \d+:)/).filter(line => line.trim());
    const modules: Module[] = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      const moduleMatch = trimmed.match(/^Module (\d+):\s*(.+?)(?=\s+\d+\.\d+:|$)/);
      
      if (moduleMatch) {
        const moduleNumber = moduleMatch[1];
        const moduleTitle = moduleMatch[2].trim();
        
        const module: Module = {
          module_id: moduleNumber,
          module_title: moduleTitle,
          lessons: []
        };
        
        // Extract lessons from the remaining text
        const remainingText = trimmed.substring(moduleMatch[0].length);
        const lessonMatches = remainingText.match(/\d+\.\d+(?:\.\d+)?:\s*[^0-9]+?(?=\s+\d+\.\d+|$)/g);
        
        if (lessonMatches) {
          lessonMatches.forEach(lessonMatch => {
            const lessonParts = lessonMatch.match(/^(\d+\.\d+(?:\.\d+)?):\s*(.+)$/);
            if (lessonParts) {
              const lessonId = lessonParts[1];
              const lessonTitle = lessonParts[2].trim();
              
              const lesson: Lesson = {
                lesson_id: lessonId,
                lesson_title: lessonTitle,
                topics: [{
                  topic_id: '1',
                  topic_title: lessonTitle,
                  content: ''
                }]
              };
              
              module.lessons.push(lesson);
            }
          });
        }
        
        modules.push(module);
      }
    });
    
    return modules;
  };

  // Generate well-formatted markdown from the content structure
  const generateMarkdownFromContent = (data: any): string => {
    if (!data) return 'No content available';
    
    let markdown = '';
    
    // Course title
    const courseTitle = data.main_body?.course_title || data.title || 'Course Content';
    markdown += `# ${courseTitle}\n\n`;
    
    // Add course number if present
    if (data.main_body?.course_number) {
      markdown += `**Course Number:** ${data.main_body.course_number}\n\n`;
    }
    
    // Add abstract if present
    if (data.abstract) {
      markdown += `## Abstract\n\n${data.abstract}\n\n`;
    }
    
    // Add introduction if present
    if (data.introduction) {
      markdown += `## Introduction\n\n${data.introduction}\n\n`;
    }
    
    // Handle Table of Contents
    let modulesToRender: Module[] = [];
    
    // First, try to get modules from main_body
    if (data.main_body?.modules && Array.isArray(data.main_body.modules)) {
      modulesToRender = data.main_body.modules as Module[];
    }
    // If not available, try parsing from table_of_contents string
    else if (data.table_of_contents && typeof data.table_of_contents === 'string') {
      modulesToRender = parseTableOfContentsString(data.table_of_contents);
    }
    // Or if table_of_contents is an array (from our parsing)
    else if (data.table_of_contents && Array.isArray(data.table_of_contents)) {
      // Convert sections to modules format
      modulesToRender = data.table_of_contents.map((section: any, index: number): Module => ({
        module_id: (index + 1).toString(),
        module_title: section.section_title || `Section ${index + 1}`,
        lessons: section.sub_sections?.map((sub: any, subIndex: number): Lesson => ({
          lesson_id: `${index + 1}.${subIndex + 1}`,
          lesson_title: sub.title || `Lesson ${subIndex + 1}`,
          topics: [{
            topic_id: '1',
            topic_title: sub.title || `Topic ${subIndex + 1}`,
            content: sub.content || ''
          }]
        })) || []
      }));
    }
    
    // Generate Table of Contents
    if (modulesToRender.length > 0) {
      markdown += `## Table of Contents\n\n`;
      
      modulesToRender.forEach((module: Module) => {
        // Module entry
        markdown += `**Module ${module.module_id}: ${module.module_title}**\n\n`;
        
        // Lessons under each module
        if (module.lessons && Array.isArray(module.lessons)) {
          module.lessons.forEach((lesson: Lesson) => {
            markdown += `&nbsp;&nbsp;&nbsp;&nbsp;${lesson.lesson_id}: ${lesson.lesson_title}\n\n`;
          });
        }
        
        markdown += '\n';
      });
    }
    
    // Course Content - Detailed Modules and Lessons
    if (modulesToRender.length > 0) {
      markdown += `## Course Content\n\n`;
      
      modulesToRender.forEach((module: Module) => {
        markdown += `### Module ${module.module_id}: ${module.module_title}\n\n`;
        
        if (module.module_description) {
          markdown += `${module.module_description}\n\n`;
        }
        
        // Add lessons
        if (module.lessons && Array.isArray(module.lessons)) {
          module.lessons.forEach((lesson: Lesson) => {
            markdown += `#### Lesson ${lesson.lesson_id}: ${lesson.lesson_title}\n\n`;
            
            if (lesson.timeBlock) {
              markdown += `**Duration:** ${lesson.timeBlock}\n\n`;
            }
            
            if (lesson.objectives && Array.isArray(lesson.objectives) && lesson.objectives.length > 0) {
              markdown += `**Learning Objectives:**\n`;
              lesson.objectives.forEach((objective: string) => {
                markdown += `- ${objective}\n`;
              });
              markdown += '\n';
            }
            
            if (lesson.activities && Array.isArray(lesson.activities) && lesson.activities.length > 0) {
              markdown += `**Activities:** ${lesson.activities.join(', ')}\n\n`;
            }
            
            if (lesson.materials && Array.isArray(lesson.materials) && lesson.materials.length > 0) {
              markdown += `**Materials:** ${lesson.materials.join(', ')}\n\n`;
            }
            
            if (lesson.assessment) {
              markdown += `**Assessment:** ${lesson.assessment}\n\n`;
            }
            
            if (lesson.homework) {
              markdown += `**Homework:** ${lesson.homework}\n\n`;
            }
            
            // Add topics content
            if (lesson.topics && Array.isArray(lesson.topics)) {
              lesson.topics.forEach((topic: Topic) => {
                if (topic.topic_title && topic.content) {
                  markdown += `**${topic.topic_title}**\n\n`;
                  markdown += `${topic.content}\n\n`;
                }
              });
            }
            
            markdown += '---\n\n'; // Separator between lessons
          });
        }
      });
    }
    
    // Add conclusion if present
    if (data.conclusion) {
      markdown += `## Conclusion\n\n${data.conclusion}\n\n`;
    }
    
    return markdown;
  };
  
  // Use markdown_document field if available, otherwise generate from structure
  const markdownContent = content?.markdown_document || generateMarkdownFromContent(content);
  
  console.log('Content received:', content);
  console.log('Generated markdown:', markdownContent);
  
  // Custom components for ReactMarkdown with enhanced styling
  const components: Components = {
    h1: ({ node, children, ...props }: any) => {
      return (
        <h1 {...props} className="text-3xl font-bold mb-8 mt-0 text-blue-700 border-b-2 border-blue-200 pb-4">
          {children}
        </h1>
      );
    },
    h2: ({ node, children, ...props }: any) => {
      const text = Array.isArray(children) 
        ? children.join('') 
        : String(children || '');
      
      const isSpecial = text.includes('Table of Contents') || 
                       text.includes('Abstract') || 
                       text.includes('Introduction') || 
                       text.includes('Course Content') ||
                       text.includes('Conclusion');
      
      return (
        <h2 {...props} className={`text-2xl font-semibold mb-6 mt-8 flex items-center gap-3 ${
          isSpecial ? 'text-blue-600' : 'text-gray-800'
        }`}>
          {text.includes('Table of Contents') && <List className="h-6 w-6" />}
          {text.includes('Course Content') && <BookOpen className="h-6 w-6" />}
          {text.includes('Abstract') && <FileText className="h-6 w-6" />}
          {text.includes('Introduction') && <FileText className="h-6 w-6" />}
          {children}
        </h2>
      );
    },
    h3: ({ node, children, ...props }: any) => {
      const text = Array.isArray(children) 
        ? children.join('') 
        : String(children || '');
        
      const isModule = text.includes('Module');
      
      return (
        <h3 {...props} className={`text-xl font-medium mb-4 mt-6 ${
          isModule ? 'text-blue-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500' : 'text-gray-700'
        }`}>
          {children}
        </h3>
      );
    },
    h4: ({ node, children, ...props }: any) => {
      const text = Array.isArray(children) 
        ? children.join('') 
        : String(children || '');
        
      const isLesson = text.includes('Lesson');
      
      return (
        <h4 {...props} className={`text-lg font-medium mb-3 mt-5 ${
          isLesson ? 'text-green-600 bg-green-50 p-2 rounded border-l-3 border-green-400' : 'text-gray-600'
        }`}>
          {children}
        </h4>
      );
    },
    h5: ({ node, children, ...props }: any) => {
      return (
        <h5 {...props} className="text-base font-medium mb-2 mt-4 text-gray-600">
          {children}
        </h5>
      );
    },
    ul: ({ node, children, ...props }: any) => (
      <ul {...props} className="list-disc ml-6 mb-4 space-y-1">
        {children}
      </ul>
    ),
    ol: ({ node, children, ...props }: any) => (
      <ol {...props} className="list-decimal ml-6 mb-4 space-y-1">
        {children}
      </ol>
    ),
    li: ({ node, children, ...props }: any) => (
      <li {...props} className="leading-relaxed text-gray-700">
        {children}
      </li>
    ),
    p: ({ node, children, ...props }: any) => {
      // Check if this paragraph contains course info
      const text = Array.isArray(children) 
        ? children.join('') 
        : String(children || '');
      
      // Special formatting for indented table of contents entries
      if (text.includes('\u00a0\u00a0\u00a0\u00a0') || text.match(/^\s*\d+\.\d+:/)) {
        return (
          <p {...props} className="mb-1 leading-relaxed text-gray-600 pl-6 text-sm">
            {children}
          </p>
        );
      }
      
      return (
        <p {...props} className="mb-4 leading-relaxed text-gray-700">
          {children}
        </p>
      );
    },
    strong: ({ node, children, ...props }: any) => {
      const text = Array.isArray(children) 
        ? children.join('') 
        : String(children || '');
      
      // Special styling for module titles in TOC
      if (text.includes('Module')) {
        return (
          <strong {...props} className="font-bold text-blue-700 text-base">
            {children}
          </strong>
        );
      }
      
      // Special styling for lesson metadata
      if (text.includes('Duration:') || text.includes('Activities:') || 
          text.includes('Materials:') || text.includes('Assessment:') ||
          text.includes('Learning Objectives:') || text.includes('Homework:')) {
        return (
          <strong {...props} className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">
            {children}
          </strong>
        );
      }
      
      return (
        <strong {...props} className="font-semibold text-gray-900">
          {children}
        </strong>
      );
    },
    em: ({ node, children, ...props }: any) => (
      <em {...props} className="italic text-gray-800">
        {children}
      </em>
    ),
    code: ({ node, children, ...props }: any) => (
      <code {...props} className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
        {children}
      </code>
    ),
    pre: ({ node, children, ...props }: any) => (
      <pre {...props} className="bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto mb-4">
        {children}
      </pre>
    ),
    blockquote: ({ node, children, ...props }: any) => (
      <blockquote {...props} className="border-l-4 border-blue-500 pl-4 italic bg-blue-50 py-3 mb-4 rounded-r">
        {children}
      </blockquote>
    ),
    table: ({ node, children, ...props }: any) => (
      <div className="overflow-x-auto mb-4">
        <table {...props} className="min-w-full border-collapse border border-gray-300">
          {children}
        </table>
      </div>
    ),
    th: ({ node, children, ...props }: any) => (
      <th {...props} className="border border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold">
        {children}
      </th>
    ),
    td: ({ node, children, ...props }: any) => (
      <td {...props} className="border border-gray-300 px-4 py-2">
        {children}
      </td>
    ),
    hr: ({ node, ...props }: any) => (
      <hr {...props} className="my-8 border-t-2 border-gray-200" />
    )
  };
  
  return (
    <div className="h-full overflow-auto bg-white">
      <div className="p-6 max-w-5xl mx-auto">
        {markdownContent && markdownContent.trim() !== '' && markdownContent !== 'No content available' ? (
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              components={components}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No Content Available</p>
              <p className="text-sm">Content is being processed or not yet available</p>
              {content && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    Debug: Show raw content
                  </summary>
                  <pre className="text-xs mt-2 bg-gray-100 p-2 rounded max-w-md overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(content, null, 2)}
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

// 'use client';

// import React from 'react';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
// import rehypeRaw from 'rehype-raw';
// import rehypeSanitize from 'rehype-sanitize';
// import type { Components } from 'react-markdown';
// import { FileText } from 'lucide-react';

// interface ContentViewProps {
//   content: any;
// }

// const ContentView: React.FC<ContentViewProps> = ({ content }) => {
//   // Generate markdown from the new API structure
//   const generateMarkdownFromContent = (data: any): string => {
//     if (!data) return 'No content available';
    
//     let markdown = '';
    
//     // Add abstract if present
//     if (data.abstract) {
//       markdown += `# Abstract\n\n${data.abstract}\n\n`;
//     }
    
//     // Process table_of_contents if it's an array of sections
//     if (data.table_of_contents && Array.isArray(data.table_of_contents)) {
//       markdown += `# Table of Contents\n\n`;
      
//       data.table_of_contents.forEach((section: any, sectionIndex: number) => {
//         // Section title
//         if (section.section_title) {
//           markdown += `## ${section.section_title}\n\n`;
//         }
        
//         // Sub-sections
//         if (section.sub_sections && Array.isArray(section.sub_sections)) {
//           section.sub_sections.forEach((subSection: any, subIndex: number) => {
//             if (subSection.title) {
//               markdown += `### ${subSection.title}\n\n`;
//             }
            
//             if (subSection.content) {
//               markdown += `${subSection.content}\n\n`;
//             }
            
//             // Add deliverables if present
//             if (subSection.deliverables && Array.isArray(subSection.deliverables)) {
//               markdown += `**Key Deliverables:**\n`;
//               subSection.deliverables.forEach((deliverable: string) => {
//                 markdown += `- ${deliverable}\n`;
//               });
//               markdown += '\n';
//             }
//           });
//         }
//       });
//     }
    
//     // If no table_of_contents array structure, try old format
//     else if (data.table_of_contents && typeof data.table_of_contents === 'string') {
//       markdown += `# Table of Contents\n\n${data.table_of_contents}\n\n`;
//     }
    
//     // Add introduction if present
//     if (data.introduction) {
//       markdown += `# Introduction\n\n${data.introduction}\n\n`;
//     }
    
//     // Add main body content (legacy structure support)
//     if (data.main_body) {
//       markdown += `# ${data.main_body.course_title || 'Course Content'}\n\n`;
      
//       if (data.main_body.course_number) {
//         markdown += `**Course Number:** ${data.main_body.course_number}\n\n`;
//       }
      
//       // Add modules
//       if (data.main_body.modules && Array.isArray(data.main_body.modules)) {
//         data.main_body.modules.forEach((module: any) => {
//           markdown += `## Module ${module.module_id}: ${module.module_title}\n\n`;
          
//           if (module.module_description) {
//             markdown += `${module.module_description}\n\n`;
//           }
          
//           // Add lessons
//           if (module.lessons && Array.isArray(module.lessons)) {
//             module.lessons.forEach((lesson: any) => {
//               markdown += `### ${lesson.lesson_id} ${lesson.lesson_title}\n\n`;
              
//               if (lesson.timeBlock) {
//                 markdown += `**Duration:** ${lesson.timeBlock}\n\n`;
//               }
              
//               if (lesson.objectives && Array.isArray(lesson.objectives)) {
//                 markdown += `**Learning Objectives:**\n`;
//                 lesson.objectives.forEach((objective: string) => {
//                   markdown += `- ${objective}\n`;
//                 });
//                 markdown += '\n';
//               }
              
//               if (lesson.activities && Array.isArray(lesson.activities)) {
//                 markdown += `**Activities:** ${lesson.activities.join(', ')}\n\n`;
//               }
              
//               if (lesson.materials && Array.isArray(lesson.materials)) {
//                 markdown += `**Materials:** ${lesson.materials.join(', ')}\n\n`;
//               }
              
//               if (lesson.assessment) {
//                 markdown += `**Assessment:** ${lesson.assessment}\n\n`;
//               }
              
//               if (lesson.homework) {
//                 markdown += `**Homework:** ${lesson.homework}\n\n`;
//               }
              
//               // Add topics
//               if (lesson.topics && Array.isArray(lesson.topics)) {
//                 lesson.topics.forEach((topic: any) => {
//                   if (topic.topic_title) {
//                     markdown += `#### ${topic.topic_id} ${topic.topic_title}\n\n`;
//                   }
//                   if (topic.content) {
//                     markdown += `${topic.content}\n\n`;
//                   }
//                 });
//               }
              
//               // Add subtopics
//               if (lesson.subtopics && Array.isArray(lesson.subtopics)) {
//                 lesson.subtopics.forEach((subtopic: any) => {
//                   if (subtopic.subtopic_title) {
//                     markdown += `##### ${subtopic.subtopic_id} ${subtopic.subtopic_title}\n\n`;
//                   }
//                   if (subtopic.content) {
//                     markdown += `${subtopic.content}\n\n`;
//                   }
//                 });
//               }
//             });
//           }
//         });
//       }
//     }
    
//     // Add conclusion if present
//     if (data.conclusion) {
//       markdown += `# Conclusion\n\n${data.conclusion}\n\n`;
//     }
    
//     return markdown;
//   };
  
//   // Use markdown_document field if available, otherwise generate from structure
//   const markdownContent = content?.markdown_document || generateMarkdownFromContent(content);
  
//   console.log('Content received:', content);
//   console.log('Generated markdown:', markdownContent);
  
//   // Custom components for ReactMarkdown
//   const components: Components = {
//     h1: ({ node, children, ...props }: any) => {
//       const text = Array.isArray(children) 
//         ? children.join('') 
//         : String(children || '');
        
//       const hasNumbering = /^\d+(\.\d+)*\.?\s+/.test(text);
      
//       return (
//         <h1 {...props} className={`text-2xl font-bold mb-6 mt-8 first:mt-0 ${hasNumbering ? 'text-blue-600' : 'text-gray-900'} border-b border-gray-200 pb-2`}>
//           {children}
//         </h1>
//       );
//     },
//     h2: ({ node, children, ...props }: any) => {
//       const text = Array.isArray(children) 
//         ? children.join('') 
//         : String(children || '');
        
//       const hasNumbering = /^\d+(\.\d+)*\.?\s+/.test(text);
//       const isSpecial = text.includes('Overview') || text.includes('Executive Summary') || text.includes('Module');
      
//       return (
//         <h2 {...props} className={`text-xl font-semibold mb-4 mt-6 ${hasNumbering || isSpecial ? 'text-blue-600' : 'text-gray-800'}`}>
//           {children}
//         </h2>
//       );
//     },
//     h3: ({ node, children, ...props }: any) => {
//       const text = Array.isArray(children) 
//         ? children.join('') 
//         : String(children || '');
        
//       const hasNumbering = /^\d+(\.\d+)*\.?\s+/.test(text);
      
//       return (
//         <h3 {...props} className={`text-lg font-medium mb-3 mt-5 ${hasNumbering ? 'text-blue-600' : 'text-gray-700'}`}>
//           {children}
//         </h3>
//       );
//     },
//     h4: ({ node, children, ...props }: any) => {
//       const text = Array.isArray(children) 
//         ? children.join('') 
//         : String(children || '');
        
//       const hasNumbering = /^\d+(\.\d+)*\.?\s+/.test(text);
      
//       return (
//         <h4 {...props} className={`text-base font-medium mb-2 mt-4 ${hasNumbering ? 'text-blue-600' : 'text-gray-600'}`}>
//           {children}
//         </h4>
//       );
//     },
//     h5: ({ node, children, ...props }: any) => {
//       const text = Array.isArray(children) 
//         ? children.join('') 
//         : String(children || '');
        
//       const hasNumbering = /^\d+(\.\d+)*\.?\s+/.test(text);
      
//       return (
//         <h5 {...props} className={`text-sm font-medium mb-2 mt-3 ${hasNumbering ? 'text-blue-600' : 'text-gray-600'}`}>
//           {children}
//         </h5>
//       );
//     },
//     ul: ({ node, children, ...props }: any) => (
//       <ul {...props} className="list-disc ml-6 mb-4 space-y-2">
//         {children}
//       </ul>
//     ),
//     ol: ({ node, children, ...props }: any) => (
//       <ol {...props} className="list-decimal ml-6 mb-4 space-y-2">
//         {children}
//       </ol>
//     ),
//     li: ({ node, children, ...props }: any) => (
//       <li {...props} className="leading-relaxed">
//         {children}
//       </li>
//     ),
//     p: ({ node, children, ...props }: any) => (
//       <p {...props} className="mb-4 leading-relaxed text-gray-700">
//         {children}
//       </p>
//     ),
//     strong: ({ node, children, ...props }: any) => (
//       <strong {...props} className="font-semibold text-gray-900">
//         {children}
//       </strong>
//     ),
//     em: ({ node, children, ...props }: any) => (
//       <em {...props} className="italic text-gray-800">
//         {children}
//       </em>
//     ),
//     code: ({ node, children, ...props }: any) => (
//       <code {...props} className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
//         {children}
//       </code>
//     ),
//     pre: ({ node, children, ...props }: any) => (
//       <pre {...props} className="bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto mb-4">
//         {children}
//       </pre>
//     ),
//     blockquote: ({ node, children, ...props }: any) => (
//       <blockquote {...props} className="border-l-4 border-blue-500 pl-4 italic bg-blue-50 py-3 mb-4 rounded-r">
//         {children}
//       </blockquote>
//     ),
//     table: ({ node, children, ...props }: any) => (
//       <div className="overflow-x-auto mb-4">
//         <table {...props} className="min-w-full border-collapse border border-gray-300">
//           {children}
//         </table>
//       </div>
//     ),
//     th: ({ node, children, ...props }: any) => (
//       <th {...props} className="border border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold">
//         {children}
//       </th>
//     ),
//     td: ({ node, children, ...props }: any) => (
//       <td {...props} className="border border-gray-300 px-4 py-2">
//         {children}
//       </td>
//     )
//   };
  
//   return (
//     <div className="h-full overflow-auto">
//       <div className="p-6 max-w-4xl">
//         {markdownContent && markdownContent.trim() !== '' && markdownContent !== 'No content available' ? (
//           <div className="prose prose-lg max-w-none">
//             <ReactMarkdown 
//               remarkPlugins={[remarkGfm]} 
//               rehypePlugins={[rehypeRaw, rehypeSanitize]}
//               components={components}
//             >
//               {markdownContent}
//             </ReactMarkdown>
//           </div>
//         ) : (
//           <div className="flex items-center justify-center h-full text-gray-500">
//             <div className="text-center">
//               <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
//               <p className="text-lg font-medium">No Content Available</p>
//               <p className="text-sm">Content is being processed or not yet available</p>
//               {content && (
//                 <details className="mt-4 text-left">
//                   <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
//                     Debug: Show raw content
//                   </summary>
//                   <pre className="text-xs mt-2 bg-gray-100 p-2 rounded max-w-md overflow-auto whitespace-pre-wrap">
//                     {JSON.stringify(content, null, 2)}
//                   </pre>
//                 </details>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ContentView;

// // 'use client';

// // import React from 'react';
// // import ReactMarkdown from 'react-markdown';
// // import remarkGfm from 'remark-gfm';
// // import rehypeRaw from 'rehype-raw';
// // import rehypeSanitize from 'rehype-sanitize';
// // import type { Components } from 'react-markdown';
// // import { FileText } from 'lucide-react';

// // interface ContentViewProps {
// //   content: any;
// // }

// // const ContentView: React.FC<ContentViewProps> = ({ content }) => {
// //   // Helper function to format table of contents
// //   const formatTableOfContents = (tocString: string): string => {
// //     if (!tocString) return '';
    
// //     // Clean up the string and normalize spacing
// //     let cleanedToc = tocString
// //       .replace(/\s+/g, ' ') // Replace multiple spaces with single space
// //       .trim();
    
// //     // Split by module boundaries and section patterns
// //     const segments = cleanedToc.split(/(Module \d+:)/);
// //     let formatted = '';
    
// //     for (let i = 0; i < segments.length; i++) {
// //       const segment = segments[i].trim();
// //       if (!segment) continue;
      
// //       // If this is a module header
// //       if (segment.match(/^Module \d+:$/)) {
// //         const nextSegment = segments[i + 1];
// //         if (nextSegment) {
// //           // Extract module title (everything until the next numbered section)
// //           const moduleMatch = nextSegment.match(/^([^0-9]+?)(?=\s*\d+\.\d+|$)/);
// //           if (moduleMatch) {
// //             formatted += `\n## ${segment} ${moduleMatch[1].trim()}\n\n`;
// //             // Process the rest of this module's content
// //             const restOfModule = nextSegment.replace(moduleMatch[1], '').trim();
// //             formatted += formatModuleContent(restOfModule);
// //           }
// //           i++; // Skip the next segment since we processed it
// //         }
// //       }
// //       // If this segment doesn't start with "Module" but has content
// //       else if (!segment.match(/^Module \d+:/)) {
// //         formatted += formatModuleContent(segment);
// //       }
// //     }
    
// //     return formatted;
// //   };
  
// //   // Helper function to format content within a module
// //   const formatModuleContent = (content: string): string => {
// //     if (!content) return '';
    
// //     let formatted = '';
    
// //     // Split by numbered sections while preserving the numbers
// //     const sections = content.split(/(?=\d+\.\d+(?:\.\d+)?\s)/);
    
// //     for (const section of sections) {
// //       const trimmedSection = section.trim();
// //       if (!trimmedSection) continue;
      
// //       // Level 2 sections (e.g., "1.1 Title")
// //       const level2Match = trimmedSection.match(/^(\d+\.\d+)\s+([^0-9]+?)(?=\s*\d+\.\d+\.\d+|\s*Case Studies:|$)/);
// //       if (level2Match) {
// //         formatted += `### ${level2Match[1]} ${level2Match[2].trim()}\n\n`;
        
// //         // Look for subsections
// //         const remaining = trimmedSection.replace(level2Match[0], '').trim();
// //         if (remaining) {
// //           formatted += formatSubsections(remaining);
// //         }
// //       }
// //       // Level 3 sections that might be standalone
// //       else {
// //         formatted += formatSubsections(trimmedSection);
// //       }
// //     }
    
// //     return formatted;
// //   };
  
// //   // Helper function to format subsections
// //   const formatSubsections = (content: string): string => {
// //     if (!content) return '';
    
// //     let formatted = '';
    
// //     // Split by level 3 sections
// //     const subsections = content.split(/(?=\d+\.\d+\.\d+\s)/);
    
// //     for (const subsection of subsections) {
// //       const trimmedSubsection = subsection.trim();
// //       if (!trimmedSubsection) continue;
      
// //       // Level 3 sections (e.g., "1.1.1 Title")
// //       const level3Match = trimmedSubsection.match(/^(\d+\.\d+\.\d+)\s+([^C]+?)(?=\s*Case Studies:|$)/);
// //       if (level3Match) {
// //         formatted += `#### ${level3Match[1]} ${level3Match[2].trim()}\n\n`;
// //       }
      
// //       // Case studies
// //       if (trimmedSubsection.includes('Case Studies:')) {
// //         const caseStudyMatch = trimmedSubsection.match(/(Case Studies:[^0-9]*)/);
// //         if (caseStudyMatch) {
// //           formatted += `\n*${caseStudyMatch[1].trim()}*\n\n`;
// //         }
// //       }
// //     }
    
// //     return formatted;
// //   };

// //   // Generate markdown from the new API structure
// //   const generateMarkdownFromContent = (data: any): string => {
// //     if (!data) return 'No content available';
    
// //     let markdown = '';
    
// //     // Add abstract if present (now supports markdown)
// //     if (data.abstract) {
// //       markdown += `# Abstract\n\n${data.abstract}\n\n`;
// //     }
    
// //     // Add table of contents if present (now supports markdown with formatting)
// //     if (data.table_of_contents) {
// //       markdown += `# Table of Contents\n\n`;
// //       const formattedToc = formatTableOfContents(data.table_of_contents);
// //       markdown += `${formattedToc}\n\n`;
// //     }
    
// //     // Add introduction if present (now supports markdown)
// //     if (data.introduction) {
// //       markdown += `# Introduction\n\n${data.introduction}\n\n`;
// //     }
    
// //     // Add main body content
// //     if (data.main_body) {
// //       markdown += `# ${data.main_body.course_title || 'Course Content'}\n\n`;
      
// //       if (data.main_body.course_number) {
// //         markdown += `**Course Number:** ${data.main_body.course_number}\n\n`;
// //       }
      
// //       // Add modules
// //       if (data.main_body.modules && Array.isArray(data.main_body.modules)) {
// //         data.main_body.modules.forEach((module: any, moduleIndex: number) => {
// //           // Module title now supports markdown
// //           markdown += `## Module ${module.module_id}: ${module.module_title}\n\n`;
          
// //           if (module.module_description) {
// //             markdown += `${module.module_description}\n\n`;
// //           }
          
// //           // Add lessons
// //           if (module.lessons && Array.isArray(module.lessons)) {
// //             module.lessons.forEach((lesson: any, lessonIndex: number) => {
// //               // Lesson title now supports markdown
// //               markdown += `### ${lesson.lesson_id} ${lesson.lesson_title}\n\n`;
              
// //               if (lesson.timeBlock) {
// //                 markdown += `**Duration:** ${lesson.timeBlock}\n\n`;
// //               }
              
// //               if (lesson.objectives && Array.isArray(lesson.objectives)) {
// //                 markdown += `**Learning Objectives:**\n`;
// //                 lesson.objectives.forEach((objective: string) => {
// //                   // Objectives now support markdown
// //                   markdown += `- ${objective}\n`;
// //                 });
// //                 markdown += '\n';
// //               }
              
// //               if (lesson.activities && Array.isArray(lesson.activities)) {
// //                 markdown += `**Activities:** ${lesson.activities.join(', ')}\n\n`;
// //               }
              
// //               if (lesson.materials && Array.isArray(lesson.materials)) {
// //                 markdown += `**Materials:** ${lesson.materials.join(', ')}\n\n`;
// //               }
              
// //               if (lesson.assessment) {
// //                 markdown += `**Assessment:** ${lesson.assessment}\n\n`;
// //               }
              
// //               if (lesson.homework) {
// //                 markdown += `**Homework:** ${lesson.homework}\n\n`;
// //               }
              
// //               // Add topics if present (now support markdown in content and titles)
// //               if (lesson.topics && Array.isArray(lesson.topics)) {
// //                 lesson.topics.forEach((topic: any) => {
// //                   if (topic.topic_title) {
// //                     // Topic title now supports markdown
// //                     markdown += `#### ${topic.topic_id} ${topic.topic_title}\n\n`;
// //                   }
// //                   if (topic.content) {
// //                     // Topic content now supports markdown
// //                     markdown += `${topic.content}\n\n`;
// //                   }
// //                 });
// //               }
              
// //               // Add subtopics if present (new structure)
// //               if (lesson.subtopics && Array.isArray(lesson.subtopics)) {
// //                 lesson.subtopics.forEach((subtopic: any) => {
// //                   if (subtopic.subtopic_title) {
// //                     // Subtopic title now supports markdown
// //                     markdown += `##### ${subtopic.subtopic_id} ${subtopic.subtopic_title}\n\n`;
// //                   }
// //                   if (subtopic.content) {
// //                     // Subtopic content now supports markdown
// //                     markdown += `${subtopic.content}\n\n`;
// //                   }
// //                 });
// //               }
// //             });
// //           }
// //         });
// //       }
// //     }
    
// //     // Add conclusion if present (now supports markdown)
// //     if (data.conclusion) {
// //       markdown += `# Conclusion\n\n${data.conclusion}\n\n`;
// //     }
    
// //     return markdown;
// //   };
  
// //   // Use markdown_document field if available, otherwise generate from structure
// //   const markdownContent = content?.markdown_document || generateMarkdownFromContent(content);
  
// //   console.log('Content received:', content);
// //   console.log('Generated markdown:', markdownContent);
  
// //   // Custom components for ReactMarkdown using the proper type
// //   const components: Components = {
// //     // Custom handling for headings with markdown support
// //     h1: ({ node, children, ...props }: any) => {
// //       const text = Array.isArray(children) 
// //         ? children.join('') 
// //         : String(children || '');
        
// //       // Check if it starts with numbering or is a special heading
// //       const hasNumbering = /^\d+(\.\d+)*\.?\s+/.test(text);
      
// //       return (
// //         <h1 {...props} className={`text-2xl font-bold mb-4 ${hasNumbering ? 'text-blue-600' : ''}`}>
// //           {children}
// //         </h1>
// //       );
// //     },
// //     h2: ({ node, children, ...props }: any) => {
// //       const text = Array.isArray(children) 
// //         ? children.join('') 
// //         : String(children || '');
        
// //       // Check if it starts with numbering or is a special heading like "Overview" or "Executive Summary"
// //       const hasNumbering = /^\d+(\.\d+)*\.?\s+/.test(text);
// //       const isSpecial = text.includes('Overview') || text.includes('Executive Summary') || text.includes('Module');
      
// //       return (
// //         <h2 {...props} className={`text-xl font-semibold mb-3 ${hasNumbering || isSpecial ? 'text-blue-600' : ''}`}>
// //           {children}
// //         </h2>
// //       );
// //     },
// //     h3: ({ node, children, ...props }: any) => {
// //       const text = Array.isArray(children) 
// //         ? children.join('') 
// //         : String(children || '');
        
// //       // Check if it starts with numbering
// //       const hasNumbering = /^\d+(\.\d+)*\.?\s+/.test(text);
      
// //       return (
// //         <h3 {...props} className={`text-lg font-medium mb-2 ${hasNumbering ? 'text-blue-600' : ''}`}>
// //           {children}
// //         </h3>
// //       );
// //     },
// //     h4: ({ node, children, ...props }: any) => {
// //       const text = Array.isArray(children) 
// //         ? children.join('') 
// //         : String(children || '');
        
// //       // Check if it starts with numbering
// //       const hasNumbering = /^\d+(\.\d+)*\.?\s+/.test(text);
      
// //       return (
// //         <h4 {...props} className={`text-base font-medium mb-2 ${hasNumbering ? 'text-blue-600' : ''}`}>
// //           {children}
// //         </h4>
// //       );
// //     },
// //     h5: ({ node, children, ...props }: any) => {
// //       const text = Array.isArray(children) 
// //         ? children.join('') 
// //         : String(children || '');
        
// //       // Check if it starts with numbering
// //       const hasNumbering = /^\d+(\.\d+)*\.?\s+/.test(text);
      
// //       return (
// //         <h5 {...props} className={`text-sm font-medium mb-2 ${hasNumbering ? 'text-blue-600' : ''}`}>
// //           {children}
// //         </h5>
// //       );
// //     },
// //     // Style lists better
// //     ul: ({ node, children, ...props }: any) => (
// //       <ul {...props} className="list-disc ml-6 mb-4 space-y-1">
// //         {children}
// //       </ul>
// //     ),
// //     ol: ({ node, children, ...props }: any) => (
// //       <ol {...props} className="list-decimal ml-6 mb-4 space-y-1">
// //         {children}
// //       </ol>
// //     ),
// //     // Style paragraphs
// //     p: ({ node, children, ...props }: any) => (
// //       <p {...props} className="mb-4 leading-relaxed">
// //         {children}
// //       </p>
// //     ),
// //     // Style strong text
// //     strong: ({ node, children, ...props }: any) => (
// //       <strong {...props} className="font-semibold text-gray-900">
// //         {children}
// //       </strong>
// //     ),
// //     // Style emphasis text
// //     em: ({ node, children, ...props }: any) => (
// //       <em {...props} className="italic text-gray-800">
// //         {children}
// //       </em>
// //     ),
// //     // Style code blocks
// //     code: ({ node, children, ...props }: any) => (
// //       <code {...props} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
// //         {children}
// //       </code>
// //     ),
// //     // Style blockquotes
// //     blockquote: ({ node, children, ...props }: any) => (
// //       <blockquote {...props} className="border-l-4 border-blue-500 pl-4 italic bg-blue-50 py-2 mb-4">
// //         {children}
// //       </blockquote>
// //     )
// //   };
  
// //   return (
// //     <div className="h-full overflow-auto">
// //       <div className="p-6">
// //         {markdownContent && markdownContent.trim() !== '' && markdownContent !== 'No content available' ? (
// //           <div className="prose prose-headings:font-medium prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-strong:font-bold prose-a:text-blue-600 max-w-none">
// //             <ReactMarkdown 
// //               remarkPlugins={[remarkGfm]} 
// //               rehypePlugins={[rehypeRaw, rehypeSanitize]}
// //               components={components}
// //             >
// //               {markdownContent}
// //             </ReactMarkdown>
// //           </div>
// //         ) : (
// //           <div className="flex items-center justify-center h-full text-gray-500">
// //             <div className="text-center">
// //               <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
// //               <p className="text-lg font-medium">No Content Available</p>
// //               <p className="text-sm">Content is being processed or not yet available</p>
// //               <pre className="text-xs mt-4 bg-gray-100 p-2 rounded text-left max-w-md overflow-auto">
// //                 {JSON.stringify(content, null, 2)}
// //               </pre>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default ContentView;