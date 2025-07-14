// components/MapDisplay/MapDisplay.jsx
"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Controls,
  Background,
  MiniMap,
  Panel, // Import Panel for title/description
  MarkerType,
} from 'reactflow';
import dagre from '@dagrejs/dagre';

// Import React Flow CSS
import 'reactflow/dist/style.css';

// --- Import Custom Node and Edge Type Maps from Index Files ---
// Assumes index files exist in these directories and export the maps
import { customNodeTypes } from '@/components/ui/custom-nodes'; // Imports the map { baseNode: BaseNode, ... }
import { customEdgeTypes } from '@/components/ui/custom-edges'; // Imports the map { buttonEdge: ButtonEdge, ... }


// --- Dagre Auto-Layout Configuration ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({})); // Default settings for Dagre edges

const nodeWidth = 172; // Default width for layout calculation if node style doesn't specify
const nodeHeight = 50; // Default height for layout calculation

/**
 * Calculates node positions using Dagre layout algorithm.
 * @param {Array} nodes - Array of React Flow node objects.
 * @param {Array} edges - Array of React Flow edge objects.
 * @param {string} direction - Layout direction ('TB' for top-to-bottom, 'LR' for left-to-right).
 * @returns {object} - Object containing layouted nodes and original edges.
 */
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  // Prevent errors if nodes array is empty or invalid
  if (!nodes || nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const isHorizontal = direction === 'LR';
  // Configure Dagre graph layout options
  dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 }); // Increased spacing slightly

  // Set nodes in Dagre graph with their dimensions
  nodes.forEach((node) => {
    // Use dimensions from node's style if provided, otherwise use defaults
    const width = node.style?.width || nodeWidth;
    const height = node.style?.height || nodeHeight;
    dagreGraph.setNode(node.id, { width, height });
  });

  // Set edges in Dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Run Dagre layout algorithm
  dagre.layout(dagreGraph);

  // Apply calculated positions to React Flow nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // Use dimensions again to calculate offset correctly
    const width = node.style?.width || nodeWidth;
    const height = node.style?.height || nodeHeight;

    // Set target/source handle positions based on layout direction
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    // Adjust Dagre's center-based position to React Flow's top-left anchor point
    node.position = {
      x: nodeWithPosition.x - width / 2,
      y: nodeWithPosition.y - height / 2,
    };

    return node;
  });

  return { nodes: layoutedNodes, edges }; // Return layouted nodes and original edges
};


// --- Internal Map Display Component (Handles React Flow Logic) ---
const MapDisplayInternal = ({ mapData }) => {
    const { fitView } = useReactFlow(); // Hook for controlling the viewport
    const [nodes, setNodes, onNodesChange] = useNodesState([]); // State for nodes
    const [edges, setEdges, onEdgesChange] = useEdgesState([]); // State for edges
    const [layoutDirection, setLayoutDirection] = useState('TB'); // State for layout direction ('TB' or 'LR')

    // --- Define Node and Edge Types Using Imported Maps ---
    // Memoize the types to prevent unnecessary re-renders
    const nodeTypes = useMemo(() => customNodeTypes, []);
    const edgeTypes = useMemo(() => customEdgeTypes, []);

    // --- Define Default Edge Options ---
    // These options apply to all edges unless overridden in specific edge data
    const defaultEdgeOptions = useMemo(() => ({
        // animated: false, // Default animation state (can be overridden by edge.animated)
        markerEnd: { // Default arrowhead style
             type: MarkerType.ArrowClosed, // Use closed arrow
             width: 20, // Arrowhead width
             height: 20, // Arrowhead height
             color: '#888', // Default arrow color (slightly lighter gray)
        },
        style: { // Default edge line style
             strokeWidth: 1.5, // Slightly thinner default lines
             stroke: '#888', // Default line color
        },
        // type: 'smoothstep', // Default edge path type (smoothstep looks nice)
    }), []);


    // --- Effect Hook for Layout Calculation ---
    // Runs when mapData or layoutDirection changes
    useEffect(() => {
        // Ensure mapData is valid and contains nodes/edges
        if (mapData && mapData.nodes && mapData.edges) {
            // Preprocess nodes: Ensure every node has a type (default to 'baseNode') and data
            const typedNodes = mapData.nodes.map(n => ({
                ...n,
                type: n.type || 'baseNode', // Default type if missing
                data: n.data || { label: n.id } // Default data if missing
            }));

            // Preprocess edges: Ensure every edge has a unique ID
             const idEdges = mapData.edges.map((e, index) => ({
                ...e,
                id: e.id || `e-${e.source}-${e.target}-${index}`, // Generate ID if missing
                // Apply default styles/markers which can be overridden by edge-specific data
                // style: { stroke: '#555', strokeWidth: 2, ...e.style }, // Let defaultEdgeOptions handle this now
                // markerEnd: { type: MarkerType.ArrowClosed, color: '#555', ...e.markerEnd }, // Let defaultEdgeOptions handle this
             }));

            // Calculate layout using Dagre
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                typedNodes,
                idEdges, // Use edges with guaranteed IDs
                layoutDirection
            );

            // Update React Flow state with layouted nodes and edges
            setNodes(layoutedNodes);
            setEdges(layoutedEdges); // Set edges (even though positions don't change, ensures consistency)

            // Adjust viewport to fit the graph after layout
            // Use setTimeout to ensure layout calculations are finished before fitting view
            const fitViewTimeout = setTimeout(() => {
                 fitView({ padding: 0.1, duration: 500 }); // Fit view with padding and animation
            }, 100); // Short delay

            // Cleanup timeout on unmount or before next run
            return () => clearTimeout(fitViewTimeout);

        } else {
            // Clear nodes/edges if mapData is invalid or missing
            setNodes([]);
            setEdges([]);
        }
    // Dependencies for the effect hook
    }, [mapData, layoutDirection, setNodes, setEdges, fitView]);

    // Callback function to change layout direction
    const onLayout = useCallback((direction) => {
        setLayoutDirection(direction);
        // The useEffect hook automatically recalculates layout when layoutDirection changes
    }, [setLayoutDirection]); // Dependency: setLayoutDirection


    // Render placeholder if map data is not valid
    if (!mapData || !mapData.nodes || !mapData.edges || mapData.nodes.length === 0) {
        return (
             <div className="flex items-center justify-center h-[500px] text-gray-400 border rounded-md bg-gray-50">
                {/* Provide more informative message */}
                {!mapData ? "Loading map data..." : "No valid map data available or the map is empty."}
             </div>
        );
    }

    // --- Render React Flow Component ---
    return (
        // Container div sets the size of the React Flow canvas
        <div className="w-full h-[600px] border rounded-md shadow-sm relative bg-gray-100"> {/* Slightly off-white background */}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange} // Handles node movements, selections, etc.
                onEdgesChange={onEdgesChange} // Handles edge selections, deletions
                nodeTypes={nodeTypes} // Pass the imported custom node types
                edgeTypes={edgeTypes} // Pass the imported custom edge types
                defaultEdgeOptions={defaultEdgeOptions} // Apply default edge styles/markers
                fitView // Automatically fit view on initial load
                fitViewOptions={{ padding: 0.1 }} // Padding for fitView
                proOptions={{ hideAttribution: true }} // Hide "React Flow" attribution if using Pro plan
                nodesDraggable={true} // Allow nodes to be dragged
                nodesConnectable={true} // Allow connections to be made
                elementsSelectable={true} // Allow elements to be selected
            >
                {/* Standard React Flow Controls (Zoom, Fit View, Lock) */}
                <Controls />
                {/* Background pattern */}
                <Background variant="dots" gap={16} size={1} color="#ccc" /> {/* Lighter gray dots */}
                {/* Minimap for navigation */}
                <MiniMap nodeStrokeWidth={3} zoomable pannable nodeColor={n => n.style?.backgroundColor || '#ddd'}/>

                 {/* Panel for Title, Description, and Layout Controls */}
                 <Panel position="top-left" className="p-2 bg-white/90 rounded-md shadow border border-gray-200 text-sm backdrop-blur-sm">
                    {/* Display title and description from mapData */}
                    {mapData.title && <h3 className="font-semibold mb-1 text-gray-800">{mapData.title}</h3>}
                    {mapData.description && <p className="text-gray-600 mb-2 max-w-xs">{mapData.description}</p>}
                     {/* Layout direction buttons */}
                     <div className="flex space-x-2 border-t pt-2 mt-2 border-gray-200">
                        <button
                            onClick={() => onLayout('TB')}
                            className={`px-2 py-1 text-xs rounded transition-colors ${layoutDirection === 'TB' ? 'bg-blue-600 text-white font-medium' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                            title="Set layout top-to-bottom"
                        >
                            Vertical
                        </button>
                        <button
                            onClick={() => onLayout('LR')}
                            className={`px-2 py-1 text-xs rounded transition-colors ${layoutDirection === 'LR' ? 'bg-blue-600 text-white font-medium' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                             title="Set layout left-to-right"
                       >
                            Horizontal
                        </button>
                     </div>
                 </Panel>
            </ReactFlow>
        </div>
    );
};

// --- Main Exported Component (Wraps Internal Component with Provider) ---
// ReactFlowProvider is necessary for hooks like useReactFlow to work
const MapDisplay = (props) => (
    <ReactFlowProvider>
        <MapDisplayInternal {...props} />
    </ReactFlowProvider>
);


export default MapDisplay;
