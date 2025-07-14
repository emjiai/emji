'use client';

import React from 'react';

// MindMap types matching the ReaderDisplay component expectations
interface MindMapNode {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    label: string;
    description: string;
    nodeType: string;
  };
}

interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated: boolean;
  style: {
    stroke: string;
    strokeWidth: number;
  };
  markerEnd: {
    type: string;
    orient: string;
  };
}

// Extended MindMap interface to handle different API response formats
interface MindMap {
  title?: string;
  description?: string;
  centralTopic?: string; // For legacy format
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  // Allow for any additional properties from API
  [key: string]: any;
}

interface BlocksViewProps {
  data: MindMap;
}

const BlocksView: React.FC<BlocksViewProps> = ({ data }) => {
  console.log('Rendering mind map with data:', data);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No mind map data available</p>
      </div>
    );
  }

  // Convert legacy mind map format to the expected format
  const convertLegacyMindMap = (legacy: any): MindMap => {
    const nodes: MindMapNode[] = [];
    const edges: MindMapEdge[] = [];
    
    console.log('Converting legacy mind map:', legacy);
    
    // Handle different mind map formats from API
    let mindMapData: any = legacy;
    
    // If the legacy object has a mindMap property, use that
    if (legacy.mindMap) {
      mindMapData = legacy.mindMap;
    }
    
    // Create root node from centralTopic
    const rootId = 'root';
    const centralTopic = mindMapData.centralTopic || mindMapData.title || 'Root Topic';
    
    // Add root node
    nodes.push({
      id: rootId,
      type: 'default',
      position: { x: 0, y: 0 },
      data: {
        label: centralTopic,
        description: mindMapData.description || ('Root node: ' + centralTopic),
        nodeType: 'root'
      }
    });
    
    // Process each top-level node and its children
    if (Array.isArray(mindMapData.nodes)) {
      mindMapData.nodes.forEach((node: any, index: number) => {
        // Calculate position for main nodes in a circle around the root
        const angle = (index * 2 * Math.PI) / mindMapData.nodes.length;
        const radius = 300;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        const nodeId = node.id || `node-${index}`;
        
        // Add the main node
        nodes.push({
          id: nodeId,
          type: 'default',
          position: node.position || { x, y },
          data: {
            label: node.text || node.label || `Node ${index + 1}`,
            description: node.description || ('Topic: ' + (node.text || node.label || `Node ${index + 1}`)),
            nodeType: 'level2'
          }
        });
        
        // Connect to root
        edges.push({
          id: `${rootId}-${nodeId}`,
          source: rootId,
          target: nodeId,
          type: 'default',
          animated: false,
          style: { stroke: '#3B82F6', strokeWidth: 2 },
          markerEnd: { type: 'arrow', orient: 'auto' }
        });
        
        // Process children if any
        if (Array.isArray(node.children)) {
          node.children.forEach((child: any, childIndex: number) => {
            const childId = child.id || `${nodeId}-child-${childIndex}`;
            
            // Calculate position for child nodes
            const childAngle = angle + (childIndex - node.children.length / 2) * 0.5;
            const childRadius = radius + 150;
            const childX = Math.cos(childAngle) * childRadius;
            const childY = Math.sin(childAngle) * childRadius;
            
            nodes.push({
              id: childId,
              type: 'default',
              position: child.position || { x: childX, y: childY },
              data: {
                label: child.text || child.label || `Child ${childIndex + 1}`,
                description: child.description || ('Subtopic: ' + (child.text || child.label || `Child ${childIndex + 1}`)),
                nodeType: 'leaf'
              }
            });
            
            // Connect to parent
            edges.push({
              id: `${nodeId}-${childId}`,
              source: nodeId,
              target: childId,
              type: 'default',
              animated: false,
              style: { stroke: '#10B981', strokeWidth: 1.5 },
              markerEnd: { type: 'arrow', orient: 'auto' }
            });
          });
        }
      });
    }
    
    return {
      title: mindMapData.title || legacy.title || 'Mind Map',
      description: mindMapData.description || legacy.description || 'Document mind map visualization',
      nodes,
      edges
    };
  };

  let mindMapData: MindMap;
  
  // Check if we already have a properly formatted mind map
  if (data.nodes && 
      Array.isArray(data.nodes) && 
      data.nodes.length > 0 &&
      data.nodes[0]?.data?.nodeType) {
    mindMapData = data;
  } else {
    // Convert from API format
    mindMapData = convertLegacyMindMap(data);
  }
  
  // Ensure we have at least a root node
  if (!mindMapData.nodes || mindMapData.nodes.length === 0) {
    mindMapData = {
      title: 'Document Mind Map',
      description: 'Mind map visualization of document content',
      nodes: [{
        id: 'root',
        type: 'default',
        position: { x: 0, y: 0 },
        data: {
          label: 'Document',
          description: 'Main document topic',
          nodeType: 'root'
        }
      }],
      edges: []
    };
  }

  // Final validation - ensure all nodes have the required structure
  const validatedNodes: MindMapNode[] = mindMapData.nodes.map((node: any, index: number) => {
    if (!node.data || !node.data.nodeType) {
      return {
        ...node,
        data: {
          label: node.data?.label || `Node ${index + 1}`,
          description: node.data?.description || `Node ${index + 1}`,
          nodeType: index === 0 ? 'root' : 'level2'
        }
      };
    }
    return node;
  });

  const finalMindMapData: MindMap = {
    ...mindMapData,
    nodes: validatedNodes
  };

  console.log('Final mind map data being passed to MindMapView:', finalMindMapData);

  // For now, we'll render a simple representation
  // You should replace this with your actual MindMapView component from the second document
  return (
    <div className="h-full w-full overflow-hidden bg-gray-50 relative">
      {/* Title */}
      {finalMindMapData.title && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow text-sm z-10">
          <h3 className="font-bold">{finalMindMapData.title}</h3>
          {finalMindMapData.description && (
            <p className="text-xs text-gray-600">{finalMindMapData.description}</p>
          )}
        </div>
      )}

      {/* Simple mind map representation */}
      <div className="flex items-center justify-center h-full p-8">
        <div className="max-w-4xl w-full">
          {/* Root node */}
          {finalMindMapData.nodes.find(n => n.data.nodeType === 'root') && (
            <div className="text-center mb-8">
              <div className="inline-block bg-blue-100 border-2 border-blue-500 rounded-lg p-4 mx-auto">
                <h3 className="font-bold text-lg text-blue-800">
                  {finalMindMapData.nodes.find(n => n.data.nodeType === 'root')?.data.label}
                </h3>
              </div>
            </div>
          )}

          {/* Level 2 nodes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {finalMindMapData.nodes
              .filter(node => node.data.nodeType === 'level2')
              .map((node, index) => (
                <div key={node.id} className="text-center">
                  <div className="bg-green-100 border-2 border-green-500 rounded-lg p-3 mb-3">
                    <h4 className="font-semibold text-green-800">{node.data.label}</h4>
                    {node.data.description && (
                      <p className="text-xs text-green-600 mt-1">{node.data.description}</p>
                    )}
                  </div>
                  
                  {/* Child nodes */}
                  <div className="space-y-2">
                    {finalMindMapData.nodes
                      .filter(childNode => 
                        finalMindMapData.edges.some(edge => 
                          edge.source === node.id && edge.target === childNode.id
                        )
                      )
                      .map(childNode => (
                        <div key={childNode.id} className="bg-yellow-100 border border-yellow-400 rounded p-2">
                          <span className="text-xs text-yellow-800">{childNode.data.label}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              ))
            }
          </div>

          {/* Info message */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            <p>Interactive mind map visualization</p>
            <p className="text-xs mt-1">
              {finalMindMapData.nodes.length} nodes, {finalMindMapData.edges.length} connections
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlocksView;