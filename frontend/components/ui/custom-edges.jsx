
import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, MarkerType } from 'reactflow';

// --- Button Edge (Included for completeness) ---
const ButtonEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data, // Contains label for the button
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt, edgeId) => {
    evt.stopPropagation(); // Prevent node drag/selection
    alert(`Button clicked on edge ${edgeId}! Action: ${data?.label || 'Default Action'}`);
    // Add more complex logic here (e.g., call a function passed via props)
  };

  return (
    <>
      {/* The base line of the edge */}
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {/* Render the button in the middle of the edge */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all', // Ensure the button is clickable
          }}
          className="nodrag nopan" // Prevent edge drag/pan when clicking button
        >
          <button
            onClick={(event) => onEdgeClick(event, id)}
            className="px-1.5 py-0.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded shadow cursor-pointer"
          >
            {data?.label || 'Action'}
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});


// --- Edge with Node Data (Data Edge) ---
// This often uses a standard edge type but displays data in the label.
// We can create a custom component if more complex rendering is needed,
// but often just passing data to the label is sufficient.
// This example shows how to display data.details in the label area.
const DataEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label, // Standard label prop
  data, // Custom data, e.g., { details: "..." }
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan p-1 bg-white border border-gray-300 rounded shadow-sm text-xs text-gray-700"
        >
          {/* Display standard label if provided */}
          {label && <div className="font-semibold mb-0.5">{label}</div>}
          {/* Display custom details from data object */}
          {data?.details && <div className="italic">{data.details}</div>}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});


// --- Animated SVG Edge ---
// This isn't a custom component type itself.
// You achieve this by setting `animated: true` on an edge object
// when passing data to React Flow.
// Example usage when defining edges:
/*
const edges = [
  {
    id: 'e1-2',
    source: 'node-1',
    target: 'node-2',
    type: 'smoothstep', // or 'default', 'step', etc.
    animated: true,     // This makes the edge animated
    label: 'Primary Flow',
    style: { stroke: '#3b82f6', strokeWidth: 2 }, // Optional custom styling
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  // ... other edges
];
*/

// You can create a styled default edge component if you want consistent styling
// for all animated edges, but it's not strictly necessary.
const StyledAnimatedEdge = memo(({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    label,
    animated // This prop will be true if set in the edge data
}) => {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
    });

    // Define specific styles for animated edges
    const animatedStyle = {
        stroke: '#2563eb', // Example: blue color
        strokeWidth: 2,
        ...style, // Allow overriding via edge data's style prop
    };

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd || { type: MarkerType.ArrowClosed, color: '#2563eb' }} style={animatedStyle} />
            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        }}
                        className="nodrag nopan bg-white px-1 py-0.5 text-xs rounded border"
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
});


// --- Export Map (for easy import in MapDisplay.jsx) ---
export const customEdgeTypes = {
  buttonEdge: ButtonEdge,
  dataEdge: DataEdge, // Use if you want the specific rendering above
  styledAnimatedEdge: StyledAnimatedEdge, // Use if you want consistent styling via a type
  // Note: For basic animation, you might just use 'default' or 'smoothstep'
  // type and set `animated: true` in the edge data itself.
};
