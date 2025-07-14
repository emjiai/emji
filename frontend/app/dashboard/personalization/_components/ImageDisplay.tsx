import React, { useEffect, useRef, useState } from 'react';

// Component props interface
interface ImageDisplayProps {
  isActive: boolean;
  onSelect: () => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ isActive, onSelect }) => {
  // State to track fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState(false);
  const displayRef = useRef<HTMLDivElement>(null);
  
  // State to track selected image
  const [selectedImage, setSelectedImage] = useState('/Slide 1.png');
  
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

  // Image content examples
  const imageContent = [
    { id: 'i1', title: 'Slide 1', thumbnail: '/Slide 1.png' },
    { id: 'i2', title: 'Slide 2', thumbnail: '/Slide 2.png' },
    { id: 'i3', title: 'Slide 3', thumbnail: '/Slide 3.png' },
    { id: 'i4', title: 'Slide 7', thumbnail: '/Slide 7.png' },
  ];

  // Dynamically set height based on fullscreen mode
  const heightClass = isFullscreen ? 'h-full' : 'h-96';

  return (
    <div ref={displayRef} className={`bg-white rounded-lg shadow-md overflow-hidden ${isActive ? 'ring-2 ring-purple-500' : ''} ${isFullscreen ? 'h-full' : ''}`}>
      <div className="bg-purple-600 text-white p-3">
        <h3 className="font-semibold">Image Gallery</h3>
      </div>
      
      <div className={`flex ${heightClass}`}>
        {/* Content List */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
          {imageContent.map(item => (
            <div 
              key={item.id} 
              className={`p-3 border-b border-gray-100 hover:bg-purple-50 cursor-pointer flex items-center ${selectedImage === item.thumbnail ? 'bg-purple-100' : ''}`}
              onClick={() => setSelectedImage(item.thumbnail)}
            >
              <img src={item.thumbnail} alt={item.title} className="w-16 h-12 object-cover rounded mr-2" />
              <h4 className="font-medium text-gray-800">{item.title}</h4>
            </div>
          ))}
        </div>
        
        {/* Image Viewer */}
        <div className="w-2/3 flex flex-col items-center justify-center bg-gray-100 p-4">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-sm p-4 text-center">
            <img 
              src={selectedImage} 
              alt="Selected image" 
              className="w-full h-auto rounded-lg mb-4" 
            />
            <h4 className="font-medium text-gray-800">Image Preview</h4>
            <p className="text-gray-500">{imageContent.find(item => item.thumbnail === selectedImage)?.title || 'Select an image to view details'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDisplay;