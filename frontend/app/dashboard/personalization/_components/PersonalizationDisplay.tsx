import { useState, useEffect, useCallback } from "react";
import TemplateOptions from '@/app/(data)/TemplateOptions';
import FullScreen from '@/components/ui/full-screen';

// Import display components
import VideoDisplay from './VideoDisplay';
import AudioDisplay from './AudioDisplay';
import ImageDisplay from './ImageDisplay';
import CanvasDisplay from './CanvasDisplay';
import TextDisplay from './TextDisplay';
import ChartDisplay from './ChartDisplay';
import FlashCardDisplay from './FlashCardDisplay';
import GridDisplay from './GridDisplay';
import GameDisplay from './GameDisplay';
import InteractiveSliderDisplay from './InteractiveSliderDisplay';
import TimelineDisplay from './TimelineDisplay';
import MindMapDisplay from './MindMapDisplay';
import FlowChartDisplay from './FlowChartDisplay';
import InfographicDisplay from './InfographicDisplay';
import ChatPage from './ChatPage';


// Define the display type based on the personalized_output_types in TemplateOptions
export type DisplayType = 'chat-page' | 'text' | 'video' | 'image' | 'chart' | 'flash_card' | 'audio' | 'canvas' | 'grid' | 
                         'game' | 'interactive_slider' | 'timeline' | 'mind_map' | 'flow_chart' | 'infographic';

// Component props interface
interface PersonalizationDisplayProps {
  onAddNode?: (addNodeFn: Function) => void;
  displayType?: DisplayType;
  data?: any;
  isLoading?: boolean;
}

const PersonalizationDisplay: React.FC<PersonalizationDisplayProps> = ({ 
  onAddNode,
  displayType = 'chat_page', // Default display type
  data = null,
  isLoading = false
}) => {
  // Use the displayType prop directly instead of managing a state
  const activeDisplay = displayType;

  // Find the selected output type label for display
  const selectedOutputType = TemplateOptions.display_type.find(
    option => option.value === activeDisplay
  )?.label || 'Personalized Content';

  console.log('PersonalizationDisplay received props:', { displayType, data, isLoading });
  
  // Map of all display components
  const displayComponentMap: Record<string, any> = {
    'video': { component: VideoDisplay, title: 'Video' },
    'audio': { component: AudioDisplay, title: 'Audio' },
    'image': { component: ImageDisplay, title: 'Image' }, 
    'canvas': { component: CanvasDisplay, title: 'Canvas' },
    'text': { component: TextDisplay, title: 'Text' },
    'chart': { component: ChartDisplay, title: 'Chart' },
    'flash_card': { component: FlashCardDisplay, title: 'Flash Card' },
    'grid': { component: GridDisplay, title: 'Grid' },
    'game': { component: GameDisplay, title: 'Game' },
    'interactive_slider': { component: InteractiveSliderDisplay, title: 'Interactive Slider' },
    'timeline': { component: TimelineDisplay, title: 'Timeline' },
    'mind_map': { component: MindMapDisplay, title: 'Mind Map' },
    'flow_chart': { component: FlowChartDisplay, title: 'Flow Chart' },
    'infographic': { component: InfographicDisplay, title: 'Infographic' },
    'chat_page': { component: ChatPage, title: 'Chat Page' },
  };

  // These are the four primary display types that should always be visible
  const primaryDisplayTypes = ['video', 'audio', 'image', 'mind_map'];
  
  // Simply use the primary display types without adding the active display
  // This ensures we only show exactly four components
  let displayTypes = [...primaryDisplayTypes];

  // If the active display isn't one of the primary ones, make sure it's visible
  // by replacing the least important primary display
  if (activeDisplay && !primaryDisplayTypes.includes(activeDisplay)) {
    displayTypes[3] = activeDisplay; // Replace the last component with the active one
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Personalized Learning Experience</h1>
      
      <div className="mb-4">
        <p className="text-lg font-medium text-gray-700">
          Selected Output Type: <span className="text-blue-600 font-bold">{selectedOutputType}</span>
        </p>
      </div>
      
      {/* Content Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Display all components in the displayTypes array */}
        {displayTypes.map((type) => {
          if (!displayComponentMap[type]) return null;
          
          const { component: DisplayComponent, title } = displayComponentMap[type];
          const isActive = type === activeDisplay;
          
          // Use the same sizing for all components including ChatPage
          const columnClass = 'col-span-1';
          
          return (
            <div key={type} className={`relative ${columnClass}`}>
              <FullScreen>
                <DisplayComponent 
                  isActive={isActive}
                  onSelect={() => {}} 
                  data={type === activeDisplay && data ? data : null}
                  isLoading={isLoading}
                />
                {type === 'mind_map' && (
                  <div className="absolute top-0 right-0 bg-blue-100 p-1 text-xs">
                    
                  </div>
                )}
              </FullScreen>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PersonalizationDisplay;
