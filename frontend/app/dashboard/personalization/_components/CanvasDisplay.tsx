import React, { useEffect, useRef, useState } from 'react';

// Component props interface
interface CanvasDisplayProps {
  isActive: boolean;
  onSelect: () => void;
}

const CanvasDisplay: React.FC<CanvasDisplayProps> = ({ isActive, onSelect }) => {
  // State to track fullscreen mode
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

  // Canvas tool options
  const tools = [
    { id: 't1', name: 'Pen', icon: '✏️' },
    { id: 't2', name: 'Eraser', icon: '🧽' },
    { id: 't3', name: 'Text', icon: 'T' },
    { id: 't4', name: 'Shape', icon: '◻️' },
    { id: 't5', name: 'Line', icon: '/' },
  ];

  // Dynamically set height based on fullscreen mode
  const heightClass = isFullscreen ? 'h-full' : 'h-96';

  return (
    <div ref={displayRef} className={`bg-white rounded-lg shadow-md overflow-hidden ${isActive ? 'ring-2 ring-orange-500' : ''} ${isFullscreen ? 'h-full' : ''}`}>
      <div className="bg-orange-600 text-white p-3">
        <h3 className="font-semibold">Canvas Tools</h3>
      </div>
      
      <div className={`flex flex-col ${heightClass}`}>
        {/* Tool Bar */}
        <div className="bg-gray-100 p-2 flex flex-wrap gap-2">
          {tools.map(tool => (
            <button key={tool.id} className="p-2 rounded-md hover:bg-orange-100 flex items-center gap-1">
              <span className="text-lg">{tool.icon}</span>
              <span className="text-sm">{tool.name}</span>
            </button>
          ))}
          
          <div className="ml-auto">
            <button className="p-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
              Save
            </button>
          </div>
        </div>
        
        {/* Canvas Area */}
        <div className="flex-1 bg-white border border-gray-200 m-2 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <p className="text-lg font-medium">Interactive Canvas</p>
            <p className="text-sm">Click and drag to start drawing</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasDisplay;

// import React, { useState } from 'react';

// // Component props interface
// interface CanvasDisplayProps {
//   isActive: boolean;
//   onSelect: () => void;
// }

// const CanvasDisplay: React.FC<CanvasDisplayProps> = ({ isActive, onSelect }) => {
//   // State for canvas mode
//   const [canvasMode, setCanvasMode] = useState('typing');
  
//   // Sample content data
//   const canvasContent = [
//     { id: 'c1', title: 'Notes Template' },
//     { id: 'c2', title: 'Problem Solving Worksheet' },
//     { id: 'c3', title: 'Reflection Journal' },
//   ];
  
//   // Function to toggle canvas mode
//   const toggleCanvasMode = () => {
//     setCanvasMode(canvasMode === 'typing' ? 'writing' : 'typing');
//   };

//   return (
//     <div className={`bg-white rounded-lg shadow-md overflow-hidden ${isActive ? 'ring-2 ring-amber-500' : ''}`}>
//       <div className="bg-amber-600 text-white p-3 flex justify-between items-center">
//         <h3 className="font-semibold">Canvas</h3>
//       </div>
      
//       <div className="flex h-96">
//         {/* Content List */}
//         <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
//           {/* Toggle Button moved here */}
//           <div className="p-3 border-b border-gray-100 bg-gray-50">
//             <button 
//               onClick={toggleCanvasMode}
//               className="w-full px-3 py-1 bg-white text-amber-600 border border-amber-300 rounded-md text-sm hover:bg-amber-50"
//             >
//               {canvasMode === 'typing' ? 'Switch to Writing' : 'Switch to Typing'}
//             </button>
//           </div>
          
//           {canvasContent.map(item => (
//             <div key={item.id} className="p-3 border-b border-gray-100 hover:bg-amber-50 cursor-pointer">
//               <h4 className="font-medium text-gray-800">{item.title}</h4>
//             </div>
//           ))}
//         </div>
        
//         {/* Canvas Display */}
//         <div className="w-2/3 p-4">
//           {canvasMode === 'typing' ? (
//             <div className="h-full border border-gray-200 rounded-lg p-3">
//               <textarea 
//                 className="w-full h-full resize-none focus:outline-none" 
//                 placeholder="Type your notes here..."
//               ></textarea>
//             </div>
//           ) : (
//             <div className="h-full bg-white border border-gray-200 rounded-lg flex items-center justify-center">
//               <div className="text-center">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
//                 </svg>
//                 <p className="text-gray-500 mt-2">Writing canvas mode enabled</p>
//                 <p className="text-sm text-gray-400">Click and drag to write</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CanvasDisplay;