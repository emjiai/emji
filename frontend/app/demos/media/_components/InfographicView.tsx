"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ChevronRight, Cloud } from "lucide-react";
import StatsGrid from "./visualizations/StatsGrid";
import BarChart from "./visualizations/BarChart";
import PieChart from "./visualizations/PieChart";
import ComparisonChart from "./visualizations/ComparisonChart";
import NetworkDiagram from "./visualizations/NetworkDiagram";
import SlideVisualization from "./visualizations/SlideVisualization";
import InfographicVisualization from "./visualizations/InfographicVisualization";
import Map from "./visualizations/Map";
import FullScreen from "@/components/ui/full-screen";

interface Html2CanvasOptions {
  backgroundColor?: string;
  scale?: number;
  useCORS?: boolean;
  allowTaint?: boolean;
  logging?: boolean;
  removeContainer?: boolean;
  letterRendering?: boolean;
  foreignObjectRendering?: boolean;
  imageTimeout?: number;
  onclone?: (clonedDoc: Document) => void;
}

interface InfographicItem {
  id: string;
  title: string;
  type: string;
  episodeId?: string;
  slideId?: string;
  episodeTitle?: string;
  data: any[];
  layout?: string;
  backgroundStyle?: string;
  animationType?: string;
  visualContent: any;
  hasExistingVisualUrl?: boolean;
}

interface InfographicViewProps {
  infographics: InfographicItem[];
  onUpdateJson?: (episodeId: string, slideId: string, awsUrl: string) => void;
}

export default function InfographicView({ infographics, onUpdateJson }: InfographicViewProps) {
  const [selectedInfographic, setSelectedInfographic] = useState<InfographicItem | null>(
    infographics.length > 0 ? infographics[0] : null
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const infographicRef = useRef<HTMLDivElement>(null);

  const infographicsPerPage = 5;
  const totalPages = Math.ceil(infographics.length / infographicsPerPage);

  // Navigation functions for main view
  const goToPrevious = useCallback(() => {
    if (!selectedInfographic || infographics.length === 0) return;
    
    const currentIndex = infographics.findIndex(item => item.id === selectedInfographic.id);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : infographics.length - 1;
    setSelectedInfographic(infographics[previousIndex]);
  }, [selectedInfographic, infographics]);

  const goToNext = useCallback(() => {
    if (!selectedInfographic || infographics.length === 0) return;
    
    const currentIndex = infographics.findIndex(item => item.id === selectedInfographic.id);
    const nextIndex = currentIndex < infographics.length - 1 ? currentIndex + 1 : 0;
    setSelectedInfographic(infographics[nextIndex]);
  }, [selectedInfographic, infographics]);

  // Function to extract actual data from nested visualContent structure
  const extractActualData = (infographic: InfographicItem): any[] => {
    console.log('Extracting data from infographic:', infographic);
    
    let actualData = infographic.data || [];
    
    // Check if data exists in visualContent structure
    if (infographic.visualContent?.content) {
      const content = infographic.visualContent.content;
      
      // Try different possible data locations based on your JSON structure
      if (content.keyStats && Array.isArray(content.keyStats)) {
        actualData = content.keyStats;
      } else if (content.data && Array.isArray(content.data)) {
        actualData = content.data;
      } else if (content.steps && Array.isArray(content.steps)) {
        actualData = content.steps;
      } else if (content.nodes && Array.isArray(content.nodes)) {
        actualData = content.nodes;
      } else if (content.points && Array.isArray(content.points)) {
        actualData = content.points;
      } else if (content.points1 && Array.isArray(content.points1)) {
        // For feature-comparison layout, combine points1 and points2
        const points1 = content.points1.map((p: any) => ({ ...p, category: 'capabilities' }));
        const points2 = content.points2 ? content.points2.map((p: any) => ({ ...p, category: 'limitations' })) : [];
        actualData = [...points1, ...points2];
      } else if (content.crimeSpots && Array.isArray(content.crimeSpots)) {
        // Handle map data
        actualData = content.crimeSpots;
      } else if (content.spots && Array.isArray(content.spots)) {
        // Handle map data alternative format
        actualData = content.spots;
      } else if (content.locations && Array.isArray(content.locations)) {
        // Handle map data alternative format
        actualData = content.locations;
      }
    }
    
    console.log('Extracted actual data:', actualData);
    return actualData;
  };

  // Function to prepare element for canvas rendering
  const prepareForCanvas = (element: HTMLElement) => {
    // Hide SVG icons and show emoji fallbacks
    const svgIcons = element.querySelectorAll('.canvas-fallback-hide');
    const emojiIcons = element.querySelectorAll('.canvas-fallback-show');
    
    svgIcons.forEach(icon => {
      (icon as HTMLElement).style.display = 'none';
    });
    
    emojiIcons.forEach(icon => {
      (icon as HTMLElement).style.display = 'block';
    });
  };

  // Function to restore element after canvas rendering
  const restoreAfterCanvas = (element: HTMLElement) => {
    // Restore SVG icons and hide emoji fallbacks
    const svgIcons = element.querySelectorAll('.canvas-fallback-hide');
    const emojiIcons = element.querySelectorAll('.canvas-fallback-show');
    
    svgIcons.forEach(icon => {
      (icon as HTMLElement).style.display = '';
    });
    
    emojiIcons.forEach(icon => {
      (icon as HTMLElement).style.display = 'none';
    });
  };

  const handleSaveToAWS = useCallback(async () => {
    if (!selectedInfographic || !infographicRef.current) {
      console.error("No infographic selected or ref not available");
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      // Prepare element for canvas rendering
      prepareForCanvas(infographicRef.current);
      
      // Import html2canvas dynamically
      const html2canvas = await import('html2canvas');
      
      // Convert the infographic to canvas with improved settings
      const canvas = await html2canvas.default(infographicRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        removeContainer: true,
        letterRendering: true,
        foreignObjectRendering: false,
        imageTimeout: 15000,
        onclone: function(clonedDoc) {
          // Ensure consistent rendering and fix text positioning
          const style = clonedDoc.createElement('style');
          style.textContent = `
            .canvas-fallback-hide {
              display: none !important;
            }
            .canvas-fallback-show {
              display: block !important;
            }
            /* Fix text positioning for canvas */
            h1, h2, h3, h4, h5, h6 {
              line-height: 1.2 !important;
              margin-top: 0 !important;
            }
            .text-center {
              text-align: center !important;
            }
            .mb-6 {
              margin-bottom: 24px !important;
            }
            .mb-4 {
              margin-bottom: 16px !important;
            }
            .mb-2 {
              margin-bottom: 8px !important;
            }
            .mb-1 {
              margin-bottom: 4px !important;
            }
            .mt-1 {
              margin-top: 4px !important;
            }
            .mt-2 {
              margin-top: 8px !important;
            }
            /* Ensure consistent box sizing */
            * {
              box-sizing: border-box !important;
            }
            /* Fix flex alignment */
            .flex {
              display: flex !important;
            }
            .justify-center {
              justify-content: center !important;
            }
            .items-center {
              align-items: center !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      } as Html2CanvasOptions);
      
      // Restore element after canvas rendering
      restoreAfterCanvas(infographicRef.current);
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to convert canvas to blob"));
          }
        }, 'image/png', 0.9);
      });

      // Prepare form data for upload
      const formData = new FormData();
      formData.append('file', blob, `${selectedInfographic.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`);
      formData.append('slide_id', selectedInfographic.slideId || 'unknown_slide');
      formData.append('episode_id', selectedInfographic.episodeId || 'unknown_episode');
      formData.append('infographic_title', selectedInfographic.title || 'Untitled Infographic');

      // Configure API endpoint using environment variable
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const apiEndpoint = `${API_BASE_URL}/api/v1/upload_infographic_image`;

      // Make the request to the API (now handles both upload AND save)
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data?.aws_url) {
        console.log("Infographic uploaded and saved successfully:", result.data.aws_url);
        console.log("JSON automatically updated:", result.data.json_updated);
        console.log("Backup created:", result.data.backup_created);
        
        // Update the local state (the JSON was already saved by the backend)
        if (onUpdateJson && selectedInfographic.episodeId && selectedInfographic.slideId) {
          onUpdateJson(selectedInfographic.episodeId, selectedInfographic.slideId, result.data.aws_url);
        }
        
        setSaveStatus('success');
        
        // Reset status after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error("Invalid response from server");
      }

    } catch (error) {
      console.error("Error saving infographic to AWS:", error);
      
      // Restore element in case of error
      if (infographicRef.current) {
        restoreAfterCanvas(infographicRef.current);
      }
      
      setSaveStatus('error');
      
      // Reset status after 5 seconds
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setIsSaving(false);
    }
  }, [selectedInfographic, onUpdateJson]);

  const handleDownload = useCallback(async () => {
    if (!selectedInfographic || !infographicRef.current) return;

    try {
      // Prepare element for canvas rendering
      prepareForCanvas(infographicRef.current);
      
      // Import html2canvas dynamically
      const html2canvas = await import('html2canvas');
      const canvas = await html2canvas.default(infographicRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        letterRendering: true,
        foreignObjectRendering: false,
        onclone: function(clonedDoc) {
          // Ensure consistent rendering and fix text positioning
          const style = clonedDoc.createElement('style');
          style.textContent = `
            .canvas-fallback-hide {
              display: none !important;
            }
            .canvas-fallback-show {
              display: block !important;
            }
            /* Fix text positioning for canvas */
            h1, h2, h3, h4, h5, h6 {
              line-height: 1.2 !important;
              margin-top: 0 !important;
            }
            .text-center {
              text-align: center !important;
            }
            .mb-6 {
              margin-bottom: 24px !important;
            }
            .mb-4 {
              margin-bottom: 16px !important;
            }
            .mb-2 {
              margin-bottom: 8px !important;
            }
            .mb-1 {
              margin-bottom: 4px !important;
            }
            .mt-1 {
              margin-top: 4px !important;
            }
            .mt-2 {
              margin-top: 8px !important;
            }
            /* Ensure consistent box sizing */
            * {
              box-sizing: border-box !important;
            }
            /* Fix flex alignment */
            .flex {
              display: flex !important;
            }
            .justify-center {
              justify-content: center !important;
            }
            .items-center {
              align-items: center !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      } as Html2CanvasOptions);
      
      // Restore element after canvas rendering
      restoreAfterCanvas(infographicRef.current);
      
      const link = document.createElement('a');
      link.download = `${selectedInfographic.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Error downloading infographic:", error);
      
      // Restore element in case of error
      if (infographicRef.current) {
        restoreAfterCanvas(infographicRef.current);
      }
      
      // Fallback: try to download as HTML
      const element = infographicRef.current;
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${selectedInfographic.title}</title>
          <style>
            body { margin: 20px; }
            .infographic { padding: 20px; border: 1px solid #ccc; }
          </style>
        </head>
        <body>
          <div class="infographic">
            ${element.innerHTML}
          </div>
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedInfographic.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [selectedInfographic]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const currentInfographics = infographics.slice(
    currentPage * infographicsPerPage,
    (currentPage + 1) * infographicsPerPage
  );

  const renderInfographic = (infographic: InfographicItem) => {
    console.log('Rendering infographic:', infographic);
    
    const { type, data, layout, visualContent } = infographic;
    
    // Use the data that was already extracted by your mediaExtractors
    let actualData = data || [];
    
    console.log('Rendering with data:', actualData);
    console.log('Type:', type, 'Layout:', layout);
    
    // If no data and we have visualContent, try one more extraction
    if ((!actualData || actualData.length === 0) && visualContent?.content) {
      const content = visualContent.content;
      if (content.features && Array.isArray(content.features)) {
        // Handle features data for infographics
        actualData = content.features;
      } else if (content.keyStats && Array.isArray(content.keyStats)) {
        actualData = content.keyStats;
      } else if (content.steps && Array.isArray(content.steps)) {
        actualData = content.steps;
      } else if (content.points1 && Array.isArray(content.points1)) {
        actualData = content.points1;
      } else if (content.data && Array.isArray(content.data)) {
        actualData = content.data;
      } else if (content.crimeSpots && Array.isArray(content.crimeSpots)) {
        actualData = content.crimeSpots;
      } else if (content.spots && Array.isArray(content.spots)) {
        actualData = content.spots;
      } else if (content.locations && Array.isArray(content.locations)) {
        actualData = content.locations;
      }
    }
    
    // If still no data, show a message
    if (!actualData || actualData.length === 0) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-500 border rounded-lg">
          <div className="text-center">
            <p>No data available for visualization</p>
            <p className="text-xs mt-1">Type: {type}, Layout: {layout}</p>
            <p className="text-xs">Data length: {data?.length || 0}</p>
            <p className="text-xs">Has features: {!!(visualContent?.content?.features)}</p>
          </div>
        </div>
      );
    }
  
    switch (type) {
      case 'slide':
        return <SlideVisualization data={actualData} visualContent={visualContent} />;
        
      case 'map':
        return <Map data={actualData} visualContent={visualContent} />;
        
      case 'infographic':
        // Use the new InfographicVisualization component for infographics
        return <InfographicVisualization data={actualData} visualContent={visualContent} />;
        
      case 'stats-grid':
        return <StatsGrid data={actualData} layout={layout} visualContent={visualContent} />;
        
      case 'chart':
        // Check chartType from visualContent
        const chartType = visualContent?.content?.chartType || visualContent?.chartType;
        if (chartType === 'bar') {
          return <BarChart data={actualData} visualContent={visualContent} />;
        } else if (chartType === 'pie') {
          return <PieChart data={actualData} visualContent={visualContent} />;
        }
        return <BarChart data={actualData} visualContent={visualContent} />;
        
      case 'bar':
        return <BarChart data={actualData} visualContent={visualContent} />;
        
      case 'pie':
        return <PieChart data={actualData} visualContent={visualContent} />;
        
      case 'comparison':
        return <ComparisonChart data={actualData} visualContent={visualContent} />;
        
      case 'network-diagram':
        return <NetworkDiagram data={actualData} visualContent={visualContent} />;
        
      default:
        console.log('Using default StatsGrid for type:', type);
        return <StatsGrid data={actualData} layout={layout} visualContent={visualContent} />;
    }
  };

  if (infographics.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg">
        <p className="text-gray-500">No visualizations available</p>
      </div>
    );
  }

  // Get current index for navigation display
  const getCurrentIndex = () => {
    if (!selectedInfographic) return 0;
    return infographics.findIndex(item => item.id === selectedInfographic.id) + 1;
  };

  return (
    <div className="space-y-6">
      {/* Main infographic view */}
      {selectedInfographic && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">{selectedInfographic.title}</h3>
              <div className="flex flex-col mt-1 text-xs text-gray-500 space-y-0.5">
                {selectedInfographic.episodeTitle && (
                  <span>Episode: {selectedInfographic.episodeTitle}</span>
                )}
                {selectedInfographic.slideId && (
                  <span>Slide ID: {selectedInfographic.slideId}</span>
                )}
                <span className="capitalize">Type: {selectedInfographic.type}</span>
                {selectedInfographic.visualContent?.content?.layout && (
                  <span>Layout: {selectedInfographic.visualContent.content.layout}</span>
                )}
                {selectedInfographic.hasExistingVisualUrl && (
                  <span className="text-green-600">✓ Has existing visual URL</span>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveToAWS}
                disabled={isSaving}
                className="flex items-center space-x-1 text-green-600 border-green-200 hover:bg-green-50"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full mr-1" />
                    <span>Uploading & Saving...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="h-4 w-4 mr-1" />
                    <span>Save to AWS</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4 mr-1" />
                <span>Download</span>
              </Button>
            </div>
          </div>
          
          {/* Save Status Messages */}
          {saveStatus === 'success' && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                ✓ Infographic uploaded to AWS and JSON updated successfully!
              </p>
            </div>
          )}
          
          {saveStatus === 'error' && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                ✗ Failed to upload infographic. Please try again.
              </p>
            </div>
          )}
          
          <FullScreen buttonPosition="absolute right-2 top-2 z-10">
            <div 
              ref={infographicRef}
              className="relative border rounded-lg overflow-hidden bg-white p-6 min-h-80"
            >
              {/* Navigation arrows - positioned for fullscreen visibility */}
              {infographics.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  {/* Navigation indicator */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {getCurrentIndex()} / {infographics.length}
                  </div>
                </>
              )}
              
              {renderInfographic(selectedInfographic)}
            </div>
          </FullScreen>
        </div>
      )}

      {/* Carousel/slider for other infographics */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-600">All Visualizations</h4>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevPage}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextPage}
              disabled={currentPage >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex space-x-2 overflow-x-auto py-2">
          {currentInfographics.map((infographic) => (
            <div
              key={infographic.id}
              className={`relative h-24 w-40 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 transition-all bg-white ${
                selectedInfographic?.id === infographic.id
                  ? "border-blue-500"
                  : "border-transparent hover:border-gray-300"
              }`}
              onClick={() => setSelectedInfographic(infographic)}
            >
              <div className="h-full w-full p-2 flex items-center justify-center">
                <div className="w-full h-full scale-50 origin-top-left transform">
                  {renderInfographic(infographic)}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1">
                <div className="truncate font-medium">{infographic.title}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300 capitalize">{infographic.type}</span>
                  {infographic.hasExistingVisualUrl && (
                    <span className="text-green-400 text-xs">✓</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useState, useCallback, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import { Download, ChevronLeft, ChevronRight, Cloud } from "lucide-react";
// import StatsGrid from "./visualizations/StatsGrid";
// import BarChart from "./visualizations/BarChart";
// import PieChart from "./visualizations/PieChart";
// import ComparisonChart from "./visualizations/ComparisonChart";
// import NetworkDiagram from "./visualizations/NetworkDiagram";
// import SlideVisualization from "./visualizations/SlideVisualization";
// import FullScreen from "@/components/ui/full-screen";

// interface Html2CanvasOptions {
//   backgroundColor?: string;
//   scale?: number;
//   useCORS?: boolean;
//   allowTaint?: boolean;
//   logging?: boolean;
//   removeContainer?: boolean;
//   letterRendering?: boolean;
//   foreignObjectRendering?: boolean;
//   imageTimeout?: number;
//   onclone?: (clonedDoc: Document) => void;
// }

// interface InfographicItem {
//   id: string;
//   title: string;
//   type: string;
//   episodeId?: string;
//   slideId?: string;
//   episodeTitle?: string;
//   data: any[];
//   layout?: string;
//   backgroundStyle?: string;
//   animationType?: string;
//   visualContent: any;
//   hasExistingVisualUrl?: boolean;
// }

// interface InfographicViewProps {
//   infographics: InfographicItem[];
//   onUpdateJson?: (episodeId: string, slideId: string, awsUrl: string) => void;
// }

// export default function InfographicView({ infographics, onUpdateJson }: InfographicViewProps) {
//   const [selectedInfographic, setSelectedInfographic] = useState<InfographicItem | null>(
//     infographics.length > 0 ? infographics[0] : null
//   );
//   const [currentPage, setCurrentPage] = useState(0);
//   const [isSaving, setIsSaving] = useState(false);
//   const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
//   const infographicRef = useRef<HTMLDivElement>(null);

//   const infographicsPerPage = 5;
//   const totalPages = Math.ceil(infographics.length / infographicsPerPage);

//   // Navigation functions for main view
//   const goToPrevious = useCallback(() => {
//     if (!selectedInfographic || infographics.length === 0) return;
    
//     const currentIndex = infographics.findIndex(item => item.id === selectedInfographic.id);
//     const previousIndex = currentIndex > 0 ? currentIndex - 1 : infographics.length - 1;
//     setSelectedInfographic(infographics[previousIndex]);
//   }, [selectedInfographic, infographics]);

//   const goToNext = useCallback(() => {
//     if (!selectedInfographic || infographics.length === 0) return;
    
//     const currentIndex = infographics.findIndex(item => item.id === selectedInfographic.id);
//     const nextIndex = currentIndex < infographics.length - 1 ? currentIndex + 1 : 0;
//     setSelectedInfographic(infographics[nextIndex]);
//   }, [selectedInfographic, infographics]);

//   // Function to extract actual data from nested visualContent structure
//   const extractActualData = (infographic: InfographicItem): any[] => {
//     console.log('Extracting data from infographic:', infographic);
    
//     let actualData = infographic.data || [];
    
//     // Check if data exists in visualContent structure
//     if (infographic.visualContent?.content) {
//       const content = infographic.visualContent.content;
      
//       // Try different possible data locations based on your JSON structure
//       if (content.keyStats && Array.isArray(content.keyStats)) {
//         actualData = content.keyStats;
//       } else if (content.data && Array.isArray(content.data)) {
//         actualData = content.data;
//       } else if (content.steps && Array.isArray(content.steps)) {
//         actualData = content.steps;
//       } else if (content.nodes && Array.isArray(content.nodes)) {
//         actualData = content.nodes;
//       } else if (content.points && Array.isArray(content.points)) {
//         actualData = content.points;
//       } else if (content.points1 && Array.isArray(content.points1)) {
//         // For feature-comparison layout, combine points1 and points2
//         const points1 = content.points1.map((p: any) => ({ ...p, category: 'capabilities' }));
//         const points2 = content.points2 ? content.points2.map((p: any) => ({ ...p, category: 'limitations' })) : [];
//         actualData = [...points1, ...points2];
//       }
//     }
    
//     console.log('Extracted actual data:', actualData);
//     return actualData;
//   };

//   // Function to prepare element for canvas rendering
//   const prepareForCanvas = (element: HTMLElement) => {
//     // Hide SVG icons and show emoji fallbacks
//     const svgIcons = element.querySelectorAll('.canvas-fallback-hide');
//     const emojiIcons = element.querySelectorAll('.canvas-fallback-show');
    
//     svgIcons.forEach(icon => {
//       (icon as HTMLElement).style.display = 'none';
//     });
    
//     emojiIcons.forEach(icon => {
//       (icon as HTMLElement).style.display = 'block';
//     });
//   };

//   // Function to restore element after canvas rendering
//   const restoreAfterCanvas = (element: HTMLElement) => {
//     // Restore SVG icons and hide emoji fallbacks
//     const svgIcons = element.querySelectorAll('.canvas-fallback-hide');
//     const emojiIcons = element.querySelectorAll('.canvas-fallback-show');
    
//     svgIcons.forEach(icon => {
//       (icon as HTMLElement).style.display = '';
//     });
    
//     emojiIcons.forEach(icon => {
//       (icon as HTMLElement).style.display = 'none';
//     });
//   };

//   const handleSaveToAWS = useCallback(async () => {
//     if (!selectedInfographic || !infographicRef.current) {
//       console.error("No infographic selected or ref not available");
//       return;
//     }

//     setIsSaving(true);
//     setSaveStatus('saving');

//     try {
//       // Prepare element for canvas rendering
//       prepareForCanvas(infographicRef.current);
      
//       // Import html2canvas dynamically
//       const html2canvas = await import('html2canvas');
      
//       // Convert the infographic to canvas with improved settings
//       const canvas = await html2canvas.default(infographicRef.current, {
//         backgroundColor: '#ffffff',
//         scale: 2,
//         useCORS: true,
//         allowTaint: false,
//         logging: false,
//         removeContainer: true,
//         letterRendering: true,
//         foreignObjectRendering: false,
//         imageTimeout: 15000,
//         onclone: function(clonedDoc) {
//           // Ensure consistent rendering and fix text positioning
//           const style = clonedDoc.createElement('style');
//           style.textContent = `
//             .canvas-fallback-hide {
//               display: none !important;
//             }
//             .canvas-fallback-show {
//               display: block !important;
//             }
//             /* Fix text positioning for canvas */
//             h1, h2, h3, h4, h5, h6 {
//               line-height: 1.2 !important;
//               margin-top: 0 !important;
//             }
//             .text-center {
//               text-align: center !important;
//             }
//             .mb-6 {
//               margin-bottom: 24px !important;
//             }
//             .mb-4 {
//               margin-bottom: 16px !important;
//             }
//             .mb-2 {
//               margin-bottom: 8px !important;
//             }
//             .mb-1 {
//               margin-bottom: 4px !important;
//             }
//             .mt-1 {
//               margin-top: 4px !important;
//             }
//             .mt-2 {
//               margin-top: 8px !important;
//             }
//             /* Ensure consistent box sizing */
//             * {
//               box-sizing: border-box !important;
//             }
//             /* Fix flex alignment */
//             .flex {
//               display: flex !important;
//             }
//             .justify-center {
//               justify-content: center !important;
//             }
//             .items-center {
//               align-items: center !important;
//             }
//           `;
//           clonedDoc.head.appendChild(style);
//         }
//       } as Html2CanvasOptions);
      
//       // Restore element after canvas rendering
//       restoreAfterCanvas(infographicRef.current);
      
//       // Convert canvas to blob
//       const blob = await new Promise<Blob>((resolve, reject) => {
//         canvas.toBlob((blob) => {
//           if (blob) {
//             resolve(blob);
//           } else {
//             reject(new Error("Failed to convert canvas to blob"));
//           }
//         }, 'image/png', 0.9);
//       });

//       // Prepare form data for upload
//       const formData = new FormData();
//       formData.append('file', blob, `${selectedInfographic.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`);
//       formData.append('slide_id', selectedInfographic.slideId || 'unknown_slide');
//       formData.append('episode_id', selectedInfographic.episodeId || 'unknown_episode');
//       formData.append('infographic_title', selectedInfographic.title || 'Untitled Infographic');

//       // Configure API endpoint using environment variable
//       const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
//       const apiEndpoint = `${API_BASE_URL}/api/v1/upload_infographic_image`;

//       // Make the request to the API (now handles both upload AND save)
//       const response = await fetch(apiEndpoint, {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
//       }

//       const result = await response.json();
      
//       if (result.success && result.data?.aws_url) {
//         console.log("Infographic uploaded and saved successfully:", result.data.aws_url);
//         console.log("JSON automatically updated:", result.data.json_updated);
//         console.log("Backup created:", result.data.backup_created);
        
//         // Update the local state (the JSON was already saved by the backend)
//         if (onUpdateJson && selectedInfographic.episodeId && selectedInfographic.slideId) {
//           onUpdateJson(selectedInfographic.episodeId, selectedInfographic.slideId, result.data.aws_url);
//         }
        
//         setSaveStatus('success');
        
//         // Reset status after 3 seconds
//         setTimeout(() => setSaveStatus('idle'), 3000);
//       } else {
//         throw new Error("Invalid response from server");
//       }

//     } catch (error) {
//       console.error("Error saving infographic to AWS:", error);
      
//       // Restore element in case of error
//       if (infographicRef.current) {
//         restoreAfterCanvas(infographicRef.current);
//       }
      
//       setSaveStatus('error');
      
//       // Reset status after 5 seconds
//       setTimeout(() => setSaveStatus('idle'), 5000);
//     } finally {
//       setIsSaving(false);
//     }
//   }, [selectedInfographic, onUpdateJson]);

//   const handleDownload = useCallback(async () => {
//     if (!selectedInfographic || !infographicRef.current) return;

//     try {
//       // Prepare element for canvas rendering
//       prepareForCanvas(infographicRef.current);
      
//       // Import html2canvas dynamically
//       const html2canvas = await import('html2canvas');
//       const canvas = await html2canvas.default(infographicRef.current, {
//         backgroundColor: '#ffffff',
//         scale: 2,
//         useCORS: true,
//         allowTaint: false,
//         letterRendering: true,
//         foreignObjectRendering: false,
//         onclone: function(clonedDoc) {
//           // Ensure consistent rendering and fix text positioning
//           const style = clonedDoc.createElement('style');
//           style.textContent = `
//             .canvas-fallback-hide {
//               display: none !important;
//             }
//             .canvas-fallback-show {
//               display: block !important;
//             }
//             /* Fix text positioning for canvas */
//             h1, h2, h3, h4, h5, h6 {
//               line-height: 1.2 !important;
//               margin-top: 0 !important;
//             }
//             .text-center {
//               text-align: center !important;
//             }
//             .mb-6 {
//               margin-bottom: 24px !important;
//             }
//             .mb-4 {
//               margin-bottom: 16px !important;
//             }
//             .mb-2 {
//               margin-bottom: 8px !important;
//             }
//             .mb-1 {
//               margin-bottom: 4px !important;
//             }
//             .mt-1 {
//               margin-top: 4px !important;
//             }
//             .mt-2 {
//               margin-top: 8px !important;
//             }
//             /* Ensure consistent box sizing */
//             * {
//               box-sizing: border-box !important;
//             }
//             /* Fix flex alignment */
//             .flex {
//               display: flex !important;
//             }
//             .justify-center {
//               justify-content: center !important;
//             }
//             .items-center {
//               align-items: center !important;
//             }
//           `;
//           clonedDoc.head.appendChild(style);
//         }
//       } as Html2CanvasOptions);
      
//       // Restore element after canvas rendering
//       restoreAfterCanvas(infographicRef.current);
      
//       const link = document.createElement('a');
//       link.download = `${selectedInfographic.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
//       link.href = canvas.toDataURL();
//       link.click();
//     } catch (error) {
//       console.error("Error downloading infographic:", error);
      
//       // Restore element in case of error
//       if (infographicRef.current) {
//         restoreAfterCanvas(infographicRef.current);
//       }
      
//       // Fallback: try to download as HTML
//       const element = infographicRef.current;
//       const htmlContent = `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <title>${selectedInfographic.title}</title>
//           <style>
//             body { margin: 20px; }
//             .infographic { padding: 20px; border: 1px solid #ccc; }
//           </style>
//         </head>
//         <body>
//           <div class="infographic">
//             ${element.innerHTML}
//           </div>
//         </body>
//         </html>
//       `;
      
//       const blob = new Blob([htmlContent], { type: 'text/html' });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `${selectedInfographic.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
//       a.click();
//       URL.revokeObjectURL(url);
//     }
//   }, [selectedInfographic]);

//   const nextPage = useCallback(() => {
//     if (currentPage < totalPages - 1) {
//       setCurrentPage(currentPage + 1);
//     }
//   }, [currentPage, totalPages]);

//   const prevPage = useCallback(() => {
//     if (currentPage > 0) {
//       setCurrentPage(currentPage - 1);
//     }
//   }, [currentPage]);

//   const currentInfographics = infographics.slice(
//     currentPage * infographicsPerPage,
//     (currentPage + 1) * infographicsPerPage
//   );

//   const renderInfographic = (infographic: InfographicItem) => {
//     console.log('Rendering infographic:', infographic);
    
//     const { type, data, layout, visualContent } = infographic;
    
//     // Use the data that was already extracted by your mediaExtractors
//     let actualData = data || [];
    
//     console.log('Rendering with data:', actualData);
//     console.log('Type:', type, 'Layout:', layout);
    
//     // If no data and we have visualContent, try one more extraction
//     if ((!actualData || actualData.length === 0) && visualContent?.content) {
//       const content = visualContent.content;
//       if (content.keyStats && Array.isArray(content.keyStats)) {
//         actualData = content.keyStats;
//       } else if (content.steps && Array.isArray(content.steps)) {
//         actualData = content.steps;
//       } else if (content.points1 && Array.isArray(content.points1)) {
//         actualData = content.points1;
//       } else if (content.data && Array.isArray(content.data)) {
//         actualData = content.data;
//       }
//     }
    
//     // If still no data, show a message
//     if (!actualData || actualData.length === 0) {
//       return (
//         <div className="flex items-center justify-center h-32 text-gray-500 border rounded-lg">
//           <div className="text-center">
//             <p>No data available for visualization</p>
//             <p className="text-xs mt-1">Type: {type}, Layout: {layout}</p>
//             <p className="text-xs">Data length: {data?.length || 0}</p>
//           </div>
//         </div>
//       );
//     }

//     switch (type) {
//       case 'slide':
//         return <SlideVisualization data={actualData} visualContent={visualContent} />;
        
//       case 'infographic':
//         // Use the layout from your data structure
//         return <StatsGrid data={actualData} layout={layout} visualContent={visualContent} />;
        
//       case 'stats-grid':
//         return <StatsGrid data={actualData} layout={layout} visualContent={visualContent} />;
        
//       case 'chart':
//         // Check chartType from visualContent
//         const chartType = visualContent?.content?.chartType || visualContent?.chartType;
//         if (chartType === 'bar') {
//           return <BarChart data={actualData} visualContent={visualContent} />;
//         } else if (chartType === 'pie') {
//           return <PieChart data={actualData} visualContent={visualContent} />;
//         }
//         return <BarChart data={actualData} visualContent={visualContent} />;
        
//       case 'bar':
//         return <BarChart data={actualData} visualContent={visualContent} />;
        
//       case 'pie':
//         return <PieChart data={actualData} visualContent={visualContent} />;
        
//       case 'comparison':
//         return <ComparisonChart data={actualData} visualContent={visualContent} />;
        
//       case 'network-diagram':
//         return <NetworkDiagram data={actualData} visualContent={visualContent} />;
        
//       default:
//         console.log('Using default StatsGrid for type:', type);
//         return <StatsGrid data={actualData} layout={layout} visualContent={visualContent} />;
//     }
//   };

//   if (infographics.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-64 border rounded-lg">
//         <p className="text-gray-500">No visualizations available</p>
//       </div>
//     );
//   }

//   // Get current index for navigation display
//   const getCurrentIndex = () => {
//     if (!selectedInfographic) return 0;
//     return infographics.findIndex(item => item.id === selectedInfographic.id) + 1;
//   };

//   return (
//     <div className="space-y-6">
//       {/* Main infographic view */}
//       {selectedInfographic && (
//         <div className="space-y-4">
//           <div className="flex justify-between items-center">
//             <div>
//               <h3 className="text-lg font-medium">{selectedInfographic.title}</h3>
//               <div className="flex flex-col mt-1 text-xs text-gray-500 space-y-0.5">
//                 {selectedInfographic.episodeTitle && (
//                   <span>Episode: {selectedInfographic.episodeTitle}</span>
//                 )}
//                 {selectedInfographic.slideId && (
//                   <span>Slide ID: {selectedInfographic.slideId}</span>
//                 )}
//                 <span className="capitalize">Type: {selectedInfographic.type}</span>
//                 {selectedInfographic.visualContent?.content?.layout && (
//                   <span>Layout: {selectedInfographic.visualContent.content.layout}</span>
//                 )}
//                 {selectedInfographic.hasExistingVisualUrl && (
//                   <span className="text-green-600">✓ Has existing visual URL</span>
//                 )}
//               </div>
//             </div>
//             <div className="flex space-x-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={handleSaveToAWS}
//                 disabled={isSaving}
//                 className="flex items-center space-x-1 text-green-600 border-green-200 hover:bg-green-50"
//               >
//                 {isSaving ? (
//                   <>
//                     <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full mr-1" />
//                     <span>Uploading & Saving...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Cloud className="h-4 w-4 mr-1" />
//                     <span>Save to AWS</span>
//                   </>
//                 )}
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={handleDownload}
//                 className="flex items-center space-x-1"
//               >
//                 <Download className="h-4 w-4 mr-1" />
//                 <span>Download</span>
//               </Button>
//             </div>
//           </div>
          
//           {/* Save Status Messages */}
//           {saveStatus === 'success' && (
//             <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
//               <p className="text-sm text-green-800">
//                 ✓ Infographic uploaded to AWS and JSON updated successfully!
//               </p>
//             </div>
//           )}
          
//           {saveStatus === 'error' && (
//             <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
//               <p className="text-sm text-red-800">
//                 ✗ Failed to upload infographic. Please try again.
//               </p>
//             </div>
//           )}
          
//           <FullScreen buttonPosition="absolute right-2 top-2 z-10">
//             <div 
//               ref={infographicRef}
//               className="relative border rounded-lg overflow-hidden bg-white p-6 min-h-80"
//             >
//               {/* Navigation arrows - positioned for fullscreen visibility */}
//               {infographics.length > 1 && (
//                 <>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={goToPrevious}
//                     className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
//                   >
//                     <ChevronLeft className="h-4 w-4" />
//                   </Button>
                  
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={goToNext}
//                     className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
//                   >
//                     <ChevronRight className="h-4 w-4" />
//                   </Button>
                  
//                   {/* Navigation indicator */}
//                   <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
//                     {getCurrentIndex()} / {infographics.length}
//                   </div>
//                 </>
//               )}
              
//               {renderInfographic(selectedInfographic)}
//             </div>
//           </FullScreen>
//         </div>
//       )}

//       {/* Carousel/slider for other infographics */}
//       <div className="space-y-2">
//         <div className="flex justify-between items-center">
//           <h4 className="text-sm font-medium text-gray-600">All Visualizations</h4>
//           <div className="flex items-center space-x-1">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={prevPage}
//               disabled={currentPage === 0}
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </Button>
//             <span className="text-sm">
//               {currentPage + 1} / {totalPages}
//             </span>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={nextPage}
//               disabled={currentPage >= totalPages - 1}
//             >
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         <div className="flex space-x-2 overflow-x-auto py-2">
//           {currentInfographics.map((infographic) => (
//             <div
//               key={infographic.id}
//               className={`relative h-24 w-40 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 transition-all bg-white ${
//                 selectedInfographic?.id === infographic.id
//                   ? "border-blue-500"
//                   : "border-transparent hover:border-gray-300"
//               }`}
//               onClick={() => setSelectedInfographic(infographic)}
//             >
//               <div className="h-full w-full p-2 flex items-center justify-center">
//                 <div className="w-full h-full scale-50 origin-top-left transform">
//                   {renderInfographic(infographic)}
//                 </div>
//               </div>
//               <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1">
//                 <div className="truncate font-medium">{infographic.title}</div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs text-gray-300 capitalize">{infographic.type}</span>
//                   {infographic.hasExistingVisualUrl && (
//                     <span className="text-green-400 text-xs">✓</span>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

