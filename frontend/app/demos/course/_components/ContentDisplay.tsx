'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Bookmark, 
  RotateCcw, 
  Download, 
  Copy, 
  Maximize2, 
  Minimize2, 
  StickyNote, 
  BarChart2, 
  Headphones
} from 'lucide-react';
import VoiceButton from '@/components/chatbot/VoiceButton.jsx';
import ContentView from './ContentView';
import NextStepsView from './NextStepsView';
import EditContentView from './EditContentView';
import SummaryView from '../../read-document/_components/SummaryView';
import ListTodo from './ListTodo';

// ========================================
// TYPE DEFINITIONS
// ========================================

interface Document {
  title: string;
  content: any;
  pages: number;
  author?: string;
  publicationDate?: string;
  fileType: string;
  fileSize: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

interface Citation {
  text: string;
  page: number;
  relevance: string;
}

interface FlashCard {
  id: string;
  front: string;
  back: string;
}

interface ReaderData {
  document: Document;
  conversation: Message[];
  citations?: Citation[];
  summary?: {
    overview: string;
    keyPoints: string[];
    insights: string[];
  };
  relatedDocuments?: {
    title: string;
    relevance: string;
    link?: string;
  }[];
  mindMap?: any;
  flashCards?: FlashCard[];
  postItNotes?: any;
  infographics?: any;
  podcast?: any;
  // Additional fields from the new API structure
  abstract?: string;
  table_of_contents?: any[];
  introduction?: string;
  main_body?: any;
  conclusion?: string;
  next_steps?: any;
  references?: any[];
  markdown_document?: string;
}

interface ChatHandlers {
  message: string;
  isStreaming: boolean;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onStopStreaming: () => void;
}

interface ContentDisplayProps {
  readerData: ReaderData;
  onReset: () => void;
  documentUrl: string;
  chatHandlers: ChatHandlers;
}

// ========================================
// MAIN COMPONENT
// ========================================

const ContentDisplay = ({
  readerData: propReaderData,
  onReset,
  documentUrl,
  chatHandlers
}: ContentDisplayProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('content');
  
  // Extract the actual course content from the readerData structure
  const actualContent = propReaderData?.document?.content || propReaderData;
  const [editedContent, setEditedContent] = useState<any>(actualContent);
  const [pdfUrl, setPdfUrl] = useState<string>('');

  // Update state when props change
  React.useEffect(() => {
    const newContent = propReaderData?.document?.content || propReaderData;
    setEditedContent(newContent);
    console.log('ContentDisplay received propReaderData:', propReaderData);
    console.log('ContentDisplay extracted content:', newContent);
    console.log('Content type:', typeof newContent);
    console.log('Content keys:', newContent ? Object.keys(newContent) : 'No content');
  }, [propReaderData]);

  const handleCopyCitation = (index: number) => {
    if (propReaderData.citations && propReaderData.citations[index]) {
      const citation = propReaderData.citations[index];
      navigator.clipboard.writeText(citation.text);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (propReaderData.document?.pages || 1)) {
      setCurrentPage(newPage);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleContentChange = (newContent: any) => {
    setEditedContent(newContent);
  };

  const handleContentUpdate = (section: string, path: string, newContent: string) => {
    // Handle updates to specific sections
    const updatedContent = { ...editedContent };
    console.log('Content update:', { section, path, newContent });
    handleContentChange(updatedContent);
  };

  // ========================================
  // FALLBACK VIEWS FOR FUTURE FEATURES
  // ========================================

  const renderMindMap = () => {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <StickyNote className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Mind Map</p>
          <p className="text-sm">Content will be generated</p>
        </div>
      </div>
    );
  };

  const renderFlashCards = () => {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Flash Cards</p>
          <p className="text-sm">Content will be generated</p>
        </div>
      </div>
    );
  };

  const renderPostItNotes = () => {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <StickyNote className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Post-It Notes</p>
          <p className="text-sm">Content will be generated</p>
        </div>
      </div>
    );
  };

  const renderInfographic = () => {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Infographic</p>
          <p className="text-sm">Content will be generated</p>
        </div>
      </div>
    );
  };
  
  const renderPodcast = () => {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <Headphones className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Podcast</p>
          <p className="text-sm">Content will be generated</p>
        </div>
      </div>
    );
  };

  // ========================================
  // SECTION RENDERS
  // ========================================
  
  const renderChatSection = () => {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-4 text-gray-400 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p className="text-lg font-medium">Chat</p>
          <p className="text-sm">Content will be generated</p>
        </div>
      </div>
    );
  };

  const renderSummarySection = () => {
    // Generate summary from the new course structure
    let summaryData;
    
    if (editedContent?.abstract || editedContent?.introduction) {
      // Extract key points from table of contents
      const keyPoints: string[] = [];
      if (editedContent?.table_of_contents && Array.isArray(editedContent.table_of_contents)) {
        editedContent.table_of_contents.forEach((section: any) => {
          if (section.section_title) {
            keyPoints.push(section.section_title);
          }
        });
      }
      
      // Extract insights from deliverables
      const insights: string[] = [];
      if (editedContent?.table_of_contents && Array.isArray(editedContent.table_of_contents)) {
        editedContent.table_of_contents.forEach((section: any) => {
          if (section.sub_sections && Array.isArray(section.sub_sections)) {
            section.sub_sections.forEach((subSection: any) => {
              if (subSection.deliverables && Array.isArray(subSection.deliverables)) {
                insights.push(...subSection.deliverables.slice(0, 2)); // Limit to first 2 deliverables per subsection
              }
            });
          }
        });
      }
      
      summaryData = {
        overview: editedContent.abstract || editedContent.introduction || 'No summary available',
        keyPoints: keyPoints.slice(0, 6), // Limit to 6 key points
        insights: insights.slice(0, 5) // Limit to 5 insights
      };
    }
    // Handle legacy structure or provided summary
    else if (propReaderData?.summary) {
      const summaryAny = propReaderData.summary as any;
      
      if (summaryAny?.summary && typeof summaryAny.summary === 'object') {
        summaryData = summaryAny.summary;
      } else if (propReaderData.summary?.overview) {
        summaryData = propReaderData.summary;
      } else if (typeof propReaderData.summary === 'string') {
        summaryData = {
          overview: propReaderData.summary,
          keyPoints: [],
          insights: []
        };
      } else {
        summaryData = {
          overview: 'No summary available',
          keyPoints: [],
          insights: []
        };
      }
    }
    else {
      summaryData = {
        overview: 'No summary available',
        keyPoints: [],
        insights: []
      };
    }
  
    return (
      <SummaryView 
        data={summaryData}
        relatedDocuments={propReaderData.relatedDocuments}
      />
    );
  };

  const renderCitationsSection = () => (
    <div className="flex-1 overflow-y-auto border rounded-md bg-gray-50 p-4">
      <h3 className="font-medium text-lg mb-3">Key Citations</h3>
      {propReaderData.citations && propReaderData.citations.length > 0 ? (
        propReaderData.citations.map((citation, index) => (
          <div key={index} className="mb-4 border-b pb-4 last:border-b-0">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Page {citation.page}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(citation.page)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center hidden md:flex"
                >
                  <Bookmark className="h-3 w-3 mr-1" /> Go to Page
                </button>
                <button
                  onClick={() => handleCopyCitation(index)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <Copy className="h-3 w-3 mr-1" /> Copy
                </button>
              </div>
            </div>
            <p className="text-gray-800 mb-1 italic">"{citation.text}"</p>
            <p className="text-xs text-gray-500">Relevance: {citation.relevance}</p>
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No citations data available</p>
        </div>
      )}
    </div>
  );

  const renderSectionNavigation = () => (
    <div className="py-2 px-4 border-b bg-white">
      <div className="flex flex-nowrap items-center gap-1 overflow-x-auto hide-scrollbar pb-2">
        <button
          onClick={() => setActiveSection('content')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 ${
            activeSection === 'content' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
        >
          <FileText className="h-4 w-4" />
          Content
        </button>
        <button
          onClick={() => setActiveSection('nextsteps')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 ${
            activeSection === 'nextsteps' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
        >
          <ListTodo className="h-4 w-4" />
          Next Steps
        </button>
        <button
          onClick={() => setActiveSection('summary')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 ${
            activeSection === 'summary' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
        >
          <Bookmark className="h-4 w-4" />
          Summary
        </button>
        <button
          onClick={() => setActiveSection('mindmap')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 ${
            activeSection === 'mindmap' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
        >
          <StickyNote className="h-4 w-4" />
          Mind Map
        </button>
        <button
          onClick={() => setActiveSection('flashcards')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 ${
            activeSection === 'flashcards' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
        >
          <BarChart2 className="h-4 w-4" />
          Flash Cards
        </button>
        <button
          onClick={() => setActiveSection('postit')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 ${
            activeSection === 'postit' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
        >
          <StickyNote className="h-4 w-4" />
          Post-It
        </button>
        <button
          onClick={() => setActiveSection('infographic')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 ${
            activeSection === 'infographic' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
        >
          <BarChart2 className="h-4 w-4" />
          Infographic
        </button>
        <button
          onClick={() => setActiveSection('podcast')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 ${
            activeSection === 'podcast' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
        >
          <Headphones className="h-4 w-4" />
          Podcast
        </button>
        <button
          onClick={() => setActiveSection('chat')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap relative ${
            activeSection === 'chat' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
        >
          Chat
          {chatHandlers.isStreaming && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          )}
        </button>
        <button
          onClick={() => setActiveSection('citations')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap ${
            activeSection === 'citations' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
        >
          Citations
        </button>
        <button
          onClick={onReset}
          className="px-3 py-1 rounded-md text-sm whitespace-nowrap text-gray-700 flex items-center justify-center hover:bg-gray-100"
          title="New Document"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const renderDocumentViewer = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 h-full overflow-auto">
        <EditContentView 
          content={editedContent} 
          onContentUpdate={handleContentUpdate}
        />
      </div>
    </div>
  );

  // ========================================
  // SECTION CONTENT RENDERER
  // ========================================
  
  const renderSectionContent = () => {
    console.log('Rendering section:', activeSection, 'with content:', editedContent);
    
    switch (activeSection) {
      case 'content':
        return (
          <div className="h-full border rounded-md overflow-hidden relative bg-white">
            <ContentView content={editedContent} />
          </div>
        );
      case 'chat':
        return renderChatSection();
      case 'nextsteps':
        return (
          <div className="h-full border rounded-md overflow-hidden relative bg-white">
            <NextStepsView content={editedContent} />
          </div>
        );
      case 'summary':
        return renderSummarySection();
      case 'mindmap':
        return (
          <div className="h-full border rounded-md overflow-hidden relative bg-gray-50">
            {renderMindMap()}
          </div>
        );
      case 'flashcards':
        return (
          <div className="h-full border rounded-md overflow-hidden relative bg-gray-50">
            {renderFlashCards()}
          </div>
        );
      case 'postit':
        return (
          <div className="h-full border rounded-md overflow-hidden relative bg-gray-50">
            {renderPostItNotes()}
          </div>
        );
      case 'infographic':
        return (
          <div className="h-full border rounded-md overflow-hidden relative bg-gray-50">
            {renderInfographic()}
          </div>
        );
      case 'podcast':
        return (
          <div className="h-full border rounded-md overflow-hidden relative bg-gray-50">
            {renderPodcast()}
          </div>
        );
      case 'citations':
        return renderCitationsSection();
      default:
        return (
          <div className="h-full border rounded-md overflow-hidden relative bg-white">
            <ContentView content={editedContent} />
          </div>
        );
    }
  };

  // ========================================
  // MAIN RENDER
  // ========================================
  
  return (
    <div className="fixed inset-0 z-50 bg-white h-screen mx-auto rounded-lg shadow-md overflow-hidden flex flex-col">
      
      {/* Mobile Tab Content */}
      <div className="md:hidden flex-1 overflow-hidden flex flex-col">
        <div className="h-1/2 flex flex-col overflow-hidden">
          {renderDocumentViewer()}
        </div>
        <div className="h-1/2 flex flex-col overflow-hidden">
          {renderSectionNavigation()}
          <div className="flex-1 overflow-auto p-4">
            {renderSectionContent()}
          </div>
        </div>
      </div>

      {/* Desktop Split View */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Document Panel - Left side for editing */}
        <div className="w-1/2 border-r flex flex-col h-full overflow-hidden">
          {renderDocumentViewer()}
        </div>

        {/* Content View Panel - Right side for preview */}
        <div className="w-1/2 flex flex-col h-full">
          {renderSectionNavigation()}
          <div className="flex-1 overflow-auto p-4">
            {renderSectionContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDisplay;

// 'use client';

// import React, { useState, useRef } from 'react';
// import { Button } from '@/components/ui/button';
// import { 
//   FileText, 
//   Bookmark, 
//   RotateCcw, 
//   Download, 
//   Copy, 
//   Maximize2, 
//   Minimize2, 
//   StickyNote, 
//   BarChart2, 
//   Headphones
// } from 'lucide-react';
// // Commented out all read-document components that will show fallbacks
// // import MindMapView from '../../read-document/_components/MindMapView';
// // import FlashCardView from '../../read-document/_components/FlashCardView';
// // import InfographicView from '../../read-document/_components/InfographicView';
// // import PodCastView from '../../read-document/_components/PodCastView';
// // import PostItView from '../../read-document/_components/PostItView';
// // import ChatView from '../../read-document/_components/ChatView';
// import VoiceButton from '@/components/chatbot/VoiceButton.jsx';
// import ContentView from './ContentView';
// import NextStepsView from './NextStepsView';
// import EditContentView from './EditContentView';
// import SummaryView from '../../read-document/_components/SummaryView';
// import ListTodo from './ListTodo';

// // ========================================
// // TYPE DEFINITIONS
// // ========================================

// interface Document {
//   title: string;
//   content: any; // Changed to any to handle our JSON structure
//   pages: number;
//   author?: string;
//   publicationDate?: string;
//   fileType: string;
//   fileSize: string;
// }

// interface Message {
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: string;
//   isStreaming?: boolean;
// }

// interface Citation {
//   text: string;
//   page: number;
//   relevance: string;
// }

// interface FlashCard {
//   id: string;
//   front: string;
//   back: string;
// }

// interface ReaderData {
//   document: Document;
//   conversation: Message[];
//   citations: Citation[];
//   summary: {
//     overview: string;
//     keyPoints: string[];
//     insights: string[];
//   };
//   relatedDocuments?: {
//     title: string;
//     relevance: string;
//     link?: string;
//   }[];
//   mindMap?: any;
//   flashCards?: FlashCard[];
//   postItNotes?: any;
//   infographics?: any;
//   podcast?: any;
// }

// interface ChatHandlers {
//   message: string;
//   isStreaming: boolean;
//   onMessageChange: (value: string) => void;
//   onSendMessage: () => void;
//   onStopStreaming: () => void;
// }

// interface ContentDisplayProps {
//   readerData: ReaderData;
//   onReset: () => void;
//   documentUrl: string;
//   chatHandlers: ChatHandlers;
// }

// // ========================================
// // MAIN COMPONENT
// // ========================================

// const ContentDisplay = ({
//   readerData: propReaderData,
//   onReset,
//   documentUrl,
//   chatHandlers
// }: ContentDisplayProps) => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [activeSection, setActiveSection] = useState<string>('content');
  
//   // Extract the actual course content from the readerData structure
//   const actualContent = propReaderData?.document?.content || propReaderData;
//   const [editedContent, setEditedContent] = useState<any>(actualContent);
//   const [pdfUrl, setPdfUrl] = useState<string>('');

//   // Update state when props change
//   React.useEffect(() => {
//     const newContent = propReaderData?.document?.content || propReaderData;
//     setEditedContent(newContent);
//     console.log('ContentDisplay received propReaderData:', propReaderData);
//     console.log('ContentDisplay extracted content:', newContent);
//     console.log('Content type:', typeof newContent);
//     console.log('Content keys:', newContent ? Object.keys(newContent) : 'No content');
//   }, [propReaderData]);

//   const handleCopyCitation = (index: number) => {
//     if (propReaderData.citations && propReaderData.citations[index]) {
//       const citation = propReaderData.citations[index];
//       navigator.clipboard.writeText(citation.text);
//     }
//   };

//   const handlePageChange = (newPage: number) => {
//     if (newPage >= 1 && newPage <= propReaderData.document.pages) {
//       setCurrentPage(newPage);
//     }
//   };

//   const toggleFullscreen = () => {
//     setIsFullscreen(!isFullscreen);
//   };

//   const handleContentChange = (newContent: any) => {
//     setEditedContent(newContent);
//   };

//   const handleContentUpdate = (section: string, path: string, newContent: string) => {
//     // Handle updates to specific sections
//     const updatedContent = { ...editedContent };
//     // In a production app, you would use the section and path to update specific parts
//     console.log('Content update:', { section, path, newContent });
//     handleContentChange(updatedContent);
//   };

//   // ========================================
//   // READ-DOCUMENT VIEWS WITH FALLBACKS
//   // ========================================

//   const renderMindMap = () => {
//     // Always show fallback for now - will be generated later
//     return (
//       <div className="flex items-center justify-center h-full text-gray-500">
//         <div className="text-center">
//           <StickyNote className="h-12 w-12 mx-auto mb-4 text-gray-400" />
//           <p className="text-lg font-medium">Mind Map</p>
//           <p className="text-sm">Content will be generated</p>
//         </div>
//       </div>
//     );
//   };

//   const renderFlashCards = () => {
//     // Always show fallback for now - will be generated later
//     return (
//       <div className="flex items-center justify-center h-full text-gray-500">
//         <div className="text-center">
//           <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
//           <p className="text-lg font-medium">Flash Cards</p>
//           <p className="text-sm">Content will be generated</p>
//         </div>
//       </div>
//     );
//   };

//   const renderPostItNotes = () => {
//     // Always show fallback for now - will be generated later
//     return (
//       <div className="flex items-center justify-center h-full text-gray-500">
//         <div className="text-center">
//           <StickyNote className="h-12 w-12 mx-auto mb-4 text-gray-400" />
//           <p className="text-lg font-medium">Post-It Notes</p>
//           <p className="text-sm">Content will be generated</p>
//         </div>
//       </div>
//     );
//   };

//   const renderInfographic = () => {
//     // Always show fallback for now - will be generated later
//     return (
//       <div className="flex items-center justify-center h-full text-gray-500">
//         <div className="text-center">
//           <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
//           <p className="text-lg font-medium">Infographic</p>
//           <p className="text-sm">Content will be generated</p>
//         </div>
//       </div>
//     );
//   };
  
//   const renderPodcast = () => {
//     // Always show fallback for now - will be generated later
//     return (
//       <div className="flex items-center justify-center h-full text-gray-500">
//         <div className="text-center">
//           <Headphones className="h-12 w-12 mx-auto mb-4 text-gray-400" />
//           <p className="text-lg font-medium">Podcast</p>
//           <p className="text-sm">Content will be generated</p>
//         </div>
//       </div>
//     );
//   };

//   // ========================================
//   // SECTION RENDERS WITH FALLBACKS
//   // ========================================
  
//   const renderChatSection = () => {
//     // Show fallback for chat as well - will be generated later
//     return (
//       <div className="flex items-center justify-center h-full text-gray-500">
//         <div className="text-center">
//           <div className="h-12 w-12 mx-auto mb-4 text-gray-400 flex items-center justify-center">
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
//             </svg>
//           </div>
//           <p className="text-lg font-medium">Chat</p>
//           <p className="text-sm">Content will be generated</p>
//         </div>
//       </div>
//     );
//   };

//   const renderSummarySection = () => {
//     // Handle different possible data structures from the API
//     let summaryData;
//     let relatedDocuments = propReaderData.relatedDocuments;
  
//     // Check if we have actual course content with abstract/introduction
//     if (editedContent?.abstract || editedContent?.introduction) {
//       summaryData = {
//         overview: editedContent.abstract || editedContent.introduction || 'No summary available',
//         keyPoints: editedContent.main_body?.modules?.map((module: any) => module.module_title) || [],
//         insights: editedContent.conclusion ? [editedContent.conclusion] : []
//       };
//     }
//     // Type-safe way to check for nested summary structure
//     else if (propReaderData.summary) {
//       const summaryAny = propReaderData.summary as any;
      
//       // Check if summary is nested under a 'summary' key (from API response)
//       if (summaryAny?.summary && typeof summaryAny.summary === 'object') {
//         summaryData = summaryAny.summary;
//       } 
//       // Check if it's already in the correct format
//       else if (propReaderData.summary?.overview) {
//         summaryData = propReaderData.summary;
//       }
//       // Handle case where summary might be a string (from some API responses)
//       else if (typeof propReaderData.summary === 'string') {
//         summaryData = {
//           overview: propReaderData.summary,
//           keyPoints: [],
//           insights: []
//         };
//       }
//       // Fallback for missing summary
//       else {
//         summaryData = {
//           overview: 'No summary available',
//           keyPoints: [],
//           insights: []
//         };
//       }
//     }
//     else {
//       summaryData = {
//         overview: 'No summary available',
//         keyPoints: [],
//         insights: []
//       };
//     }
  
//     return (
//       <SummaryView 
//         data={summaryData}
//         relatedDocuments={relatedDocuments}
//       />
//     );
//   };

//   const renderCitationsSection = () => (
//     <div className="flex-1 overflow-y-auto border rounded-md bg-gray-50 p-4">
//       <h3 className="font-medium text-lg mb-3">Key Citations</h3>
//       {propReaderData.citations?.map((citation, index) => (
//         <div key={index} className="mb-4 border-b pb-4 last:border-b-0">
//           <div className="flex justify-between mb-2">
//             <span className="text-sm font-medium text-gray-500">Page {citation.page}</span>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => handlePageChange(citation.page)}
//                 className="text-blue-600 hover:text-blue-800 text-sm flex items-center hidden md:flex"
//               >
//                 <Bookmark className="h-3 w-3 mr-1" /> Go to Page
//               </button>
//               <button
//                 onClick={() => handleCopyCitation(index)}
//                 className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
//               >
//                 <Copy className="h-3 w-3 mr-1" /> Copy
//               </button>
//             </div>
//           </div>
//           <p className="text-gray-800 mb-1 italic">"{citation.text}"</p>
//           <p className="text-xs text-gray-500">Relevance: {citation.relevance}</p>
//         </div>
//       )) ?? (
//         <div className="flex items-center justify-center h-full text-gray-500">
//           <p>No citations data available</p>
//         </div>
//       )}
//     </div>
//   );

//   const renderSectionNavigation = () => (
//     <div className="py-2 px-4 border-b bg-white">
//       <div className="flex flex-nowrap items-center gap-1 overflow-x-auto hide-scrollbar pb-2">
//         <button
//           onClick={() => setActiveSection('content')}
//           className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 ${
//             activeSection === 'content' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
//           }`}
//         >
//           <FileText className="h-4 w-4" />
//           Content
//         </button>
//         <button
//           onClick={() => setActiveSection('nextsteps')}
//           className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 ${
//             activeSection === 'nextsteps' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
//           }`}
//         >
//           <ListTodo className="h-4 w-4" />
//           Next Steps
//         </button>
//         <button
//           onClick={() => setActiveSection('summary')}
//           className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 ${
//             activeSection === 'summary' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
//           }`}
//         >
//           <Bookmark className="h-4 w-4" />
//           Summary
//         </button>
//         <button
//           onClick={() => setActiveSection('mindmap')}
//           className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 ${
//             activeSection === 'mindmap' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
//           }`}
//         >
//           <StickyNote className="h-4 w-4" />
//           Mind Map
//         </button>
//         <button
//           onClick={() => setActiveSection('flashcards')}
//           className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 ${
//             activeSection === 'flashcards' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
//           }`}
//         >
//           <BarChart2 className="h-4 w-4" />
//           Flash Cards
//         </button>
//         <button
//           onClick={() => setActiveSection('postit')}
//           className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 ${
//             activeSection === 'postit' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
//           }`}
//         >
//           <StickyNote className="h-4 w-4" />
//           Post-It
//         </button>
//         <button
//           onClick={() => setActiveSection('infographic')}
//           className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 ${
//             activeSection === 'infographic' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
//           }`}
//         >
//           <BarChart2 className="h-4 w-4" />
//           Infographic
//         </button>
//         <button
//           onClick={() => setActiveSection('podcast')}
//           className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 ${
//             activeSection === 'podcast' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
//           }`}
//         >
//           <Headphones className="h-4 w-4" />
//           Podcast
//         </button>
//         <button
//           onClick={() => setActiveSection('chat')}
//           className={`px-3 py-1 rounded-md text-sm whitespace-nowrap relative ${
//             activeSection === 'chat' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
//           }`}
//         >
//           Chat
//           {chatHandlers.isStreaming && (
//             <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//           )}
//         </button>
//         <button
//           onClick={() => setActiveSection('citations')}
//           className={`px-3 py-1 rounded-md text-sm whitespace-nowrap ${
//             activeSection === 'citations' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
//           }`}
//         >
//           Citations
//         </button>
//         <button
//           onClick={onReset}
//           className="px-3 py-1 rounded-md text-sm whitespace-nowrap text-gray-700 flex items-center justify-center hover:bg-gray-100"
//           title="New Document"
//         >
//           <RotateCcw className="h-4 w-4" />
//         </button>
//       </div>
//     </div>
//   );

//   const renderDocumentViewer = () => (
//     <div className="flex flex-col h-full">
//       <div className="flex-1 h-full overflow-auto">
//         <EditContentView 
//           content={editedContent} 
//           onContentUpdate={handleContentUpdate}
//         />
//       </div>
//     </div>
//   );

//   // ========================================
//   // SECTION CONTENT RENDERER
//   // ========================================
  
//   const renderSectionContent = () => {
//     console.log('Rendering section:', activeSection, 'with content:', editedContent);
    
//     switch (activeSection) {
//       case 'content':
//         return (
//           <div className="h-full border rounded-md overflow-hidden relative bg-white">
//             <ContentView content={editedContent} />
//           </div>
//         );
//       case 'chat':
//         return renderChatSection();
//       case 'nextsteps':
//         return (
//           <div className="h-full border rounded-md overflow-hidden relative bg-white">
//             <NextStepsView content={editedContent} />
//           </div>
//         );
//       case 'summary':
//         return renderSummarySection();
//       case 'mindmap':
//         return (
//           <div className="h-full border rounded-md overflow-hidden relative bg-gray-50">
//             {renderMindMap()}
//           </div>
//         );
//       case 'flashcards':
//         return (
//           <div className="h-full border rounded-md overflow-hidden relative bg-gray-50">
//             {renderFlashCards()}
//           </div>
//         );
//       case 'postit':
//         return (
//           <div className="h-full border rounded-md overflow-hidden relative bg-gray-50">
//             {renderPostItNotes()}
//           </div>
//         );
//       case 'infographic':
//         return (
//           <div className="h-full border rounded-md overflow-hidden relative bg-gray-50">
//             {renderInfographic()}
//           </div>
//         );
//       case 'podcast':
//         return (
//           <div className="h-full border rounded-md overflow-hidden relative bg-gray-50">
//             {renderPodcast()}
//           </div>
//         );
//       case 'citations':
//         return renderCitationsSection();
//       default:
//         return (
//           <div className="h-full border rounded-md overflow-hidden relative bg-white">
//             <ContentView content={editedContent} />
//           </div>
//         );
//     }
//   };

//   // ========================================
//   // MAIN RENDER
//   // ========================================
  
//   return (
//     <div className="fixed inset-0 z-50 bg-white h-screen mx-auto rounded-lg shadow-md overflow-hidden flex flex-col">
      
//       {/* Mobile Tab Content */}
//       <div className="md:hidden flex-1 overflow-hidden flex flex-col">
//         <div className="h-1/2 flex flex-col overflow-hidden">
//           {renderDocumentViewer()}
//         </div>
//         <div className="h-1/2 flex flex-col overflow-hidden">
//           {renderSectionNavigation()}
//           <div className="flex-1 overflow-auto p-4">
//             {renderSectionContent()}
//           </div>
//         </div>
//       </div>

//       {/* Desktop Split View */}
//       <div className="hidden md:flex flex-1 overflow-hidden">
//         {/* Document Panel - Left side for editing */}
//         <div className="w-1/2 border-r flex flex-col h-full overflow-hidden">
//           {renderDocumentViewer()}
//         </div>

//         {/* Content View Panel - Right side for preview */}
//         <div className="w-1/2 flex flex-col h-full">
//           {renderSectionNavigation()}
//           <div className="flex-1 overflow-auto p-4">
//             {renderSectionContent()}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ContentDisplay;