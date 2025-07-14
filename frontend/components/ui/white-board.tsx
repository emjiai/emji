'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Paintbrush, Eraser, Trash2, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WhiteBoardProps {
  className?: string;
  width?: number;
  height?: number;
}

const WhiteBoard: React.FC<WhiteBoardProps> = ({ 
  className = '',
  width = 600,
  height = 400
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    setContext(ctx);
  }, []);

  // Update stroke style when color or brush size changes
  useEffect(() => {
    if (!context) return;
    context.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    context.lineWidth = brushSize;
  }, [color, brushSize, tool, context]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!context) return;
    context.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={tool === 'brush' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setTool('brush')}
            title="Brush"
          >
            <Paintbrush className="h-5 w-5" />
          </Button>
          <Button
            variant={tool === 'eraser' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setTool('eraser')}
            title="Eraser"
          >
            <Eraser className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={clearCanvas}
            title="Clear Canvas"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <label htmlFor="color-picker" className="mr-2 text-sm">Color:</label>
            <input
              id="color-picker"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 p-0 border rounded cursor-pointer"
            />
          </div>
          
          <div className="flex items-center">
            <label htmlFor="brush-size" className="mr-2 text-sm">Size:</label>
            <input
              id="brush-size"
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-24"
            />
          </div>
        </div>
      </div>

      <div className="relative border rounded-md bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-full cursor-crosshair"
        />
      </div>
    </div>
  );
};

export default WhiteBoard;