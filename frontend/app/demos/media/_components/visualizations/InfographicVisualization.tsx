// Type definitions for Infographic Visualization
interface ComparisonFeature {
    name: string;
    [key: string]: string | number | boolean; // Dynamic keys for comparison items (e.g., "NotebookLM", "CustomGPT")
  }
  
  interface ProcessStep {
    id?: string | number;
    label: string;
    description: string;
    title?: string;
    icon?: string;
    status?: 'pending' | 'active' | 'completed';
  }
  
  interface InfographicContent {
    layout?: 'feature-comparison' | 'process-flow' | 'network-diagram' | 'stats-grid' | 'timeline' | 'hierarchy';
    features?: ComparisonFeature[];
    steps?: ProcessStep[];
    title?: string;
    subtitle?: string;
    backgroundStyle?: 'white' | 'gradient-blue' | 'gradient-green' | 'gradient-purple' | 'gradient-orange' | 'gradient-red' | 'gradient-teal' | 'gradient-indigo';
    animationType?: 'fade-in' | 'fade-in-sequence' | 'slide-in' | 'zoom-in' | 'bounce-in';
    
    // Alternative data structures for different layouts
    keyStats?: Array<{
      label: string;
      value: string | number;
      icon?: string;
      color?: string;
      description?: string;
    }>;
    
    nodes?: Array<{
      id: string | number;
      label: string;
      type?: 'primary' | 'secondary' | 'tertiary';
      connections?: (string | number)[];
      position?: { x: number; y: number };
      color?: string;
    }>;
    
    points?: string[];
    points1?: Array<{
      text: string;
      category?: string;
      importance?: 'high' | 'medium' | 'low';
    }>;
    points2?: Array<{
      text: string;
      category?: string;
      importance?: 'high' | 'medium' | 'low';
    }>;
    
    data?: Array<{
      label: string;
      value: number;
      color?: string;
      percentage?: number;
    }>;
    
    // Map-specific data
    crimeSpots?: Array<{
      id: string | number;
      name: string;
      lat: number;
      lng: number;
      severity?: 'low' | 'medium' | 'high';
      type?: string;
      description?: string;
    }>;
    
    spots?: Array<{
      id: string | number;
      name: string;
      coordinates: [number, number];
      category?: string;
      intensity?: number;
    }>;
    
    locations?: Array<{
      id: string | number;
      name: string;
      position: { lat: number; lng: number };
      metadata?: Record<string, any>;
    }>;
  }
  
  interface VisualContent {
    type: 'infographic' | 'chart' | 'map' | 'slide' | 'network-diagram' | 'stats-grid';
    title?: string;
    content?: InfographicContent;
    layout?: string;
    backgroundStyle?: string;
    animationType?: string;
    chartType?: 'bar' | 'pie' | 'line' | 'scatter' | 'area';
    
    // Direct properties (for backward compatibility)
    keyStats?: InfographicContent['keyStats'];
    data?: InfographicContent['data'];
    features?: ComparisonFeature[];
    steps?: ProcessStep[];
    crimeSpots?: InfographicContent['crimeSpots'];
    spots?: InfographicContent['spots'];
    locations?: InfographicContent['locations'];
    visualUrl?: string;
    slideId?: string;
  }
  
  interface InfographicVisualizationProps {
    data: Array<ComparisonFeature | ProcessStep | any>; // Array of features, steps, or other data types
    visualContent: VisualContent;
  }
  
  // Background style type definitions
  type BackgroundStyle = 'white' | 'gradient-blue' | 'gradient-green' | 'gradient-purple' | 'gradient-orange' | 'gradient-red' | 'gradient-teal' | 'gradient-indigo';
  
  interface BackgroundStyles {
    [key: string]: string;
  }
  
  // Layout type definitions
  type LayoutType = 0 | 1 | 2 | 3 | 4;
  
  export default function InfographicVisualization({ data, visualContent }: InfographicVisualizationProps) {
    const backgroundStyles: BackgroundStyles = {
      'white': 'bg-white',
      'gradient-blue': 'bg-gradient-to-br from-blue-500 to-blue-600',
      'gradient-green': 'bg-gradient-to-br from-green-500 to-green-600',
      'gradient-purple': 'bg-gradient-to-br from-purple-500 to-purple-600',
      'gradient-orange': 'bg-gradient-to-br from-orange-500 to-orange-600',
      'gradient-red': 'bg-gradient-to-br from-red-500 to-red-600',
      'gradient-teal': 'bg-gradient-to-br from-teal-500 to-teal-600',
      'gradient-indigo': 'bg-gradient-to-br from-indigo-500 to-indigo-600'
    };
  
    // Extract features data from the visual content structure
    const getFeatures = (): ComparisonFeature[] => {
      if (visualContent?.content?.features && Array.isArray(visualContent.content.features)) {
        return visualContent.content.features;
      }
      if (visualContent?.features && Array.isArray(visualContent.features)) {
        return visualContent.features;
      }
      // Try to use data prop if it matches ComparisonFeature structure
      if (data && Array.isArray(data) && data.length > 0 && 'name' in data[0]) {
        return data as ComparisonFeature[];
      }
      return [];
    };
  
    // Extract steps data for process flow layouts
    const getSteps = (): ProcessStep[] => {
      if (visualContent?.content?.steps && Array.isArray(visualContent.content.steps)) {
        return visualContent.content.steps;
      }
      if (visualContent?.steps && Array.isArray(visualContent.steps)) {
        return visualContent.steps;
      }
      // Try to use data prop if it matches ProcessStep structure
      if (data && Array.isArray(data) && data.length > 0 && 'label' in data[0]) {
        return data as ProcessStep[];
      }
      return [];
    };
  
    // Get layout type
    const layout: string = visualContent?.content?.layout || visualContent?.layout || 'feature-comparison';
    const backgroundStyle: BackgroundStyle = (visualContent?.content?.backgroundStyle || visualContent?.backgroundStyle || 'white') as BackgroundStyle;
    const isWhiteBackground: boolean = backgroundStyle === 'white';
    const backgroundClass: string = backgroundStyles[backgroundStyle] || backgroundStyles['white'];
    
    // Text colors based on background
    const textColorClass: string = isWhiteBackground ? 'text-gray-800' : 'text-white';
    const subtitleColorClass: string = isWhiteBackground ? 'text-gray-600' : 'text-white opacity-90';
  
    // Get title
    const title: string = visualContent?.title || visualContent?.content?.title || 'Process Flow';
    
    // Get feature data and steps data
    const features: ComparisonFeature[] = getFeatures();
    const steps: ProcessStep[] = getSteps();
    
    // Determine if this is a process flow layout
    const isProcessFlow: boolean = layout === 'process-flow' || (steps.length > 0 && features.length === 0);
    
    // Generate layout type based on title hash for consistency
    const titleHash: number = title.split('').reduce((a: number, b: string) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const layoutType: LayoutType = Math.abs(titleHash) % 5 as LayoutType;
  
    // Process Flow Layout 1: Horizontal Timeline
    const renderHorizontalProcessFlow = (): JSX.Element | null => {
      if (steps.length === 0) return null;
  
      return (
        <div className="space-y-8">
          {/* Title */}
          <div className="text-center">
            <h1 className={`text-4xl font-bold ${textColorClass} mb-4`}>
              {title}
            </h1>
            <div className={`w-24 h-1 mx-auto rounded-full ${isWhiteBackground ? 'bg-blue-500' : 'bg-white opacity-50'}`}></div>
          </div>
  
          {/* Horizontal Process Flow */}
          <div className="relative">
            {/* Connecting Line */}
            <div className={`absolute top-1/2 left-0 right-0 h-1 ${isWhiteBackground ? 'bg-gray-200' : 'bg-white bg-opacity-20'} transform -translate-y-1/2 z-0`}></div>
            
            {/* Progress Line */}
            <div className={`absolute top-1/2 left-0 h-1 ${isWhiteBackground ? 'bg-blue-500' : 'bg-blue-400'} transform -translate-y-1/2 z-10 transition-all duration-2000 ease-out`} 
                 style={{ width: '100%' }}></div>
  
            {/* Steps */}
            <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
              {steps.map((step: ProcessStep, index: number) => (
                <div key={step.id || index} className="relative z-20 text-center">
                  {/* Step Circle */}
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center font-bold text-lg mb-4 shadow-lg transition-all duration-500 hover:scale-110 ${
                    isWhiteBackground 
                      ? 'bg-blue-500 text-white border-4 border-white' 
                      : 'bg-blue-400 text-blue-900 border-4 border-gray-900'
                  }`}>
                    {step.icon || (index + 1)}
                  </div>
                  
                  {/* Step Content */}
                  <div className={`p-4 rounded-lg shadow-sm transition-all duration-300 hover:shadow-lg ${
                    isWhiteBackground 
                      ? 'bg-white border border-gray-200' 
                      : 'bg-white bg-opacity-10 border border-white border-opacity-20'
                  }`}>
                    <h3 className={`font-semibold mb-2 ${textColorClass}`}>
                      {step.label}
                    </h3>
                    <p className={`text-sm ${subtitleColorClass} leading-relaxed`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    };
  
    // Process Flow Layout 2: Vertical Timeline
    const renderVerticalProcessFlow = (): JSX.Element | null => {
      if (steps.length === 0) return null;
  
      return (
        <div className="space-y-8">
          {/* Title */}
          <div className="text-center">
            <h1 className={`text-4xl font-bold ${textColorClass} mb-4`}>
              {title}
            </h1>
            <div className={`w-24 h-1 mx-auto rounded-full ${isWhiteBackground ? 'bg-blue-500' : 'bg-white opacity-50'}`}></div>
          </div>
  
          {/* Vertical Process Flow */}
          <div className="relative max-w-4xl mx-auto">
            {/* Vertical connecting line */}
            <div className={`absolute left-8 top-16 bottom-16 w-1 ${isWhiteBackground ? 'bg-gray-200' : 'bg-white bg-opacity-20'}`}></div>
            <div className={`absolute left-8 top-16 w-1 ${isWhiteBackground ? 'bg-blue-500' : 'bg-blue-400'} transition-all duration-2000 ease-out`} 
                 style={{ height: '100%' }}></div>
  
            {/* Steps */}
            <div className="space-y-8">
              {steps.map((step: ProcessStep, index: number) => (
                <div key={step.id || index} className="relative flex items-start">
                  {/* Step Circle */}
                  <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-500 hover:scale-110 ${
                    isWhiteBackground 
                      ? 'bg-blue-500 text-white border-4 border-white' 
                      : 'bg-blue-400 text-blue-900 border-4 border-gray-900'
                  }`}>
                    {step.icon || (index + 1)}
                  </div>
                  
                  {/* Step Content */}
                  <div className={`ml-8 flex-1 p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                    isWhiteBackground 
                      ? 'bg-white border border-gray-200' 
                      : 'bg-white bg-opacity-10 border border-white border-opacity-20'
                  }`}>
                    <h3 className={`font-bold text-lg mb-3 ${textColorClass}`}>
                      {step.label}
                    </h3>
                    <p className={`${subtitleColorClass} leading-relaxed`}>
                      {step.description}
                    </p>
                    
                    {/* Arrow pointing to next step */}
                    {index < steps.length - 1 && (
                      <div className={`absolute -bottom-4 left-8 w-8 h-8 ${isWhiteBackground ? 'text-blue-500' : 'text-blue-400'} transform rotate-90`}>
                        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    };
  
    // Process Flow Layout 3: Circular Process Flow
    const renderCircularProcessFlow = (): JSX.Element | null => {
      if (steps.length === 0) return null;
  
      const radius = 180;
      const centerX = 250;
      const centerY = 250;
  
      return (
        <div className="space-y-8">
          {/* Title */}
          <div className="text-center">
            <h1 className={`text-4xl font-bold ${textColorClass} mb-8`}>
              {title}
            </h1>
          </div>
  
          <div className="relative w-full max-w-lg mx-auto" style={{ height: '500px' }}>
            {/* Central Circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center font-bold text-xl border-4 ${isWhiteBackground ? 'bg-white border-gray-300 text-gray-800' : 'bg-gray-900 border-white text-white'} shadow-lg`}>
                <div className="text-center">
                  <div className="text-2xl">🔄</div>
                </div>
              </div>
            </div>
  
            {/* Steps arranged in circle */}
            {steps.map((step: ProcessStep, index: number) => {
              const angle = (index / steps.length) * 2 * Math.PI - Math.PI / 2;
              const x = centerX + radius * Math.cos(angle);
              const y = centerY + radius * Math.sin(angle);
  
              return (
                <div
                  key={step.id || index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                  style={{ left: `${(x / 500) * 100}%`, top: `${(y / 500) * 100}%` }}
                >
                  {/* Step Circle */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-500 hover:scale-110 mb-2 ${
                    isWhiteBackground 
                      ? 'bg-blue-500 text-white border-4 border-white' 
                      : 'bg-blue-400 text-blue-900 border-4 border-gray-900'
                  }`}>
                    {step.icon || (index + 1)}
                  </div>
                  
                  {/* Step Content */}
                  <div className={`w-48 p-3 rounded-lg shadow-sm text-center ${
                    isWhiteBackground 
                      ? 'bg-white border border-gray-200' 
                      : 'bg-white bg-opacity-10 border border-white border-opacity-20'
                  }`}>
                    <h4 className={`font-semibold text-sm mb-1 ${textColorClass}`}>
                      {step.label}
                    </h4>
                    <p className={`text-xs ${subtitleColorClass}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
  
            {/* Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 5 }}>
              {steps.map((_, index) => {
                const angle1 = (index / steps.length) * 2 * Math.PI - Math.PI / 2;
                const angle2 = ((index + 1) / steps.length) * 2 * Math.PI - Math.PI / 2;
                const x1 = centerX + (radius - 50) * Math.cos(angle1);
                const y1 = centerY + (radius - 50) * Math.sin(angle1);
                const x2 = centerX + (radius - 50) * Math.cos(angle2);
                const y2 = centerY + (radius - 50) * Math.sin(angle2);
  
                return (
                  <path
                    key={index}
                    d={`M ${x1} ${y1} A ${radius - 50} ${radius - 50} 0 0 1 ${x2} ${y2}`}
                    stroke={isWhiteBackground ? '#3B82F6' : '#60A5FA'}
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                    opacity="0.6"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      );
    };
  
    // Process Flow Layout 4: Card Flow
    const renderCardProcessFlow = (): JSX.Element | null => {
      if (steps.length === 0) return null;
  
      return (
        <div className="space-y-8">
          {/* Title */}
          <div className="text-center">
            <h1 className={`text-4xl font-bold ${textColorClass} mb-4`}>
              {title}
            </h1>
            <div className={`w-24 h-1 mx-auto rounded-full ${isWhiteBackground ? 'bg-blue-500' : 'bg-white opacity-50'}`}></div>
          </div>
  
          {/* Process Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {steps.map((step: ProcessStep, index: number) => (
              <div
                key={step.id || index}
                className={`relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  isWhiteBackground 
                    ? 'bg-white border border-gray-200' 
                    : 'bg-white bg-opacity-10 border border-white border-opacity-20'
                }`}
              >
                {/* Step Number Badge */}
                <div className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  isWhiteBackground ? 'bg-blue-500 text-white' : 'bg-blue-400 text-blue-900'
                }`}>
                  {index + 1}
                </div>
  
                <div className="p-6">
                  {/* Icon */}
                  {step.icon && (
                    <div className="text-3xl mb-4">
                      {step.icon}
                    </div>
                  )}
  
                  {/* Content */}
                  <h3 className={`font-bold text-lg mb-3 ${textColorClass}`}>
                    {step.label}
                  </h3>
                  <p className={`${subtitleColorClass} leading-relaxed`}>
                    {step.description}
                  </p>
  
                  {/* Progress indicator */}
                  <div className="mt-4">
                    <div className={`w-full h-1 rounded-full ${isWhiteBackground ? 'bg-gray-200' : 'bg-white bg-opacity-20'}`}>
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isWhiteBackground ? 'bg-blue-500' : 'bg-blue-400'}`}
                        style={{ width: `${((index + 1) / steps.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
  
                {/* Arrow to next step */}
                {index < steps.length - 1 && index % 2 === 0 && (
                  <div className={`absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 ${isWhiteBackground ? 'text-blue-500' : 'text-blue-400'}`}>
                    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    };
  
    // Process Flow Layout 5: Modern Flow
    const renderModernProcessFlow = (): JSX.Element | null => {
      if (steps.length === 0) return null;
  
      return (
        <div className="space-y-8">
          {/* Modern Header */}
          <div className="text-center">
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 ${isWhiteBackground ? 'bg-gray-100 text-gray-600' : 'bg-white bg-opacity-20 text-white'}`}>
              PROCESS WORKFLOW
            </div>
            <h1 className={`text-4xl font-bold ${textColorClass} mb-2`}>
              {title}
            </h1>
          </div>
  
          {/* Flow Steps */}
          <div className="space-y-6">
            {steps.map((step: ProcessStep, index: number) => (
              <div key={step.id || index} className="relative">
                <div className="flex items-start space-x-6">
                  {/* Step Indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg ${
                      isWhiteBackground 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-blue-400 text-blue-900'
                    }`}>
                      {step.icon || (index + 1)}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-0.5 h-16 mt-4 ${isWhiteBackground ? 'bg-gray-300' : 'bg-white bg-opacity-30'}`}></div>
                    )}
                  </div>
  
                  {/* Step Content */}
                  <div className={`flex-1 p-6 rounded-lg ${
                    isWhiteBackground 
                      ? 'bg-white border border-gray-200 shadow-sm' 
                      : 'bg-white bg-opacity-5 border border-white border-opacity-20'
                  }`}>
                    <h3 className={`font-bold text-lg mb-2 ${textColorClass}`}>
                      {step.label}
                    </h3>
                    <p className={`${subtitleColorClass} leading-relaxed`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  
    // Layout 0: Classic Split Comparison OR Horizontal Process Flow
    const renderSplitComparison = (): JSX.Element | null => {
      // If it's a process flow, render horizontal timeline
      if (isProcessFlow) {
        return renderHorizontalProcessFlow();
      }
      
      if (features.length === 0) return null;
  
      // Get the two comparison items (NotebookLM vs CustomGPT in your example)
      const comparisonKeys: string[] = Object.keys(features[0]).filter((key: string) => key !== 'name');
      const leftKey: string = comparisonKeys[0] || 'Option A';
      const rightKey: string = comparisonKeys[1] || 'Option B';
  
      return (
        <div className="space-y-8">
          {/* Title */}
          <div className="text-center">
            <h1 className={`text-4xl font-bold ${textColorClass} mb-4`}>
              {title}
            </h1>
            <div className={`w-24 h-1 mx-auto rounded-full ${isWhiteBackground ? 'bg-blue-500' : 'bg-white opacity-50'}`}></div>
          </div>
  
          {/* Comparison Headers */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div></div>
            <div className={`text-center p-4 rounded-lg ${isWhiteBackground ? 'bg-blue-50 border-2 border-blue-200' : 'bg-blue-500 bg-opacity-20 border-2 border-blue-400'}`}>
              <h2 className={`text-xl font-bold ${isWhiteBackground ? 'text-blue-700' : 'text-blue-200'}`}>
                {leftKey}
              </h2>
            </div>
            <div className={`text-center p-4 rounded-lg ${isWhiteBackground ? 'bg-purple-50 border-2 border-purple-200' : 'bg-purple-500 bg-opacity-20 border-2 border-purple-400'}`}>
              <h2 className={`text-xl font-bold ${isWhiteBackground ? 'text-purple-700' : 'text-purple-200'}`}>
                {rightKey}
              </h2>
            </div>
          </div>
  
          {/* Feature Rows */}
          <div className="space-y-3">
            {features.map((feature: ComparisonFeature, index: number) => (
              <div key={index} className="grid grid-cols-3 gap-4 items-center">
                {/* Feature Name */}
                <div className={`p-4 rounded-lg font-semibold ${textColorClass} ${isWhiteBackground ? 'bg-gray-100' : 'bg-white bg-opacity-10'}`}>
                  {feature.name}
                </div>
                
                {/* Left Value */}
                <div className={`p-4 rounded-lg text-center ${isWhiteBackground ? 'bg-blue-50 text-blue-800' : 'bg-blue-500 bg-opacity-20 text-blue-200'} border-l-4 ${isWhiteBackground ? 'border-blue-500' : 'border-blue-400'}`}>
                  {feature[leftKey]}
                </div>
                
                {/* Right Value */}
                <div className={`p-4 rounded-lg text-center ${isWhiteBackground ? 'bg-purple-50 text-purple-800' : 'bg-purple-500 bg-opacity-20 text-purple-200'} border-l-4 ${isWhiteBackground ? 'border-purple-500' : 'border-purple-400'}`}>
                  {feature[rightKey]}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  
    // Layout 1: Cards with VS Separator OR Vertical Process Flow
    const renderVsCards = (): JSX.Element | null => {
      // If it's a process flow, render vertical flow
      if (isProcessFlow) {
        return renderVerticalProcessFlow();
      }
      
      if (features.length === 0) return null;
  
      const comparisonKeys: string[] = Object.keys(features[0]).filter((key: string) => key !== 'name');
      const leftKey: string = comparisonKeys[0] || 'Option A';
      const rightKey: string = comparisonKeys[1] || 'Option B';
  
      return (
        <div className="space-y-8">
          {/* Title */}
          <div className="text-center">
            <h1 className={`text-4xl font-bold ${textColorClass} mb-2`}>
              {title}
            </h1>
            <div className="flex items-center justify-center space-x-4 mt-6">
            <span className={`text-2xl font-bold ${textColorClass} mx-4`}>VS</span>
            <span className={`px-6 py-2 rounded-full font-bold text-lg ${isWhiteBackground ? 'bg-purple-500 text-white' : 'bg-purple-400 text-purple-900'}`}>
              {rightKey}
            </span>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6">
          {features.map((feature: ComparisonFeature, index: number) => (
            <div key={index} className={`rounded-xl border-2 overflow-hidden ${isWhiteBackground ? 'border-gray-200 bg-white shadow-lg' : 'border-white border-opacity-20 bg-white bg-opacity-5'}`}>
              <div className={`p-4 text-center font-bold text-lg ${isWhiteBackground ? 'bg-gray-100 text-gray-800' : 'bg-white bg-opacity-10 text-white'}`}>
                {feature.name}
              </div>
              
              <div className="grid grid-cols-2">
                <div className={`p-6 ${isWhiteBackground ? 'bg-blue-50' : 'bg-blue-500 bg-opacity-10'} border-r ${isWhiteBackground ? 'border-gray-200' : 'border-white border-opacity-20'}`}>
                  <div className="text-center">
                    <div className={`inline-block p-3 rounded-full mb-3 ${isWhiteBackground ? 'bg-blue-500' : 'bg-blue-400'}`}>
                      <span className="text-white text-xl">📊</span>
                    </div>
                    <p className={`font-medium ${isWhiteBackground ? 'text-blue-800' : 'text-blue-200'}`}>
                      {feature[leftKey]}
                    </p>
                  </div>
                </div>
                
                <div className={`p-6 ${isWhiteBackground ? 'bg-purple-50' : 'bg-purple-500 bg-opacity-10'}`}>
                  <div className="text-center">
                    <div className={`inline-block p-3 rounded-full mb-3 ${isWhiteBackground ? 'bg-purple-500' : 'bg-purple-400'}`}>
                      <span className="text-white text-xl">🎯</span>
                    </div>
                    <p className={`font-medium ${isWhiteBackground ? 'text-purple-800' : 'text-purple-200'}`}>
                      {feature[rightKey]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Layout 2: Circular Comparison OR Circular Process Flow
  const renderCircularComparison = (): JSX.Element | null => {
    // If it's a process flow, render circular flow
    if (isProcessFlow) {
      return renderCircularProcessFlow();
    }
    
    if (features.length === 0) return null;

    const comparisonKeys: string[] = Object.keys(features[0]).filter((key: string) => key !== 'name');
    const leftKey: string = comparisonKeys[0] || 'Option A';
    const rightKey: string = comparisonKeys[1] || 'Option B';

    return (
      <div className="space-y-8">
        {/* Title */}
        <div className="text-center">
          <h1 className={`text-4xl font-bold ${textColorClass} mb-8`}>
            {title}
          </h1>
        </div>

        <div className="relative">
          {/* Central VS Circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-xl border-4 ${isWhiteBackground ? 'bg-white border-gray-300 text-gray-800' : 'bg-gray-900 border-white text-white'} shadow-lg`}>
              VS
            </div>
          </div>

          {/* Left and Right Circles */}
          <div className="grid grid-cols-2 gap-20 items-center">
            {/* Left Circle */}
            <div className="text-center">
              <div className={`w-48 h-48 mx-auto rounded-full flex items-center justify-center mb-6 ${isWhiteBackground ? 'bg-blue-500' : 'bg-blue-400'} shadow-2xl`}>
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">{leftKey}</h3>
                  <div className="text-4xl">🔍</div>
                </div>
              </div>
              
              <div className="space-y-3">
                {features.map((feature: ComparisonFeature, index: number) => (
                  <div key={index} className={`p-3 rounded-lg ${isWhiteBackground ? 'bg-blue-50 border border-blue-200' : 'bg-blue-500 bg-opacity-20 border border-blue-400'}`}>
                    <div className={`font-semibold ${isWhiteBackground ? 'text-blue-800' : 'text-blue-200'} mb-1`}>
                      {feature.name}
                    </div>
                    <div className={`text-sm ${isWhiteBackground ? 'text-blue-700' : 'text-blue-100'}`}>
                      {feature[leftKey]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Circle */}
            <div className="text-center">
              <div className={`w-48 h-48 mx-auto rounded-full flex items-center justify-center mb-6 ${isWhiteBackground ? 'bg-purple-500' : 'bg-purple-400'} shadow-2xl`}>
                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">{rightKey}</h3>
                  <div className="text-4xl">⚙️</div>
                </div>
              </div>
              
              <div className="space-y-3">
                {features.map((feature: ComparisonFeature, index: number) => (
                  <div key={index} className={`p-3 rounded-lg ${isWhiteBackground ? 'bg-purple-50 border border-purple-200' : 'bg-purple-500 bg-opacity-20 border border-purple-400'}`}>
                    <div className={`font-semibold ${isWhiteBackground ? 'text-purple-800' : 'text-purple-200'} mb-1`}>
                      {feature.name}
                    </div>
                    <div className={`text-sm ${isWhiteBackground ? 'text-purple-700' : 'text-purple-100'}`}>
                      {feature[rightKey]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Layout 3: Battle Card Style OR Card Process Flow
  const renderBattleCards = (): JSX.Element | null => {
    // If it's a process flow, render card flow
    if (isProcessFlow) {
      return renderCardProcessFlow();
    }
    
    if (features.length === 0) return null;

    const comparisonKeys: string[] = Object.keys(features[0]).filter((key: string) => key !== 'name');
    const leftKey: string = comparisonKeys[0] || 'Option A';
    const rightKey: string = comparisonKeys[1] || 'Option B';

    return (
      <div className="space-y-8">
        {/* Title with Battle Theme */}
        <div className="text-center">
          <h1 className={`text-4xl font-bold ${textColorClass} mb-4`}>
            {title}
          </h1>
          <div className="text-6xl mb-4">⚔️</div>
          <p className={`text-lg ${subtitleColorClass}`}>Choose Your Champion</p>
        </div>

        {/* Battle Cards */}
        <div className="grid grid-cols-2 gap-8">
          {/* Left Champion */}
          <div className={`rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300 ${isWhiteBackground ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
            <div className="p-6 text-white text-center">
              <div className="text-4xl mb-2">🛡️</div>
              <h3 className="text-2xl font-bold">{leftKey}</h3>
            </div>
            
            <div className={`p-6 space-y-4 ${isWhiteBackground ? 'bg-white' : 'bg-gray-900'}`}>
              {features.map((feature: ComparisonFeature, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20">
                  <span className={`font-semibold ${isWhiteBackground ? 'text-blue-800' : 'text-blue-200'}`}>
                    {feature.name}
                  </span>
                  <span className={`text-sm ${isWhiteBackground ? 'text-blue-600' : 'text-blue-300'}`}>
                    {feature[leftKey]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Champion */}
          <div className={`rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300 ${isWhiteBackground ? 'bg-gradient-to-br from-purple-400 to-purple-600' : 'bg-gradient-to-br from-purple-500 to-purple-700'}`}>
            <div className="p-6 text-white text-center">
              <div className="text-4xl mb-2">⚡</div>
              <h3 className="text-2xl font-bold">{rightKey}</h3>
            </div>
            
            <div className={`p-6 space-y-4 ${isWhiteBackground ? 'bg-white' : 'bg-gray-900'}`}>
              {features.map((feature: ComparisonFeature, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20">
                  <span className={`font-semibold ${isWhiteBackground ? 'text-purple-800' : 'text-purple-200'}`}>
                    {feature.name}
                  </span>
                  <span className={`text-sm ${isWhiteBackground ? 'text-purple-600' : 'text-purple-300'}`}>
                    {feature[rightKey]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Layout 4: Modern Dashboard Style OR Modern Process Flow
  const renderDashboardStyle = (): JSX.Element | null => {
    // If it's a process flow, render modern flow
    if (isProcessFlow) {
      return renderModernProcessFlow();
    }
    
    if (features.length === 0) return null;

    const comparisonKeys: string[] = Object.keys(features[0]).filter((key: string) => key !== 'name');
    const leftKey: string = comparisonKeys[0] || 'Option A';
    const rightKey: string = comparisonKeys[1] || 'Option B';

    return (
      <div className="space-y-8">
        {/* Modern Header */}
        <div className="text-center">
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 ${isWhiteBackground ? 'bg-gray-100 text-gray-600' : 'bg-white bg-opacity-20 text-white'}`}>
            COMPARISON ANALYSIS
          </div>
          <h1 className={`text-4xl font-bold ${textColorClass} mb-2`}>
            {title}
          </h1>
          <div className="flex justify-center space-x-8 mt-6">
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${isWhiteBackground ? 'bg-blue-500' : 'bg-blue-400'}`}></div>
              <span className={`text-sm font-medium ${textColorClass}`}>{leftKey}</span>
            </div>
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${isWhiteBackground ? 'bg-purple-500' : 'bg-purple-400'}`}></div>
              <span className={`text-sm font-medium ${textColorClass}`}>{rightKey}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-4">
          {features.map((feature: ComparisonFeature, index: number) => (
            <div key={index} className={`rounded-xl border p-6 ${isWhiteBackground ? 'border-gray-200 bg-white shadow-sm' : 'border-white border-opacity-20 bg-white bg-opacity-5'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${textColorClass}`}>
                  {feature.name}
                </h3>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${isWhiteBackground ? 'bg-gray-100 text-gray-600' : 'bg-white bg-opacity-20 text-white'}`}>
                  #{index + 1}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${isWhiteBackground ? 'bg-blue-50' : 'bg-blue-500 bg-opacity-20'}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isWhiteBackground ? 'bg-blue-500' : 'bg-blue-400'}`}></div>
                    <div>
                      <div className={`text-xs font-medium ${isWhiteBackground ? 'text-blue-600' : 'text-blue-200'} mb-1`}>
                        {leftKey}
                      </div>
                      <div className={`font-medium ${isWhiteBackground ? 'text-blue-800' : 'text-blue-100'}`}>
                        {feature[leftKey]}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${isWhiteBackground ? 'bg-purple-50' : 'bg-purple-500 bg-opacity-20'}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${isWhiteBackground ? 'bg-purple-500' : 'bg-purple-400'}`}></div>
                    <div>
                      <div className={`text-xs font-medium ${isWhiteBackground ? 'text-purple-600' : 'text-purple-200'} mb-1`}>
                        {rightKey}
                      </div>
                      <div className={`font-medium ${isWhiteBackground ? 'text-purple-800' : 'text-purple-100'}`}>
                        {feature[rightKey]}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render appropriate layout
  const renderLayout = (): JSX.Element | null => {
    switch (layoutType) {
      case 0:
        return renderSplitComparison();
      case 1:
        return renderVsCards();
      case 2:
        return renderCircularComparison();
      case 3:
        return renderBattleCards();
      case 4:
        return renderDashboardStyle();
      default:
        return renderSplitComparison();
    }
  };

  // If no data available, show placeholder
  if (!isProcessFlow && features.length === 0) {
    return (
      <div className={`${backgroundClass} rounded-lg p-8 min-h-80 flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className={`text-xl font-semibold ${textColorClass} mb-2`}>
            {title}
          </h3>
          <p className={`${subtitleColorClass}`}>
            No comparison data available
          </p>
          <div className="text-xs mt-2 space-y-1 opacity-60">
            <p>Data length: {data?.length || 0}</p>
            <p>Has content: {visualContent?.content ? 'Yes' : 'No'}</p>
            <p>Has features: {visualContent?.content?.features ? 'Yes' : 'No'}</p>
            <p>Layout: {layout}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isProcessFlow && steps.length === 0) {
    return (
      <div className={`${backgroundClass} rounded-lg p-8 min-h-80 flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <h3 className={`text-xl font-semibold ${textColorClass} mb-2`}>
            {title}
          </h3>
          <p className={`${subtitleColorClass}`}>
            No process steps available
          </p>
          <div className="text-xs mt-2 space-y-1 opacity-60">
            <p>Data length: {data?.length || 0}</p>
            <p>Has content: {visualContent?.content ? 'Yes' : 'No'}</p>
            <p>Has steps: {visualContent?.content?.steps ? 'Yes' : 'No'}</p>
            <p>Layout: {layout}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${backgroundClass} rounded-lg p-8 min-h-80 relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      <div className="relative z-10">
        {renderLayout()}
      </div>
    </div>
  );
}