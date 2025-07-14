import React, { useEffect, useRef, useState } from 'react';

// Base display component interface for all display components
interface DisplayProps {
  isActive: boolean;
  onSelect: () => void;
}

const VideoDisplay: React.FC<DisplayProps> = ({ isActive, onSelect }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const displayRef = useRef<HTMLDivElement>(null);
  
  // Check for fullscreen status by inspecting the parent element
  useEffect(() => {
    if (!displayRef.current) return;
    
    const checkFullscreen = () => {
      let currentEl: HTMLElement | null = displayRef.current;
      while (currentEl) {
        if (currentEl.hasAttribute('data-fullscreen') && 
            currentEl.getAttribute('data-fullscreen') === 'true') {
          setIsFullscreen(true);
          return;
        }
        currentEl = currentEl.parentElement;
      }
      setIsFullscreen(false);
    };
    
    // Initial check
    checkFullscreen();
    
    // Setup mutation observer to watch for attribute changes
    const observer = new MutationObserver(checkFullscreen);
    
    // Start observing the document
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-fullscreen'],
      subtree: true
    });
    
    return () => observer.disconnect();
  }, []);

  // Video content examples
  const videoContent = [
    { id: 'v1', title: 'Introduction to the Topic', duration: '10:15' },
    { id: 'v2', title: 'Advanced Concepts', duration: '15:30' },
    { id: 'v3', title: 'Practical Applications', duration: '12:45' },
  ];

  // Dynamically set height based on fullscreen mode
  const heightClass = isFullscreen ? 'h-full' : 'h-96';

  return (
    <div ref={displayRef} className={`bg-white rounded-lg shadow-md overflow-hidden ${isActive ? 'ring-2 ring-blue-500' : ''}  ${isFullscreen ? 'h-full' : ''}`}>
      <div className="bg-blue-600 text-white p-3">
        <h3 className="font-semibold">Video Content</h3>
      </div>
      
      <div className={`flex ${heightClass}`}>
        {/* Content List */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
          {videoContent.map(item => (
            <div key={item.id} className="p-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer">
              <h4 className="font-medium text-gray-800">{item.title}</h4>
              <span className="text-sm text-gray-500">{item.duration}</span>
            </div>
          ))}
        </div>
        
        {/* Video Player */}
        <div className="w-2/3 flex flex-col items-center justify-center bg-gray-800 p-4">
          <div className="text-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">Select a video to play</p>
            <p className="text-sm text-gray-400">Click on a video from the list to start watching</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDisplay;

