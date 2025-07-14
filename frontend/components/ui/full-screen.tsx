import { useState, useEffect, useCallback } from "react";
import { Maximize2Icon, Minimize2Icon } from 'lucide-react';
// import VoiceButton from '@/components/chatbot/VoiceButton';
import VoiceButton from '@/components/chatbot/VoiceButton.jsx';

interface FullScreenProps {
  children: React.ReactNode;
  buttonPosition?: string;
  buttonClassName?: string;
  content?: string;
}

export const FullScreen = ({ 
  children, 
  buttonPosition = "absolute right-2 top-2 z-10", 
  buttonClassName = "",
  content
}: FullScreenProps) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // Fullscreen toggle handlers
  const enterFullscreen = useCallback(() => {
    setIsFullscreen(true);
  }, []);

  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        exitFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, exitFullscreen]);

  // Determine the container class based on fullscreen state
  const containerClass = isFullscreen
    ? "fixed inset-0 z-50 bg-white flex flex-col" // Fullscreen mode
    : "relative w-full h-full flex flex-col"; // Normal mode

  const contentClass = isFullscreen
    ? "flex-1 w-full overflow-auto" // Fill available space in fullscreen
    : "flex-1 h-full w-full"; // Normal height in regular mode

  return (
    <div className={containerClass}>
      {/* Header row for controls */}
      <div className="h-10 min-h-10 w-full bg-gray-50 border-b border-gray-200 flex items-center justify-end px-2 z-10">
        <div className="flex items-center gap-2">
          {/* Voice Button with size overrides */}
          <div className="voice-button-wrapper" style={{
            transform: 'scale(0.75)',
            marginRight: '-8px'
          }}>
            <VoiceButton selectedDocumentContent={content} />
          </div>
          
          {/* Fullscreen Button */}
          <button
            onClick={isFullscreen ? exitFullscreen : enterFullscreen}
            className={`px-2 py-1 bg-white border border-gray-300 rounded-md shadow-sm flex items-center gap-1 text-sm text-gray-700 hover:bg-gray-100 ${buttonClassName}`}
          >
            {isFullscreen ? (
              <>
                <Minimize2Icon size={16} />
                {/* <span className="hidden sm:inline text-xs">Exit</span> */}
              </>
            ) : (
              <>
                <Maximize2Icon size={16} />
                {/* <span className="hidden sm:inline text-xs">Fullscreen</span> */}
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className={contentClass} data-fullscreen={isFullscreen ? "true" : "false"}>
        {children}
      </div>
    </div>
  );
};

export default FullScreen;