"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2Icon, FileTextIcon, ZoomInIcon, ZoomOutIcon, RotateCwIcon } from "lucide-react";

interface DocumentViewerProps {
  documentUrl: string | null;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documentUrl }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);

  // Handle zoom controls
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2.0));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setZoom(1);

  // Handle rotation
  const rotateDocument = () => setRotation(prev => (prev + 90) % 360);

  // Handle loading state
  const handleLoad = () => setLoading(false);
  const handleError = () => {
    setLoading(false);
    console.error("Error loading document");
  };

  if (!documentUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <FileTextIcon size={48} className="text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Document Available</h3>
        <p className="text-gray-500">
          The document could not be loaded or is not available for this summary.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Document Viewer Toolbar */}
      <div className="flex items-center justify-between bg-gray-100 p-2 border-b">
        <div className="text-sm font-medium">Document Viewer</div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={zoomOut}
            title="Zoom Out"
          >
            <ZoomOutIcon size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetZoom}
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={zoomIn}
            title="Zoom In"
          >
            <ZoomInIcon size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={rotateDocument}
            title="Rotate"
          >
            <RotateCwIcon size={16} />
          </Button>
        </div>
      </div>

      {/* Document Display Area */}
      <div className="flex-1 overflow-auto bg-gray-200 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <Loader2Icon className="animate-spin mr-2" size={30} />
            <span>Loading document...</span>
          </div>
        )}

        {/* Use iframe for all document types including PDFs */}
        <iframe
          src={documentUrl}
          title={`Document Viewer - ${documentUrl.split('/').pop()}`}
          className="w-full h-full border-0"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
          onLoad={handleLoad}
          onError={handleError}
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default DocumentViewer;
