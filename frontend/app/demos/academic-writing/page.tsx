'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2Icon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import DemoHeader from '../_components/DemoHeader';
import ContentDisplay from './_components/ContentDisplay';
import readerData from '../_data/reader-data.json';
import { demoDocumentTemplate } from '../_data/DemoTemplates';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

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

export default function ContentWritingDemo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({
    title: '',
    prompt: '',
    doc_type: 'literature_review',
    additional_info: ''
  });
  const [readerResult, setReaderResult] = useState<ReaderResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [taskFile, setTaskFile] = useState<File | null>(null);
  const [markingCriteriaFile, setMarkingCriteriaFile] = useState<File | null>(null);
  const [useTestData, setUseTestData] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const taskFileRef = useRef<HTMLInputElement>(null);
  const markingCriteriaFileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [context, setContext] = useState('');

  // Chat-related state
  const [conversation, setConversation] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isFirstUserMessage, setIsFirstUserMessage] = useState(true);

  // Function to fetch literature review data
  const fetchLiteratureData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create form data for submission
      const formData = new FormData();
      
      // Add required form fields
      formData.append('clerk_id', 'demo_user'); // Using a demo user ID
      formData.append('title', formValues.title || 'Default Title');
      formData.append('prompt', formValues.prompt || 'Generate a literature review');
      formData.append('doc_type', formValues.doc_type || 'literature_review');
      
      // Add optional files if they exist
      if (taskFile) {
        formData.append('task_file', taskFile);
      }
      
      if (markingCriteriaFile) {
        formData.append('marking_criteria_file', markingCriteriaFile);
      }
      
      // Add additional info if provided
      if (formValues.additional_info) {
        formData.append('additional_info', formValues.additional_info);
      }

      // Configure API endpoint using environment variable
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const apiEndpoint = `${API_BASE_URL}/api/v1/writing/load_literature_data`;

      // Make the request to the API
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        // Don't set Content-Type header when using FormData, the browser sets it automatically
        // with the correct boundary
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      console.log("Data from API:", data)

      setReaderResult(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching literature data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load literature data');
      setLoading(false);
    }
  };
  
  // Chat handlers for ContentDisplay component
  const chatHandlers = {
    message,
    isStreaming,
    onMessageChange: setMessage,
    onSendMessage: () => { /* Handle sending message */ },
    onStopStreaming: () => { /* Handle stop streaming */ }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleTaskFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTaskFile(e.target.files[0]);
    }
  };

  const handleMarkingCriteriaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMarkingCriteriaFile(e.target.files[0]);
    }
  };

  // Handle reset function
  const handleReset = () => {
    setReaderResult(null);
    setSelectedFile(null);
    setTaskFile(null);
    setMarkingCriteriaFile(null);
    setFormValues({
      title: '',
      prompt: '',
      doc_type: 'literature_review',
      additional_info: ''
    });
    setConversation([]);
    setMessage('');
    setIsFirstUserMessage(true);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (taskFileRef.current) {
      taskFileRef.current.value = '';
    }
    if (markingCriteriaFileRef.current) {
      markingCriteriaFileRef.current.value = '';
    }
  };

  return (
    <>
      <DemoHeader 
        title="Literature Review Editor"
        description="Edit and view a structured literature review document in real-time"
      />
      
      <div className="container mx-auto py-6 mt-24 px-4 sm:px-6 lg:px-8">
        {!readerResult ? (
          <div className="max-w-3xl mx-auto mt-8">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold">Generate Document</h2>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                {/* Title Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input 
                    id="title"
                    name="title"
                    value={formValues.title}
                    onChange={handleInputChange}
                    placeholder="Enter document title"
                    required
                    className="w-full"
                  />
                </div>
                
                {/* Prompt Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prompt <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Textarea 
                    id="prompt"
                    name="prompt"
                    value={formValues.prompt}
                    onChange={handleInputChange}
                    placeholder="Enter your prompt for the document generation"
                    rows={3}
                    className="min-h-[80px] w-full resize-y"
                    required
                  />
                </div>
                
                {/* Document Type Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    id="doc_type"
                    name="doc_type"
                    value={formValues.doc_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="literature_review">Literature Review</option>
                    <option value="essay">Essay</option>
                    <option value="report">Report</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                {/* Task File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task File (optional)
                  </label>
                  <div className="flex flex-col items-center justify-center w-full h-32 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      ref={taskFileRef}
                      id="task_file"
                      name="task_file"
                      type="file"
                      className="hidden"
                      onChange={handleTaskFileChange}
                    />
                    <Button 
                      onClick={() => taskFileRef.current?.click()}
                      variant="outline"
                      className="mb-2"
                      size="sm"
                    >
                      Choose File
                    </Button>
                    {taskFile ? (
                      <p className="text-sm text-gray-600 text-center px-2 break-all">{taskFile.name}</p>
                    ) : (
                      <p className="text-sm text-gray-500 text-center px-2">
                        Upload a task file (optional)
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Marking Criteria File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marking Criteria File (optional)
                  </label>
                  <div className="flex flex-col items-center justify-center w-full h-32 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      ref={markingCriteriaFileRef}
                      id="marking_criteria_file"
                      name="marking_criteria_file"
                      type="file"
                      className="hidden"
                      onChange={handleMarkingCriteriaFileChange}
                    />
                    <Button 
                      onClick={() => markingCriteriaFileRef.current?.click()}
                      variant="outline"
                      className="mb-2"
                      size="sm"
                    >
                      Choose File
                    </Button>
                    {markingCriteriaFile ? (
                      <p className="text-sm text-gray-600 text-center px-2 break-all">{markingCriteriaFile.name}</p>
                    ) : (
                      <p className="text-sm text-gray-500 text-center px-2">
                        Upload a marking criteria file (optional)
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Additional Information Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Information (optional)
                  </label>
                  <Textarea 
                    id="additional_info"
                    name="additional_info"
                    value={formValues.additional_info}
                    onChange={handleInputChange}
                    placeholder="Enter any additional information or context"
                    rows={2}
                    className="min-h-[80px] w-full resize-y"
                  />
                </div>
                
                <Button 
                  onClick={fetchLiteratureData} 
                  className="w-full py-4 sm:py-6" 
                  disabled={loading}
                >
                  {loading && <Loader2Icon className="animate-spin mr-2" />}
                  Generate & Load Literature Review
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 sm:mt-16">
            <ContentDisplay
              readerData={{
                ...readerResult,
                conversation: conversation
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
            <span className="text-sm sm:text-base">Generating literature review...</span>
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
