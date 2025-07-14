'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2Icon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import DemoHeader from '../_components/DemoHeader';
import ReaderDisplay from './_components/ReaderDisplay';
import readerData from '../_data/reader-data.json';
import { demoDocumentTemplate } from '../_data/DemoTemplates';

// Interface for reader result data structure
interface ReaderResult {
  id: string;
  title: string;
  processedDate?: string;
  documentUrl?: string;
  document: {
    title: string;
    author?: string;
    type?: string;
    pages: number;
    url?: string;
    datePublished?: string;
    currentPage?: number;
    thumbnailUrl?: string;
    keyTopics?: string[];
    fileType: string;
    fileSize: string;
    content: string;
  };
  insights?: {
    id: string;
    title: string;
    content: string;
    pageReference: number;
    relevance: string;
  }[];
  chat?: {
    messages: {
      id: string;
      role: string;
      content: string;
      timestamp?: string;
      citations?: {
        pageNumber: number;
        text: string;
      }[];
    }[];
    newMessage?: {
      placeholder: string;
    };
  };
  annotations?: {
    id: string;
    type: string;
    color: string;
    pageNumber: number;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    text: string;
    content?: string;
    note?: string;
  }[];
  documentControls?: {
    maxZoom: number;
    minZoom: number;
    pageCount: number;
    currentPage: number;
    viewMode: string;
    showAnnotations: boolean;
  };
  mindMap: {
    title?: string;
    description?: string;
    centralTopic?: string;
    nodes: any[];
    edges: any[];
  };
  flashCards: {
    id: string;
    front: string;
    back: string;
  }[];
  summary: {
    overview: string;
    keyPoints: string[];
    insights: string[];
  };
  conversation: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }[];
  citations: {
    text: string;
    page: number;
    relevance: string;
  }[];
  postItNotes?: {
    title: string;
    description: string;
    notes: any[];
  };
  infographics?: {
    title?: string;
    description?: string;
    infographic?: any;
    theme?: string | object;
    layout?: string | object;
    components?: any[];
    metrics?: any[];
    annotations?: any[];
  };
  podcast?: {
    title?: string;
    description?: string;
    fullVideoUrl?: string;
    podcast?: any;
    episodes?: any[];
  };
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export default function ReadDocumentDemo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [readerResult, setReaderResult] = useState<ReaderResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useTestData, setUseTestData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [context, setContext] = useState('');

  // Chat-related state
  const [conversation, setConversation] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isFirstUserMessage, setIsFirstUserMessage] = useState(true); // Track if this is the first user message

  // ========================================
  // CHAT STREAMING FUNCTIONS
  // ========================================
  
  const handleStreamingChat = async (userMessage: string) => {
    if (!userMessage.trim() || isStreaming) return;

    // Prepare the message content
    let messageContent = userMessage;
    
    // If this is the first user message and we have context, include it with instructions
    if (isFirstUserMessage && context) {
      messageContent = `${userMessage}

[CONTEXT FOR AI: Use the following document context only when necessary to answer questions specifically related to this document content. Do not reference this context unless the user's question directly relates to the document being analyzed.

Document Context:
${context}]`;
      
      setIsFirstUserMessage(false); // Mark that we've sent the first message
    }

    // Add user message
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage, // Display the original message without context
      timestamp: new Date().toISOString()
    };

    // Create assistant message placeholder
    const assistantMessageId = `msg-${Date.now()}`;
    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true
    };

    setConversation(prev => [...prev, newUserMessage, assistantMessage]);
    setMessage('');
    setIsStreaming(true);
    setStreamingMessageId(assistantMessageId);

    // Create abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const apiEndpoint = `${API_BASE_URL}/api/v1/chat_v2`;
    
    try {
      // Prepare messages for API - use messageContent (with context) for the API call
      const apiMessages = [...conversation.map(msg => ({
        role: msg.role,
        content: msg.content
      })), {
        role: 'user',
        content: messageContent // Send the message with context to API
      }];

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1',
          messages: apiMessages
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log("Stream reading complete");
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        console.log("Raw chunk received:", chunk);
        
        // The backend is now sending raw content without SSE formatting
        // Just add the chunk directly to accumulated content
        accumulatedContent += chunk;
        console.log("Accumulated content:", accumulatedContent);
        
        // Update the conversation with the accumulated content
        setConversation(prev => prev.map(msg => {
          if (msg.role === 'assistant' && msg.isStreaming) {
            return { ...msg, content: accumulatedContent };
          }
          return msg;
        }));
      }

      // Finalize the message
      setConversation(prev => prev.map(msg => {
        if (msg.role === 'assistant' && msg.isStreaming) {
          return { ...msg, content: accumulatedContent, isStreaming: false };
        }
        return msg;
      }));

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Chat request was aborted');
        // Remove the incomplete assistant message
        setConversation(prev => prev.filter(msg => !msg.isStreaming));
      } else {
        console.error('Error in streaming chat:', error);
        // Update the assistant message with error
        setConversation(prev => prev.map(msg => {
          if (msg.role === 'assistant' && msg.isStreaming) {
            return { 
              ...msg, 
              content: 'Sorry, I encountered an error while processing your request. Please try again.',
              isStreaming: false 
            };
          }
          return msg;
        }));
      }
    } finally {
      setIsStreaming(false);
      setStreamingMessageId(null);
      abortControllerRef.current = null;
    }
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleMessageChange = (value: string) => {
    setMessage(value);
  };

  const handleSendMessage = async () => {
    if (message.trim() && !isStreaming) {
      await handleStreamingChat(message);
    }
  };

  // ========================================
  // CHAT HANDLERS OBJECT
  // ========================================
  
  const chatHandlers = {
    message,
    isStreaming,
    onMessageChange: handleMessageChange,
    onSendMessage: handleSendMessage,
    onStopStreaming: stopStreaming,
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFormValues(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  // Handle form input changes
  const handleInputChange = (name: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };


  // Helper functions to transform mind map data for test data
  function transformMindMapNodes(mindMap: any) {
    if (!mindMap) return [];
    
    const nodes = [];
    
    // Add root node based on centralTopic
    if (mindMap.centralTopic) {
      nodes.push({
        id: 'root',
        type: 'default',
        position: { x: 0, y: 0 },
        data: {
          label: mindMap.centralTopic,
          description: '',
          nodeType: 'root'
        }
      });
    }
    
    // Process top-level nodes
    if (Array.isArray(mindMap.nodes)) {
      mindMap.nodes.forEach((node: any) => {
        // Add main node
        nodes.push({
          id: node.id,
          type: 'default',
          position: node.position || { x: 0, y: 0 },
          data: {
            label: node.text || '',
            description: node.description || '',
            nodeType: 'level2'
          }
        });
        
        // Process children
        if (Array.isArray(node.children)) {
          node.children.forEach((child: any) => {
            nodes.push({
              id: child.id,
              type: 'default',
              position: child.position || { x: 0, y: 0 },
              data: {
                label: child.text || '',
                description: child.description || '',
                nodeType: 'leaf'
              }
            });
          });
        }
      });
    }
    
    return nodes;
  }
  
  function transformMindMapEdges(mindMap: any) {
    if (!mindMap) return [];
    
    const edges: { id: string; source: any; target: any; type: string; animated: boolean; style: { stroke: string; strokeWidth: number; } | { stroke: string; strokeWidth: number; }; markerEnd: { type: string; orient: string; } | { type: string; orient: string; }; }[] = [];
    const rootId = 'root';
    
    // Connect root to top-level nodes
    if (Array.isArray(mindMap.nodes)) {
      mindMap.nodes.forEach((node: any) => {
        // Connect to root
        edges.push({
          id: `${rootId}-${node.id}`,
          source: rootId,
          target: node.id,
          type: 'default',
          animated: false,
          style: { stroke: '#999', strokeWidth: 1.5 },
          markerEnd: { type: 'arrow', orient: 'auto' }
        });
        
        // Connect to children
        if (Array.isArray(node.children)) {
          node.children.forEach((child: any) => {
            edges.push({
              id: `${node.id}-${child.id}`,
              source: node.id,
              target: child.id,
              type: 'default',
              animated: false,
              style: { stroke: '#999', strokeWidth: 1.5 },
              markerEnd: { type: 'arrow', orient: 'auto' }
            });
          });
        }
      });
    }
    
    return edges;
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (useTestData) {
      // Map the sample data to match our interface
      try {
        const sampleData = JSON.parse(JSON.stringify(readerData));
        const mappedReaderData: ReaderResult = {
          id: sampleData.id || 'sample-data',
          title: sampleData.title || 'Sample Document Analysis',
          document: {
            title: sampleData.document?.title || 'Sample Document',
            author: sampleData.document?.author || '',
            type: sampleData.document?.type || '',
            pages: sampleData.document?.pages || 1,
            fileType: sampleData.document?.fileType || 'pdf',
            fileSize: sampleData.document?.fileSize || '1MB',
            content: sampleData.document?.content || '',
          },
          summary: sampleData.Summary || {
            overview: '',
            keyPoints: [],
            insights: []
          },
          mindMap: sampleData.mindMap ? {
            title: sampleData.mindMap.title || 'Mind Map',
            description: sampleData.mindMap.description || '',
            centralTopic: sampleData.mindMap.centralTopic,
            nodes: transformMindMapNodes(sampleData.mindMap),
            edges: transformMindMapEdges(sampleData.mindMap)
          } : { nodes: [], edges: [] },
          conversation: sampleData.conversation || [],
          citations: sampleData.citations || [],
          flashCards: sampleData.flashCards || [],
          postItNotes: sampleData.postItNotes || {},
          infographics: sampleData.infographics || {},
          podcast: sampleData.podcast || {}
        };
        
        setReaderResult(mappedReaderData);
        // Initialize conversation state with the reader result's conversation
        setConversation(mappedReaderData.conversation || []);
        // Reset first message flag for test data (no context to include)
        setIsFirstUserMessage(true);
      } catch (error) {
        console.error('Error parsing sample data:', error);
        setError('Failed to load sample data');
      }
      return;
    }

    if (!selectedFile && !formValues.file_url) {
      setError('Please upload a document or provide a document URL');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Create form data for API request
      const formData = new FormData();
      
      // Add clerk_id (required by backend)
      formData.append('clerk_id', 'demo_user_' + Math.random().toString(36).substring(2, 9));
      
      // Add topic and prompt (now required fields from template)
      formData.append('topic', formValues.topic || 'Document Analysis');
      formData.append('prompt', formValues.prompt || 'Analyze this document and create comprehensive content');
      
      // Add optional fields with their default values
      formData.append('provider', formValues.provider || 'google');
      formData.append('model', formValues.model || 'gemini-2.5-flash-preview-05-20');
      formData.append('level', formValues.level || 'intermediate');
      formData.append('content_types', formValues.content_types || 'summary,mind_map,flash_card,infographic,post_it,podcast,citation');
      
      // Add file if available
      if (selectedFile) {
        formData.append('file', selectedFile);
        formData.append('file_type', formValues.file_type || selectedFile.type);
      }
      
      // Add URL if provided
      if (formValues.file_url) {
        formData.append('file_url', formValues.file_url);
      }
      
      // Get the API base URL from environment variables
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const apiEndpoint = `${API_BASE_URL}/api/v1/read_document_v2`;
      
      // Make the API call
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to process document: Server returned ${response.status}`);
      }
      
      // Parse the response - guaranteed format: {content: {...}, url: "..."}
      const responseData = await response.json();
      
      // Extract content and url from the guaranteed format
      const { content, url, context } = responseData;

      let summaryData;
      if (content.summary_content) {
        // If summary_content is a string, parse it
        if (typeof content.summary_content === 'string') {
          try {
            const parsed = JSON.parse(content.summary_content);
            summaryData = parsed.summary || parsed; // Extract nested summary or use the whole object
          } catch (e) {
            console.warn('Failed to parse summary_content as JSON:', e);
            summaryData = {
              overview: content.summary_content,
              keyPoints: [],
              insights: []
            };
          }
        } else {
          // If it's already an object, extract the nested summary
          summaryData = content.summary_content.summary || content.summary_content;
        }
      } else {
        // Fallback if no summary_content
        summaryData = {
          overview: 'No summary available',
          keyPoints: [],
          insights: []
        };
      }
      
      // Map the content to the expected ReaderResult format
      const podcastMapping = (apiPodcastData: any) => {
        // Handle different API response structures
        let podcastContent;
        
        if (apiPodcastData?.podcast) {
          podcastContent = apiPodcastData.podcast;
        } else if (apiPodcastData?.episodes) {
          podcastContent = apiPodcastData;
        } else {
          // Create default structure if no podcast data
          return {
            title: 'Educational Podcast Series',
            description: 'AI-generated learning content based on your document',
            fullVideoUrl: '',
            episodes: []
          };
        }
      
        return {
          title: podcastContent.title || 'Educational Podcast Series',
          description: podcastContent.description || 'Comprehensive audio-visual learning experience',
          fullVideoUrl: podcastContent.fullVideoUrl || '', // Main video URL from JSON
          episodes: Array.isArray(podcastContent.episodes) ? podcastContent.episodes.map((episode: any, index: number) => {
            // Generate enhanced episode data with video structure
            const enhancedEpisode = {
              id: episode.id || `lesson${index + 1}`,
              title: episode.title || `Lesson ${index + 1}: Document Analysis`,
              description: episode.description || 'Educational content based on document analysis',
              duration: episode.duration || '25:00',
              publishDate: episode.publishDate || new Date().toISOString().split('T')[0],
              audioUrl: episode.audioUrl || '', // Keep for backward compatibility
              imageUrl: episode.imageUrl || '',
              hostName: episode.hostName || 'AI Learning Assistant',
              guestName: episode.guestName || '',
              topics: Array.isArray(episode.topics) ? episode.topics : ['Document Analysis', 'Key Concepts', 'Learning Objectives'],
              learningObjectives: Array.isArray(episode.learningObjectives) ? episode.learningObjectives : [
                'Understand the main concepts of the document',
                'Apply learned knowledge to practical scenarios',
                'Analyze and synthesize document content'
              ],
              audioScript: episode.audioScript || '',
              // Add video structure from new JSON format
              videoStructure: episode.videoStructure ? {
                episodeOutput: {
                  finalVideoUrl: episode.videoStructure.episodeOutput?.finalVideoUrl || '',
                  totalDuration: episode.videoStructure.episodeOutput?.totalDuration || 0,
                  status: episode.videoStructure.episodeOutput?.status || 'pending'
                }
              } : undefined
            };
      
            return enhancedEpisode;
          }) : []
        };
      };

      // Map the content to the expected ReaderResult format with enhanced podcast handling
      const mappedData = {
        id: 'processed-document',
        title: content.topic || 'Document Analysis',
        document: {
          title: content.content_plan?.document_metadata?.title || 'Document',
          author: content.content_plan?.document_metadata?.author || '',
          type: 'pdf',
          pages: content.content_plan?.document_metadata?.pages || 10,
          fileType: 'pdf',
          fileSize: '1MB',
          content: content.document_text || '',
        },
        summary: summaryData,
        mindMap: content.mind_map_content?.mindMap || { nodes: [], edges: [] },
        conversation: [],
        citations: content.citation_content?.citations || [],
        flashCards: content.flashcards_content?.flashCards || [],
        postItNotes: content.post_it_content?.postItNotes || { title: '', description: '', notes: [] },
        infographics: content.infographic_content?.infographics || {},
        podcast: podcastMapping(content.podcast_content) // Use enhanced mapping function
      };
      
      setReaderResult(mappedData);
      setUrl(url);
      setContext(context);

      console.log("pdf url",url)
      // Initialize conversation state with initial message
      setConversation([{
        role: 'assistant',
        content: 'I\'ve analyzed your document and created comprehensive learning materials. How can I help you understand it better?',
        timestamp: new Date().toISOString()
      }]);
      // Reset first message flag for new document processing
      setIsFirstUserMessage(true);
      
    } catch (error) {
      console.error('Error processing document:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setReaderResult(null);
    setSelectedFile(null);
    setFormValues({});
    setConversation([]);
    setMessage('');
    setIsStreaming(false);
    setContext('');
    setUrl('');
    setIsFirstUserMessage(true); // Reset first message flag
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Toggle between API and test data
  const toggleDataSource = () => {
    setUseTestData(!useTestData);
  };

  return (
    <>
      <DemoHeader 
        // title="Document Reader & Analysis"
        // description="Upload a document to receive a summary, flashcards, mind map, and more."
      />
      
      <div className="container mx-auto py-6 mt-24 px-4 sm:px-6 lg:px-8">
        {!readerResult ? (
          <div className="max-w-3xl mx-auto mt-8">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold">Upload Your Document</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleDataSource}
                  className="w-full sm:w-auto"
                >
                  {useTestData ? "Use AI Processing" : "Use Sample Document"}
                </Button>
              </div>
              
              {useTestData ? (
                <div className="mb-6">
                  <p className="mb-4 text-gray-600 text-sm sm:text-base">Using a sample white paper on "Generative AI in the Workplace" with comprehensive analysis including flashcards and mind maps.</p>
                  <Button 
                    onClick={handleSubmit} 
                    className="w-full py-4 sm:py-6" 
                    disabled={loading}
                  >
                    {loading && <Loader2Icon className="animate-spin mr-2" />}
                    Load Sample Document
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {demoDocumentTemplate.form.map((field, index) => {
                    switch (field.field) {
                      case 'input':
                        return (
                          <div key={index}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <Input
                              type={field.name === 'file_url' ? 'url' : 'text'}
                              placeholder={field.placeholder}
                              value={formValues[field.name] || ''}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              required={field.required}
                              className="w-full"
                            />
                          </div>
                        );
                      
                      case 'textarea':
                        return (
                          <div key={index}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <Textarea
                              placeholder={field.placeholder}
                              value={formValues[field.name] || ''}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              className="min-h-[80px] w-full resize-y"
                              required={field.required}
                            />
                          </div>
                        );
                      
                      case 'file':
                        return (
                          <div key={index}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <div className="flex flex-col items-center justify-center w-full h-32 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                              <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept={field.fileAccept}
                                onChange={handleFileChange}
                                required={field.required}
                              />
                              <Button 
                                onClick={() => fileInputRef.current?.click()}
                                variant="outline"
                                className="mb-2"
                                size="sm"
                              >
                                Choose File
                              </Button>
                              {selectedFile ? (
                                <p className="text-sm text-gray-600 text-center px-2 break-all">{selectedFile.name}</p>
                              ) : (
                                <p className="text-sm text-gray-500 text-center px-2">
                                  {field.required ? 'Please upload a document' : 'Upload a document (optional)'}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      
                      case 'select':
                        return (
                          <div key={index}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              value={formValues[field.name] || field.defaultValue || ''}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              required={field.required}
                            >
                              {field.options?.map((option, optIndex) => (
                                <option key={optIndex} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      
                      case 'multiselect':
                        return (
                          <div key={index}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <div className="border border-gray-300 rounded-md p-3 max-h-40 sm:max-h-32 overflow-y-auto bg-white">
                              {field.options?.map((option, optIndex) => {
                                const currentValues = formValues[field.name] 
                                  ? formValues[field.name].split(',') 
                                  : (field.defaultValue ? field.defaultValue.split(',') : []);
                                const isChecked = currentValues.includes(option.value);
                                
                                return (
                                  <div key={optIndex} className="flex items-center mb-2 last:mb-0">
                                    <input
                                      type="checkbox"
                                      id={`${field.name}-${optIndex}`}
                                      checked={isChecked}
                                      onChange={(e) => {
                                        let newValues;
                                        if (e.target.checked) {
                                          newValues = [...currentValues, option.value];
                                        } else {
                                          newValues = currentValues.filter((v: string) => v !== option.value);
                                        }
                                        handleInputChange(field.name, newValues.join(','));
                                      }}
                                      className="mr-2 flex-shrink-0"
                                    />
                                    <label 
                                      htmlFor={`${field.name}-${optIndex}`}
                                      className="text-sm text-gray-700 cursor-pointer flex-1"
                                    >
                                      {option.label}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      
                      default:
                        return null;
                    }
                  })}
                  
                  <Button 
                    onClick={handleSubmit} 
                    className="w-full py-4 sm:py-6" 
                    disabled={loading || ((!selectedFile && !formValues.file_url) && !useTestData)}
                  >
                    {loading && <Loader2Icon className="animate-spin mr-2" />}
                    Analyze Document
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8 sm:mt-16">
            <ReaderDisplay
              readerData={{
                ...readerResult,
                conversation: conversation // Use the local conversation state
              }}
              onReset={handleReset}
              documentUrl={url}
              chatHandlers={chatHandlers}
            />
          </div>
        )}
        
        {loading && (
          <div className="mt-6 flex items-center justify-center px-4">
            <Loader2Icon className="animate-spin mr-2" size={24} />
            <span className="text-sm sm:text-base">Analyzing your document...</span>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg max-w-3xl mx-auto text-sm sm:text-base">
            {error}
          </div>
        )}
      </div>
    </>
  );
}

