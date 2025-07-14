'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  ChartOptions as ChartJSOptions,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, Radar } from 'react-chartjs-2';
import { ArrowUp, ArrowDown, Minus, ArrowRight, Calendar, TrendingUp, Quote, X, Check } from 'lucide-react';
import { getIcon, Icon, IconName } from './icons';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend
);

interface InfographicTheme {
  primary: string;
  secondary: string;
  accent: string;
  danger: string;
  dark: string;
  background: string;
  surface: string;
}

interface InfographicLayout {
  type: string; // Changed from union type to string for flexibility
  columns: number;
  responsive: boolean;
  spacing: string; // Changed from union type to string for flexibility
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// Use Chart.js native options type instead of custom interface
type ChartOptions = any; // This allows for flexible chart options

interface ChartConfig {
  chartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'scatter' | 'bubble' | 'polarArea';
  data: ChartData;
  options: ChartOptions;
}

interface ChartStyling {
  containerClass: string;
  titleClass: string;
  height: string;
  customCSS?: Record<string, string>;
}

interface InfographicComponent {
  id: string;
  type: string; // Made more flexible to handle any component type
  position: { row: number; col: number; span: number };
  title?: string;
  config?: ChartConfig | any; // Made more flexible to handle different config types
  styling?: ChartStyling | any; // Made more flexible
  content?: any; // Allow various content types
  // Step-specific properties
  icon?: string;
  label?: string;
  description?: string;
  // Additional properties for flexibility
  value?: string | number;
  unit?: string;
  trend?: string;
  trendValue?: string;
  // New properties for enhanced components
  items?: any[]; // For info-grid and list components
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
}

interface InfographicMetric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  description?: string;
}

interface InfographicAnnotation {
  id: string;
  type: 'callout' | 'highlight' | 'note';
  content: string;
  position: string;
  styling: 'info' | 'warning' | 'success' | 'error' | 'neutral';
}

export interface InfographicData {
  title: string;
  description: string;
  theme: InfographicTheme;
  layout: InfographicLayout;
  components: InfographicComponent[];
  metrics?: InfographicMetric[];
  annotations?: InfographicAnnotation[];
}

const renderChart = (config: ChartConfig, styling: ChartStyling) => {
  const { chartType, data, options } = config;
  const { height } = styling;

  // Convert options to ensure compatibility and prevent infinite growth
  const chartOptions = {
    ...options,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      ...options.plugins,
      legend: {
        ...options.plugins?.legend,
        display: options.plugins?.legend?.display ?? true,
      },
      tooltip: {
        ...options.plugins?.tooltip,
        enabled: options.plugins?.tooltip?.enabled ?? true,
      }
    },
    scales: {
      ...options.scales,
      x: {
        ...options.scales?.x,
        display: options.scales?.x?.display ?? true,
      },
      y: {
        ...options.scales?.y,
        beginAtZero: options.scales?.y?.beginAtZero ?? true,
      }
    }
  };

  // Create a container with fixed dimensions to prevent growth
  const containerStyle = {
    height: height || '300px',
    width: '100%',
    position: 'relative' as const,
    overflow: 'hidden'
  };

  const chartStyle = {
    height: '100%',
    width: '100%'
  };

  const commonProps = {
    data,
    options: chartOptions,
    style: chartStyle
  };

  return (
    <div style={containerStyle}>
      {(() => {
        switch (chartType) {
          case 'bar':
            return <Bar {...commonProps} />;
          case 'line':
            return <Line {...commonProps} />;
          case 'pie':
            return <Pie {...commonProps} />;
          case 'doughnut':
            return <Doughnut {...commonProps} />;
          case 'radar':
            return <Radar {...commonProps} />;
          default:
            return <div className="p-4 text-gray-500">Chart type not supported</div>;
        }
      })()}
    </div>
  );
};

// New component to render info-grid components
const InfoGridComponent = ({ config, component }: { config: any, component?: any }) => {
  const items = config?.items || component?.items || [];
  
  if (!items.length) {
    return <div className="text-gray-500">No info grid data available</div>;
  }

  return (
    <div className="flex flex-col space-y-4">
      {items.map((item: any, index: number) => (
        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          {item.icon && (
            <div className="mb-2 text-xl text-primary">
              {getIcon(item.icon as IconName)}
            </div>
          )}
          <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
          <p className="text-sm text-gray-600">{item.description}</p>
        </div>
      ))}
    </div>
  );
};

// Enhanced process-flow component to handle flexible data structures
const ProcessFlowComponent = ({ config, component }: { config: any, component?: any }) => {
  const steps = config?.steps || component?.steps || [];
  const orientation = config?.orientation || component?.orientation || 'vertical';
  
  if (!steps.length) {
    return <div className="text-gray-500">No process steps available</div>;
  }

  return (
    <div className="flex flex-col space-y-8">
      {steps.map((step: any, index: number) => (
        <div key={index} className="relative">
          <div className="flex flex-col bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full mr-3 flex-shrink-0">
                {index + 1}
              </div>
              <h4 className="font-medium text-gray-900">{step.title}</h4>
            </div>
            {step.description && (
              <p className="text-sm text-gray-600 ml-11">{step.description}</p>
            )}
          </div>
          
          {index < steps.length - 1 && (
            <div className="flex justify-center my-2">
              <ArrowDown className="text-gray-400" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Enhanced table component to handle flexible data structures
const TableComponent = ({ config, component }: { config: any, component?: any }) => {
  // Handle direct headers/rows in config
  let headers = config?.headers;
  let rows = config?.rows;

  // Handle headers/rows directly in component
  if (!headers && component?.headers) {
    headers = component.headers;
  }
  if (!rows && component?.rows) {
    rows = component.rows;
  }

  // Handle table data in different formats
  if (!headers || !rows) {
    // Try to extract from component properties
    if (component?.data) {
      if (Array.isArray(component.data) && component.data.length > 0) {
        // Extract headers from first object keys
        headers = Object.keys(component.data[0]);
        rows = component.data.map((item: any) => Object.values(item));
      }
    }
  }

  if (!headers || !rows) {
    return <div className="text-gray-500">No table data available</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            {headers.map((header: string, index: number) => (
              <th key={index} className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-800">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any[], rowIndex: number) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell: any, cellIndex: number) => (
                <td key={cellIndex} className="border border-gray-300 px-4 py-2 text-gray-700">
                  {String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Enhanced text-block component
const TextBlockComponent = ({ config }: { config: any }) => {
  if (!config) {
    return <div className="text-gray-500">No text content available</div>;
  }

  // Handle simple content string
  if (typeof config.content === 'string') {
    return (
      <div className="prose prose-sm max-w-none">
        <div 
          className="text-gray-700 leading-relaxed whitespace-pre-line"
          dangerouslySetInnerHTML={{ 
            __html: config.content
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/•/g, '•')
          }}
        />
      </div>
    );
  }

  // Handle sections array
  if (config.sections) {
    return (
      <div className="space-y-4">
        {config.sections.map((section: any, index: number) => (
          <div key={index} className="space-y-2">
            {section.heading && (
              <h4 className="font-semibold text-gray-800">
                {section.heading}
              </h4>
            )}
            {section.content && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {section.content}
              </p>
            )}
          </div>
        ))}
        
        {config.visualAid && config.visualAid.type === 'icon-grid' && (
          <div className="flex justify-center space-x-6 mt-4 pt-4 border-t border-gray-200">
            {config.visualAid.icons?.map((iconItem: any, index: number) => (
              <div key={index} className="text-center">
                <div className="text-2xl mb-1">
                  {getIcon(iconItem.name as IconName)}
                </div>
                <div className="text-xs text-gray-500">
                  {iconItem.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <div className="text-gray-500">Invalid text block configuration</div>;
};

// New component to render process/timeline components
const ProcessComponent = ({ config }: { config: any }) => {
  if (!config || !config.steps) {
    return <div className="text-gray-500">No process data available</div>;
  }

  return (
    <div className="space-y-4">
      {config.steps.map((step: any, index: number) => (
        <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
          {step.icon && (
            <div className="flex-shrink-0 text-2xl">
              {typeof step.icon === 'string' ? getIcon(step.icon as IconName) : step.icon}
            </div>
          )}
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">
              {step.title}
            </h4>
            {step.description && (
              <p className="text-sm text-gray-600">
                {step.description}
              </p>
            )}
          </div>
          {index < config.steps.length - 1 && (
            <div className="flex-shrink-0 text-gray-400">
              ↓
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Enhanced list component to handle flexible data structures
const ListComponent = ({ config, component }: { config: any, component?: any }) => {
  let items = config?.items;

  // Handle items directly in component
  if (!items && component?.items) {
    items = component.items;
  }

  // Handle different item formats
  if (!items) {
    return <div className="text-gray-500">No list data available</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((item: any, index: number) => {
        // Handle different item structures
        let iconName = item.icon as IconName;
        let label = item.label || item.title || item.text;
        let description = item.description || item.subtitle;
        
        return (
          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            {iconName && (
              <div className="flex-shrink-0 text-xl">
                {getIcon(iconName)}
              </div>
            )}
            <div className="flex-1">
              {label && (
                <h5 className="font-medium text-gray-800 mb-1">
                  {label}
                </h5>
              )}
              {description && (
                <p className="text-sm text-gray-600">
                  {description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// NEW: Timeline Component
const TimelineComponent = ({ config, component }: { config: any, component?: any }) => {
  const events = config?.events || component?.events || [];
  
  if (!events.length) {
    return <div className="text-gray-500">No timeline events available</div>;
  }

  return (
    <div className="flex flex-col space-y-2">
      {events.map((event: any, index: number) => (
        <div key={index} className="relative pb-8 last:pb-0">
          <div className="flex flex-col ml-6 border-l-2 border-blue-300 pl-4 pb-4">
            <div className="absolute left-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white">
              {event.icon ? getIcon(event.icon as IconName) : <Calendar className="w-3 h-3" />}
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium text-blue-600">{event.date}</span>
            </div>
            <h4 className="font-medium text-gray-900 mt-1">{event.title}</h4>
            {event.description && (
              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// NEW: Comparison Component
// Updated iconMap to include missing icons
const updatedIconMap: Record<string, string> = {
  // Add missing icons that might be used
  'X': '❌',
  'Check': '✅',
  'Users': '👥',
  'MapPin': '📍', 
  'Cloud': '☁️',
  'AlertCircle': '⚠️',
  'EyeOff': '👁️‍🗨️',
  'Lock': '🔒',
  'Banknote': '💰',
  'Clock': '🕐',
  'Globe': '🌍',
  'MessageSquare': '💬',
  'GitFork': '🔀',
  'HelpCircle': '❓',
  'LayoutList': '📋',
  'BookOpen': '📖',
  'Brain': '🧠',
  'TrendingDown': '📉',
  'Map': '🗺️',
  // ... existing icons
};

// Fixed ComparisonComponent in infographic.tsx
const ComparisonComponent = ({ config, component }: { config: any, component?: any }) => {
  const left = config?.left || component?.left;
  const right = config?.right || component?.right;

  if (!left || !right) {
    return <div className="text-gray-500">No comparison data available</div>;
  }

  const renderItem = (item: any, index: number, isLeft: boolean = true) => {
    // Handle both string items and object items
    if (typeof item === 'string') {
      return (
        <li key={index} className="flex items-start space-x-2">
          <span className={`${isLeft ? 'text-red-500' : 'text-green-500'} mt-1`}>
            {getIcon(isLeft ? 'X' : 'Check')}
          </span>
          <span className={`text-sm ${isLeft ? 'text-red-700' : 'text-green-700'}`}>
            {item}
          </span>
        </li>
      );
    } else if (typeof item === 'object' && item !== null) {
      // Handle object items with icon and label properties
      const iconName = item.icon || (isLeft ? 'X' : 'Check');
      const label = item.label || item.text || item.description || '';
      
      return (
        <li key={index} className="flex items-start space-x-2">
          <span className={`${isLeft ? 'text-red-500' : 'text-green-500'} mt-1`}>
            {getIcon(iconName as IconName)}
          </span>
          <span className={`text-sm ${isLeft ? 'text-red-700' : 'text-green-700'}`}>
            {label}
          </span>
        </li>
      );
    } else {
      // Fallback for other types
      return (
        <li key={index} className="flex items-start space-x-2">
          <span className={`${isLeft ? 'text-red-500' : 'text-green-500'} mt-1`}>
            {getIcon(isLeft ? 'X' : 'Check')}
          </span>
          <span className={`text-sm ${isLeft ? 'text-red-700' : 'text-green-700'}`}>
            {String(item)}
          </span>
        </li>
      );
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h4 className="font-semibold text-red-900 mb-4 text-center">
          {left.label || 'Before'}
        </h4>
        <ul className="space-y-2">
          {left.items?.map((item: any, index: number) => renderItem(item, index, true))}
        </ul>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h4 className="font-semibold text-green-900 mb-4 text-center">
          {right.label || 'After'}
        </h4>
        <ul className="space-y-2">
          {right.items?.map((item: any, index: number) => renderItem(item, index, false))}
        </ul>
      </div>
    </div>
  );
};
// NEW: Stat Card Component
const StatCardComponent = ({ component }: { component: any }) => {
  if (!component) {
    return <div className="text-gray-500">No stat card data available</div>;
  }

  const items = component.items || [];

  return (
    <div className="flex flex-col space-y-4">
      {items && items.length > 0 ? (
        items.map((item: any, index: number) => (
          <div 
            key={index} 
            className="bg-slate-50 rounded-lg p-4 border border-slate-200"
          >
            <div className="flex items-center">
              {item.icon && (
                <div className="mr-3 text-slate-700">
                  {getIcon(item.icon as IconName)}
                </div>
              )}
              <div>
                <div className="text-2xl font-bold text-slate-800">
                  {item.value}{item.unit && <span className="text-slate-500 text-lg ml-1">{item.unit}</span>}
                </div>
                <div className="text-sm text-slate-500">{item.label}</div>
              </div>
              {item.trend && (
                <div className={`ml-auto flex items-center ${
                  item.trend === 'up' ? 'text-green-500' : 
                  item.trend === 'down' ? 'text-red-500' : 
                  'text-slate-500'
                }`}>
                  {item.trend === 'up' && <ArrowUp className="w-4 h-4 mr-1" />}
                  {item.trend === 'down' && <ArrowDown className="w-4 h-4 mr-1" />}
                  {item.trend === 'neutral' && <Minus className="w-4 h-4 mr-1" />}
                  {item.trendValue && <span className="text-sm">{item.trendValue}</span>}
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-500">No stat items available</div>
      )}
    </div>
  );
};

// NEW: Progress Bar Component
const ProgressBarComponent = ({ config, component }: { config: any, component?: any }) => {
  const items = config?.items || component?.items || [];

  if (!items.length) {
    return <div className="text-gray-500">No progress data available</div>;
  }

  return (
    <div className="space-y-4">
      {items.map((item: any, index: number) => (
        <div key={index}>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{item.label}</span>
            <span className="text-sm font-medium text-gray-700">{item.value}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full transition-all duration-500"
              style={{ 
                width: `${item.value}%`,
                backgroundColor: item.color || '#3B82F6'
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// NEW: Icon Stat Component
// NEW: Icon Stat Component - Updated for vertical layout
const IconStatComponent = ({ config, component }: { config: any, component?: any }) => {
  const items = config?.items || component?.items || [];

  if (!items.length) {
    return <div className="text-gray-500">No icon stat data available</div>;
  }

  return (
    <div className="flex flex-col space-y-4">
      {items.map((item: any, index: number) => (
        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="text-3xl text-blue-600 flex-shrink-0">
              {getIcon(item.icon as IconName)}
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
              <div className="text-sm text-gray-500">{item.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// NEW: Quote Block Component
const QuoteBlockComponent = ({ config, component }: { config: any, component?: any }) => {
  const content = config?.content || component?.content || '';
  const author = config?.author || component?.author || '';
  const role = config?.role || component?.role || '';

  return (
    <div className="bg-gray-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
      <div className="flex items-start space-x-3">
        <Quote className="text-blue-600 flex-shrink-0 w-8 h-8" />
        <div className="flex-1">
          <p className="text-lg italic text-gray-700 mb-3">"{content}"</p>
          {author && (
            <div className="text-sm">
              <span className="font-semibold text-gray-900">{author}</span>
              {role && <span className="text-gray-600"> - {role}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// NEW: Feature Grid Component
const FeatureGridComponent = ({ config, component }: { config: any, component?: any }) => {
  const features = config?.features || component?.features || [];

  if (!features.length) {
    return <div className="text-gray-500">No feature data available</div>;
  }

  return (
    <div className="flex flex-col space-y-4">
      {features.map((feature: any, index: number) => (
        <div 
          key={index} 
          className="border border-gray-200 rounded-lg p-4 bg-white"
        >
          <div className="flex items-start">
            {feature.icon && (
              <div className="flex-shrink-0 mr-3 text-primary">
                {getIcon(feature.icon as IconName)}
              </div>
            )}
            <div>
              <h4 className="font-medium text-gray-900 mb-1">{feature.title}</h4>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// NEW: Hierarchy Component
const HierarchyComponent = ({ config, component }: { config: any, component?: any }) => {
  const root = config?.root || component?.root;
  
  if (!root) {
    return <div className="text-gray-500">No hierarchy data available</div>;
  }

  const renderNode = (node: any, level = 0) => {
    if (!node) return null;

    return (
      <div className="ml-4">
        <div className={`flex items-center p-2 my-2 rounded-lg ${level === 0 ? 'bg-blue-100' : 'bg-gray-50'}`}>
          <div className="font-medium">{node.label}</div>
        </div>
        {Array.isArray(node.children) && node.children.length > 0 && (
          <div className="ml-4 pl-4 border-l-2 border-gray-300">
            {node.children.map((child: any, index: number) => (
              <React.Fragment key={index}>
                {renderNode(child, level + 1)}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-auto max-h-[500px]">
      {renderNode(root)}
    </div>
  );
};

// NEW: Standalone Metric Component
const MetricComponent = ({ config, component }: { config?: any, component?: any }) => {
  // Allow using either config or component as the data source
  const data = config || component || {};
  const {
    value = '0',
    unit = '',
    label = '',
    description = '',
    icon = 'TrendingUp',
    trend = 'neutral',
    trendValue = '',
  } = data;

  let trendIcon = null;
  if (trend === 'up') {
    trendIcon = <ArrowUp className="w-4 h-4 text-green-500" />;
  } else if (trend === 'down') {
    trendIcon = <ArrowDown className="w-4 h-4 text-red-500" />;
  } else if (trend === 'neutral') {
    trendIcon = <Minus className="w-4 h-4 text-gray-500" />;
  }
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="text-sm text-gray-500 font-medium mb-1">{label}</div>
      <div className="flex items-baseline space-x-1">
        <div className="text-3xl font-bold">{value}</div>
        {unit && <div className="text-lg text-gray-500">{unit}</div>}
      </div>
      {(trend || trendValue) && (
        <div className="mt-2 flex items-center space-x-1">
          {trendIcon}
          {trendValue && <span className="text-sm">{trendValue}</span>}
        </div>
      )}
      {description && <div className="mt-1 text-xs text-gray-500">{description}</div>}
    </div>
  );
};

export const Infographic: React.FC<{ data: InfographicData }> = ({ data }) => {
  const { title, description, theme, layout, components, metrics, annotations } = data;
  
  if (!components || components.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-center">
        <div>
          <div className="text-2xl font-bold text-gray-400">No infographic data available</div>
          <p className="mt-2 text-gray-500">The infographic contents could not be rendered.</p>
        </div>
      </div>
    );
  }

  // Sort components by row for proper vertical layout
  const sortedComponents = [...components].sort((a, b) => {
    const rowA = a.position?.row || 0;
    const rowB = b.position?.row || 0;
    return rowA - rowB;
  });

  // Use spacingClass for vertical spacing between components
  const spacingClass = layout.spacing === 'compact' ? 'space-y-2' : layout.spacing === 'spacious' ? 'space-y-8' : 'space-y-4';
  
  return (
    <div 
      className="infographic w-full"
      style={{
        backgroundColor: theme.background,
        color: theme.dark,
      }}
    >
      <div className="infographic-header mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        {description && <p className="text-gray-600">{description}</p>}
      </div>
      
      <div className={`infographic-body flex flex-col ${spacingClass}`}>
        {sortedComponents.map((component, index) => {
          const key = component.id || `component-${index}`;
          
          return (
            <div key={key} className="w-full bg-white rounded-lg shadow-sm p-4">
              {component.title && (
                <h3 className="text-lg font-semibold mb-3">{component.title}</h3>
              )}
              
              {(() => {
                switch (component.type) {
                  case 'chart':
                    return renderChart(
                      component.config || { chartType: 'bar', data: { labels: [], datasets: [] }, options: {} }, 
                      component.styling || { containerClass: '', titleClass: '', height: '300px' }
                    );
                  case 'metric':
                    return <MetricComponent config={component.config} component={component} />;
                  case 'process-flow':
                    return <ProcessFlowComponent config={component.config} component={component} />;
                  case 'info-grid':
                    return <InfoGridComponent config={component.config} component={component} />;
                  case 'table':
                    return <TableComponent config={component.config} component={component} />;
                  case 'text-block':
                    return <TextBlockComponent config={component.config || { content: component.content }} />;
                  case 'list':
                    return <ListComponent config={component.config} component={component} />;
                  case 'timeline':
                    return <TimelineComponent config={component.config} component={component} />;
                  case 'comparison':
                    return <ComparisonComponent config={component.config} component={component} />;
                  case 'stat-card':
                    return <StatCardComponent component={component} />;
                  case 'progress-bar':
                    return <ProgressBarComponent config={component.config} component={component} />;
                  case 'icon-stat':
                    return <IconStatComponent config={component.config} component={component} />;
                  case 'quote-block':
                    return <QuoteBlockComponent config={component.config} component={component} />;
                  case 'feature-grid':
                    return <FeatureGridComponent config={component.config} component={component} />;
                  case 'hierarchy':
                    return <HierarchyComponent config={component.config} component={component} />;
                  default:
                    return <div className="text-gray-500">Unknown component type: {component.type}</div>;
                }
              })()}
            </div>
          );
        })}
      </div>
      
      {metrics && metrics.length > 0 && (
        <div className="infographic-metrics mt-8">
          <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
          <div className="flex flex-col space-y-4">
            {metrics.map((metric, index: number) => (
              <MetricComponent 
                key={metric.id || `metric-${index}`}
                component={metric}
                config={metric}
              />
            ))}
          </div>
        </div>
      )}
      
      {annotations && annotations.length > 0 && (
        <div className="infographic-annotations mt-8">
          {annotations.map((anno, index: number) => {
            const colorClass = 
              anno.styling === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' :
              anno.styling === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
              anno.styling === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
              anno.styling === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-gray-50 border-gray-200 text-gray-800';
              
            return (
              <div 
                key={anno.id || `anno-${index}`} 
                className={`p-3 rounded-lg border ${colorClass} mb-3`}
              >
                <div className="text-sm">{anno.content}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};