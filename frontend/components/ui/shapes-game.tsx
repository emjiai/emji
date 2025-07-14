// shapes-game.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, PanInfo, Reorder } from 'framer-motion';

interface Shape {
  id: string;
  type: 'circle' | 'square' | 'triangle' | 'rectangle' | 'star';
  color: string;
  size: number;
  zIndex: number;
}

interface ShapesGameProps {
  className?: string;
}

const ShapesGame: React.FC<ShapesGameProps> = ({ className = '' }) => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);

  // Default shapes for the palette
  const defaultShapes: Shape[] = [
    { id: 'circle-1', type: 'circle', color: '#FF5252', size: 80, zIndex: 1 },
    { id: 'square-1', type: 'square', color: '#4CAF50', size: 80, zIndex: 1 },
    { id: 'triangle-1', type: 'triangle', color: '#2196F3', size: 80, zIndex: 1 },
    { id: 'rectangle-1', type: 'rectangle', color: '#FFC107', size: 80, zIndex: 1 },
    { id: 'star-1', type: 'star', color: '#9C27B0', size: 80, zIndex: 1 },
  ];

  // Reset the game
  const resetGame = () => {
    setShapes([]);
    setSelectedShape(null);
  };

  // Add a shape to the board
  const addShape = (type: 'circle' | 'square' | 'triangle' | 'rectangle' | 'star', color: string) => {
    const newShape: Shape = {
      id: `${type}-${Date.now()}`,
      type,
      color,
      size: Math.floor(Math.random() * 40) + 60, // Random size between 60-100
      zIndex: shapes.length + 1,
    };
    setShapes((prevShapes) => [...prevShapes, newShape]);
  };

  // Handle selecting a shape
  const handleSelectShape = (id: string) => {
    setSelectedShape(id);
    
    // Bring the selected shape to the front
    setShapes(prevShapes => {
      const maxZ = Math.max(...prevShapes.map(s => s.zIndex));
      return prevShapes.map(shape => 
        shape.id === id ? { ...shape, zIndex: maxZ + 1 } : shape
      );
    });
  };

  // Render a shape
  const renderShape = (shape: Shape) => {
    const isSelected = selectedShape === shape.id;
    
    switch (shape.type) {
      case 'circle':
        return (
          <motion.div
            key={shape.id}
            drag={!isReorderMode}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              boxShadow: isSelected ? '0 0 0 3px #fff, 0 0 0 6px #000' : 'none'
            }}
            whileDrag={{ scale: 1.1 }}
            onDragStart={() => handleSelectShape(shape.id)}
            className="absolute cursor-move"
            style={{ 
              width: shape.size, 
              height: shape.size, 
              borderRadius: '50%', 
              backgroundColor: shape.color,
              zIndex: shape.zIndex
            }}
          />
        );
      case 'square':
        return (
          <motion.div
            key={shape.id}
            drag={!isReorderMode}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              boxShadow: isSelected ? '0 0 0 3px #fff, 0 0 0 6px #000' : 'none'
            }}
            whileDrag={{ scale: 1.1 }}
            onDragStart={() => handleSelectShape(shape.id)}
            className="absolute cursor-move"
            style={{ 
              width: shape.size, 
              height: shape.size, 
              backgroundColor: shape.color,
              zIndex: shape.zIndex
            }}
          />
        );
      case 'triangle':
        return (
          <motion.div
            key={shape.id}
            drag={!isReorderMode}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              boxShadow: isSelected ? '0 0 0 3px #fff, 0 0 0 6px #000' : 'none'
            }}
            whileDrag={{ scale: 1.1 }}
            onDragStart={() => handleSelectShape(shape.id)}
            className="absolute cursor-move"
            style={{ 
              width: 0, 
              height: 0, 
              borderLeft: `${shape.size / 2}px solid transparent`,
              borderRight: `${shape.size / 2}px solid transparent`,
              borderBottom: `${shape.size}px solid ${shape.color}`,
              zIndex: shape.zIndex,
              transformOrigin: 'center'
            }}
          />
        );
      case 'rectangle':
        return (
          <motion.div
            key={shape.id}
            drag={!isReorderMode}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              boxShadow: isSelected ? '0 0 0 3px #fff, 0 0 0 6px #000' : 'none'
            }}
            whileDrag={{ scale: 1.1 }}
            onDragStart={() => handleSelectShape(shape.id)}
            className="absolute cursor-move"
            style={{ 
              width: shape.size * 1.5, 
              height: shape.size, 
              backgroundColor: shape.color,
              zIndex: shape.zIndex
            }}
          />
        );
      case 'star':
        return (
          <motion.div
            key={shape.id}
            drag={!isReorderMode}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              boxShadow: isSelected ? '0 0 0 3px #fff, 0 0 0 6px #000' : 'none'
            }}
            whileDrag={{ scale: 1.1 }}
            onDragStart={() => handleSelectShape(shape.id)}
            className="absolute cursor-move"
            style={{ 
              width: shape.size, 
              height: shape.size, 
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              backgroundColor: shape.color,
              zIndex: shape.zIndex
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="mb-4 bg-gray-100 p-3 rounded-md flex flex-wrap items-center gap-3">
        <div className="font-medium text-sm text-gray-700 mr-3">Add Shape:</div>
        {defaultShapes.map((shape) => (
          <button
            key={shape.id}
            className="p-1 rounded-md border border-gray-300 hover:bg-gray-200 transition-colors"
            onClick={() => addShape(shape.type, shape.color)}
          >
            <div 
              style={{ 
                height: 30, 
                backgroundColor: shape.color,
                borderRadius: shape.type === 'circle' ? '50%' : 0,
                clipPath: shape.type === 'triangle' 
                  ? 'polygon(50% 0%, 0% 100%, 100% 100%)' 
                  : shape.type === 'star'
                    ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                    : 'none',
                width: shape.type === 'rectangle' ? 45 : 30,
              }}
            />
          </button>
        ))}

        <button
          onClick={resetGame}
          className="ml-auto px-3 py-1 bg-red-50 text-red-600 rounded-md text-sm font-medium border border-red-200 hover:bg-red-100"
        >
          Reset
        </button>
        
        <button
          onClick={() => setIsReorderMode(!isReorderMode)}
          className={`px-3 py-1 rounded-md text-sm font-medium border ${
            isReorderMode 
              ? 'bg-blue-100 text-blue-600 border-blue-200' 
              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
          }`}
        >
          {isReorderMode ? 'Exit Stacking Mode' : 'Enter Stacking Mode'}
        </button>
      </div>

      <div 
        ref={containerRef}
        className="relative bg-gradient-to-b from-sky-50 to-indigo-50 rounded-md border border-gray-200 overflow-hidden flex-1"
        style={{ minHeight: '400px' }}
      >
        {isReorderMode ? (
          <Reorder.Group 
            axis="y" 
            values={shapes} 
            onReorder={setShapes}
            className="flex flex-col items-center pt-10 h-full gap-2"
          >
            {shapes.map((shape) => (
              <Reorder.Item 
                key={shape.id} 
                value={shape}
                className="cursor-move"
              >
                <div 
                  style={{ 
                    width: shape.type === 'rectangle' ? shape.size * 1.5 : shape.size,
                    height: shape.size,
                    backgroundColor: shape.color,
                    borderRadius: shape.type === 'circle' ? '50%' : 0,
                    clipPath: shape.type === 'triangle' 
                      ? 'polygon(50% 0%, 0% 100%, 100% 100%)' 
                      : shape.type === 'star'
                        ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                        : 'none',
                  }}
                />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          shapes.map(renderShape)
        )}
      </div>

      <div className="mt-3 p-3 bg-yellow-50 rounded-md border border-yellow-100">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">Learning with Shapes:</h3>
        <ul className="list-disc pl-5 text-xs text-yellow-700 space-y-1">
          <li>Drag shapes onto the board to create patterns</li>
          <li>Click "Enter Stacking Mode" to stack shapes in different orders</li>
          <li>Use different colors and shapes to learn about patterns and sorting</li>
          <li>Create pictures or scenes with different shapes</li>
          <li>Practice naming shapes and colors while playing</li>
        </ul>
      </div>
    </div>
  );
};

export default ShapesGame;