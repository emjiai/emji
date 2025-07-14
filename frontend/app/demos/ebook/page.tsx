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

// Interface for reader result data structure - simplified to use raw API response
interface ReaderResult {
  // Raw API response - no transformation needed
  [key: string]: any;
  
  // Required document wrapper for compatibility
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
    content: any;
  };
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export default function EbookPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({
    title: '',
    prompt: '',
    doc_type: 'ebook',
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

  // Simple function to create document wrapper and extract final_response
  const createDocumentWrapper = (data: any): ReaderResult => {
    // Extract the actual content from final_response if it exists
    const actualContent = data.final_response || data;
    
    // Create minimal document wrapper for compatibility
    const document = {
      title: actualContent.title || formValues.title || 'Generated Content',
      content: actualContent, // Pass extracted content
      pages: 1,
      fileType: actualContent.doc_type || formValues.doc_type || 'ebook',
      fileSize: 'N/A',
      author: actualContent.publication_details?.publisher || 'AI Generated',
      type: actualContent.doc_type || formValues.doc_type || 'ebook',
      currentPage: 1,
      keyTopics: []
    };

    // Return the extracted content with minimal document wrapper
    return {
      ...actualContent, // Keep all original content intact
      id: actualContent.id || 'generated-content',
      processedDate: new Date().toISOString(),
      document // Add document wrapper for compatibility
    };
  };

  // Function to fetch course data from API
  const fetchEbookData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create form data for submission
      const formData = new FormData();
      
      // Add required form fields
      formData.append('clerk_id', 'demo_user'); // Using a demo user ID
      formData.append('title', formValues.title || 'Default Ebook Title');
      formData.append('prompt', formValues.prompt || 'Generate a comprehensive ebook');
      formData.append('doc_type', formValues.doc_type || 'course');
      
      // Add optional files if they exist
      if (taskFile) {
        formData.append('task_file', taskFile);
      }
      
      // Add additional info if provided
      if (formValues.additional_info) {
        formData.append('additional_info', formValues.additional_info);
      }

      // Configure API endpoint using environment variable
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';
      const apiEndpoint = `${API_BASE_URL}/api/v1/load_ebook_data`;

      // Make the request to the API
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Raw API response:", data);

      // Use raw data with minimal document wrapper
      const wrappedData = createDocumentWrapper(data);
      console.log("Wrapped data:", wrappedData);
      
      setReaderResult(wrappedData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching course data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load course data');
      setLoading(false);
    }
  };
  
  // Chat handlers for ContentDisplay component
  const chatHandlers = {
    message,
    isStreaming,
    onMessageChange: setMessage,
    onSendMessage: () => { 
      // TODO: Implement chat functionality
      console.log('Chat functionality not yet implemented');
    },
    onStopStreaming: () => { 
      setIsStreaming(false);
    }
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
      doc_type: 'course',
      additional_info: ''
    });
    setConversation([]);
    setMessage('');
    setIsFirstUserMessage(true);
    setError(null);
    
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
      {/* <DemoHeader 
        title="Ebook & Course Generator"
        description="Generate and edit comprehensive ebook or course content with AI assistance"
      /> */}
      
      <div className="container mx-auto py-6 mt-24 px-4 sm:px-6 lg:px-8">
        {!readerResult ? (
          <div className="max-w-3xl mx-auto mt-8">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Generate Ebook Content</h2>
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
                    placeholder="Enter title (e.g., 'The Professional's Guide to Prompt Engineering')"
                    required
                    className="w-full"
                  />
                </div>
                
                {/* Prompt Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description/Prompt <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Textarea 
                    id="prompt"
                    name="prompt"
                    value={formValues.prompt}
                    onChange={handleInputChange}
                    placeholder="Describe the content you want to generate (e.g., 'Create a comprehensive guide on prompt engineering for business professionals with practical examples and hands-on exercises')"
                    rows={4}
                    className="min-h-[100px] w-full resize-y"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white"
                  >
                    <option value="course">Course</option>
                    <option value="ebook">Ebook</option>
                    <option value="literature_review">Literature Review</option>
                    <option value="essay">Essay</option>
                    <option value="report">Report</option>
                    <option value="guide">Guide</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                {/* Task File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task/Requirements File (optional)
                  </label>
                  <div className="flex flex-col items-center justify-center w-full h-32 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      ref={taskFileRef}
                      id="task_file"
                      name="task_file"
                      type="file"
                      className="hidden"
                      onChange={handleTaskFileChange}
                      accept=".pdf,.doc,.docx,.txt"
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
                        Upload requirements or task description file
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
                      accept=".pdf,.doc,.docx,.txt"
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
                        Upload assessment or grading criteria
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
                    placeholder="Enter any additional context, target audience, learning objectives, or specific requirements"
                    rows={3}
                    className="min-h-[80px] w-full resize-y"
                  />
                </div>
                
                <Button 
                  onClick={fetchEbookData} 
                  className="w-full py-4 sm:py-6 bg-gray-700 hover:bg-gray-800 text-white" 
                  disabled={loading || !formValues.title || !formValues.prompt}
                >
                  {loading && <Loader2Icon className="animate-spin mr-2" />}
                  {loading ? 'Generating Content...' : 'Generate Content'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 sm:mt-16">
            <ContentDisplay
              readerData={readerResult}
              onReset={handleReset}
              documentUrl={url}
              chatHandlers={chatHandlers}
            />
          </div>
        )}
        
        {loading && (
          <div className="mt-6 flex items-center justify-center px-4">
            <Loader2Icon className="animate-spin mr-2" size={24} />
            <span className="text-sm sm:text-base">Generating content... This may take a few moments</span>
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