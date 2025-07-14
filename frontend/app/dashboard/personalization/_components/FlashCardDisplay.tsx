import React from 'react';

// Component props interface
interface FlashCardDisplayProps {
  isActive: boolean;
  onSelect: () => void;
}

const FlashCardDisplay: React.FC<FlashCardDisplayProps> = ({ isActive, onSelect }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="bg-purple-600 text-white p-3">
        <h3 className="font-semibold">Flash Card Content</h3>
      </div>
      
      <div className="flex flex-col items-center justify-center h-96 p-8">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-16 w-16 text-purple-500 mb-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
          />
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
        <p className="text-gray-600 text-center mb-4">
          Flash card learning feature is currently under development. Check back soon for interactive study cards.
        </p>
        <div className="bg-purple-100 text-purple-800 p-4 rounded-lg max-w-md">
          <p className="text-sm">
            The flash card module will feature customizable study cards with spaced repetition learning, progress tracking, and quiz modes to help reinforce key concepts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FlashCardDisplay;