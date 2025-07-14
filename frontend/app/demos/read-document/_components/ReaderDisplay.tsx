'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import MindMapView from './MindMapView';
import FlashCardView from './FlashCardView';
import InfographicView from './InfographicView';
import PodCastView from './PodCastView';
import PostItView from './PostItView';
import ChatView from './ChatView';
import VoiceButton from '@/components/chatbot/VoiceButton.jsx';
import DocumentViewer from './DocumentViewer';
import SummaryView from './SummaryView';

// ========================================
// TYPE DEFINITIONS
// ========================================

interface Document {
  title: string;
  content: string;
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

// MindMap types matching MindMapView component expectations
interface MindMapNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    label: string;
    description: string;
    nodeType: string;
  };
}

interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated: boolean;
  style: {
    stroke: string;
    strokeWidth: number;
  };
  markerEnd: {
    type: string;
    orient: string;
  };
}

// Extended MindMap interface to handle different API response formats
interface MindMap {
  title?: string;
  description?: string;
  centralTopic?: string; // For legacy format
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  // Allow for any additional properties from API
  [key: string]: any;
}

interface PostItNote {
  id: string;
  content: string;
  color: "yellow" | "blue" | "green" | "pink" | "purple";
  type: "action" | "insight" | "question" | "key-point";
  position: {
    x: number;
    y: number;
    rotate: number;
  };
}

interface PostItNotes {
  title: string;
  description: string;
  notes: PostItNote[];
}

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  duration: string;
  publishDate: string;
  audioUrl: string;
  imageUrl: string;
  hostName: string;
  guestName: string;
  learningObjectives: string[];
  topics: string[];
}

interface Podcast {
  /**
   * All properties optional so that we can safely render even when some
   * information is missing from the backend/Test-data.  This mirrors the
   * flexibility we introduced for the `Infographics` interface.
   */
  title?: string;
  description?: string;
  /**
   * Detailed list of podcast episodes. Optional because sample data may omit
   * it entirely or provide it lazily.
   */
  episodes?: PodcastEpisode[];
  /**
   * Fallback catch-all for any other podcast payloads (e.g. a raw string or
   * differently-shaped object). Keeps type compatibility without runtime
   * errors.
   */

  podcast?: any;
}

interface Infographics {
  title?: string;
  description?: string;

  // `theme` can be a detailed palette object OR just a simple string value
  theme?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    danger?: string;
    dark?: string;
    background?: string;
    surface?: string;
  } | string;

  // `layout` can be the detailed layout object OR a string
  layout?: {
    type?: "dashboard" | "single-chart" | "story-flow" | "comparison";
    columns?: number;
    responsive?: boolean;
    spacing?: "comfortable" | "compact" | "spacious";
  } | string;

  infographic?: any;
  components?: any[];
  metrics?: any[];
  annotations?: any[];
}

interface ReaderData {
  document: Document;
  conversation: Message[];
  citations: Citation[];
  summary: {
    overview: string;
    keyPoints: string[];
    insights: string[];
  };
  relatedDocuments?: {
    title: string;
    relevance: string;
    link?: string;
  }[];
  mindMap?: MindMap;
  flashCards?: FlashCard[];
  postItNotes?: PostItNotes;
  infographics?: Infographics;
  podcast?: Podcast;
}

interface ChatHandlers {
  message: string;
  isStreaming: boolean;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onStopStreaming: () => void;
}

interface ReaderDisplayProps {
  readerData: ReaderData;
  onReset: () => void;
  documentUrl: string;
  chatHandlers: ChatHandlers;
}

// ========================================
// MAIN COMPONENT
// ========================================

const ReaderDisplay: React.FC<ReaderDisplayProps> = ({
  readerData: propReaderData,
  onReset,
  documentUrl,
  chatHandlers
}) => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  
  const [activeTab, setActiveTab] = useState<'document' | 'conversation'>('document');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSection, setActiveSection] = useState<
    'chat' | 'summary' | 'citations' | 'flashcards' | 'mindmap' | 'postit' | 'infographic' | 'podcast'
  >('chat');
  const [copiedCitation, setCopiedCitation] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(true);
  
  // ========================================
  // CONSTANTS
  // ========================================
  
  const pdfUrl = 'https://soosimage.s3.eu-west-2.amazonaws.com/reference_articles/Charles_Agbo42b35/Generative+AI.pdf.pdf';
  
  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleCopyCitation = (index: number) => {
    const citation = propReaderData.citations[index];
    navigator.clipboard.writeText(citation.text);
    setCopiedCitation(index);
    setTimeout(() => setCopiedCitation(null), 2000);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= propReaderData.document.pages) {
      setCurrentPage(newPage);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const convertLegacyMindMap = (legacy: any): MindMap => {
    const nodes: MindMapNode[] = [];
    const edges: MindMapEdge[] = [];
    
    console.log('Converting legacy mind map:', legacy);
    
    // Handle different mind map formats from API
    let mindMapData: any = legacy;
    
    // If the legacy object has a mindMap property, use that
    if (legacy.mindMap) {
      mindMapData = legacy.mindMap;
    }
    
    // Create root node from centralTopic
    const rootId = 'root';
    const centralTopic = mindMapData.centralTopic || mindMapData.title || 'Root Topic';
    
    // Add root node
    nodes.push({
      id: rootId,
      type: 'default',
      position: { x: 0, y: 0 },
      data: {
        label: centralTopic,
        description: mindMapData.description || ('Root node: ' + centralTopic),
        nodeType: 'root'
      }
    });
    
    // Process each top-level node and its children
    if (Array.isArray(mindMapData.nodes)) {
      mindMapData.nodes.forEach((node: any, index: number) => {
        // Calculate position for main nodes in a circle around the root
        const angle = (index * 2 * Math.PI) / mindMapData.nodes.length;
        const radius = 300;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        const nodeId = node.id || `node-${index}`;
        
        // Add the main node
        nodes.push({
          id: nodeId,
          type: 'default',
          position: node.position || { x, y },
          data: {
            label: node.text || node.label || `Node ${index + 1}`,
            description: node.description || ('Topic: ' + (node.text || node.label || `Node ${index + 1}`)),
            nodeType: 'level2'
          }
        });
        
        // Connect to root
        edges.push({
          id: `${rootId}-${nodeId}`,
          source: rootId,
          target: nodeId,
          type: 'default',
          animated: false,
          style: { stroke: '#3B82F6', strokeWidth: 2 },
          markerEnd: { type: 'arrow', orient: 'auto' }
        });
        
        // Process children if any
        if (Array.isArray(node.children)) {
          node.children.forEach((child: any, childIndex: number) => {
            const childId = child.id || `${nodeId}-child-${childIndex}`;
            
            // Calculate position for child nodes
            const childAngle = angle + (childIndex - node.children.length / 2) * 0.5;
            const childRadius = radius + 150;
            const childX = Math.cos(childAngle) * childRadius;
            const childY = Math.sin(childAngle) * childRadius;
            
            nodes.push({
              id: childId,
              type: 'default',
              position: child.position || { x: childX, y: childY },
              data: {
                label: child.text || child.label || `Child ${childIndex + 1}`,
                description: child.description || ('Subtopic: ' + (child.text || child.label || `Child ${childIndex + 1}`)),
                nodeType: 'leaf'
              }
            });
            
            // Connect to parent
            edges.push({
              id: `${nodeId}-${childId}`,
              source: nodeId,
              target: childId,
              type: 'default',
              animated: false,
              style: { stroke: '#10B981', strokeWidth: 1.5 },
              markerEnd: { type: 'arrow', orient: 'auto' }
            });
          });
        }
      });
    }
    
    return {
      title: mindMapData.title || legacy.title || 'Mind Map',
      description: mindMapData.description || legacy.description || 'Document mind map visualization',
      nodes,
      edges
    };
  };
  
  const renderMindMap = () => {
    console.log('Rendering mind map with data:', propReaderData.mindMap);
    
    if (!propReaderData.mindMap) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No mind map data available</p>
        </div>
      );
    }
  
    let mindMapData: MindMap;
    
    // Check if we already have a properly formatted mind map
    if (propReaderData.mindMap.nodes && 
        Array.isArray(propReaderData.mindMap.nodes) && 
        propReaderData.mindMap.nodes.length > 0 &&
        propReaderData.mindMap.nodes[0]?.data?.nodeType) {
      mindMapData = propReaderData.mindMap;
    } else {
      // Convert from API format
      mindMapData = convertLegacyMindMap(propReaderData.mindMap);
    }
    
    // Ensure we have at least a root node
    if (!mindMapData.nodes || mindMapData.nodes.length === 0) {
      mindMapData = {
        title: 'Document Mind Map',
        description: 'Mind map visualization of document content',
        nodes: [{
          id: 'root',
          type: 'default',
          position: { x: 0, y: 0 },
          data: {
            label: propReaderData.document?.title || 'Document',
            description: 'Main document topic',
            nodeType: 'root'
          }
        }],
        edges: []
      };
    }
  
    // Final validation - ensure all nodes have the required structure
    const validatedNodes: MindMapNode[] = mindMapData.nodes.map((node: any, index: number) => {
      if (!node.data || !node.data.nodeType) {
        return {
          ...node,
          data: {
            label: node.data?.label || `Node ${index + 1}`,
            description: node.data?.description || `Node ${index + 1}`,
            nodeType: index === 0 ? 'root' : 'level2'
          }
        };
      }
      return node;
    });
  
    const finalMindMapData: MindMap = {
      ...mindMapData,
      nodes: validatedNodes
    };
  
    console.log('Final mind map data being passed to MindMapView:', finalMindMapData);
    
    return <MindMapView data={finalMindMapData} />;
  };

  const renderFlashCards = () => {
    if (propReaderData.flashCards && propReaderData.flashCards.length > 0) {
      return <FlashCardView flashCards={propReaderData.flashCards} />;
    }
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No flashcards data available</p>
      </div>
    );
  };

  const renderPostItNotes = () => {
    // Check if postItNotes exists and has the correct structure
    if (!propReaderData.postItNotes || !propReaderData.postItNotes.notes || !Array.isArray(propReaderData.postItNotes.notes)) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No post-it notes data available</p>
        </div>
      );
    }
    
    return <PostItView data={propReaderData.postItNotes} />;
  };

  const renderInfographic = () => {
    if (!propReaderData.infographics) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No infographic data available</p>
        </div>
      );
    }
    
    return <InfographicView data={propReaderData.infographics} />;
  };
  
  const renderPodcast = () => {
    // Handle different podcast data structures from API
    let podcastData: any;
    
    // Check if podcast has the expected structure
    if (propReaderData.podcast?.podcast) {
      // Handle nested podcast structure from API
      podcastData = propReaderData.podcast.podcast;
    } else if (propReaderData.podcast?.episodes) {
      // Handle direct podcast structure
      podcastData = propReaderData.podcast;
    } else if (propReaderData.podcast?.title || propReaderData.podcast?.description) {
      // Handle partial podcast structure
      podcastData = propReaderData.podcast;
    } else {
      // No valid podcast data
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No podcast data available</p>
        </div>
      );
    }
  
    // Ensure required fields have fallback values and proper structure
    const normalizedPodcastData = {
      title: podcastData.title || 'Educational Podcast',
      description: podcastData.description || 'Comprehensive audio-visual learning experience based on your document',
      fullVideoUrl: podcastData.fullVideoUrl || '', // Main video URL from new JSON structure
      episodes: Array.isArray(podcastData.episodes) ? podcastData.episodes.map((episode: any) => ({
        ...episode,
        // Ensure all required fields exist
        id: episode.id || `episode-${Math.random().toString(36).substr(2, 9)}`,
        title: episode.title || 'Untitled Episode',
        description: episode.description || 'Educational content based on document analysis',
        duration: episode.duration || '25:00',
        publishDate: episode.publishDate || new Date().toISOString().split('T')[0],
        audioUrl: episode.audioUrl || '',
        imageUrl: episode.imageUrl || '',
        hostName: episode.hostName || 'AI Learning Assistant',
        guestName: episode.guestName || '',
        topics: Array.isArray(episode.topics) ? episode.topics : [],
        learningObjectives: Array.isArray(episode.learningObjectives) ? episode.learningObjectives : [],
        audioScript: episode.audioScript || '',
        // Add video structure from new JSON format
        videoStructure: episode.videoStructure ? {
          episodeOutput: {
            finalVideoUrl: episode.videoStructure.episodeOutput?.finalVideoUrl || '',
            totalDuration: episode.videoStructure.episodeOutput?.totalDuration || 0,
            status: episode.videoStructure.episodeOutput?.status || 'pending'
          }
        } : undefined
      })) : []
    };
  
    // Import the enhanced podcast component dynamically
    return <PodCastView data={normalizedPodcastData} />;
  };

  // ========================================
  // SECTION RENDERS
  // ========================================
  
  const renderChatSection = () => (
    <ChatView
      conversation={propReaderData.conversation}
      message={chatHandlers.message}
      isStreaming={chatHandlers.isStreaming}
      onMessageChange={chatHandlers.onMessageChange}
      onSendMessage={chatHandlers.onSendMessage}
      onStopStreaming={chatHandlers.onStopStreaming}
    />
  );

  // Replace the existing renderSummarySection function with this:
  const renderSummarySection = () => {
    // Handle different possible data structures from the API
    let summaryData;
    let relatedDocuments = propReaderData.relatedDocuments;
  
    // Type-safe way to check for nested summary structure
    const summaryAny = propReaderData.summary as any;
  
    // Check if summary is nested under a 'summary' key (from API response)
    if (summaryAny?.summary && typeof summaryAny.summary === 'object') {
      summaryData = summaryAny.summary;
    } 
    // Check if it's already in the correct format
    else if (propReaderData.summary?.overview) {
      summaryData = propReaderData.summary;
    }
    // Handle case where summary might be a string (from some API responses)
    else if (typeof propReaderData.summary === 'string') {
      summaryData = {
        overview: propReaderData.summary,
        keyPoints: [],
        insights: []
      };
    }
    // Fallback for missing summary
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
        relatedDocuments={relatedDocuments}
      />
    );
  };

  const renderCitationsSection = () => (
    <div className="flex-1 overflow-y-auto border rounded-md bg-gray-50 p-4">
      <h3 className="font-medium text-lg mb-3">Key Citations</h3>
      {propReaderData.citations.map((citation, index) => (
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
                {copiedCitation === index ? (
                  <span className="flex items-center">
                    <Copy className="h-3 w-3 mr-1" /> Copied!
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Copy className="h-3 w-3 mr-1" /> Copy
                  </span>
                )}
              </button>
            </div>
          </div>
          <p className="text-gray-800 mb-1 italic">"{citation.text}"</p>
          <p className="text-xs text-gray-500">Relevance: {citation.relevance}</p>
        </div>
      ))}
    </div>
  );

  // ========================================
  // NAVIGATION COMPONENTS
  // ========================================
  
  const renderTabNavigation = () => (
    <div className="flex bg-gray-100 border-b justify-between">
      <button
        onClick={() => setActiveTab('document')}
        className={`flex items-center justify-center px-4 py-3 font-medium ${
          activeTab === 'document' 
            ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-600'
        }`}
      >
        <FileText className="mr-2 h-4 w-4" /> Document View
      </button>
      <div className="flex items-center">
        <button
          onClick={onReset}
          className="flex items-center justify-center px-4 py-3 font-medium text-gray-600"
        >
          <RotateCcw className="h-3 w-3 mr-1" /> New Document
        </button>
        
        {/* Voice Button */}
        <div className="px-2">
          <VoiceButton />
        </div>
        
        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="flex items-center justify-center px-3 mx-1 py-2 rounded-full bg-gray-200 hover:bg-gray-300"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  const renderSectionNavigation = () => (
    <div className="py-2 px-3 border-b">
      <div className="flex overflow-x-auto space-x-2">
        <button
          onClick={() => setActiveSection('summary')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap ${
            activeSection === 'summary' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveSection('mindmap')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap ${
            activeSection === 'mindmap' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
        >
          Mind Map
        </button>
        <button
          onClick={() => setActiveSection('flashcards')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap ${
            activeSection === 'flashcards' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
        >
          Flash Cards
        </button>
        <button
          onClick={() => setActiveSection('postit')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap ${
            activeSection === 'postit' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
        >
          <StickyNote className="h-3 w-3 mr-1 inline md:hidden" />
          Post-It
        </button>
        <button
          onClick={() => setActiveSection('infographic')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap ${
            activeSection === 'infographic' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
        >
          <BarChart2 className="h-3 w-3 mr-1 inline md:hidden" />
          Infographic
        </button>
        <button
          onClick={() => setActiveSection('podcast')}
          className={`px-3 py-1 rounded-md text-sm whitespace-nowrap ${
            activeSection === 'podcast' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
        >
          <Headphones className="h-3 w-3 mr-1 inline md:hidden" />
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
        <DocumentViewer
          currentPage={currentPage}
          totalPages={propReaderData.document.pages}
          onPageChange={handlePageChange}
          url={documentUrl || pdfUrl}
        />
      </div>
    </div>
  );

  // ========================================
  // SECTION CONTENT RENDERER
  // ========================================
  
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'chat':
        return renderChatSection();
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
        return renderChatSection();
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
        {/* Document Panel */}
        <div className="w-1/2 border-r flex flex-col h-full overflow-hidden">
          {renderDocumentViewer()}
        </div>

        {/* AI Assistant Panel */}
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

export default ReaderDisplay;