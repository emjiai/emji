// MindMapView.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, RefreshCw, Maximize, Download, Plus, Minus, Info, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Line type options
type LineType = 'straight' | 'curve' | 'spiral';
const line_type: LineType = 'spiral'; // default value, can be 'straight', 'curve', or 'spiral'

// Node shape options
type NodeShape = 'rounded-rectangle' | 'circle';
const node_shape: NodeShape = 'rounded-rectangle'; // default value, can be 'rounded-rectangle' or 'circle'

interface Node {
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

interface Edge {
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

interface MindMapData {
  title?: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
}

interface MindMapViewProps {
  data: MindMapData;
}

// Function to truncate text
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const MindMapView: React.FC<MindMapViewProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [viewBox, setViewBox] = useState({ x: -500, y: -350, width: 1000, height: 700 });
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number, y: number }>>({});
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<{ nodeId: string; x: number; y: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize the mind map layout
  useEffect(() => {
    if (!data || !data.nodes || !data.edges) return;

    // Calculate initial positions in a tree layout
    const rootNode = data.nodes.find(node => node.data.nodeType === 'root');
    if (!rootNode) return;

    const newPositions: Record<string, { x: number, y: number }> = {};
    
    // Set root at center
    newPositions[rootNode.id] = { x: 0, y: 0 };
    
    // Position level 2 nodes in a circle around root
    const level2Nodes = data.nodes.filter(node => node.data.nodeType === 'level2');
    const angleStep2 = (2 * Math.PI) / level2Nodes.length;
    
    level2Nodes.forEach((node, index) => {
      const radius = 250;
      const angle = index * angleStep2;
      newPositions[node.id] = {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      };
    });
    
    // For each level 2 node, position its level 3 children
    level2Nodes.forEach((parentNode, parentIndex) => {
      const parentEdges = data.edges.filter(edge => edge.source === parentNode.id);
      const childNodes = parentEdges.map(edge => data.nodes.find(node => node.id === edge.target)).filter(Boolean) as Node[];
      
      if (childNodes.length > 0) {
        const angleRange = angleStep2 * 0.8; // Use 80% of the available angle to avoid overlap
        const startAngle = parentIndex * angleStep2 - angleRange / 2;
        const childAngleStep = angleRange / childNodes.length;
        
        childNodes.forEach((childNode, childIndex) => {
          const radius = 450;
          const angle = startAngle + childIndex * childAngleStep;
          newPositions[childNode.id] = {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
          };
        });
      }
    });
    
    // Update node positions
    setNodePositions(newPositions);
    
    // Create nodes with positions
    const positionedNodes = data.nodes.map(node => ({
      ...node,
      position: newPositions[node.id] || { x: 0, y: 0 }
    }));
    
    setNodes(positionedNodes);
    setEdges(data.edges);
  }, [data]);

  // Get all child nodes of a given node
  const getChildNodes = (nodeId: string): string[] => {
    const directChildren = edges
      .filter(edge => edge.source === nodeId)
      .map(edge => edge.target);

    const allChildren = [...directChildren];
    directChildren.forEach(childId => {
      allChildren.push(...getChildNodes(childId));
    });

    return allChildren;
  };

  // Toggle node collapse state
  const toggleNodeCollapse = (nodeId: string) => {
    setCollapsedNodes(prev => {
      const newCollapsed = new Set(prev);
      if (newCollapsed.has(nodeId)) {
        newCollapsed.delete(nodeId);
      } else {
        newCollapsed.add(nodeId);
      }
      return newCollapsed;
    });
  };

  // Check if a node has children
  const hasChildren = (nodeId: string): boolean => {
    return edges.some(edge => edge.source === nodeId);
  };

  // Start dragging a node
  const startDrag = (e: React.MouseEvent, nodeId: string) => {
    if (!svgRef.current) return;
    
    const svgRect = svgRef.current.getBoundingClientRect();
    const nodePosition = nodePositions[nodeId];
    
    if (!nodePosition) return;
    
    // Calculate cursor position in SVG coordinates
    const svgPoint = {
      x: (e.clientX - svgRect.left) / scale + viewBox.x,
      y: (e.clientY - svgRect.top) / scale + viewBox.y
    };
    
    // Calculate offset between cursor and node center
    setDragOffset({
      x: nodePosition.x - svgPoint.x,
      y: nodePosition.y - svgPoint.y
    });
    
    setDraggingNode(nodeId);
    e.preventDefault();
  };

  // Handle dragging motion
  const handleDrag = (e: React.MouseEvent) => {
    if (!draggingNode || !svgRef.current) return;
    
    const svgRect = svgRef.current.getBoundingClientRect();
    
    // Calculate cursor position in SVG coordinates
    const svgPoint = {
      x: (e.clientX - svgRect.left) / scale + viewBox.x,
      y: (e.clientY - svgRect.top) / scale + viewBox.y
    };
    
    // Calculate new node position with offset
    const newPosition = {
      x: svgPoint.x + dragOffset.x,
      y: svgPoint.y + dragOffset.y
    };
    
    // Update node position
    setNodePositions(prev => ({
      ...prev,
      [draggingNode]: newPosition
    }));
  };

  // End dragging
  const endDrag = () => {
    setDraggingNode(null);
  };

  // Handle zoom in
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
    setViewBox(prev => ({
      ...prev,
      width: prev.width / 1.2,
      height: prev.height / 1.2
    }));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.3));
    setViewBox(prev => ({
      ...prev,
      width: prev.width * 1.2,
      height: prev.height * 1.2
    }));
  };

  // Reset view
  const handleResetView = () => {
    setScale(1);
    setViewBox({ x: -500, y: -350, width: 1000, height: 700 });
  };

  // Fit to screen
  const handleFitToScreen = () => {
    if (nodes.length === 0) return;
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    // Find bounds of all visible nodes
    for (const nodeId in nodePositions) {
      // Skip if node is a child of a collapsed node
      let isChildOfCollapsed = false;
      for (const collapsedId of collapsedNodes) {
        if (getChildNodes(collapsedId).includes(nodeId)) {
          isChildOfCollapsed = true;
          break;
        }
      }
      
      if (!isChildOfCollapsed) {
        const pos = nodePositions[nodeId];
        minX = Math.min(minX, pos.x - 100);
        minY = Math.min(minY, pos.y - 50);
        maxX = Math.max(maxX, pos.x + 100);
        maxY = Math.max(maxY, pos.y + 50);
      }
    }
    
    // Add padding
    minX -= 50;
    minY -= 50;
    maxX += 50;
    maxY += 50;
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    setViewBox({
      x: minX,
      y: minY,
      width: width,
      height: height
    });
    
    setScale(1);
  };

  // Export as PNG
  const handleExport = () => {
    if (!svgRef.current) return;
    
    // Create a canvas to draw the SVG
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Get SVG data
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    // Create an image from the SVG
    const img = new Image();
    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw white background
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the SVG image
      context.drawImage(img, 0, 0);
      
      // Create a downloadable link
      canvas.toBlob(blob => {
        if (!blob) return;
        
        const downloadUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = 'mindmap.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up
        URL.revokeObjectURL(downloadUrl);
      });
      
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    
    setIsFullscreen(!isFullscreen);
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Get node color based on type
  const getNodeColor = (nodeType: string) => {
    switch (nodeType) {
      case 'root':
        return {
          bg: 'white',
          border: '#333333',
          text: 'black'
        };
      case 'level2':
        return {
          bg: '#e6f2ff', // light blue
          border: '#0066cc',
          text: 'black'
        };
      case 'level3':
        return {
          bg: '#ffebeb', // light red
          border: '#cc0000',
          text: 'black'
        };
      default:
        return {
          bg: '#ffffcc', // light yellow
          border: '#cccc00',
          text: 'black'
        };
    }
  };

  // Get node dimensions based on type
  const getNodeDimensions = (nodeType: string) => {
    switch (nodeType) {
      case 'root':
        return { width: 180, height: 70 };
      case 'level2':
        return { width: 160, height: 60 };
      case 'level3':
        return { width: 140, height: 50 };
      default:
        return { width: 150, height: 60 };
    }
  };

  // Generate path for the connection based on line type
  const generatePath = (sourceX: number, sourceY: number, targetX: number, targetY: number, angle: number, distance: number) => {
    switch (line_type as string) {
      case 'straight':
        return `M${sourceX},${sourceY} L${targetX},${targetY}`;
      
      case 'curve':
        // Calculate control points for curved lines
        const midX = (sourceX + targetX) / 2;
        const midY = (sourceY + targetY) / 2;
        
        // Add a slight curve to the line
        const curveOffset = distance * 0.2;
        const controlX = midX + curveOffset * Math.sin(angle);
        const controlY = midY - curveOffset * Math.cos(angle);
        
        return `M${sourceX},${sourceY} Q${controlX},${controlY} ${targetX},${targetY}`;
      
      case 'spiral':
        // Create a spiral effect with two control points
        const thirdX = sourceX + (targetX - sourceX) / 3;
        const thirdY = sourceY + (targetY - sourceY) / 3;
        const twoThirdsX = sourceX + 2 * (targetX - sourceX) / 3;
        const twoThirdsY = sourceY + 2 * (targetY - sourceY) / 3;
        
        const offset1 = distance * 0.25;
        const offset2 = distance * 0.25;
        
        const control1X = thirdX + offset1 * Math.sin(angle + Math.PI/2);
        const control1Y = thirdY + offset1 * Math.cos(angle + Math.PI/2);
        const control2X = twoThirdsX + offset2 * Math.sin(angle - Math.PI/2);
        const control2Y = twoThirdsY + offset2 * Math.cos(angle - Math.PI/2);
        
        return `M${sourceX},${sourceY} C${control1X},${control1Y} ${control2X},${control2Y} ${targetX},${targetY}`;
      
      default:
        return `M${sourceX},${sourceY} L${targetX},${targetY}`;
    }
  };

  // Render connections between nodes
  const renderConnections = () => {
    return edges.map(edge => {
      const sourceNode = nodePositions[edge.source];
      const targetNode = nodePositions[edge.target];
      
      if (!sourceNode || !targetNode) return null;
      
      // Check if source or target is a child of a collapsed node
      for (const collapsedId of collapsedNodes) {
        if (edge.source === collapsedId || getChildNodes(collapsedId).includes(edge.target)) {
          return null;
        }
      }
      
      const sourceDims = getNodeDimensions(
        nodes.find(n => n.id === edge.source)?.data.nodeType || 'default'
      );
      
      const targetDims = getNodeDimensions(
        nodes.find(n => n.id === edge.target)?.data.nodeType || 'default'
      );
      
      // Calculate the angle between nodes
      const dx = targetNode.x - sourceNode.x;
      const dy = targetNode.y - sourceNode.y;
      const angle = Math.atan2(dy, dx);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate edge points based on node dimensions and shape
      let sourceX, sourceY, targetX, targetY;
      
      if ((node_shape as string) === 'circle') {
        // For circle nodes, calculate intersection points with the circle
        const sourceRadius = Math.max(sourceDims.width, sourceDims.height) / 2;
        const targetRadius = Math.max(targetDims.width, targetDims.height) / 2;
        
        sourceX = sourceNode.x + Math.cos(angle) * sourceRadius;
        sourceY = sourceNode.y + Math.sin(angle) * sourceRadius;
        targetX = targetNode.x - Math.cos(angle) * targetRadius;
        targetY = targetNode.y - Math.sin(angle) * targetRadius;
      } else {
        // For rounded rectangles
        sourceX = sourceNode.x + Math.cos(angle) * (sourceDims.width / 2);
        sourceY = sourceNode.y + Math.sin(angle) * (sourceDims.height / 2);
        targetX = targetNode.x - Math.cos(angle) * (targetDims.width / 2);
        targetY = targetNode.y - Math.sin(angle) * (targetDims.height / 2);
      }
      
      const pathData = generatePath(sourceX, sourceY, targetX, targetY, angle, distance);
      
      return (
        <g key={edge.id}>
          <defs>
            <marker
              id={`arrow-${edge.id}`}
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="4"
              markerHeight="4"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
            </marker>
          </defs>
          <path
            d={pathData}
            stroke={edge.style.stroke}
            strokeWidth={edge.style.strokeWidth}
            fill="none"
            markerEnd={`url(#arrow-${edge.id})`}
            className={edge.animated ? "animate-pulse" : ""}
          />
        </g>
      );
    });
  };

  // Handle tooltip display for truncated text
  const handleInfoClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const position = nodePositions[nodeId];
    if (!position) return;
    
    setShowTooltip({
      nodeId,
      x: position.x,
      y: position.y
    });
  };

  // Hide tooltip
  const hideTooltip = () => {
    setShowTooltip(null);
  };

  // Render nodes
  const renderNodes = () => {
    return nodes.map(node => {
      const position = nodePositions[node.id];
      if (!position) return null;
      
      // Check if node is a child of a collapsed node
      for (const collapsedId of collapsedNodes) {
        if (getChildNodes(collapsedId).includes(node.id)) {
          return null;
        }
      }
      
      const colors = getNodeColor(node.data.nodeType);
      const dims = getNodeDimensions(node.data.nodeType);
      const isCollapsed = collapsedNodes.has(node.id);
      const canCollapse = hasChildren(node.id);
      const isHovered = hoveredNode === node.id;
      
      // Check if text needs to be truncated
      const maxLabelLength = dims.width / 7; // Approximate character count that fits
      const isTruncatedLabel = node.data.label.length > maxLabelLength;
      const hasDescription = node.data.description && node.data.description.length > 0;
      
      // Simple text wrapping (split into two lines)
      let firstLine = '';
      let secondLine = '';
      
      if (node.data.label.length > maxLabelLength) {
        // Try to find a good break point (space)
        const middleIndex = Math.floor(node.data.label.length / 2);
        let breakIndex = node.data.label.lastIndexOf(' ', middleIndex);
        
        // If no good break found in first half, look in second half
        if (breakIndex < 0 || breakIndex < middleIndex - 10) {
          breakIndex = node.data.label.indexOf(' ', middleIndex);
        }
        
        // If still no good break, just split in the middle
        if (breakIndex < 0) {
          breakIndex = middleIndex;
        }
        
        firstLine = node.data.label.substring(0, breakIndex);
        secondLine = node.data.label.substring(breakIndex + (node.data.label[breakIndex] === ' ' ? 1 : 0));
        
        // Truncate lines if still too long
        if (firstLine.length > maxLabelLength) {
          firstLine = firstLine.substring(0, maxLabelLength) + '...';
        }
        if (secondLine.length > maxLabelLength) {
          secondLine = secondLine.substring(0, maxLabelLength) + '...';
        }
      } else {
        firstLine = node.data.label;
      }
      
      // Shape rendering based on node_shape
      const renderNodeShape = () => {
        if ((node_shape as string) === 'circle') {
          const radius = Math.max(dims.width, dims.height) / 2;
          return (
            <circle
              cx={dims.width / 2}
              cy={dims.height / 2}
              r={radius}
              fill={colors.bg}
              stroke={colors.border}
              strokeWidth={isHovered ? 2 : 1}
              className={isHovered ? "shadow-lg" : ""}
            />
          );
        } else {
          // Default: rounded-rectangle
          return (
            <rect
              width={dims.width}
              height={dims.height}
              rx="10"
              ry="10"
              fill={colors.bg}
              stroke={colors.border}
              strokeWidth={isHovered ? 2 : 1}
              className={isHovered ? "shadow-lg" : ""}
            />
          );
        }
      };
      
      return (
        <g 
          key={node.id} 
          transform={`translate(${position.x - dims.width/2}, ${position.y - dims.height/2})`}
          onMouseDown={(e) => startDrag(e, node.id)}
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
          style={{ cursor: 'move' }}
        >
          {renderNodeShape()}
          
          {/* Render full label if it fits on one line */}
          {secondLine === '' && (
            <text
              x={dims.width / 2}
              y={dims.height / 2}
              textAnchor="middle"
              fill={colors.text}
              fontSize={node.data.nodeType === 'root' ? 18 : 16}
              fontWeight={node.data.nodeType === 'root' ? 'bold' : 'normal'}
              dominantBaseline="middle"
            >
              {firstLine}
            </text>
          )}
          
          {/* Render split label if it needs two lines */}
          {secondLine !== '' && (
            <>
              <text
                x={dims.width / 2}
                y={dims.height / 2 - 10}
                textAnchor="middle"
                fill={colors.text}
                fontSize={node.data.nodeType === 'root' ? 18 : 16}
                fontWeight={node.data.nodeType === 'root' ? 'bold' : 'normal'}
              >
                {firstLine}
              </text>
              <text
                x={dims.width / 2}
                y={dims.height / 2 + 10}
                textAnchor="middle"
                fill={colors.text}
                fontSize={node.data.nodeType === 'root' ? 18 : 16}
                fontWeight={node.data.nodeType === 'root' ? 'bold' : 'normal'}
              >
                {secondLine}
              </text>
            </>
          )}
          
          {/* Info icon for truncated text or if description exists */}
          {(isTruncatedLabel || hasDescription) && (
            <g
              transform={`translate(${dims.width - 20}, ${dims.height - 15})`}
              onClick={(e) => handleInfoClick(e, node.id)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                r="8"
                fill="white"
                stroke={colors.border}
                strokeWidth="1"
              />
              <text
                x="0"
                y="3"
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill={colors.border}
              >
                i
              </text>
            </g>
          )}
          
          {/* Collapse/Expand button */}
          {canCollapse && (
            <g
              transform={`translate(${dims.width - 20}, 10)`}
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeCollapse(node.id);
              }}
              style={{ cursor: 'pointer' }}
            >
              <circle
                r="8"
                fill="white"
                stroke="black"
                strokeWidth="1"
              />
              <line
                x1="-4"
                y1="0"
                x2="4"
                y2="0"
                stroke="black"
                strokeWidth="1.5"
              />
              {!isCollapsed && (
                <line
                  x1="0"
                  y1="-4"
                  x2="0"
                  y2="4"
                  stroke="black"
                  strokeWidth="1.5"
                />
              )}
            </g>
          )}
        </g>
      );
    });
  };

  // Render tooltip for full text display
  const renderTooltip = () => {
    if (!showTooltip) return null;
    
    const node = nodes.find(n => n.id === showTooltip.nodeId);
    if (!node) return null;
    
    return (
      <g transform={`translate(${showTooltip.x}, ${showTooltip.y})`}>
        <rect
          x="-150"
          y="-80"
          width="300"
          height="160"
          rx="10"
          ry="10"
          fill="white"
          stroke="black"
          strokeWidth="1"
        />
        <text 
          x="0" 
          y="-50" 
          textAnchor="middle" 
          fontSize={node.data.nodeType === 'root' ? 14 : 12}
          fontWeight={node.data.nodeType === 'root' ? 'bold' : 'normal'}
        >
          {node.data.label}
        </text>
        {node.data.description && (
          <foreignObject x="-140" y="-20" width="280" height="120">
            <div style={{ 
              fontSize: '12px', 
              padding: '10px',
              fontWeight: 'normal',
              fontFamily: 'inherit'
            }}>
              {node.data.description}
            </div>
          </foreignObject>
        )}
        <circle
          cx="140"
          cy="-70"
          r="12"
          fill="white"
          stroke="black"
          strokeWidth="1"
          onClick={hideTooltip}
          style={{ cursor: 'pointer' }}
        />
        <text 
          x="140" 
          y="-66" 
          textAnchor="middle" 
          fontWeight="bold" 
          fontSize="16"
          onClick={hideTooltip}
          style={{ cursor: 'pointer' }}
        >
          ×
        </text>
      </g>
    );
  };

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-gray-50">
      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <Button size="sm" variant="outline" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleResetView}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleFitToScreen}>
          <Maximize className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Mind Map SVG */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onMouseMove={handleDrag}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
      >
        {renderConnections()}
        {renderNodes()}
        {renderTooltip()}
      </svg>
      
      {/* Map Title */}
      {data.title && (
        <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow text-sm">
          <h3 className="font-bold">{data.title}</h3>
          {data.description && <p className="text-xs text-gray-600">{data.description}</p>}
        </div>
      )}
    </div>
  );
};

export default MindMapView;