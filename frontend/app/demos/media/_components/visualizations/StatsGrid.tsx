import { iconMap, iconFallbacks, getIcon, getIconFallback } from './Icons';

interface StatsGridProps {
  data: any[];
  layout?: string;
  visualContent: any;
}

export default function StatsGrid({ data, layout = 'stats-grid', visualContent }: StatsGridProps) {
  console.log('StatsGrid received data:', data);
  console.log('StatsGrid received layout:', layout);
  console.log('StatsGrid received visualContent:', visualContent);

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
  
  // Card styling
  const cardBaseClass = isWhiteBackground
    ? 'bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:shadow-lg'
    : 'bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30';
    
  // Icon color
  const iconColorClass = isWhiteBackground ? 'text-blue-600' : 'text-white';
  
  // Value text styling
  const valueColorClass = isWhiteBackground ? 'text-gray-900' : 'text-white';
  
  // Description text styling
  const descriptionColorClass = isWhiteBackground ? 'text-gray-600' : 'text-white opacity-75';

  // Handle feature-comparison layout
  if (layout === 'feature-comparison') {
    const points1 = visualContent?.content?.points1 || [];
    const points2 = visualContent?.content?.points2 || [];
    
    return (
      <div className={`${backgroundClass} rounded-lg p-6 ${textColorClass} min-h-64`}>
        <h3 className={`text-xl font-bold mb-6 text-center ${textColorClass}`}>
          {visualContent?.title || visualContent?.content?.title || 'Feature Comparison'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className={`text-lg font-semibold mb-4 text-center ${textColorClass}`}>
              {visualContent?.content?.title1 || 'Category 1'}
            </h4>
            <div className="space-y-3">
              {points1.map((point: any, index: number) => {
                const IconComponent = getIcon(point.icon);
                const fallbackIcon = getIconFallback(point.icon);
                
                return (
                  <div key={index} className={`${cardBaseClass} rounded-lg p-4 flex items-center space-x-3 transition-all duration-300`}>
                    <div className="icon-container">
                      <IconComponent className={`h-6 w-6 ${iconColorClass} canvas-fallback-hide`} />
                      <span className="canvas-fallback-show text-xl" style={{ display: 'none' }}>
                        {fallbackIcon}
                      </span>
                    </div>
                    <span className={`${textColorClass} font-medium`}>{point.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 className={`text-lg font-semibold mb-4 text-center ${textColorClass}`}>
              {visualContent?.content?.title2 || 'Category 2'}
            </h4>
            <div className="space-y-3">
              {points2.map((point: any, index: number) => {
                const IconComponent = getIcon(point.icon);
                const fallbackIcon = getIconFallback(point.icon);
                
                return (
                  <div key={index} className={`${cardBaseClass} rounded-lg p-4 flex items-center space-x-3 transition-all duration-300`}>
                    <div className="icon-container">
                      <IconComponent className={`h-6 w-6 ${iconColorClass} canvas-fallback-hide`} />
                      <span className="canvas-fallback-show text-xl" style={{ display: 'none' }}>
                        {fallbackIcon}
                      </span>
                    </div>
                    <span className={`${textColorClass} font-medium`}>{point.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle process-flow layout
  if (layout === 'process-flow') {
    const steps = visualContent?.content?.steps || data;
    
    return (
      <div className={`${backgroundClass} rounded-lg p-6 ${textColorClass} min-h-64`}>
        <h3 className={`text-xl font-bold mb-4 text-center ${textColorClass}`}>
          {visualContent?.title || visualContent?.content?.title || 'Process Flow'}
        </h3>
        
        {visualContent?.content?.description && (
          <p className={`text-center mb-6 ${descriptionColorClass}`}>
            {visualContent.content.description}
          </p>
        )}
        
        <div className="space-y-6">
          {steps.map((step: any, index: number) => {
            const IconComponent = getIcon(step.icon);
            const fallbackIcon = getIconFallback(step.icon);
            
            return (
              <div key={index} className="flex items-start space-x-4 relative">
                <div className={`${cardBaseClass} rounded-full p-3 flex-shrink-0 z-10`}>
                  <div className="icon-container">
                    <IconComponent className={`h-6 w-6 ${iconColorClass} canvas-fallback-hide`} />
                    <span className="canvas-fallback-show text-xl" style={{ display: 'none' }}>
                      {fallbackIcon}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${textColorClass} mb-2`}>
                    {step.label}
                  </h4>
                  <p className={`text-sm ${descriptionColorClass}`}>
                    {step.description}
                  </p>
                </div>
                {/* Connection line to next step */}
                {index < steps.length - 1 && (
                  <div 
                    className={`absolute left-8 top-16 w-0.5 h-8 ${isWhiteBackground ? 'bg-gray-300' : 'bg-white bg-opacity-30'}`}
                    style={{ zIndex: 1 }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Handle network-diagram layout (simplified version for StatsGrid)
  if (layout === 'network-diagram') {
    return (
      <div className={`${backgroundClass} rounded-lg p-6 ${textColorClass} min-h-64`}>
        <h3 className={`text-xl font-bold mb-6 text-center ${textColorClass}`}>
          {visualContent?.title || visualContent?.content?.title || 'Network Diagram'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {data.map((item, index) => {
            const IconComponent = getIcon(item.icon);
            const fallbackIcon = getIconFallback(item.icon);
            
            return (
              <div
                key={index}
                className={`${cardBaseClass} rounded-lg p-4 text-center transition-all duration-300`}
              >
                <div className="icon-container mb-2 flex justify-center items-center" style={{ height: '32px' }}>
                  <IconComponent 
                    className={`h-8 w-8 ${iconColorClass} canvas-fallback-hide`}
                  />
                  <span 
                    className="canvas-fallback-show text-2xl" 
                    style={{ display: 'none' }}
                  >
                    {fallbackIcon}
                  </span>
                </div>
                
                <div className={`font-semibold text-sm ${textColorClass} mb-1`}>
                  {item.label}
                </div>
                {item.value && (
                  <div className={`text-xs mt-1 ${descriptionColorClass}`}>
                    {item.value}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Default stats-grid layout
  return (
    <div className={`${backgroundClass} rounded-lg p-6 ${textColorClass} min-h-64`}>
      <h3 className={`text-xl font-bold mb-6 text-center ${textColorClass}`}>
        {visualContent?.title || visualContent?.content?.title || 'Statistics'}
      </h3>
      
      {/* Check if we have valid data */}
      {!data || data.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <p className={`${textColorClass} opacity-75`}>No data available</p>
            <p className={`text-xs ${descriptionColorClass} mt-1`}>
              Data structure: {JSON.stringify(data?.slice(0, 1) || 'undefined')}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.map((stat, index) => {
            const IconComponent = getIcon(stat.icon);
            const fallbackIcon = getIconFallback(stat.icon);
            
            return (
              <div
                key={index}
                className={`${cardBaseClass} rounded-lg p-6 text-center transition-all duration-300 transform hover:scale-105`}
              >
                {/* Icon */}
                <div className="icon-container mb-4 flex justify-center items-center" style={{ height: '48px' }}>
                  <IconComponent 
                    className={`h-12 w-12 ${iconColorClass} canvas-fallback-hide`}
                  />
                  <span 
                    className="canvas-fallback-show text-4xl" 
                    style={{ display: 'none' }}
                  >
                    {fallbackIcon}
                  </span>
                </div>
                
                {/* Value */}
                <div className={`text-2xl font-bold mb-2 ${valueColorClass}`}>
                  {stat.value || stat.label || 'N/A'}
                </div>
                
                {/* Label */}
                <div className={`text-sm font-medium ${textColorClass} mb-2`}>
                  {stat.label || stat.title || `Item ${index + 1}`}
                </div>
                
                {/* Description */}
                {stat.description && (
                  <div className={`text-xs mt-2 ${descriptionColorClass}`}>
                    {stat.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
