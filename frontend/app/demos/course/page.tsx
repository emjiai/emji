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

// Interface for reader result data structure - updated for new API format
interface ReaderResult {
  id: string;
  title: string;
  processedDate?: string;
  documentUrl?: string;
  
  // Main content structure from new API
  abstract?: string;
  table_of_contents?: Array<{
    section_title: string;
    sub_sections: Array<{
      title: string;
      content: string;
      deliverables: string[];
    }>;
  }>;
  introduction?: string;
  main_body?: {
    course_title?: string;
    course_number?: string;
    modules?: any[];
  };
  conclusion?: string;
  next_steps?: {
    steps?: any[];
    implementation_plan?: string;
    timeline?: string;
    resources?: string;
    evaluation?: string;
    pilot_testing?: string;
    evaluation_methodology?: string;
  };
  references?: any[];
  markdown_document?: string;
  
  // Document structure for compatibility (required)
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
  
  // Additional features (will be generated later)
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
  mindMap?: {
    title?: string;
    description?: string;
    centralTopic?: string;
    nodes: any[];
    edges: any[];
  };
  flashCards?: {
    id: string;
    front: string;
    back: string;
  }[];
  summary?: {
    overview: string;
    keyPoints: string[];
    insights: string[];
  };
  conversation?: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }[];
  citations?: {
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

export default function CoursePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({
    title: '',
    prompt: '',
    doc_type: 'course',
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

  // Helper function to parse table_of_contents if it's a string
  const parseTableOfContents = (toc: any) => {
    if (Array.isArray(toc)) {
      return toc;
    }
    
    if (typeof toc === 'string') {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(toc);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // If JSON parsing fails, convert string to basic structure
        console.log('Converting string table_of_contents to array structure');
        
        // Split by lines and create basic structure
        const lines = toc.split('\n').filter(line => line.trim() !== '');
        const sections: any[] = [];
        let currentSection: any = null;
        
        lines.forEach(line => {
          const trimmed = line.trim();
          
          // Check if it's a main section (Module X: or starts with number)
          if (trimmed.match(/^(Module \d+:|Section \d+:|\d+\.)/i)) {
            if (currentSection) {
              sections.push(currentSection);
            }
            currentSection = {
              section_title: trimmed.replace(/^(Module \d+:|Section \d+:|\d+\.)\s*/i, ''),
              sub_sections: []
            };
          } 
          // Check if it's a sub-section (indented or with sub-numbering)
          else if (trimmed.match(/^\s+\d+\.\d+:|\s+[-*]/) || trimmed.startsWith('  ')) {
            if (currentSection) {
              currentSection.sub_sections.push({
                title: trimmed.replace(/^\s+\d+\.\d+:\s*|\s+[-*]\s*|\s+/g, ''),
                content: '',
                deliverables: []
              });
            }
          }
          // If no current section, create a default one
          else if (!currentSection && trimmed.length > 0) {
            currentSection = {
              section_title: trimmed,
              sub_sections: []
            };
          }
        });
        
        // Don't forget the last section
        if (currentSection) {
          sections.push(currentSection);
        }
        
        return sections.length > 0 ? sections : [{
          section_title: 'Course Content',
          sub_sections: [{
            title: 'Main Content',
            content: toc,
            deliverables: []
          }]
        }];
      }
    }
    
    // Default fallback
    return [{
      section_title: 'Course Content',
      sub_sections: [{
        title: 'Main Content',
        content: 'Content structure needs to be defined',
        deliverables: []
      }]
    }];
  };

  // Function to ensure the data structure matches expected types
  const ensureValidReaderData = (data: any): ReaderResult => {
    // Process the table of contents
    const processedToc = parseTableOfContents(data.table_of_contents);

    // Ensure document is always present
    const document = {
      title: data.title || formValues.title || 'Generated Course',
      content: data, // Pass the entire API response as content
      pages: 1, // Single page document
      fileType: 'course',
      fileSize: 'N/A',
      author: 'AI Generated',
      type: 'course',
      currentPage: 1,
      keyTopics: processedToc.map((section: any) => section.section_title).filter(Boolean)
    };

    return {
      id: data.id || 'generated-course',
      title: data.title || formValues.title || 'Generated Course',
      processedDate: new Date().toISOString(),
      
      // Main content from new API structure with processed table of contents
      abstract: data.abstract || '',
      table_of_contents: processedToc,
      introduction: data.introduction || '',
      main_body: data.main_body || {},
      conclusion: data.conclusion || '',
      next_steps: data.next_steps || {},
      references: data.references || [],
      markdown_document: data.markdown_document || '',
      
      // Required document wrapper
      document,
      
      // Initialize other structures
      summary: data.summary || {
        overview: data.abstract || data.introduction || 'Course overview not available',
        keyPoints: processedToc.map((section: any) => section.section_title).filter(Boolean),
        insights: []
      },
      conversation: [],
      citations: [],
      mindMap: { nodes: [], edges: [] },
      flashCards: [],
      postItNotes: { title: '', description: '', notes: [] },
      infographics: {},
      podcast: {}
    };
  };

  // Function to fetch course data from API
  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create form data for submission
      const formData = new FormData();
      
      // Add required form fields
      formData.append('clerk_id', 'demo_user'); // Using a demo user ID
      formData.append('title', formValues.title || 'Default Course Title');
      formData.append('prompt', formValues.prompt || 'Generate a comprehensive course');
      formData.append('doc_type', formValues.doc_type || 'course');
      
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
      const apiEndpoint = `${API_BASE_URL}/api/v1/load_course_data`;

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

      // Transform and validate the API response
      const transformedData = ensureValidReaderData(data);
      console.log("Transformed data:", transformedData);
      
      setReaderResult(transformedData);
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
      <DemoHeader 
        title="Course Generator"
        description="Generate and edit comprehensive course content with AI assistance"
      />
      
      <div className="container mx-auto py-6 mt-24 px-4 sm:px-6 lg:px-8">
        {!readerResult ? (
          <div className="max-w-3xl mx-auto mt-8">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold">Generate Course Content</h2>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                {/* Title Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Title <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input 
                    id="title"
                    name="title"
                    value={formValues.title}
                    onChange={handleInputChange}
                    placeholder="Enter course title (e.g., 'Generative AI for Everyone')"
                    required
                    className="w-full"
                  />
                </div>
                
                {/* Prompt Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Description/Prompt <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Textarea 
                    id="prompt"
                    name="prompt"
                    value={formValues.prompt}
                    onChange={handleInputChange}
                    placeholder="Describe the course content you want to generate (e.g., 'Create a comprehensive course on generative AI for business professionals with practical examples and hands-on exercises')"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="course">Course</option>
                    <option value="literature_review">Literature Review</option>
                    <option value="essay">Essay</option>
                    <option value="report">Report</option>
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
                  onClick={fetchCourseData} 
                  className="w-full py-4 sm:py-6" 
                  disabled={loading || !formValues.title || !formValues.prompt}
                >
                  {loading && <Loader2Icon className="animate-spin mr-2" />}
                  {loading ? 'Generating Course...' : 'Generate Course Content'}
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
            <span className="text-sm sm:text-base">Generating course content...</span>
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

// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Loader2Icon } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import DemoHeader from '../_components/DemoHeader';
// import ContentDisplay from './_components/ContentDisplay';
// import readerData from '../_data/reader-data.json';
// import { demoDocumentTemplate } from '../_data/DemoTemplates';
// import { Label } from '@/components/ui/label';
// import { Select } from '@/components/ui/select';

// // Interface for reader result data structure
// interface ReaderResult {
//   id: string;
//   title: string;
//   processedDate?: string;
//   documentUrl?: string;
//   document: {
//     title: string;
//     author?: string;
//     type?: string;
//     pages: number;
//     url?: string;
//     datePublished?: string;
//     currentPage?: number;
//     thumbnailUrl?: string;
//     keyTopics?: string[];
//     fileType: string;
//     fileSize: string;
//     content: string;
//   };
//   insights?: {
//     id: string;
//     title: string;
//     content: string;
//     pageReference: number;
//     relevance: string;
//   }[];
//   chat?: {
//     messages: {
//       id: string;
//       role: string;
//       content: string;
//       timestamp?: string;
//       citations?: {
//         pageNumber: number;
//         text: string;
//       }[];
//     }[];
//     newMessage?: {
//       placeholder: string;
//     };
//   };
//   annotations?: {
//     id: string;
//     type: string;
//     color: string;
//     pageNumber: number;
//     position: {
//       x: number;
//       y: number;
//       width: number;
//       height: number;
//     };
//     text: string;
//     content?: string;
//     note?: string;
//   }[];
//   documentControls?: {
//     maxZoom: number;
//     minZoom: number;
//     pageCount: number;
//     currentPage: number;
//     viewMode: string;
//     showAnnotations: boolean;
//   };
//   mindMap: {
//     title?: string;
//     description?: string;
//     centralTopic?: string;
//     nodes: any[];
//     edges: any[];
//   };
//   flashCards: {
//     id: string;
//     front: string;
//     back: string;
//   }[];
//   summary: {
//     overview: string;
//     keyPoints: string[];
//     insights: string[];
//   };
//   conversation: {
//     role: 'user' | 'assistant';
//     content: string;
//     timestamp: string;
//   }[];
//   citations: {
//     text: string;
//     page: number;
//     relevance: string;
//   }[];
//   postItNotes?: {
//     title: string;
//     description: string;
//     notes: any[];
//   };
//   infographics?: {
//     title?: string;
//     description?: string;
//     infographic?: any;
//     theme?: string | object;
//     layout?: string | object;
//     components?: any[];
//     metrics?: any[];
//     annotations?: any[];
//   };
//   podcast?: {
//     title?: string;
//     description?: string;
//     fullVideoUrl?: string;
//     podcast?: any;
//     episodes?: any[];
//   };
// }

// interface Message {
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: string;
//   isStreaming?: boolean;
// }

// export default function CoursePage() {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [formValues, setFormValues] = useState<Record<string, any>>({
//     title: '',
//     prompt: '',
//     doc_type: 'course',
//     additional_info: ''
//   });
//   const [readerResult, setReaderResult] = useState<ReaderResult | null>(null);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [taskFile, setTaskFile] = useState<File | null>(null);
//   const [markingCriteriaFile, setMarkingCriteriaFile] = useState<File | null>(null);
//   const [useTestData, setUseTestData] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const taskFileRef = useRef<HTMLInputElement>(null);
//   const markingCriteriaFileRef = useRef<HTMLInputElement>(null);
//   const [url, setUrl] = useState('');
//   const [context, setContext] = useState('');

//   // Chat-related state
//   const [conversation, setConversation] = useState<Message[]>([]);
//   const [message, setMessage] = useState('');
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
//   const abortControllerRef = useRef<AbortController | null>(null);
//   const [isFirstUserMessage, setIsFirstUserMessage] = useState(true);

//   // Function to fetch literature review data
//   const fetchCourseData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Create form data for submission
//       const formData = new FormData();
      
//       // Add required form fields
//       formData.append('clerk_id', 'demo_user'); // Using a demo user ID
//       formData.append('title', formValues.title || 'Default Title');
//       formData.append('prompt', formValues.prompt || 'Generate a course');
//       formData.append('doc_type', formValues.doc_type || 'course');
      
//       // Add optional files if they exist
//       if (taskFile) {
//         formData.append('task_file', taskFile);
//       }
      
//       if (markingCriteriaFile) {
//         formData.append('marking_criteria_file', markingCriteriaFile);
//       }
      
//       // Add additional info if provided
//       if (formValues.additional_info) {
//         formData.append('additional_info', formValues.additional_info);
//       }

//       // Configure API endpoint using environment variable
//       const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
//       const apiEndpoint = `${API_BASE_URL}/api/v1/load_course_data`;

//       // Make the request to the API
//       const response = await fetch(apiEndpoint, {
//         method: 'POST',
//         // Don't set Content-Type header when using FormData, the browser sets it automatically
//         // with the correct boundary
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error(`Error: ${response.status} ${response.statusText}`);
//       }

//       const data = await response.json();

//       console.log("Data from API:", data)

//       setReaderResult(data);
//       setLoading(false);
//     } catch (err) {
//       console.error('Error fetching literature data:', err);
//       setError(err instanceof Error ? err.message : 'Failed to load literature data');
//       setLoading(false);
//     }
//   };
  
//   // Chat handlers for ContentDisplay component
//   const chatHandlers = {
//     message,
//     isStreaming,
//     onMessageChange: setMessage,
//     onSendMessage: () => { /* Handle sending message */ },
//     onStopStreaming: () => { /* Handle stop streaming */ }
//   };

//   // Handle form input changes
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormValues(prev => ({ ...prev, [name]: value }));
//   };

//   // Handle file selection
//   const handleTaskFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setTaskFile(e.target.files[0]);
//     }
//   };

//   const handleMarkingCriteriaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setMarkingCriteriaFile(e.target.files[0]);
//     }
//   };

//   // Handle reset function
//   const handleReset = () => {
//     setReaderResult(null);
//     setSelectedFile(null);
//     setTaskFile(null);
//     setMarkingCriteriaFile(null);
//     setFormValues({
//       title: '',
//       prompt: '',
//       doc_type: 'course',
//       additional_info: ''
//     });
//     setConversation([]);
//     setMessage('');
//     setIsFirstUserMessage(true);
    
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//     if (taskFileRef.current) {
//       taskFileRef.current.value = '';
//     }
//     if (markingCriteriaFileRef.current) {
//       markingCriteriaFileRef.current.value = '';
//     }
//   };

//   return (
//     <>
//       <DemoHeader 
//         title="Literature Review Editor"
//         description="Edit and view a structured literature review document in real-time"
//       />
      
//       <div className="container mx-auto py-6 mt-24 px-4 sm:px-6 lg:px-8">
//         {!readerResult ? (
//           <div className="max-w-3xl mx-auto mt-8">
//             <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
//               <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
//                 <h2 className="text-xl font-semibold">Generate Document</h2>
//               </div>
              
//               <div className="space-y-4 sm:space-y-6">
//                 {/* Title Field */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Title <span className="text-red-500 ml-1">*</span>
//                   </label>
//                   <Input 
//                     id="title"
//                     name="title"
//                     value={formValues.title}
//                     onChange={handleInputChange}
//                     placeholder="Enter document title"
//                     required
//                     className="w-full"
//                   />
//                 </div>
                
//                 {/* Prompt Field */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Prompt <span className="text-red-500 ml-1">*</span>
//                   </label>
//                   <Textarea 
//                     id="prompt"
//                     name="prompt"
//                     value={formValues.prompt}
//                     onChange={handleInputChange}
//                     placeholder="Enter your prompt for the document generation"
//                     rows={3}
//                     className="min-h-[80px] w-full resize-y"
//                     required
//                   />
//                 </div>
                
//                 {/* Document Type Field */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Document Type <span className="text-red-500 ml-1">*</span>
//                   </label>
//                   <select
//                     id="doc_type"
//                     name="doc_type"
//                     value={formValues.doc_type}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
//                   >
//                     <option value="literature_review">Literature Review</option>
//                     <option value="essay">Essay</option>
//                     <option value="report">Report</option>
//                     <option value="other">Other</option>
//                   </select>
//                 </div>
                
//                 {/* Task File Upload */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Task File (optional)
//                   </label>
//                   <div className="flex flex-col items-center justify-center w-full h-32 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
//                     <input
//                       ref={taskFileRef}
//                       id="task_file"
//                       name="task_file"
//                       type="file"
//                       className="hidden"
//                       onChange={handleTaskFileChange}
//                     />
//                     <Button 
//                       onClick={() => taskFileRef.current?.click()}
//                       variant="outline"
//                       className="mb-2"
//                       size="sm"
//                     >
//                       Choose File
//                     </Button>
//                     {taskFile ? (
//                       <p className="text-sm text-gray-600 text-center px-2 break-all">{taskFile.name}</p>
//                     ) : (
//                       <p className="text-sm text-gray-500 text-center px-2">
//                         Upload a task file (optional)
//                       </p>
//                     )}
//                   </div>
//                 </div>
                
//                 {/* Marking Criteria File Upload */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Marking Criteria File (optional)
//                   </label>
//                   <div className="flex flex-col items-center justify-center w-full h-32 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
//                     <input
//                       ref={markingCriteriaFileRef}
//                       id="marking_criteria_file"
//                       name="marking_criteria_file"
//                       type="file"
//                       className="hidden"
//                       onChange={handleMarkingCriteriaFileChange}
//                     />
//                     <Button 
//                       onClick={() => markingCriteriaFileRef.current?.click()}
//                       variant="outline"
//                       className="mb-2"
//                       size="sm"
//                     >
//                       Choose File
//                     </Button>
//                     {markingCriteriaFile ? (
//                       <p className="text-sm text-gray-600 text-center px-2 break-all">{markingCriteriaFile.name}</p>
//                     ) : (
//                       <p className="text-sm text-gray-500 text-center px-2">
//                         Upload a marking criteria file (optional)
//                       </p>
//                     )}
//                   </div>
//                 </div>
                
//                 {/* Additional Information Field */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Additional Information (optional)
//                   </label>
//                   <Textarea 
//                     id="additional_info"
//                     name="additional_info"
//                     value={formValues.additional_info}
//                     onChange={handleInputChange}
//                     placeholder="Enter any additional information or context"
//                     rows={2}
//                     className="min-h-[80px] w-full resize-y"
//                   />
//                 </div>
                
//                 <Button 
//                   onClick={fetchCourseData} 
//                   className="w-full py-4 sm:py-6" 
//                   disabled={loading}
//                 >
//                   {loading && <Loader2Icon className="animate-spin mr-2" />}
//                   Generate & Load Course
//                 </Button>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="mt-8 sm:mt-16">
//             <ContentDisplay
//               readerData={{
//                 ...readerResult,
//                 conversation: conversation
//               }}
//               onReset={handleReset}
//               documentUrl={url}
//               chatHandlers={chatHandlers}
//             />
//           </div>
//         )}
        
//         {loading && (
//           <div className="mt-6 flex items-center justify-center px-4">
//             <Loader2Icon className="animate-spin mr-2" size={24} />
//             <span className="text-sm sm:text-base">Generating course...</span>
//           </div>
//         )}
        
//         {error && (
//           <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg max-w-3xl mx-auto text-sm sm:text-base">
//             {error}
//           </div>
//         )}
//       </div>
//     </>
//   );
// }
