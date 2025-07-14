import React, { useEffect, useRef, useState } from 'react';

// Component props interface
interface AudioDisplayProps {
  isActive: boolean;
  onSelect: () => void;
}

const AudioDisplay: React.FC<AudioDisplayProps> = ({ isActive, onSelect }) => {
  // State to track fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState(false);
  const displayRef = useRef<HTMLDivElement>(null);

  const audioContent = [
    { id: 'a1', title: 'Lecture: Key Principles', duration: '15:10' },
    { id: 'a2', title: 'Expert Interview', duration: '22:30' },
    { id: 'a3', title: 'Study Tips & Techniques', duration: '7:15' },
  ];
  
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

  // Dynamically set height based on fullscreen mode
  const heightClass = isFullscreen ? 'h-full' : 'h-96';

  return (
    <div ref={displayRef} className={`bg-white rounded-lg shadow-md overflow-hidden ${isActive ? 'ring-2 ring-green-500' : ''} ${isFullscreen ? 'h-full' : ''}`}>
      <div className="bg-green-600 text-white p-3">
        <h3 className="font-semibold">Audio Content</h3>
      </div>
      
      <div className={`flex ${heightClass}`}>
        {/* Content List */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
          {audioContent.map(item => (
            <div key={item.id} className="p-3 border-b border-gray-100 hover:bg-green-50 cursor-pointer">
              <h4 className="font-medium text-gray-800">{item.title}</h4>
              <span className="text-sm text-gray-500">{item.duration}</span>
            </div>
          ))}
        </div>
        
        {/* Audio Player */}
        <div className="w-2/3 flex flex-col items-center justify-center bg-gray-100 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-4">
            <div className="mb-4 text-center">
              <h4 className="font-medium text-gray-800">Now Playing</h4>
              <p className="text-gray-500">Select an audio track</p>
            </div>
            
            <div className="h-2 bg-gray-200 rounded-full mb-4">
              <div className="h-2 bg-green-500 rounded-full w-0"></div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
              </button>
              
              <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioDisplay;
