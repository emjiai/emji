interface BarChartProps {
  data: any[];
  visualContent: any;
}

export default function BarChart({ data, visualContent }: BarChartProps) {
  console.log('BarChart received data:', data);
  console.log('BarChart received visualContent:', visualContent);

  const backgroundStyles = {
    'white': 'bg-white',
    'gradient-blue': 'bg-gradient-to-br from-blue-500 to-blue-600',
    'gradient-green': 'bg-gradient-to-br from-green-500 to-green-600',
    'gradient-purple': 'bg-gradient-to-br from-purple-500 to-purple-600',
    'gradient-orange': 'bg-gradient-to-br from-orange-500 to-orange-600',
    'gradient-red': 'bg-gradient-to-br from-red-500 to-red-600',
    'gradient-teal': 'bg-gradient-to-br from-teal-500 to-teal-600',
    'gradient-indigo': 'bg-gradient-to-br from-indigo-500 to-indigo-600'
  };

  // Determine if background is white
  const isWhiteBackground = visualContent?.backgroundStyle === 'white' || visualContent?.content?.backgroundStyle === 'white';
  const backgroundClass = backgroundStyles[visualContent?.backgroundStyle as keyof typeof backgroundStyles] || 
                          backgroundStyles[visualContent?.content?.backgroundStyle as keyof typeof backgroundStyles] || 
                          backgroundStyles['gradient-blue'];
  
  // Text color based on background
  const textColorClass = isWhiteBackground ? 'text-gray-800' : 'text-white';
  
  // Progress bar background based on main background
  const progressBgClass = isWhiteBackground 
    ? 'bg-gray-200' 
    : 'bg-white bg-opacity-20 backdrop-blur-sm';

  // If no data, show message
  if (!data || data.length === 0) {
    return (
      <div className={`${backgroundClass} rounded-lg p-6 ${textColorClass} min-h-64 flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-lg">No chart data available</p>
          <p className="text-sm mt-2 opacity-75">Please check the data source</p>
        </div>
      </div>
    );
  }
  
  // Calculate max value for scaling - handle different value formats
  const maxValue = Math.max(...data.map(item => {
    // Handle numeric values
    if (typeof item.value === 'number') return item.value;
    // Handle string numbers
    if (typeof item.value === 'string' && !isNaN(Number(item.value))) return Number(item.value);
    // Default fallback
    return 100;
  }));
  
  return (
    <div className={`${backgroundClass} rounded-lg p-6 ${textColorClass} min-h-64`}>
      <h3 className={`text-xl font-bold mb-6 text-center ${textColorClass}`}>
        {visualContent?.title || visualContent?.content?.title || 'Bar Chart'}
      </h3>
      
      <div className="space-y-4">
        {data.map((item, index) => {
          // Handle different data structures
          const category = item.category || item.label || `Item ${index + 1}`;
          const value = typeof item.value === 'number' ? item.value : 
                       (typeof item.value === 'string' && !isNaN(Number(item.value))) ? Number(item.value) : 
                       100; // Default fallback
          const description = item.description || '';
          
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`font-medium text-sm ${textColorClass}`}>
                  {category}
                </span>
                <span className={`font-bold text-lg ${textColorClass}`}>
                  {typeof item.value === 'string' && isNaN(Number(item.value)) ? item.value : `${value}%`}
                </span>
              </div>
              
              <div className={`w-full ${progressBgClass} rounded-full h-3`}>
                <div
                  className="h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color || (isWhiteBackground ? '#3B82F6' : '#ffffff'),
                    opacity: isWhiteBackground ? 1 : 0.9
                  }}
                />
              </div>
              
              {description && (
                <p className={`text-xs ${isWhiteBackground ? 'text-gray-600' : 'text-white opacity-75'}`}>
                  {description}
                </p>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 text-center">
        <p className={`text-sm ${isWhiteBackground ? 'text-gray-600' : 'text-white opacity-90'}`}>
          Data shows comparative values across categories
        </p>
      </div>
    </div>
  );
}

