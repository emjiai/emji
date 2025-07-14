// components/VisualExplanationDisplay.jsx
"use client"; // If using Next.js App Router

import React, { useMemo, useEffect, useCallback, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Controls,
  Background,
  MiniMap,
  Panel,
  Position,
  MarkerType
} from 'reactflow';
import dagre from '@dagrejs/dagre';
import 'reactflow/dist/style.css';

// Import the node/edge data
import { explanationNodes, explanationEdges } from './reactflow/explanationData'; // Fixed import path

// Import custom node types
import DiagramPlaceholderNode from './reactflow/DiagramPlaceholderNode'; // Fixed import path
import ConceptNode from './reactflow/ConceptNode'; // Fixed import path

// Layout logic (same as before)
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 172; // Default - will be overridden by node styles often
const nodeHeight = 50; // Default

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    if (!nodes || nodes.length === 0) return { nodes: [], edges: [] };

    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 });

    nodes.forEach((node) => {
        const width = node.style?.width || nodeWidth;
        const height = node.style?.height || (node.type === 'group' ? 200 : nodeHeight); // Adjust height guess for groups
        dagreGraph.setNode(node.id, { width, height });
    });

    edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

    dagre.layout(dagreGraph);

    return {
        nodes: nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
             const width = node.style?.width || nodeWidth;
             const height = node.style?.height || (node.type === 'group' ? 200 : nodeHeight);

            // Make sure group nodes have valid positions after layout
            if (nodeWithPosition) {
                 node.position = {
                     x: nodeWithPosition.x - width / 2,
                     y: nodeWithPosition.y - height / 2,
                 };
             } else if (!node.position) {
                 // Fallback position if layout fails for some reason
                 node.position = { x: Math.random() * 400, y: Math.random() * 400 };
                 console.warn(`Dagre failed to position node: ${node.id}`);
             }


            node.targetPosition = isHorizontal ? Position.Left : Position.Top;
            node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

            return node;
        }),
        edges,
    };
};
// Internal Component
const VisualExplanationInternal = () => {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [layoutDirection, setLayoutDirection] = useState('TB');

  // Define Custom Node Types
  const nodeTypes = useMemo(() => ({
    diagramPlaceholder: DiagramPlaceholderNode,
    conceptNode: ConceptNode,
    // Add other custom nodes if needed
    // group: GroupNode, // If you need a custom group node style
  }), []);

   // Default Edge Options
    const defaultEdgeOptions = useMemo(() => ({
        markerEnd: {
             type: MarkerType.ArrowClosed,
             width: 15,
             height: 15,
             color: '#94a3b8', // slate-400
        },
        style: {
             strokeWidth: 1.5,
             stroke: '#94a3b8', // slate-400
        },
        type: 'smoothstep',
    }), []);


  // Effect for Layout
  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      explanationNodes, // Use the imported data
      explanationEdges,
      layoutDirection
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

     // Adjust viewport after layout
     const fitViewTimeout = setTimeout(() => {
         fitView({ padding: 0.1, duration: 300 });
     }, 100); // Short delay

     return () => clearTimeout(fitViewTimeout);

  }, [layoutDirection, fitView, setNodes, setEdges]); // Dependencies

  // Layout change handler
  const onLayout = useCallback((direction) => {
    setLayoutDirection(direction);
  }, [setLayoutDirection]);

  return (
    <div className="w-full h-[800px] border rounded-md shadow-sm relative bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes} // Register custom nodes
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Controls />
        <Background variant="dots" gap={16} size={1} color="#e0e0e0" />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Panel position="top-right" className="p-2 bg-white/90 rounded-md shadow border border-gray-200 text-sm backdrop-blur-sm">
           Layout:
           <button onClick={() => onLayout('TB')} className={`ml-2 px-2 py-1 text-xs rounded ${layoutDirection === 'TB' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Vertical</button>
           <button onClick={() => onLayout('LR')} className={`ml-1 px-2 py-1 text-xs rounded ${layoutDirection === 'LR' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Horizontal</button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

// Main Exported Component
const VisualExplanationDisplay = () => (
  <ReactFlowProvider>
    <VisualExplanationInternal />
  </ReactFlowProvider>
);

export default VisualExplanationDisplay;