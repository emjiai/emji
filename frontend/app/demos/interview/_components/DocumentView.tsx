"use client";
import React, { useState, useRef } from 'react';
import { Loader2, FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentViewProps {
  url?: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  content?: string;
}

const DocumentView: React.FC<DocumentViewProps> = ({
  url,
  currentPage,
  totalPages,
  onPageChange,
  content,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  
  // Only use the URL if provided, no fallback
  const pdfUrl = url || "";

  // Handle loading state
  const handleLoad = () => {
    setLoading(false);
    console.log('Document loaded successfully');
  };

  // Handle errors
  const handleError = () => {
    setLoading(false);
    setError('Failed to load document. Please check if the file exists and is accessible.');
    console.error('Error loading document:', pdfUrl);
  };

  // Open in new tab
  const openInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Upload size={48} className="text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Document Uploaded Yet</h3>
        <p className="text-gray-500">
          Please upload a document or provide a URL to start the interview process.
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={viewerRef}
      className="flex flex-col h-full"
    >
      {/* Document Display Area */}
      <div className="flex-1 overflow-auto bg-gray-200 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <Loader2 className="animate-spin mr-2" size={30} />
            <span>Loading document...</span>
          </div>
        )}

        {error ? (
          <div className="flex items-center justify-center h-full flex-col p-4">
            <div className="text-red-500 mb-2">⚠️ {error}</div>
            <div className="text-gray-500 text-sm">PDF: {pdfUrl}</div>
            <Button 
              onClick={openInNewTab}
              className="mt-4"
              variant="outline"
            >
              Open in New Tab
            </Button>
          </div>
        ) : (
          <iframe
            src={`${pdfUrl}#page=${currentPage}`}
            title="Document Viewer"
            className="w-full h-full border-0"
            onLoad={handleLoad}
            onError={handleError}
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
};

export default DocumentView;