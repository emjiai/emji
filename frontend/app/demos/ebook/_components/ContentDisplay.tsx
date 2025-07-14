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
import EditContentView from './EditContentView';
import SummaryView from '../../read-document/_components/SummaryView';

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
  document?: Document;
  conversation?: Message[];
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
  // Raw API response fields - no transformation needed
  [key: string]: any;
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
  
  // Extract actual content from final_response wrapper if it exists
  const actualContent = propReaderData?.final_response || propReaderData;
  const [editedContent, setEditedContent] = useState<any>(actualContent);
  const [pdfUrl, setPdfUrl] = useState<string>('');

  // Update state when props change
  React.useEffect(() => {
    const actualContent = propReaderData?.final_response || propReaderData;
    setEditedContent(actualContent);
    console.log('ContentDisplay received propReaderData:', propReaderData);
    console.log('ContentDisplay extracted actualContent:', actualContent);
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
    // The EditContentView component will handle the actual update
    // This is just for logging/tracking
  };

  // ========================================
  // FALLBACK VIEWS FOR FUTURE FEATURES
  // ========================================

  const renderMindMap = () => {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50">
        <div className="text-center">
          <StickyNote className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Mind Map</p>
          <p className="text-sm">Feature coming soon</p>
        </div>
      </div>
    );
  };

  const renderFlashCards = () => {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50">
        <div className="text-center">
          <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Flash Cards</p>
          <p className="text-sm">Feature coming soon</p>
        </div>
      </div>
    );
  };

  const renderPostItNotes = () => {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50">
        <div className="text-center">
          <StickyNote className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Post-It Notes</p>
          <p className="text-sm">Feature coming soon</p>
        </div>
      </div>
    );
  };

  const renderInfographic = () => {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50">
        <div className="text-center">
          <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Infographic</p>
          <p className="text-sm">Feature coming soon</p>
        </div>
      </div>
    );
  };
  
  const renderPodcast = () => {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50">
        <div className="text-center">
          <Headphones className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Podcast</p>
          <p className="text-sm">Feature coming soon</p>
        </div>
      </div>
    );
  };

  // ========================================
  // SECTION RENDERS
  // ========================================
  
  const renderChatSection = () => {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-4 text-gray-400 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p className="text-lg font-medium">Chat</p>
          <p className="text-sm">Feature coming soon</p>
        </div>
      </div>
    );
  };

  const renderSummarySection = () => {
    // Generate summary from the raw content
    let summaryData;
    
    // Check if it's ebook format (has chapters and table_of_contents)
    if (editedContent?.chapters && editedContent?.title && editedContent?.table_of_contents) {
      const keyPoints: string[] = [];
      const insights: string[] = [];
      
      // Extract key points from table of contents
      if (editedContent.table_of_contents?.length > 0) {
        editedContent.table_of_contents.forEach((item: any) => {
          if (item.title) {
            keyPoints.push(item.title);
          }
        });
      }
      
      // Extract insights from chapters
      if (editedContent.chapters?.length > 0) {
        editedContent.chapters.forEach((chapter: any) => {
          if (chapter.key_takeaways?.length > 0) {
            insights.push(...chapter.key_takeaways.slice(0, 2));
          }
        });
      }
      
      // Get overview from introduction
      let overview = '';
      if (editedContent.introduction?.content && Array.isArray(editedContent.introduction.content)) {
        const textContent = editedContent.introduction.content.find((item: any) => typeof item === 'string');
        overview = textContent || editedContent.tagline || editedContent.subtitle || 'No overview available';
      } else {
        overview = editedContent.tagline || editedContent.subtitle || 'No overview available';
      }
      
      summaryData = {
        overview,
        keyPoints: keyPoints.slice(0, 6),
        insights: insights.slice(0, 5)
      };
    }
    // Check if it's course format
    else if (editedContent?.abstract || editedContent?.introduction) {
      const keyPoints: string[] = [];
      if (editedContent?.table_of_contents && Array.isArray(editedContent.table_of_contents)) {
        editedContent.table_of_contents.forEach((section: any) => {
          if (section.section_title) {
            keyPoints.push(section.section_title);
          }
        });
      }
      
      const insights: string[] = [];
      if (editedContent?.table_of_contents && Array.isArray(editedContent.table_of_contents)) {
        editedContent.table_of_contents.forEach((section: any) => {
          if (section.sub_sections && Array.isArray(section.sub_sections)) {
            section.sub_sections.forEach((subSection: any) => {
              if (subSection.deliverables && Array.isArray(subSection.deliverables)) {
                insights.push(...subSection.deliverables.slice(0, 2));
              }
            });
          }
        });
      }
      
      summaryData = {
        overview: editedContent.abstract || editedContent.introduction || 'No summary available',
        keyPoints: keyPoints.slice(0, 6),
        insights: insights.slice(0, 5)
      };
    }
    // Use provided summary if available
    else if (propReaderData?.summary) {
      summaryData = propReaderData.summary;
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
    <div className="flex-1 overflow-y-auto border border-gray-200 rounded-md bg-gray-50 p-4">
      <h3 className="font-medium text-lg mb-3 text-gray-700">Key Citations</h3>
      {propReaderData.citations && propReaderData.citations.length > 0 ? (
        propReaderData.citations.map((citation, index) => (
          <div key={index} className="mb-4 border-b border-gray-200 pb-4 last:border-b-0">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Page {citation.page}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(citation.page)}
                  className="text-gray-600 hover:text-gray-800 text-sm flex items-center hidden md:flex"
                >
                  <Bookmark className="h-3 w-3 mr-1" /> Go to Page
                </button>
                <button
                  onClick={() => handleCopyCitation(index)}
                  className="text-gray-600 hover:text-gray-800 text-sm flex items-center"
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
        <div className="flex items-center justify-center h-32 text-gray-500">
          <p>No citations available</p>
        </div>
      )}
    </div>
  );

  const renderSectionNavigation = () => (
    <div className="py-2 px-4 border-b border-gray-200 bg-white">
      <div className="flex flex-nowrap items-center gap-1 overflow-x-auto hide-scrollbar pb-2">
        <button
          onClick={() => setActiveSection('content')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 transition-colors ${
            activeSection === 'content' ? 'bg-gray-100 text-gray-700' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FileText className="h-4 w-4" />
          Content
        </button>
        <button
          onClick={() => setActiveSection('summary')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 transition-colors ${
            activeSection === 'summary' ? 'bg-gray-100 text-gray-700' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Bookmark className="h-4 w-4" />
          Summary
        </button>
        <button
          onClick={() => setActiveSection('mindmap')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 transition-colors ${
            activeSection === 'mindmap' ? 'bg-gray-100 text-gray-700' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <StickyNote className="h-4 w-4" />
          Mind Map
        </button>
        <button
          onClick={() => setActiveSection('flashcards')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 transition-colors ${
            activeSection === 'flashcards' ? 'bg-gray-100 text-gray-700' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <BarChart2 className="h-4 w-4" />
          Flash Cards
        </button>
        <button
          onClick={() => setActiveSection('postit')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 transition-colors ${
            activeSection === 'postit' ? 'bg-gray-100 text-gray-700' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <StickyNote className="h-4 w-4" />
          Post-It
        </button>
        <button
          onClick={() => setActiveSection('infographic')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 transition-colors ${
            activeSection === 'infographic' ? 'bg-gray-100 text-gray-700' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <BarChart2 className="h-4 w-4" />
          Infographic
        </button>
        <button
          onClick={() => setActiveSection('podcast')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap flex items-center gap-1 transition-colors ${
            activeSection === 'podcast' ? 'bg-gray-100 text-gray-700' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Headphones className="h-4 w-4" />
          Podcast
        </button>
        <button
          onClick={() => setActiveSection('chat')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap relative transition-colors ${
            activeSection === 'chat' ? 'bg-gray-100 text-gray-700' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Chat
          {chatHandlers.isStreaming && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          )}
        </button>
        <button
          onClick={() => setActiveSection('citations')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap transition-colors ${
            activeSection === 'citations' ? 'bg-gray-100 text-gray-700' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Citations
        </button>
        <button
          onClick={onReset}
          className="px-3 py-1 rounded-md text-sm whitespace-nowrap text-gray-600 flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="New Document"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const renderDocumentViewer = () => (
    <div className="flex flex-col h-full bg-gray-50">
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
          <div className="h-full border border-gray-200 rounded-md overflow-hidden relative bg-white">
            <ContentView content={editedContent} />
          </div>
        );
      case 'chat':
        return renderChatSection();
      case 'summary':
        return renderSummarySection();
      case 'mindmap':
        return (
          <div className="h-full border border-gray-200 rounded-md overflow-hidden relative bg-gray-50">
            {renderMindMap()}
          </div>
        );
      case 'flashcards':
        return (
          <div className="h-full border border-gray-200 rounded-md overflow-hidden relative bg-gray-50">
            {renderFlashCards()}
          </div>
        );
      case 'postit':
        return (
          <div className="h-full border border-gray-200 rounded-md overflow-hidden relative bg-gray-50">
            {renderPostItNotes()}
          </div>
        );
      case 'infographic':
        return (
          <div className="h-full border border-gray-200 rounded-md overflow-hidden relative bg-gray-50">
            {renderInfographic()}
          </div>
        );
      case 'podcast':
        return (
          <div className="h-full border border-gray-200 rounded-md overflow-hidden relative bg-gray-50">
            {renderPodcast()}
          </div>
        );
      case 'citations':
        return renderCitationsSection();
      default:
        return (
          <div className="h-full border border-gray-200 rounded-md overflow-hidden relative bg-white">
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
      <div className="w-1/2 border-r border-gray-200 flex flex-col h-full overflow-hidden">
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