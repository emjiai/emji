import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Lightbulb, Database, AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react'; // Example icons

// --- Base Node (Included for completeness) ---
const BaseNode = memo(({ data, isConnectable }) => {
  return (
    <div className="react-flow__node-default p-3 border border-gray-300 bg-white rounded-md shadow-sm min-w-[150px] text-sm">
      {/* Target Handle (Top) */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!bg-teal-500 !w-2 !h-2"
      />
      {/* Node Content */}
      <div>
        <p className="font-medium text-gray-800">{data.label || 'Unnamed Node'}</p>
      </div>
      {/* Source Handle (Bottom) - Example of Base Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="a" // Unique ID for this handle
        isConnectable={isConnectable}
        className="!bg-orange-500 !w-2 !h-2"
      />
       {/* Example of Handle with Label (Right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="b" // Unique ID
        style={{ top: '70%' }} // Adjust position as needed
        isConnectable={isConnectable}
        className="!bg-blue-500 !w-2 !h-2"
      >
         {/* Label positioned relative to the handle */}
         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs bg-gray-100 px-1 rounded border text-gray-600">Output</span>
      </Handle>
       {/* Example of Button Handle (Bottom-Left) - Styling makes it look like a button */}
       {/* Interaction logic (onClick) would be added here or on the node itself */}
       <Handle
        type="source"
        position={Position.Left}
        id="c" // Unique ID
        style={{ top: '30%', background: '#f44336', width: '12px', height: '12px', borderRadius: '3px' }}
        isConnectable={isConnectable}
        className="cursor-pointer hover:opacity-80"
        title="Action Handle" // Tooltip for the handle
      />
    </div>
  );
});

// --- Tooltip Node ---
const TooltipNode = memo(({ data, isConnectable }) => {
  return (
    <div
      className="group relative react-flow__node-default p-3 border border-gray-300 bg-white rounded-md shadow-sm min-w-[150px] text-sm"
      title={data.tooltip} // Use native title attribute for simple tooltips
    >
      {/* Target Handle */}
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="!bg-teal-500 !w-2 !h-2" />
      {/* Node Content */}
      <div>
        <p className="font-medium text-gray-800">{data.label || 'Node'}</p>
      </div>
      {/* Source Handle */}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="!bg-orange-500 !w-2 !h-2" />

      {/* More complex tooltip example using absolute positioning and group-hover */}
      {/* <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {data.tooltip || 'No details'}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div> Arrow
      </div> */}
    </div>
  );
});

// --- Placeholder Node ---
const PlaceholderNode = memo(({ data, isConnectable }) => {
  return (
    <div className="p-3 border-2 border-dashed border-gray-400 bg-gray-50 rounded-md shadow-sm min-w-[150px] text-sm text-center">
      {/* Target Handle */}
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="!bg-gray-500 !w-2 !h-2" />
      {/* Node Content */}
      <div>
        <p className="font-medium text-gray-500 italic">{data.label || 'Placeholder'}</p>
      </div>
      {/* Source Handle */}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="!bg-gray-500 !w-2 !h-2" />
    </div>
  );
});

// --- Database Schema Node ---
const DatabaseSchemaNode = memo(({ data, isConnectable }) => {
  // Split schema string into lines, handling potential null/undefined
  const schemaLines = data.schema ? data.schema.split('\\n') : ['No schema defined'];

  return (
    <div className="p-3 border border-blue-300 bg-blue-50 rounded-md shadow-sm min-w-[200px] text-sm">
      {/* Target Handle */}
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="!bg-teal-500 !w-2 !h-2" />
      {/* Node Content */}
      <div className="flex items-center mb-2">
        <Database className="w-4 h-4 mr-2 text-blue-600" />
        <p className="font-semibold text-blue-800">{data.label || 'Database Table'}</p>
      </div>
      <div className="pl-1 border-l-2 border-blue-200 text-xs text-gray-700 max-h-40 overflow-y-auto">
        {schemaLines.map((line, index) => (
          <p key={index} className="whitespace-pre-wrap font-mono">{line || ' '}</p> // whitespace-pre-wrap respects newlines
        ))}
      </div>
      {/* Source Handle */}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="!bg-orange-500 !w-2 !h-2" />
    </div>
  );
});

// --- Annotation Node ---
// Often doesn't need handles if it's just descriptive text on the canvas
const AnnotationNode = memo(({ data }) => {
  return (
    <div className="p-2 border border-yellow-300 bg-yellow-50 rounded-md shadow-sm text-xs text-gray-700 max-w-[200px]">
      {/* No Handles typically needed for annotations */}
      <p>{data.label || 'Annotation'}</p>
    </div>
  );
});

// --- Group Node ---
// This component styles the container for nodes with a matching `parentNode` ID.
// React Flow handles the grouping logic.
const GroupNode = memo(({ data, selected }) => { // `selected` prop is passed by React Flow
  return (
    <div className={`border-2 rounded-lg shadow-inner ${selected ? 'border-blue-500' : 'border-gray-300'} bg-gray-50/30`}>
      {/* Optional Label for the Group */}
      {data.label && (
        <div className="text-center text-xs font-semibold text-gray-600 pt-1 pb-2 px-2">
          {data.label}
        </div>
      )}
      {/* Child nodes are rendered inside this by React Flow */}
    </div>
  );
});

// --- Header Node ---
const HeaderNode = memo(({ data, isConnectable }) => {
  return (
    <div className="p-2 bg-gray-100 border-b-2 border-gray-300 rounded-t-md text-center min-w-[150px]">
      {/* Target Handle (Optional, depending if headers can be targets) */}
      {/* <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="!bg-teal-500 !w-2 !h-2" /> */}
      {/* Node Content */}
      <div>
        <p className="font-bold text-gray-700 text-base">{data.label || 'Header'}</p>
      </div>
      {/* Source Handle (Bottom) */}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="!bg-orange-500 !w-2 !h-2" />
    </div>
  );
});

// --- Status Node ---
const StatusNode = memo(({ data, isConnectable }) => {
  const getStatusIndicator = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'pending':
         return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return <div className="w-3 h-3 bg-gray-300 rounded-full"></div>; // Default gray dot
    }
  };

  return (
    <div className="react-flow__node-default p-3 border border-gray-300 bg-white rounded-md shadow-sm min-w-[150px] text-sm">
      {/* Target Handle */}
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="!bg-teal-500 !w-2 !h-2" />
      {/* Node Content */}
      <div className="flex items-center justify-between">
        <p className="font-medium text-gray-800 mr-2">{data.label || 'Status Node'}</p>
        {getStatusIndicator(data.status)}
      </div>
      {/* Source Handle */}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="!bg-orange-500 !w-2 !h-2" />
    </div>
  );
});


// --- Export Map (for easy import in MapDisplay.jsx) ---
export const customNodeTypes = {
  baseNode: BaseNode,
  tooltipNode: TooltipNode,
  placeholderNode: PlaceholderNode,
  databaseSchemaNode: DatabaseSchemaNode,
  annotationNode: AnnotationNode,
  groupNode: GroupNode,
  headerNode: HeaderNode,
  statusNode: StatusNode,
};

