import React from 'react';

// Component props interface
interface TimelineDisplayProps {
  isActive: boolean;
  onSelect: () => void;
}

const TimelineDisplay: React.FC<TimelineDisplayProps> = ({ isActive, onSelect }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="bg-blue-600 text-white p-3">
        <h3 className="font-semibold">Timeline Content</h3>
      </div>
      
      <div className="flex flex-col items-center justify-center h-96 p-8">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-16 w-16 text-blue-500 mb-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
        <p className="text-gray-600 text-center mb-4">
          Timeline content display is currently under development. Check back soon for enhanced text-based learning materials.
        </p>
        <div className="bg-blue-100 text-blue-800 p-4 rounded-lg max-w-md">
          <p className="text-sm">
            The text content module will feature interactive reading materials, summaries, and note-taking capabilities to enhance your learning experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimelineDisplay;