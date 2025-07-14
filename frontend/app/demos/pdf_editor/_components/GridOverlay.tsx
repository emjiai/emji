import React, { useState, useRef, useEffect } from 'react';
import { Move, X, RotateCw } from 'lucide-react';

interface GridElement {
  id: string;
  type: 'text' | 'image';
  gridX: number; // Grid column position
  gridY: number; // Grid row position
  gridWidth: number; // Grid cells wide
  gridHeight: number; // Grid cells tall
  content: string;
  imageData?: string;
  imageType?: string;
  fontSize?: number;
}

interface GridOverlayProps {
  pdfWidth: number;
  pdfHeight: number;
  elements: GridElement[];
  onElementsChange: (elements: GridElement[]) => void;
  onApplyToPDF: (elements: GridElement[]) => void;
  gridSize?: number; // Number of cells per side (default 20x20)
  showGrid?: boolean;
}

const GridOverlay: React.FC<GridOverlayProps> = ({
  pdfWidth,
  pdfHeight,
  elements,
  onElementsChange,
  onApplyToPDF,
  gridSize = 20,
  showGrid = true
}) => {
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  // Calculate cell dimensions
  const cellWidth = pdfWidth / gridSize;
  const cellHeight = pdfHeight / gridSize;

  // Convert grid coordinates to pixel coordinates
  const gridToPixel = (gridX: number, gridY: number) => ({
    x: gridX * cellWidth,
    y: gridY * cellHeight
  });

  // Convert pixel coordinates to grid coordinates
  const pixelToGrid = (pixelX: number, pixelY: number) => ({
    gridX: Math.round(pixelX / cellWidth),
    gridY: Math.round(pixelY / cellHeight)
  });

  // Convert grid coordinates to PDF coordinates (for pdf-lib)
  const gridToPDF = (gridX: number, gridY: number, gridWidth: number = 1, gridHeight: number = 1) => ({
    x: (gridX * cellWidth) * (pdfWidth / (gridSize * cellWidth)),
    y: pdfHeight - ((gridY + gridHeight) * cellHeight) * (pdfHeight / (gridSize * cellHeight)),
    width: gridWidth * cellWidth * (pdfWidth / (gridSize * cellWidth)),
    height: gridHeight * cellHeight * (pdfHeight / (gridSize * cellHeight))
  });

  const handleMouseDown = (elementId: string, event: React.MouseEvent, action: 'drag' | 'resize' = 'drag') => {
    event.preventDefault();
    event.stopPropagation();

    const element = elements.find(el => el.id === elementId);
    if (!element || !overlayRef.current) return;

    const rect = overlayRef.current.getBoundingClientRect();
    const startX = event.clientX - rect.left;
    const startY = event.clientY - rect.top;

    setDragStart({ x: startX, y: startY });
    
    if (action === 'drag') {
      setIsDragging(elementId);
    } else {
      setIsResizing(elementId);
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentX = moveEvent.clientX - rect.left;
      const currentY = moveEvent.clientY - rect.top;

      if (action === 'drag') {
        const deltaX = currentX - dragStart.x;
        const deltaY = currentY - dragStart.y;
        
        const newPixelPos = gridToPixel(element.gridX, element.gridY);
        const newGridPos = pixelToGrid(newPixelPos.x + deltaX, newPixelPos.y + deltaY);

        // Constrain to grid bounds
        const constrainedGridX = Math.max(0, Math.min(gridSize - element.gridWidth, newGridPos.gridX));
        const constrainedGridY = Math.max(0, Math.min(gridSize - element.gridHeight, newGridPos.gridY));

        updateElement(elementId, {
          gridX: constrainedGridX,
          gridY: constrainedGridY
        });
      } else if (action === 'resize') {
        const deltaX = currentX - dragStart.x;
        const deltaY = currentY - dragStart.y;
        
        const deltaCellsX = Math.round(deltaX / cellWidth);
        const deltaCellsY = Math.round(deltaY / cellHeight);
        
        const newWidth = Math.max(1, element.gridWidth + deltaCellsX);
        const newHeight = Math.max(1, element.gridHeight + deltaCellsY);
        
        // Constrain to grid bounds
        const maxWidth = gridSize - element.gridX;
        const maxHeight = gridSize - element.gridY;
        
        updateElement(elementId, {
          gridWidth: Math.min(newWidth, maxWidth),
          gridHeight: Math.min(newHeight, maxHeight)
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
      setIsResizing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const updateElement = (elementId: string, updates: Partial<GridElement>) => {
    const updatedElements = elements.map(el =>
      el.id === elementId ? { ...el, ...updates } : el
    );
    onElementsChange(updatedElements);
  };

  const deleteElement = (elementId: string) => {
    const updatedElements = elements.filter(el => el.id !== elementId);
    onElementsChange(updatedElements);
  };

  const addTextElement = (gridX: number, gridY: number) => {
    const newElement: GridElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      gridX,
      gridY,
      gridWidth: 4, // Default 4 cells wide
      gridHeight: 2, // Default 2 cells tall
      content: 'New Text',
      fontSize: 12
    };
    onElementsChange([...elements, newElement]);
  };

  const handleGridClick = (event: React.MouseEvent) => {
    if (!overlayRef.current) return;
    
    const rect = overlayRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    const gridPos = pixelToGrid(clickX, clickY);
    
    // Check if click is on empty grid space
    const elementAtPosition = elements.find(el => 
      gridPos.gridX >= el.gridX && 
      gridPos.gridX < el.gridX + el.gridWidth &&
      gridPos.gridY >= el.gridY && 
      gridPos.gridY < el.gridY + el.gridHeight
    );
    
    if (!elementAtPosition && event.detail === 2) { // Double click
      addTextElement(gridPos.gridX, gridPos.gridY);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Grid Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-auto"
        style={{ 
          width: pdfWidth, 
          height: pdfHeight,
          backgroundImage: showGrid ? 
            `linear-gradient(to right, #e5e7eb 1px, transparent 1px),
             linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)` : 'none',
          backgroundSize: `${cellWidth}px ${cellHeight}px`
        }}
        onClick={handleGridClick}
      >
        {/* Grid Elements */}
        {elements.map((element) => {
          const pixelPos = gridToPixel(element.gridX, element.gridY);
          const pixelSize = {
            width: element.gridWidth * cellWidth,
            height: element.gridHeight * cellHeight
          };

          return (
            <div
              key={element.id}
              className={`absolute border-2 rounded shadow-lg group select-none ${
                isDragging === element.id || isResizing === element.id
                  ? 'border-blue-500 bg-blue-50 z-20'
                  : 'border-gray-400 bg-white hover:border-gray-600 z-10'
              }`}
              style={{
                left: pixelPos.x,
                top: pixelPos.y,
                width: pixelSize.width,
                height: pixelSize.height,
                minWidth: cellWidth,
                minHeight: cellHeight
              }}
            >
              {/* Header with controls */}
              <div 
                className="flex items-center justify-between p-1 bg-gray-100 border-b cursor-move"
                onMouseDown={(e) => handleMouseDown(element.id, e, 'drag')}
              >
                <Move size={12} className="text-gray-500" />
                <span className="text-xs text-gray-600 font-medium">
                  {element.type} ({element.gridX},{element.gridY})
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteElement(element.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>

              {/* Content Area */}
              <div className="p-2 h-full" style={{ height: 'calc(100% - 28px)' }}>
                {element.type === 'text' ? (
                  <textarea
                    value={element.content}
                    onChange={(e) => updateElement(element.id, { content: e.target.value })}
                    className="w-full h-full text-sm border-none bg-transparent focus:outline-none resize-none"
                    style={{ fontSize: element.fontSize || 12 }}
                    placeholder="Enter text..."
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    {element.imageData ? (
                      <img
                        src={element.imageData}
                        alt={element.content}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-xs text-gray-500 text-center">
                        {element.content}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Resize Handle */}
              <div
                className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
                onMouseDown={(e) => handleMouseDown(element.id, e, 'resize')}
                style={{
                  clipPath: 'polygon(100% 0, 0 100%, 100% 100%)'
                }}
              />

              {/* Grid Position Indicator */}
              <div className="absolute -top-6 left-0 text-xs bg-gray-800 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {element.gridWidth}x{element.gridHeight} cells
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Info Panel */}
      <div className="absolute top-2 right-2 bg-white border rounded-lg p-2 shadow-lg text-xs">
        <div><strong>Grid:</strong> {gridSize}x{gridSize}</div>
        <div><strong>Cell Size:</strong> {cellWidth.toFixed(1)}x{cellHeight.toFixed(1)}px</div>
        <div><strong>Elements:</strong> {elements.length}</div>
        <div className="mt-1 text-gray-600">Double-click to add text</div>
      </div>

      {/* Apply Button */}
      {elements.length > 0 && (
        <div className="absolute bottom-2 left-2">
          <button
            onClick={() => {
              // Convert grid coordinates to PDF coordinates for pdf-lib
              const pdfElements = elements.map(el => ({
                ...el,
                pdfCoords: gridToPDF(el.gridX, el.gridY, el.gridWidth, el.gridHeight)
              }));
              onApplyToPDF(pdfElements);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            Apply {elements.length} Element(s) to PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default GridOverlay;