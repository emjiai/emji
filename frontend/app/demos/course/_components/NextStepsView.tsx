'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import type { Components } from 'react-markdown';
import { CheckCircle } from 'lucide-react';

interface NextStepsViewProps {
  content: any;
}

const NextStepsView: React.FC<NextStepsViewProps> = ({ content }) => {
  // Generate markdown from the next_steps data structure (now supports markdown)
  const generateNextStepsMarkdown = (data: any): string => {
    if (!data?.next_steps) return 'No next steps available';
    
    const nextSteps = data.next_steps;
    let markdown = '# Next Steps\n\n';
    
    // Implementation Plan (now supports markdown)
    if (nextSteps.implementation_plan) {
      markdown += '## Implementation Plan\n\n';
      markdown += `${nextSteps.implementation_plan}\n\n`;
    }
    
    // Pilot Testing (now supports markdown)
    if (nextSteps.pilot_testing) {
      markdown += '## Pilot Testing\n\n';
      markdown += `${nextSteps.pilot_testing}\n\n`;
    }
    
    // Evaluation Methodology (now supports markdown)
    if (nextSteps.evaluation_methodology) {
      markdown += '## Evaluation Methodology\n\n';
      markdown += `${nextSteps.evaluation_methodology}\n\n`;
    }
    
    // Resources (now supports markdown)
    if (nextSteps.resources) {
      markdown += '## Resources\n\n';
      markdown += `${nextSteps.resources}\n\n`;
    }
    
    // Additional sections that might be present
    if (nextSteps.timeline) {
      markdown += '## Timeline\n\n';
      markdown += `${nextSteps.timeline}\n\n`;
    }
    
    if (nextSteps.budget_considerations) {
      markdown += '## Budget Considerations\n\n';
      markdown += `${nextSteps.budget_considerations}\n\n`;
    }
    
    if (nextSteps.success_metrics) {
      markdown += '## Success Metrics\n\n';
      markdown += `${nextSteps.success_metrics}\n\n`;
    }
    
    if (nextSteps.risk_mitigation) {
      markdown += '## Risk Mitigation\n\n';
      markdown += `${nextSteps.risk_mitigation}\n\n`;
    }
    
    return markdown;
  };
  
  // Use markdown_next_steps field if available, otherwise generate from structure
  const markdownNextSteps = content?.markdown_next_steps || generateNextStepsMarkdown(content);
  
  // Custom components for ReactMarkdown with enhanced styling for next steps
  const components: Components = {
    // Custom handling for headings with action-oriented styling
    h1: ({ node, children, ...props }: any) => {
      return (
        <h1 {...props} className="text-3xl font-bold mb-6 text-green-600 flex items-center">
          <CheckCircle className="h-8 w-8 mr-3" />
          {children}
        </h1>
      );
    },
    h2: ({ node, children, ...props }: any) => {
      const text = Array.isArray(children) 
        ? children.join('') 
        : String(children || '');
        
      const isActionSection = text.includes('Implementation') || 
                             text.includes('Pilot') || 
                             text.includes('Evaluation') || 
                             text.includes('Resources') ||
                             text.includes('Timeline') ||
                             text.includes('Budget') ||
                             text.includes('Success') ||
                             text.includes('Risk');
      
      return (
        <h2 {...props} className="text-xl font-semibold mb-4 text-green-600 border-b-2 border-green-200 pb-2 flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
          {children}
        </h2>
      );
    },
    h3: ({ node, children, ...props }: any) => {
      return (
        <h3 {...props} className="text-lg font-medium mb-3 text-green-700">
          {children}
        </h3>
      );
    },
    h4: ({ node, children, ...props }: any) => {
      return (
        <h4 {...props} className="text-base font-medium mb-2 text-green-700">
          {children}
        </h4>
      );
    },
    // Enhanced list styling for actionable items
    ul: ({ node, children, ...props }: any) => (
      <ul {...props} className="list-none ml-0 mb-4 space-y-3">
        {children}
      </ul>
    ),
    ol: ({ node, children, ...props }: any) => (
      <ol {...props} className="list-none ml-0 mb-4 space-y-3">
        {children}
      </ol>
    ),
    li: ({ node, children, ...props }: any) => (
      <li {...props} className="flex items-start text-gray-700 leading-relaxed">
        <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex-1">{children}</div>
      </li>
    ),
    // Enhanced paragraph styling
    p: ({ node, children, ...props }: any) => (
      <p {...props} className="mb-4 leading-relaxed text-gray-800">
        {children}
      </p>
    ),
    // Highlighted strong text for key action items
    strong: ({ node, children, ...props }: any) => (
      <strong {...props} className="font-semibold text-green-800 bg-green-50 px-1 rounded">
        {children}
      </strong>
    ),
    // Enhanced emphasis styling
    em: ({ node, children, ...props }: any) => (
      <em {...props} className="italic text-green-700">
        {children}
      </em>
    ),
    // Style blockquotes as important callouts
    blockquote: ({ node, children, ...props }: any) => (
      <blockquote {...props} className="border-l-4 border-green-500 pl-6 py-4 italic bg-green-50 mb-4 rounded-r-lg">
        <div className="flex items-start">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>{children}</div>
        </div>
      </blockquote>
    ),
    // Style code blocks for implementation details
    code: ({ node, children, ...props }: any) => (
      <code {...props} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">
        {children}
      </code>
    ),
    pre: ({ node, children, ...props }: any) => (
      <pre {...props} className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 overflow-x-auto">
        {children}
      </pre>
    ),
    // Style links for resources
    a: ({ node, children, ...props }: any) => (
      <a {...props} className="text-green-600 hover:text-green-800 underline font-medium">
        {children}
      </a>
    ),
    // Style tables for structured action plans
    table: ({ node, children, ...props }: any) => (
      <div className="overflow-x-auto mb-4">
        <table {...props} className="min-w-full border border-green-200 rounded-lg">
          {children}
        </table>
      </div>
    ),
    thead: ({ node, children, ...props }: any) => (
      <thead {...props} className="bg-green-100">
        {children}
      </thead>
    ),
    th: ({ node, children, ...props }: any) => (
      <th {...props} className="px-4 py-2 text-left font-semibold text-green-800 border-b border-green-200">
        {children}
      </th>
    ),
    td: ({ node, children, ...props }: any) => (
      <td {...props} className="px-4 py-2 border-b border-green-100 text-gray-700">
        {children}
      </td>
    )
  };
  
  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-green-50 to-white">
      <div className="p-6">
        {markdownNextSteps && markdownNextSteps.trim() !== '' && markdownNextSteps !== 'No next steps available' ? (
          <div className="prose prose-headings:font-medium prose-h1:text-3xl prose-h2:text-xl prose-h3:text-lg prose-strong:font-bold prose-a:text-green-600 max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              components={components}
            >
              {markdownNextSteps}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No Next Steps Available</p>
              <p className="text-sm">Next steps content is being processed or not yet available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NextStepsView;

// 'use client';

// import React from 'react';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
// import rehypeRaw from 'rehype-raw';
// import rehypeSanitize from 'rehype-sanitize';
// import type { Components } from 'react-markdown';
// import { 
//   CheckCircle, 
//   Circle, 
//   Clock, 
//   Users, 
//   Target, 
//   FileText,
//   ArrowRight,
//   Calendar,
//   AlertCircle
// } from 'lucide-react';

// interface NextStepsViewProps {
//   content: any;
// }

// const NextStepsView: React.FC<NextStepsViewProps> = ({ content }) => {
//   // Extract next steps data from content
//   const nextSteps = content?.next_steps || {};
//   const tableOfContents = content?.table_of_contents || [];
  
//   // Generate next steps from table of contents deliverables if next_steps is empty
//   const generateNextStepsFromDeliverables = () => {
//     const steps: any[] = [];
    
//     tableOfContents.forEach((section: any, sectionIndex: number) => {
//       if (section.sub_sections) {
//         section.sub_sections.forEach((subSection: any, subIndex: number) => {
//           if (subSection.deliverables && Array.isArray(subSection.deliverables)) {
//             subSection.deliverables.forEach((deliverable: string, delivIndex: number) => {
//               steps.push({
//                 id: `${sectionIndex}-${subIndex}-${delivIndex}`,
//                 title: deliverable,
//                 description: `From ${section.section_title} - ${subSection.title}`,
//                 priority: 'medium',
//                 timeline: 'TBD',
//                 status: 'pending',
//                 category: section.section_title,
//                 dependencies: []
//               });
//             });
//           }
//         });
//       }
//     });
    
//     return steps;
//   };
  
//   // Use provided next steps or generate from deliverables
//   const steps = nextSteps.steps || nextSteps.action_items || generateNextStepsFromDeliverables();
//   const implementationPlan = nextSteps.implementation_plan || '';
//   const timeline = nextSteps.timeline || nextSteps.schedule || '';
//   const resources = nextSteps.resources || nextSteps.required_resources || '';
//   const evaluation = nextSteps.evaluation || nextSteps.assessment_criteria || '';
  
//   // Priority color mapping
//   const getPriorityColor = (priority: string) => {
//     switch (priority?.toLowerCase()) {
//       case 'high': return 'text-red-600 bg-red-50 border-red-200';
//       case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
//       case 'low': return 'text-green-600 bg-green-50 border-green-200';
//       default: return 'text-gray-600 bg-gray-50 border-gray-200';
//     }
//   };
  
//   // Status icon mapping
//   const getStatusIcon = (status: string) => {
//     switch (status?.toLowerCase()) {
//       case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
//       case 'in-progress': return <Clock className="h-5 w-5 text-yellow-600" />;
//       case 'pending': return <Circle className="h-5 w-5 text-gray-400" />;
//       default: return <Circle className="h-5 w-5 text-gray-400" />;
//     }
//   };
  
//   // Custom components for ReactMarkdown
//   const components: Components = {
//     h1: ({ node, children, ...props }: any) => (
//       <h1 {...props} className="text-xl font-bold mb-4 text-gray-900 border-b border-gray-200 pb-2">
//         {children}
//       </h1>
//     ),
//     h2: ({ node, children, ...props }: any) => (
//       <h2 {...props} className="text-lg font-semibold mb-3 text-gray-800">
//         {children}
//       </h2>
//     ),
//     h3: ({ node, children, ...props }: any) => (
//       <h3 {...props} className="text-base font-medium mb-2 text-gray-700">
//         {children}
//       </h3>
//     ),
//     ul: ({ node, children, ...props }: any) => (
//       <ul {...props} className="list-disc ml-6 mb-4 space-y-1">
//         {children}
//       </ul>
//     ),
//     ol: ({ node, children, ...props }: any) => (
//       <ol {...props} className="list-decimal ml-6 mb-4 space-y-1">
//         {children}
//       </ol>
//     ),
//     p: ({ node, children, ...props }: any) => (
//       <p {...props} className="mb-3 leading-relaxed text-gray-700">
//         {children}
//       </p>
//     ),
//     strong: ({ node, children, ...props }: any) => (
//       <strong {...props} className="font-semibold text-gray-900">
//         {children}
//       </strong>
//     )
//   };

//   return (
//     <div className="h-full overflow-auto">
//       <div className="p-6 space-y-6">
//         <div className="flex items-center gap-3 mb-6">
//           <Target className="h-6 w-6 text-blue-600" />
//           <h1 className="text-2xl font-bold text-gray-900">Next Steps & Implementation</h1>
//         </div>
        
//         {/* Action Items/Steps */}
//         {steps && Array.isArray(steps) && steps.length > 0 && (
//           <div className="bg-white rounded-lg border border-gray-200 p-6">
//             <div className="flex items-center gap-2 mb-4">
//               <CheckCircle className="h-5 w-5 text-blue-600" />
//               <h2 className="text-lg font-semibold text-gray-900">Action Items</h2>
//             </div>
            
//             <div className="space-y-4">
//               {steps.map((step: any, index: number) => (
//                 <div key={step.id || index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                   <div className="flex-shrink-0 mt-1">
//                     {getStatusIcon(step.status)}
//                   </div>
                  
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-start justify-between gap-4">
//                       <div className="flex-1">
//                         <h3 className="font-medium text-gray-900 mb-1">
//                           {typeof step === 'string' ? step : step.title || step.task || step.action}
//                         </h3>
//                         {step.description && (
//                           <p className="text-sm text-gray-600 mb-2">{step.description}</p>
//                         )}
//                         {step.category && (
//                           <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
//                             {step.category}
//                           </span>
//                         )}
//                       </div>
                      
//                       <div className="flex flex-col items-end gap-2">
//                         {step.priority && (
//                           <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(step.priority)}`}>
//                             {step.priority}
//                           </span>
//                         )}
//                         {step.timeline && (
//                           <div className="flex items-center gap-1 text-xs text-gray-500">
//                             <Calendar className="h-3 w-3" />
//                             {step.timeline}
//                           </div>
//                         )}
//                       </div>
//                     </div>
                    
//                     {step.dependencies && Array.isArray(step.dependencies) && step.dependencies.length > 0 && (
//                       <div className="mt-2">
//                         <p className="text-xs text-gray-500 mb-1">Dependencies:</p>
//                         <div className="flex flex-wrap gap-1">
//                           {step.dependencies.map((dep: string, depIndex: number) => (
//                             <span key={depIndex} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
//                               {dep}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
        
//         {/* Implementation Plan */}
//         {implementationPlan && (
//           <div className="bg-white rounded-lg border border-gray-200 p-6">
//             <div className="flex items-center gap-2 mb-4">
//               <ArrowRight className="h-5 w-5 text-green-600" />
//               <h2 className="text-lg font-semibold text-gray-900">Implementation Plan</h2>
//             </div>
//             <div className="prose prose-sm max-w-none">
//               <ReactMarkdown
//                 remarkPlugins={[remarkGfm]}
//                 rehypePlugins={[rehypeRaw, rehypeSanitize]}
//                 components={components}
//               >
//                 {implementationPlan}
//               </ReactMarkdown>
//             </div>
//           </div>
//         )}
        
//         {/* Timeline */}
//         {timeline && (
//           <div className="bg-white rounded-lg border border-gray-200 p-6">
//             <div className="flex items-center gap-2 mb-4">
//               <Calendar className="h-5 w-5 text-purple-600" />
//               <h2 className="text-lg font-semibold text-gray-900">Timeline & Schedule</h2>
//             </div>
//             <div className="prose prose-sm max-w-none">
//               <ReactMarkdown
//                 remarkPlugins={[remarkGfm]}
//                 rehypePlugins={[rehypeRaw, rehypeSanitize]}
//                 components={components}
//               >
//                 {timeline}
//               </ReactMarkdown>
//             </div>
//           </div>
//         )}
        
//         {/* Resources */}
//         {resources && (
//           <div className="bg-white rounded-lg border border-gray-200 p-6">
//             <div className="flex items-center gap-2 mb-4">
//               <Users className="h-5 w-5 text-orange-600" />
//               <h2 className="text-lg font-semibold text-gray-900">Required Resources</h2>
//             </div>
//             <div className="prose prose-sm max-w-none">
//               <ReactMarkdown
//                 remarkPlugins={[remarkGfm]}
//                 rehypePlugins={[rehypeRaw, rehypeSanitize]}
//                 components={components}
//               >
//                 {resources}
//               </ReactMarkdown>
//             </div>
//           </div>
//         )}
        
//         {/* Evaluation */}
//         {evaluation && (
//           <div className="bg-white rounded-lg border border-gray-200 p-6">
//             <div className="flex items-center gap-2 mb-4">
//               <AlertCircle className="h-5 w-5 text-red-600" />
//               <h2 className="text-lg font-semibold text-gray-900">Evaluation & Assessment</h2>
//             </div>
//             <div className="prose prose-sm max-w-none">
//               <ReactMarkdown
//                 remarkPlugins={[remarkGfm]}
//                 rehypePlugins={[rehypeRaw, rehypeSanitize]}
//                 components={components}
//               >
//                 {evaluation}
//               </ReactMarkdown>
//             </div>
//           </div>
//         )}
        
//         {/* Show message if no next steps data */}
//         {(!steps || steps.length === 0) && !implementationPlan && !timeline && !resources && !evaluation && (
//           <div className="flex items-center justify-center h-64 text-gray-500">
//             <div className="text-center">
//               <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
//               <p className="text-lg font-medium">No Next Steps Available</p>
//               <p className="text-sm">Next steps will be generated based on the course content</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default NextStepsView;

// // 'use client';

// // import React from 'react';
// // import ReactMarkdown from 'react-markdown';
// // import remarkGfm from 'remark-gfm';
// // import rehypeRaw from 'rehype-raw';
// // import rehypeSanitize from 'rehype-sanitize';
// // import type { Components } from 'react-markdown';
// // import { CheckCircle } from 'lucide-react';

// // interface NextStepsViewProps {
// //   content: any;
// // }

// // const NextStepsView: React.FC<NextStepsViewProps> = ({ content }) => {
// //   // Generate markdown from the next_steps data structure (now supports markdown)
// //   const generateNextStepsMarkdown = (data: any): string => {
// //     if (!data?.next_steps) return 'No next steps available';
    
// //     const nextSteps = data.next_steps;
// //     let markdown = '# Next Steps\n\n';
    
// //     // Implementation Plan (now supports markdown)
// //     if (nextSteps.implementation_plan) {
// //       markdown += '## Implementation Plan\n\n';
// //       markdown += `${nextSteps.implementation_plan}\n\n`;
// //     }
    
// //     // Pilot Testing (now supports markdown)
// //     if (nextSteps.pilot_testing) {
// //       markdown += '## Pilot Testing\n\n';
// //       markdown += `${nextSteps.pilot_testing}\n\n`;
// //     }
    
// //     // Evaluation Methodology (now supports markdown)
// //     if (nextSteps.evaluation_methodology) {
// //       markdown += '## Evaluation Methodology\n\n';
// //       markdown += `${nextSteps.evaluation_methodology}\n\n`;
// //     }
    
// //     // Resources (now supports markdown)
// //     if (nextSteps.resources) {
// //       markdown += '## Resources\n\n';
// //       markdown += `${nextSteps.resources}\n\n`;
// //     }
    
// //     // Additional sections that might be present
// //     if (nextSteps.timeline) {
// //       markdown += '## Timeline\n\n';
// //       markdown += `${nextSteps.timeline}\n\n`;
// //     }
    
// //     if (nextSteps.budget_considerations) {
// //       markdown += '## Budget Considerations\n\n';
// //       markdown += `${nextSteps.budget_considerations}\n\n`;
// //     }
    
// //     if (nextSteps.success_metrics) {
// //       markdown += '## Success Metrics\n\n';
// //       markdown += `${nextSteps.success_metrics}\n\n`;
// //     }
    
// //     if (nextSteps.risk_mitigation) {
// //       markdown += '## Risk Mitigation\n\n';
// //       markdown += `${nextSteps.risk_mitigation}\n\n`;
// //     }
    
// //     return markdown;
// //   };
  
// //   // Use markdown_next_steps field if available, otherwise generate from structure
// //   const markdownNextSteps = content?.markdown_next_steps || generateNextStepsMarkdown(content);
  
// //   // Custom components for ReactMarkdown with enhanced styling for next steps
// //   const components: Components = {
// //     // Custom handling for headings with action-oriented styling
// //     h1: ({ node, children, ...props }: any) => {
// //       return (
// //         <h1 {...props} className="text-3xl font-bold mb-6 text-green-600 flex items-center">
// //           <CheckCircle className="h-8 w-8 mr-3" />
// //           {children}
// //         </h1>
// //       );
// //     },
// //     h2: ({ node, children, ...props }: any) => {
// //       const text = Array.isArray(children) 
// //         ? children.join('') 
// //         : String(children || '');
        
// //       const isActionSection = text.includes('Implementation') || 
// //                              text.includes('Pilot') || 
// //                              text.includes('Evaluation') || 
// //                              text.includes('Resources') ||
// //                              text.includes('Timeline') ||
// //                              text.includes('Budget') ||
// //                              text.includes('Success') ||
// //                              text.includes('Risk');
      
// //       return (
// //         <h2 {...props} className="text-xl font-semibold mb-4 text-green-600 border-b-2 border-green-200 pb-2 flex items-center">
// //           <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
// //           {children}
// //         </h2>
// //       );
// //     },
// //     h3: ({ node, children, ...props }: any) => {
// //       return (
// //         <h3 {...props} className="text-lg font-medium mb-3 text-green-700">
// //           {children}
// //         </h3>
// //       );
// //     },
// //     h4: ({ node, children, ...props }: any) => {
// //       return (
// //         <h4 {...props} className="text-base font-medium mb-2 text-green-700">
// //           {children}
// //         </h4>
// //       );
// //     },
// //     // Enhanced list styling for actionable items
// //     ul: ({ node, children, ...props }: any) => (
// //       <ul {...props} className="list-none ml-0 mb-4 space-y-3">
// //         {children}
// //       </ul>
// //     ),
// //     ol: ({ node, children, ...props }: any) => (
// //       <ol {...props} className="list-none ml-0 mb-4 space-y-3">
// //         {children}
// //       </ol>
// //     ),
// //     li: ({ node, children, ...props }: any) => (
// //       <li {...props} className="flex items-start text-gray-700 leading-relaxed">
// //         <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
// //           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
// //         </div>
// //         <div className="flex-1">{children}</div>
// //       </li>
// //     ),
// //     // Enhanced paragraph styling
// //     p: ({ node, children, ...props }: any) => (
// //       <p {...props} className="mb-4 leading-relaxed text-gray-800">
// //         {children}
// //       </p>
// //     ),
// //     // Highlighted strong text for key action items
// //     strong: ({ node, children, ...props }: any) => (
// //       <strong {...props} className="font-semibold text-green-800 bg-green-50 px-1 rounded">
// //         {children}
// //       </strong>
// //     ),
// //     // Enhanced emphasis styling
// //     em: ({ node, children, ...props }: any) => (
// //       <em {...props} className="italic text-green-700">
// //         {children}
// //       </em>
// //     ),
// //     // Style blockquotes as important callouts
// //     blockquote: ({ node, children, ...props }: any) => (
// //       <blockquote {...props} className="border-l-4 border-green-500 pl-6 py-4 italic bg-green-50 mb-4 rounded-r-lg">
// //         <div className="flex items-start">
// //           <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
// //           <div>{children}</div>
// //         </div>
// //       </blockquote>
// //     ),
// //     // Style code blocks for implementation details
// //     code: ({ node, children, ...props }: any) => (
// //       <code {...props} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">
// //         {children}
// //       </code>
// //     ),
// //     pre: ({ node, children, ...props }: any) => (
// //       <pre {...props} className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 overflow-x-auto">
// //         {children}
// //       </pre>
// //     ),
// //     // Style links for resources
// //     a: ({ node, children, ...props }: any) => (
// //       <a {...props} className="text-green-600 hover:text-green-800 underline font-medium">
// //         {children}
// //       </a>
// //     ),
// //     // Style tables for structured action plans
// //     table: ({ node, children, ...props }: any) => (
// //       <div className="overflow-x-auto mb-4">
// //         <table {...props} className="min-w-full border border-green-200 rounded-lg">
// //           {children}
// //         </table>
// //       </div>
// //     ),
// //     thead: ({ node, children, ...props }: any) => (
// //       <thead {...props} className="bg-green-100">
// //         {children}
// //       </thead>
// //     ),
// //     th: ({ node, children, ...props }: any) => (
// //       <th {...props} className="px-4 py-2 text-left font-semibold text-green-800 border-b border-green-200">
// //         {children}
// //       </th>
// //     ),
// //     td: ({ node, children, ...props }: any) => (
// //       <td {...props} className="px-4 py-2 border-b border-green-100 text-gray-700">
// //         {children}
// //       </td>
// //     )
// //   };
  
// //   return (
// //     <div className="h-full overflow-auto bg-gradient-to-br from-green-50 to-white">
// //       <div className="p-6">
// //         {markdownNextSteps && markdownNextSteps.trim() !== '' && markdownNextSteps !== 'No next steps available' ? (
// //           <div className="prose prose-headings:font-medium prose-h1:text-3xl prose-h2:text-xl prose-h3:text-lg prose-strong:font-bold prose-a:text-green-600 max-w-none">
// //             <ReactMarkdown 
// //               remarkPlugins={[remarkGfm]} 
// //               rehypePlugins={[rehypeRaw, rehypeSanitize]}
// //               components={components}
// //             >
// //               {markdownNextSteps}
// //             </ReactMarkdown>
// //           </div>
// //         ) : (
// //           <div className="flex items-center justify-center h-full text-gray-500">
// //             <div className="text-center">
// //               <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
// //               <p className="text-lg font-medium">No Next Steps Available</p>
// //               <p className="text-sm">Next steps content is being processed or not yet available</p>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default NextStepsView;