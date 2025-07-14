"use client";
import React, { useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { FullScreen } from "@/components/ui/full-screen";
import ChatTextArea from "@/components/chatbot/ChatTextArea";

// Import display components
import DocumentViewer from './DocumentViewer';
import SummaryContent from './SummaryContent';

// Define the display type as a TypeScript type for reuse
export type SummaryDisplayType = 'summary' | 'map' | 'key concepts' | 'notes';

// Component props interface
interface SummarizerDisplayProps {
  apiResponseData?: any; // The API response data containing document URL and summary content
  documentUrl?: string | null; // URL to the document being summarized
  summaryData?: any; // The summary data to display
  loading?: boolean; // Whether the data is loading
  defaultTab?: SummaryDisplayType; // Default tab to display
}

const SummarizerDisplay: React.FC<SummarizerDisplayProps> = ({ 
  apiResponseData,
  documentUrl = null,
  summaryData = null,
  loading = false,
  defaultTab = 'summary'
}) => {
  // Extract document URL and summary data from API response if not provided directly
  const docUrl = documentUrl || (apiResponseData?.documentUrl || apiResponseData?.source_url || null);
  const summData = summaryData || (apiResponseData?.content || null);
  
  // State to track if document is loading
  const [docLoading, setDocLoading] = useState<boolean>(loading);
  // State to track chat messages
  const [messages, setMessages] = useState<Array<{text: string, sender: 'user' | 'ai'}>>([]);
  // State to track if the AI is responding
  const [isAiResponding, setIsAiResponding] = useState<boolean>(false);

  // Log values for debugging
  console.log("SummarizerDisplay - documentUrl:", documentUrl);
  console.log("SummarizerDisplay - docUrl (computed):", docUrl);
  console.log("SummarizerDisplay - summaryData:", summaryData);

  // Handle sending a new message
  const handleSendMessage = async (message: string) => {
    // Add user message to chat
    setMessages(prev => [...prev, { text: message, sender: 'user' }]);
    
    // Set AI as responding
    setIsAiResponding(true);
    
    try {
      // Placeholder for API call to backend
      // TODO: Replace with actual API call
      console.log("Sending message to API:", message);
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add AI response to chat
      setMessages(prev => [
        ...prev, 
        { 
          text: `This is a placeholder response to: "${message}"`, 
          sender: 'ai' 
        }
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message to chat
      setMessages(prev => [
        ...prev, 
        { 
          text: "Sorry, there was an error processing your request.", 
          sender: 'ai' 
        }
      ]);
    } finally {
      // Set AI as no longer responding
      setIsAiResponding(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    console.log("File uploaded:", file.name);
    
    // Placeholder for file upload API call
    // TODO: Replace with actual API implementation
    
    // Add file upload message to chat
    setMessages(prev => [
      ...prev, 
      { 
        text: `Uploaded file: ${file.name}`, 
        sender: 'user' 
      }
    ]);
    
    // Simulate processing
    setIsAiResponding(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Add AI response
    setMessages(prev => [
      ...prev, 
      { 
        text: `I've received your file "${file.name}" and analyzed its contents.`, 
        sender: 'ai' 
      }
    ]);
    
    setIsAiResponding(false);
  };

  return (
    <FullScreen buttonPosition="absolute right-4 top-4 z-10">
      <div className="bg-white border rounded-lg shadow-md p-4 h-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Document Summary</h1>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2Icon className="animate-spin mr-2" size={40} />
            <span>Processing document...</span>
          </div>
        ) : docUrl || summData ? (
          // Content Display - Side by side layout as in the image
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Document Viewer on the left */}
            <div className="border rounded-md bg-gray-50 overflow-hidden min-h-[600px] flex flex-col">
              {docLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2Icon className="animate-spin mr-2" size={40} />
                  <span>Loading document...</span>
                </div>
              ) : docUrl ? (
                <DocumentViewer documentUrl={docUrl} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No document available to display</p>
                </div>
              )}
            </div>
            
            {/* Summary Content with Tabs on the right */}
            <div className="border rounded-md bg-white overflow-hidden min-h-[600px] flex flex-col">
              <div className="flex-1 overflow-auto">
                <SummaryContent summaryData={summData} />
              </div>
              
              {/* Chat interface at the bottom of summary panel */}
              <div className="border-t mt-4 pt-2">
                {/* Display messages if there are any */}
                {messages.length > 0 && (
                  <div className="max-h-40 overflow-y-auto px-3 py-2 bg-gray-50 mb-2 rounded">
                    {messages.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`mb-2 ${
                          msg.sender === 'user' 
                            ? 'text-right text-blue-600' 
                            : 'text-left text-gray-700'
                        }`}
                      >
                        <div 
                          className={`inline-block p-2 rounded-lg ${
                            msg.sender === 'user' 
                              ? 'bg-blue-50 text-blue-800' 
                              : 'bg-gray-100'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Chat text area for user input */}
                <ChatTextArea
                  onSendMessage={handleSendMessage}
                  onUploadFile={handleFileUpload}
                  placeholder="Ask questions about this document..."
                  disabled={isAiResponding}
                />
              </div>
            </div>
          </div>
        ) : (
          // Empty state when no data is available
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
            <div className="text-center">
              <p className="text-gray-500 mb-2">No document summary available</p>
              <p className="text-sm text-gray-400">Upload a document or provide a URL to generate a summary</p>
            </div>
          </div>
        )}
      </div>
    </FullScreen>
  );
};

export default SummarizerDisplay;