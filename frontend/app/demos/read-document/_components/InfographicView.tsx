'use client';

import React from 'react';
import { Infographic, InfographicData } from '@/components/ui/infographic';
import FullScreen from '@/components/ui/full-screen';

interface Infographics {
  title?: string;
  description?: string;
  theme?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    danger?: string;
    dark?: string;
    background?: string;
    surface?: string;
  } | string;
  layout?: {
    type?: "dashboard" | "single-chart" | "story-flow" | "comparison";
    columns?: number;
    responsive?: boolean;
    spacing?: "comfortable" | "compact" | "spacious";
  } | string;
  infographic?: any;
  components?: Array<{
    id?: string;
    type?: 'chart' | 'metric' | 'process-flow' | 'info-grid' | 'table' | 'text-block' | 
           'list' | 'timeline' | 'comparison' | 'stat-card' | 'progress-bar' | 
           'icon-stat' | 'quote-block' | 'feature-grid' | 'hierarchy';
    position?: { row?: number; col?: number; span?: number };
    title?: string;
    config?: any;
    styling?: any;
    content?: any;
    icon?: string;
    label?: string;
    description?: string;
    value?: string | number;
    unit?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    // Additional properties for enhanced components
    items?: any[];
    headers?: string[]; // For table components
    rows?: any[][]; // For table components
    steps?: any[]; // For process-flow components
    subtitle?: string; // For header components
    text?: string; // For list items and text components
    // Timeline properties
    events?: any[];
    orientation?: string;
    // Comparison properties
    left?: any;
    right?: any;
    // Stat-card properties
    change?: string;
    changeType?: string;
    // Quote properties
    author?: string;
    role?: string;
    // Feature grid properties
    features?: any[];
    // Hierarchy properties
    root?: any;
  }>;
  metrics?: any[];
  annotations?: any[];
  // Additional flexible properties for direct data access
  items?: any[];
  headers?: string[];
  rows?: any[][];
  steps?: any[];
  events?: any[];
  features?: any[];
  left?: any;
  right?: any;
  root?: any;
}

interface InfographicViewProps {
  data: Infographics;
}

const InfographicView: React.FC<InfographicViewProps> = ({ data }) => {
  console.log('Rendering infographic with data:', data);
  
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No infographic data available</p>
      </div>
    );
  }

  try {
    // Ensure theme is an object
    const themeObject = typeof data.theme === 'object' && data.theme !== null ? {
      primary: data.theme.primary || '#3B82F6',
      secondary: data.theme.secondary || '#10B981',
      accent: data.theme.accent || '#F59E0B',
      danger: data.theme.danger || '#EF4444',
      dark: data.theme.dark || '#1F2937',
      background: data.theme.background || '#F9FAFB',
      surface: data.theme.surface || '#FFFFFF'
    } : {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B',
      danger: '#EF4444',
      dark: '#1F2937',
      background: '#F9FAFB',
      surface: '#FFFFFF'
    };

    // Ensure layout is an object
    const layoutObject = typeof data.layout === 'object' && data.layout !== null ? {
      type: data.layout.type || 'dashboard',
      columns: data.layout.columns || 2,
      responsive: data.layout.responsive !== undefined ? data.layout.responsive : true,
      spacing: data.layout.spacing || 'comfortable'
    } : {
      type: 'dashboard',
      columns: 2,
      responsive: true,
      spacing: 'comfortable'
    };

    // Process components to ensure they have proper structure
    const processedComponents = Array.isArray(data.components) 
      ? data.components.map((component, index) => {
          const processedComponent = {
            id: component.id || `component-${index}`,
            type: component.type || 'text',
            position: component.position || { row: 1, col: 1, span: 1 },
            title: component.title,
            config: component.config,
            styling: component.styling,
            content: component.content,
            icon: component.icon,
            label: component.label,
            description: component.description,
            value: component.value,
            unit: component.unit,
            trend: component.trend,
            trendValue: component.trendValue,
            // Additional properties for enhanced components
            items: component.items,
            headers: component.headers,
            rows: component.rows,
            steps: component.steps,
            subtitle: component.subtitle,
            text: component.text,
            // New properties for additional components
            events: component.events,
            orientation: component.orientation,
            left: component.left,
            right: component.right,
            change: component.change,
            changeType: component.changeType,
            author: component.author,
            role: component.role,
            features: component.features,
            root: component.root
          };

          // Process component based on type
          switch (component.type?.toLowerCase() || 'unknown') {
            case 'chart':
              // Ensure chart data is properly structured
              if (component.config && component.config.data) {
                // Any chart specific processing
              }
              break;

            case 'process-flow':
              // Ensure process-flow has proper steps
              if (component.config && component.config.steps) {
                processedComponent.config = {
                  direction: component.config.direction || 'vertical',
                  connectorType: component.config.connectorType || 'arrow',
                  steps: component.config.steps.map((step: any, stepIndex: number) => ({
                    id: step.id || `step-${stepIndex}`,
                    label: step.label || step.title || `Step ${stepIndex + 1}`,
                    description: step.description || '',
                    ...step
                  }))
                };
              } else if (component.steps) {
                // Handle steps directly on component
                processedComponent.steps = component.steps.map((step: any, stepIndex: number) => ({
                  id: step.id || `step-${stepIndex}`,
                  label: step.label || step.title || `Step ${stepIndex + 1}`,
                  description: step.description || '',
                  ...step
                }));
              }
              break;

            case 'info-grid':
              // Ensure info-grid has proper items
              if (component.config && component.config.items) {
                // Handle items in config
              } else if (component.items) {
                // Handle items directly on component
              }
              break;

            case 'table':
              // Ensure table has proper headers and rows
              if (component.config) {
                // Handle headers and rows in config
              } else if (component.headers && component.rows) {
                // Handle headers and rows directly on component
              }
              break;

            case 'text-block':
              // Ensure text-block has content or sections
              if (!component.config) {
                processedComponent.config = { content: component.content || '' };
              }
              break;

            case 'list':
              // Ensure list has items
              if (component.config && component.config.items) {
                // Handle items in config
              } else if (component.items) {
                // Handle items directly on component
                processedComponent.config = { items: component.items };
              }
              break;

            case 'timeline':
              // Ensure timeline has events
              if (component.config && component.config.events) {
                // Handle events in config
              } else if (component.events) {
                // Handle events directly on component
                processedComponent.config = { 
                  orientation: component.orientation || 'vertical',
                  events: component.events 
                };
              }
              break;

            case 'comparison':
              // Ensure comparison has left and right content
              if (component.config && (component.config.left || component.config.right)) {
                // Handle left/right in config
              } else if (component.left || component.right) {
                // Handle left/right directly on component
                processedComponent.config = { left: component.left, right: component.right };
              }
              break;

            case 'stat-card':
              // Stat-card specific properties are already handled in the base component structure
              // No additional processing needed
              break;

            case 'progress-bar':
              // Ensure progress-bar has items
              if (component.config && component.config.items) {
                // Handle items in config
              } else if (component.items) {
                // Handle items directly on component
                processedComponent.config = { items: component.items };
              }
              break;

            case 'icon-stat':
              // Ensure icon-stat has items
              if (component.config && component.config.items) {
                // Handle items in config
              } else if (component.items) {
                // Handle items directly on component
                processedComponent.config = { items: component.items };
              }
              break;

            case 'quote-block':
              // Ensure quote-block has content and author
              if (!component.config) {
                processedComponent.config = { 
                  content: component.content,
                  author: component.author,
                  role: component.role
                };
              }
              break;

            case 'feature-grid':
              // Ensure feature-grid has features
              if (component.config && component.config.features) {
                processedComponent.config = {
                  ...component.config,
                  features: component.config.features.map((feature: any, featureIndex: number) => ({
                    id: feature.id || `feature-${featureIndex}`,
                    icon: feature.icon,
                    title: feature.title || `Feature ${featureIndex + 1}`,
                    description: feature.description || '',
                    highlight: feature.highlight || false,
                    ...feature
                  }))
                };
              } else if (component.features) {
                // Handle features directly on component
                processedComponent.features = component.features.map((feature: any, featureIndex: number) => ({
                  id: feature.id || `feature-${featureIndex}`,
                  icon: feature.icon,
                  title: feature.title || `Feature ${featureIndex + 1}`,
                  description: feature.description || '',
                  highlight: feature.highlight || false,
                  ...feature
                }));
              }
              break;

            case 'hierarchy':
              // Ensure hierarchy has proper root structure
              if (component.config && component.config.root) {
                processedComponent.config = {
                  root: component.config.root,
                  ...component.config
                };
              } else if (component.root) {
                // Handle root directly on component
                processedComponent.root = component.root;
              }
              break;
              
            case 'metric':
              // Metric-specific properties are already handled in the base component structure
              // No additional processing needed
              break;

            default:
              // For other component types, keep as is
              break;
          }

          return processedComponent;
        })
      : [];

    // Format data to match InfographicData interface
    const formattedData: InfographicData = {
      title: data.title || 'Infographic',
      description: data.description || 'Document infographic visualization',
      theme: themeObject,
      layout: {
        type: layoutObject.type,
        columns: layoutObject.columns,
        responsive: layoutObject.responsive,
        spacing: layoutObject.spacing
      },
      components: processedComponents.map(comp => ({
        ...comp,
        position: {
          row: comp.position?.row || 0,
          col: comp.position?.col || 0,
          span: comp.position?.span || 1
        }
      })),
      metrics: Array.isArray(data.metrics) ? data.metrics.map((metric, index) => ({
        id: metric.id || `metric-${index}`,
        label: metric.label || `Metric ${index + 1}`,
        value: String(metric.value || '0'),
        unit: metric.unit,
        trend: metric.trend,
        trendValue: metric.trendValue,
        description: metric.description
      })) : [],
      annotations: Array.isArray(data.annotations) ? data.annotations.map((annotation, index) => ({
        id: annotation.id || `annotation-${index}`,
        type: annotation.type || 'note',
        content: annotation.content || '',
        position: annotation.position || 'top',
        styling: annotation.styling || 'info'
      })) : []
    };
    
    console.log('Processed formattedData:', formattedData);
    
    return (
      <FullScreen buttonPosition="absolute right-2 top-2 z-10">
        <div className="h-full overflow-y-auto p-4">
          <Infographic data={formattedData} />
        </div>
      </FullScreen>
    );
    
  } catch (error) {
    console.error('Error rendering InfographicView:', error);
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="mb-2">Error loading infographic</p>
          <p className="text-sm">Check console for details</p>
          <pre className="text-xs text-left mt-2 bg-gray-100 p-2 rounded max-w-md overflow-auto">
            {error instanceof Error ? error.message : 'Unknown error'}
          </pre>
        </div>
      </div>
    );
  }
};

export default InfographicView;