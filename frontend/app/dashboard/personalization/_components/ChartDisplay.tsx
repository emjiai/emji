import React from 'react';

// Component props interface
interface ChartDisplayProps {
  isActive: boolean;
  onSelect: () => void;
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ isActive, onSelect }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="bg-green-600 text-white p-3">
        <h3 className="font-semibold">Chart Content</h3>
      </div>
      
      <div className="flex flex-col items-center justify-center h-96 p-8">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-16 w-16 text-green-500 mb-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
          />
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
        <p className="text-gray-600 text-center mb-4">
          Chart visualization feature is currently under development. Check back soon for interactive data visualizations.
        </p>
        <div className="bg-green-100 text-green-800 p-4 rounded-lg max-w-md">
          <p className="text-sm">
            The charts module will include bar charts, pie charts, line graphs, and other visual data representations to help you understand complex information at a glance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChartDisplay;