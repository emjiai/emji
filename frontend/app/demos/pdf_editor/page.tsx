'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Upload, Download, Type, Image, Grid3X3, Eye, EyeOff } from 'lucide-react';
// Import the GridOverlay component
// import GridOverlay from './components/GridOverlay';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface GridElement {
  id: string;
  type: 'text' | 'image';
  gridX: number;
  gridY: number;
  gridWidth: number;
  gridHeight: number;
  content: string;
  imageData?: string;
  imageType?: string;
  fontSize?: number;
  pdfCoords?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface PDFEditorState {
  pdfDoc: PDFDocument | null;
  pdfBytes: ArrayBuffer | null;
  pdfUrl: string | null;
  currentPage: number;
  totalPages: number;
  textInput: string;
  isLoading: boolean;
  pdfId: string | null;
  gridElements: GridElement[];
  showGrid: boolean;
  gridSize: number;
  pdfDimensions: { width: number; height: number };
}

// Inline GridOverlay component for demo (in production, import from separate file)
const GridOverlay: React.FC<{
  pdfWidth: number;
  pdfHeight: number;
  elements: GridElement[];
  onElementsChange: (elements: GridElement[]) => void;
  onApplyToPDF: (elements: any[]) => void;
  gridSize?: number;
  showGrid?: boolean;
}> = ({
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

  const cellWidth = pdfWidth / gridSize;
  const cellHeight = pdfHeight / gridSize;

  const gridToPixel = (gridX: number, gridY: number) => ({
    x: gridX * cellWidth,
    y: gridY * cellHeight
  });

  const pixelToGrid = (pixelX: number, pixelY: number) => ({
    gridX: Math.round(pixelX / cellWidth),
    gridY: Math.round(pixelY / cellHeight)
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
      gridWidth: 4,
      gridHeight: 2,
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
    
    const elementAtPosition = elements.find(el => 
      gridPos.gridX >= el.gridX && 
      gridPos.gridX < el.gridX + el.gridWidth &&
      gridPos.gridY >= el.gridY && 
      gridPos.gridY < el.gridY + el.gridHeight
    );
    
    if (!elementAtPosition && event.detail === 2) {
      addTextElement(gridPos.gridX, gridPos.gridY);
    }
  };

  return (
    <div className="relative w-full h-full">
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
              <div 
                className="flex items-center justify-between p-1 bg-gray-100 border-b cursor-move"
                onMouseDown={(e) => handleMouseDown(element.id, e, 'drag')}
              >
                <span className="text-xs text-gray-600 font-medium">
                  {element.type} ({element.gridX},{element.gridY})
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteElement(element.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity text-xs"
                >
                  ×
                </button>
              </div>

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

              <div
                className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
                onMouseDown={(e) => handleMouseDown(element.id, e, 'resize')}
                style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
              />
            </div>
          );
        })}
      </div>

      <div className="absolute top-2 right-2 bg-white border rounded-lg p-2 shadow-lg text-xs">
        <div><strong>Grid:</strong> {gridSize}x{gridSize}</div>
        <div><strong>Cell Size:</strong> {cellWidth.toFixed(1)}x{cellHeight.toFixed(1)}px</div>
        <div><strong>Elements:</strong> {elements.length}</div>
        <div className="mt-1 text-gray-600">Double-click to add text</div>
      </div>

      {elements.length > 0 && (
        <div className="absolute bottom-2 left-2">
          <button
            onClick={() => onApplyToPDF(elements)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            Apply {elements.length} Element(s) to PDF
          </button>
        </div>
      )}
    </div>
  );
};

const PDFEditor: React.FC = () => {
  const [state, setState] = useState<PDFEditorState>({
    pdfDoc: null,
    pdfBytes: null,
    pdfUrl: null,
    currentPage: 0,
    totalPages: 0,
    textInput: '',
    isLoading: false,
    pdfId: null,
    gridElements: [],
    showGrid: true,
    gridSize: 20,
    pdfDimensions: { width: 595, height: 842 } // A4 default
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const uint8ArrayToArrayBuffer = (uint8Array: Uint8Array): ArrayBuffer => {
    const arrayBuffer = new ArrayBuffer(uint8Array.length);
    const view = new Uint8Array(arrayBuffer);
    view.set(uint8Array);
    return arrayBuffer;
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file');
      return;
    }

    console.log('Starting file upload...', file.name, file.size);
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);
      
      const doc = await PDFDocument.load(arrayBuffer);
      console.log('PDF loaded successfully');
      
      const totalPages = doc.getPageCount();
      const page = doc.getPages()[0];
      const { width, height } = page.getSize();
      
      console.log('PDF page dimensions:', width, 'x', height);
      
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setState(prev => ({
        ...prev,
        pdfDoc: doc,
        pdfBytes: arrayBuffer,
        pdfUrl: url,
        totalPages,
        currentPage: 0,
        isLoading: false,
        gridElements: [],
        pdfDimensions: { width, height }
      }));
      
      console.log('PDF loaded with grid system ready');
      
    } catch (error) {
      console.error('Error during PDF upload:', error);
      alert(`Error uploading PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const applyElementsToPDF = async (elements: GridElement[]) => {
    if (!state.pdfDoc) return;

    try {
      console.log('Applying grid elements to PDF:', elements);

      const pages = state.pdfDoc.getPages();
      const page = pages[state.currentPage];
      const { width, height } = page.getSize();

      // Grid overlay dimensions (matches iframe)
      const overlayWidth = 800;
      const overlayHeight = 700;

      for (const element of elements) {
        // Convert grid coordinates to overlay pixel coordinates
        const cellWidth = overlayWidth / state.gridSize;
        const cellHeight = overlayHeight / state.gridSize;
        
        const overlayX = element.gridX * cellWidth;
        const overlayY = element.gridY * cellHeight;
        const overlayWidth_element = element.gridWidth * cellWidth;
        const overlayHeight_element = element.gridHeight * cellHeight;

        // Convert overlay coordinates to PDF coordinates
        const scaleX = width / overlayWidth;
        const scaleY = height / overlayHeight;
        
        const pdfX = overlayX * scaleX;
        const pdfY = height - ((overlayY + overlayHeight_element) * scaleY);
        const pdfWidth = overlayWidth_element * scaleX;
        const pdfHeight = overlayHeight_element * scaleY;

        console.log(`Grid element ${element.id}:`);
        console.log(`  Grid coords: (${element.gridX},${element.gridY}) ${element.gridWidth}x${element.gridHeight}`);
        console.log(`  Overlay coords: (${overlayX},${overlayY}) ${overlayWidth_element}x${overlayHeight_element}`);
        console.log(`  PDF coords: (${pdfX},${pdfY}) ${pdfWidth}x${pdfHeight}`);
        console.log(`  Scale factors: X=${scaleX}, Y=${scaleY}`);

        if (element.type === 'text' && element.content.trim()) {
          const font = await state.pdfDoc.embedFont(StandardFonts.Helvetica);
          page.drawText(element.content, {
            x: pdfX,
            y: pdfY + (pdfHeight * 0.7), // Adjust for text baseline
            size: element.fontSize || 12,
            font: font,
            color: rgb(0, 0, 0),
            maxWidth: pdfWidth,
          });
          console.log(`Applied text: "${element.content}" at PDF coordinates (${pdfX}, ${pdfY})`);
        } else if (element.type === 'image' && element.imageData) {
          try {
            const imageBytes = await fetch(element.imageData).then(res => res.arrayBuffer());
            let image;
            
            if (element.imageType === 'image/jpeg') {
              image = await state.pdfDoc.embedJpg(imageBytes);
            } else if (element.imageType === 'image/png') {
              image = await state.pdfDoc.embedPng(imageBytes);
            }

            if (image) {
              page.drawImage(image, {
                x: pdfX,
                y: pdfY,
                width: pdfWidth,
                height: pdfHeight,
              });
              console.log(`Applied image: "${element.content}" at PDF coordinates (${pdfX}, ${pdfY})`);
            }
          } catch (imageError) {
            console.error('Error embedding image:', imageError);
          }
        }
      }

      // Generate new PDF
      const newPdfBytes = await state.pdfDoc.save();
      
      if (state.pdfUrl) {
        URL.revokeObjectURL(state.pdfUrl);
      }
      
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setState(prev => ({
        ...prev,
        pdfUrl: url,
        pdfBytes: uint8ArrayToArrayBuffer(newPdfBytes),
        gridElements: []
      }));
      
      alert(`Successfully applied ${elements.length} element(s) to PDF using grid system!`);
      
    } catch (error) {
      console.error('Error applying elements to PDF:', error);
      alert('Error applying elements to PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const addTextElement = () => {
    if (!state.textInput.trim()) return;
    
    const newElement: GridElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      gridX: 2,
      gridY: 2,
      gridWidth: 6,
      gridHeight: 3,
      content: state.textInput,
      fontSize: 12
    };

    setState(prev => ({
      ...prev,
      gridElements: [...prev.gridElements, newElement],
      textInput: ''
    }));
  };

  const addImageElement = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        const newElement: GridElement = {
          id: `image-${Date.now()}`,
          type: 'image',
          gridX: 5,
          gridY: 5,
          gridWidth: 4,
          gridHeight: 4,
          content: file.name,
          imageData,
          imageType: file.type
        };

        setState(prev => ({
          ...prev,
          gridElements: [...prev.gridElements, newElement]
        }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error loading image:', error);
      alert('Error loading image');
    }
  };

  const downloadPDF = async (): Promise<void> => {
    if (!state.pdfDoc) return;

    try {
      const pdfBytes = await state.pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'grid-edited-document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF');
    }
  };

  const navigatePage = (direction: 'prev' | 'next'): void => {
    let newPage = state.currentPage;
    if (direction === 'prev' && state.currentPage > 0) {
      newPage = state.currentPage - 1;
    } else if (direction === 'next' && state.currentPage < state.totalPages - 1) {
      newPage = state.currentPage + 1;
    }
    
    if (newPage !== state.currentPage) {
      setState(prev => ({ 
        ...prev,
        currentPage: newPage, 
        gridElements: []
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Grid-Based PDF Editor</h1>
          <p className="text-gray-600">Precise positioning with grid system for perfect alignment</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Upload PDF</h2>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={state.isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
              >
                <Upload size={20} />
                {state.isLoading ? 'Loading...' : 'Upload PDF'}
              </button>
            </div>

            {state.pdfDoc && (
              <>
                {/* Page Navigation */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Page Navigation</h2>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => navigatePage('prev')}
                      disabled={state.currentPage === 0}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded disabled:opacity-50 transition-colors"
                    >
                      ← Prev
                    </button>
                    <span className="font-medium">
                      Page {state.currentPage + 1} of {state.totalPages}
                    </span>
                    <button
                      onClick={() => navigatePage('next')}
                      disabled={state.currentPage === state.totalPages - 1}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded disabled:opacity-50 transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {/* Grid Controls */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Grid Settings</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Grid Size:</label>
                      <select
                        value={state.gridSize}
                        onChange={(e) => setState(prev => ({ ...prev, gridSize: parseInt(e.target.value) }))}
                        className="border rounded px-2 py-1"
                      >
                        <option value={10}>10x10</option>
                        <option value={15}>15x15</option>
                        <option value={20}>20x20</option>
                        <option value={25}>25x25</option>
                        <option value={30}>30x30</option>
                        <option value={40}>40x40</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Show Grid:</label>
                      <button
                        onClick={() => setState(prev => ({ ...prev, showGrid: !prev.showGrid }))}
                        className={`p-2 rounded ${state.showGrid ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {state.showGrid ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      <div>PDF Size: {state.pdfDimensions.width.toFixed(0)} × {state.pdfDimensions.height.toFixed(0)}pt</div>
                      <div>Grid cells: {(800/state.gridSize).toFixed(1)} × {(700/state.gridSize).toFixed(1)}px each</div>
                    </div>
                  </div>
                </div>

                {/* Add Elements */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Add Elements</h2>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={state.textInput}
                      onChange={(e) => setState(prev => ({ ...prev, textInput: e.target.value }))}
                      placeholder="Enter text to add"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addTextElement}
                      disabled={!state.textInput.trim()}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                    >
                      <Type size={16} />
                      Add Text to Grid
                    </button>
                  </div>
                </div>

                {/* Add Images */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Add Image</h2>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={addImageElement}
                    ref={imageInputRef}
                    className="hidden"
                  />
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Image size={16} />
                    Add Image to Grid
                  </button>
                </div>

                {/* Download */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Download</h2>
                  <button
                    onClick={downloadPDF}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download size={16} />
                    Download PDF
                  </button>
                </div>
              </>
            )}
          </div>

          {/* PDF Preview with Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Grid3X3 size={20} />
                PDF Preview with Grid System
              </h2>
              {state.pdfUrl ? (
                <div className="relative">
                  {/* PDF Background */}
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white relative">
                    <iframe
                      src={`${state.pdfUrl}#page=${state.currentPage + 1}&view=FitH`}
                      className="w-full h-[700px]"
                      title="PDF Preview"
                      style={{ border: 'none' }}
                    />
                  </div>
                  
                  {/* Grid Overlay */}
                  <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                    <div className="w-full h-full pointer-events-auto">
                      <GridOverlay
                        pdfWidth={800} // Match iframe width exactly
                        pdfHeight={700} // Match iframe height exactly
                        elements={state.gridElements}
                        onElementsChange={(elements) => setState(prev => ({ ...prev, gridElements: elements }))}
                        onApplyToPDF={applyElementsToPDF}
                        gridSize={state.gridSize}
                        showGrid={state.showGrid}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
                  <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg mb-2">Upload a PDF file to start editing</p>
                  <p className="text-gray-400 text-sm">Grid-based positioning for precise control</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFEditor;





// 'use client';

// import React, { useState, useRef, ChangeEvent, DragEvent, MouseEvent } from 'react';
// import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';
// import { Upload, Download, Type, Image, RotateCw, Trash2, Plus, Move, X, Check } from 'lucide-react';

// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

// interface DraggableElement {
//   id: string;
//   type: 'text' | 'image';
//   x: number;
//   y: number;
//   content: string;
//   imageData?: string;
//   imageType?: string;
//   width?: number;
//   height?: number;
//   fontSize?: number;
//   isDragging?: boolean;
//   isResizing?: boolean;
// }

// interface PDFEditorState {
//   pdfDoc: PDFDocument | null;
//   pdfBytes: ArrayBuffer | null;
//   pdfUrl: string | null;
//   currentPage: number;
//   totalPages: number;
//   textInput: string;
//   isLoading: boolean;
//   pdfId: string | null;
//   draggableElements: DraggableElement[];
//   dragOffset: { x: number; y: number };
//   previewScale: number;
//   previewOffset: { x: number; y: number };
// }

// const PDFEditor: React.FC = () => {
//   const [state, setState] = useState<PDFEditorState>({
//     pdfDoc: null,
//     pdfBytes: null,
//     pdfUrl: null,
//     currentPage: 0,
//     totalPages: 0,
//     textInput: '',
//     isLoading: false,
//     pdfId: null,
//     draggableElements: [],
//     dragOffset: { x: 0, y: 0 },
//     previewScale: 1,
//     previewOffset: { x: 0, y: 0 }
//   });

//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const imageInputRef = useRef<HTMLInputElement>(null);
//   const previewRef = useRef<HTMLDivElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   const updateState = (updates: Partial<PDFEditorState>) => {
//     setState(prev => ({ ...prev, ...updates }));
//   };

//   // Helper function to convert Uint8Array to ArrayBuffer
//   const uint8ArrayToArrayBuffer = (uint8Array: Uint8Array): ArrayBuffer => {
//     // Create a new ArrayBuffer with the same length as the Uint8Array
//     const arrayBuffer = new ArrayBuffer(uint8Array.length);
//     // Create a new Uint8Array view of the ArrayBuffer
//     const view = new Uint8Array(arrayBuffer);
//     // Copy the data from the original Uint8Array
//     view.set(uint8Array);
//     return arrayBuffer;
//   };

//   const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
//     const file = event.target.files?.[0];
//     if (!file || file.type !== 'application/pdf') {
//       alert('Please select a valid PDF file');
//       return;
//     }

//     console.log('Starting file upload...', file.name, file.size);
//     updateState({ isLoading: true });
    
//     try {
//       console.log('Loading PDF with pdf-lib...');
//       // Load for client-side editing first (skip backend for now)
//       const arrayBuffer = await file.arrayBuffer();
//       console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);
      
//       const doc = await PDFDocument.load(arrayBuffer);
//       console.log('PDF loaded successfully');
      
//       const totalPages = doc.getPageCount();
//       console.log('Total pages:', totalPages);
      
//       // Create blob URL for iframe display
//       const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
//       const url = URL.createObjectURL(blob);
//       console.log('Blob URL created:', url);
      
//       // Update state first, then do canvas rendering
//       updateState({
//         pdfDoc: doc,
//         pdfBytes: arrayBuffer,
//         pdfUrl: url,
//         totalPages,
//         currentPage: 0,
//         isLoading: false,
//         draggableElements: [],
//         previewScale: 1,
//         previewOffset: { x: 0, y: 0 }
//       });
      
//       console.log('State updated, PDF should be visible');
      
//       // Do canvas rendering after state update
//       setTimeout(async () => {
//         try {
//           await renderPDFToCanvas(arrayBuffer);
//           console.log('Canvas rendering completed');
//         } catch (renderError) {
//           console.warn('Canvas rendering failed, but PDF should still be visible:', renderError);
//         }
//       }, 100);
      
//       // Try backend upload in the background (non-blocking)
//       if (API_BASE_URL) {
//         setTimeout(async () => {
//           try {
//             console.log('Attempting background backend upload...');
//             const formData = new FormData();
//             formData.append('file', file);
            
//             const apiEndpoint = `${API_BASE_URL}/api/v1/upload-pdf`;
//             const response = await fetch(apiEndpoint, {
//               method: 'POST',
//               body: formData,
//             });

//             if (response.ok) {
//               const result = await response.json();
//               console.log('Background backend upload successful:', result);
//               // Update pdfId separately
//               setState(prev => ({ ...prev, pdfId: result.pdf_id }));
//             } else {
//               console.warn('Background backend upload failed with status:', response.status);
//             }
//           } catch (apiError) {
//             console.warn('Background backend upload failed:', apiError);
//           }
//         }, 500);
//       }
      
//     } catch (error) {
//       console.error('Error during PDF upload:', error);
//       alert(`Error uploading PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
//       updateState({ isLoading: false });
//     }
//   };

//   const renderPDFToCanvas = async (pdfBytes: ArrayBuffer) => {
//     try {
//       console.log('Rendering PDF to canvas...');
//       // Using pdf-lib to get page dimensions and create preview
//       const doc = await PDFDocument.load(pdfBytes);
//       const pages = doc.getPages();
//       const page = pages[state.currentPage] || pages[0];
//       const { width, height } = page.getSize();
      
//       console.log('PDF page dimensions:', width, 'x', height);
      
//       updateState({ 
//         previewScale: Math.min(600 / width, 800 / height),
//         previewOffset: { x: 0, y: 0 }
//       });
      
//       console.log('Preview scale calculated');
//     } catch (error) {
//       console.error('Error rendering PDF:', error);
//     }
//   };

//   const addTextElement = () => {
//     if (!state.textInput.trim()) return;
    
//     const newElement: DraggableElement = {
//       id: `text-${Date.now()}`,
//       type: 'text',
//       x: 100,
//       y: 100,
//       content: state.textInput,
//       fontSize: 12,
//       width: 200,
//       height: 40
//     };

//     console.log('Adding new text element:', newElement);

//     setState(prev => {
//       const updated = {
//         ...prev,
//         draggableElements: [...prev.draggableElements, newElement],
//         textInput: ''
//       };
//       console.log('Updated elements after add:', updated.draggableElements);
//       return updated;
//     });
//   };

//   const addImageElement = async (event: ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     try {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const imageData = e.target?.result as string;
//         const newElement: DraggableElement = {
//           id: `image-${Date.now()}`,
//           type: 'image',
//           x: 200,
//           y: 200,
//           content: file.name,
//           imageData,
//           imageType: file.type,
//           width: 100,
//           height: 100
//         };

//         updateState({
//           draggableElements: [...state.draggableElements, newElement]
//         });
//       };
//       reader.readAsDataURL(file);
//     } catch (error) {
//       console.error('Error loading image:', error);
//       alert('Error loading image');
//     }
//   };

//   const handleMouseDown = (elementId: string, event: MouseEvent, action: 'drag' | 'resize' = 'drag') => {
//     event.preventDefault();
//     event.stopPropagation();
    
//     const element = state.draggableElements.find(el => el.id === elementId);
//     if (!element) return;

//     const rect = previewRef.current?.getBoundingClientRect();
//     if (!rect) return;

//     let startX = event.clientX;
//     let startY = event.clientY;
//     let startElementX = element.x;
//     let startElementY = element.y;
//     let startWidth = element.width || 100;
//     let startHeight = element.height || 40;

//     // Update element state to show it's being manipulated
//     setState(prev => ({
//       ...prev,
//       draggableElements: prev.draggableElements.map(el =>
//         el.id === elementId 
//           ? { ...el, isDragging: action === 'drag', isResizing: action === 'resize' } 
//           : el
//       )
//     }));

//     const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
//       const deltaX = moveEvent.clientX - startX;
//       const deltaY = moveEvent.clientY - startY;

//       setState(prev => ({
//         ...prev,
//         draggableElements: prev.draggableElements.map(el => {
//           if (el.id !== elementId) return el;
          
//           if (action === 'drag') {
//             return {
//               ...el,
//               x: Math.max(0, startElementX + deltaX),
//               y: Math.max(0, startElementY + deltaY)
//             };
//           } else if (action === 'resize') {
//             return {
//               ...el,
//               width: Math.max(50, startWidth + deltaX),
//               height: Math.max(20, startHeight + deltaY)
//             };
//           }
          
//           return el;
//         })
//       }));
//     };

//     const handleMouseUp = () => {
//       setState(prev => ({
//         ...prev,
//         draggableElements: prev.draggableElements.map(el =>
//           el.id === elementId 
//             ? { ...el, isDragging: false, isResizing: false } 
//             : el
//         )
//       }));
      
//       document.removeEventListener('mousemove', handleMouseMove);
//       document.removeEventListener('mouseup', handleMouseUp);
//     };

//     document.addEventListener('mousemove', handleMouseMove);
//     document.addEventListener('mouseup', handleMouseUp);
//   };

//   const deleteElement = (elementId: string) => {
//     updateState({
//       draggableElements: state.draggableElements.filter(el => el.id !== elementId)
//     });
//   };

//   const updateElementContent = (elementId: string, newContent: string) => {
//     console.log('Updating element content:', elementId, newContent);
//     setState(prev => {
//       const updated = {
//         ...prev,
//         draggableElements: prev.draggableElements.map(el =>
//           el.id === elementId ? { ...el, content: newContent } : el
//         )
//       };
//       console.log('Updated state:', updated.draggableElements.find(el => el.id === elementId));
//       return updated;
//     });
//   };

//   const applyElementsToPDF = async () => {
//     if (!state.pdfDoc) return;

//     try {
//       // Get current page elements
//       const pageElements = state.draggableElements;
//       if (pageElements.length === 0) {
//         alert('No elements to apply. Add some text or images first.');
//         return;
//       }

//       console.log('Applying elements to PDF:', pageElements);

//       const pages = state.pdfDoc.getPages();
//       const page = pages[state.currentPage];
//       const { width, height } = page.getSize();

//       console.log('PDF page size:', width, 'x', height);
//       console.log('Preview scale:', state.previewScale);

//       // Get the iframe dimensions for proper coordinate conversion
//       const iframeHeight = 600; // Height of our iframe
//       const iframeWidth = 800; // Approximate width based on container

//       // Apply each element to the PDF
//       for (const element of pageElements) {
//         // Better coordinate conversion accounting for iframe scaling
//         // Convert from overlay coordinates to PDF coordinates
//         const overlayToPdfScaleX = width / iframeWidth;
//         const overlayToPdfScaleY = height / iframeHeight;
        
//         const pdfX = element.x * overlayToPdfScaleX;
//         const pdfY = height - (element.y * overlayToPdfScaleY) - 30; // PDF Y coordinates are bottom-up

//         console.log(`Element ${element.id}: Overlay(${element.x}, ${element.y}) -> PDF(${pdfX}, ${pdfY})`);
//         console.log(`Scale factors: X=${overlayToPdfScaleX}, Y=${overlayToPdfScaleY}`);

//         if (element.type === 'text' && element.content.trim()) {
//           const font = await state.pdfDoc.embedFont(StandardFonts.Helvetica);
//           page.drawText(element.content, {
//             x: Math.max(0, pdfX),
//             y: Math.max(20, pdfY),
//             size: element.fontSize || 12,
//             font: font,
//             color: rgb(0, 0, 0),
//           });
//           console.log(`Applied text: "${element.content}" at PDF coordinates (${pdfX}, ${pdfY})`);
//         } else if (element.type === 'image' && element.imageData) {
//           try {
//             const imageBytes = await fetch(element.imageData).then(res => res.arrayBuffer());
//             let image;
            
//             if (element.imageType === 'image/jpeg') {
//               image = await state.pdfDoc.embedJpg(imageBytes);
//             } else if (element.imageType === 'image/png') {
//               image = await state.pdfDoc.embedPng(imageBytes);
//             }

//             if (image) {
//               const imgWidth = (element.width || 100) * overlayToPdfScaleX;
//               const imgHeight = (element.height || 100) * overlayToPdfScaleY;
              
//               page.drawImage(image, {
//                 x: Math.max(0, pdfX),
//                 y: Math.max(0, pdfY - imgHeight),
//                 width: imgWidth,
//                 height: imgHeight,
//               });
//               console.log(`Applied image: "${element.content}" at PDF coordinates (${pdfX}, ${pdfY})`);
//             }
//           } catch (imageError) {
//             console.error('Error embedding image:', imageError);
//           }
//         }
//       }

//       // Generate new PDF bytes
//       const newPdfBytes = await state.pdfDoc.save();
//       console.log('PDF saved with new content');

//       // Clean up previous URL
//       if (state.pdfUrl) {
//         URL.revokeObjectURL(state.pdfUrl);
//       }
      
//       // Create new blob URL
//       const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
//       const url = URL.createObjectURL(blob);
//       console.log('New PDF blob URL created:', url);

//       // Update state with new PDF URL and clear elements
//       setState(prev => ({
//         ...prev,
//         pdfUrl: url,
//         pdfBytes: uint8ArrayToArrayBuffer(newPdfBytes),
//         draggableElements: [] // Clear elements after applying
//       }));
      
//       console.log('Elements successfully applied to PDF and cleared from overlay');
//       alert(`Successfully applied ${pageElements.length} element(s) to page ${state.currentPage + 1}!`);
      
//     } catch (error) {
//       console.error('Error applying elements to PDF:', error);
//       alert('Error applying elements to PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
//     }
//   };

//   const updatePdfPreview = async (): Promise<void> => {
//     if (!state.pdfDoc) return;

//     try {
//       const newPdfBytes = await state.pdfDoc.save();
      
//       // Clean up previous URL
//       if (state.pdfUrl) {
//         URL.revokeObjectURL(state.pdfUrl);
//       }
      
//       const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
//       const url = URL.createObjectURL(blob);
      
//       setState(prev => ({
//         ...prev,
//         pdfUrl: url,
//         pdfBytes: uint8ArrayToArrayBuffer(newPdfBytes)
//       }));
      
//       console.log('PDF preview updated with new content');
//     } catch (error) {
//       console.error('Error updating preview:', error);
//     }
//   };

//   const downloadPDF = async (): Promise<void> => {
//     if (!state.pdfDoc) return;

//     try {
//       const pdfBytes = await state.pdfDoc.save();
//       const blob = new Blob([pdfBytes], { type: 'application/pdf' });
//       const url = URL.createObjectURL(blob);
      
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = 'edited-document.pdf';
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
      
//       URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error('Error downloading PDF:', error);
//       alert('Error downloading PDF');
//     }
//   };

//   const navigatePage = (direction: 'prev' | 'next'): void => {
//     let newPage = state.currentPage;
//     if (direction === 'prev' && state.currentPage > 0) {
//       newPage = state.currentPage - 1;
//     } else if (direction === 'next' && state.currentPage < state.totalPages - 1) {
//       newPage = state.currentPage + 1;
//     }
    
//     if (newPage !== state.currentPage) {
//       updateState({ 
//         currentPage: newPage, 
//         draggableElements: [] // Clear elements when changing pages
//       });
      
//       // The iframe will automatically navigate to the new page via the URL fragment
//     }
//   };

//   const handleTextInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
//     updateState({ textInput: event.target.value });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
//       <div className="max-w-7xl mx-auto">
//         <header className="text-center mb-8">
//           <h1 className="text-4xl font-bold text-gray-800 mb-2">Draggable PDF Editor</h1>
//           <p className="text-gray-600">Upload, drag elements, and save your PDF</p>
//         </header>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Control Panel */}
//           <div className="lg:col-span-1 space-y-6">
//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h2 className="text-xl font-semibold mb-4">Upload PDF</h2>
//               <input
//                 type="file"
//                 accept=".pdf"
//                 onChange={handleFileUpload}
//                 ref={fileInputRef}
//                 className="hidden"
//               />
//               <button
//                 onClick={() => fileInputRef.current?.click()}
//                 disabled={state.isLoading}
//                 className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
//               >
//                 <Upload size={20} />
//                 {state.isLoading ? 'Loading...' : 'Upload PDF'}
//               </button>
//             </div>

//             {state.pdfDoc && (
//               <>
//                 <div className="bg-white rounded-lg shadow-lg p-6">
//                   <h2 className="text-xl font-semibold mb-4">Page Navigation</h2>
//                   <div className="flex items-center justify-between mb-4">
//                     <button
//                       onClick={() => navigatePage('prev')}
//                       disabled={state.currentPage === 0}
//                       className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded disabled:opacity-50 transition-colors"
//                     >
//                       ← Prev
//                     </button>
//                     <span className="font-medium">
//                       Page {state.currentPage + 1} of {state.totalPages}
//                     </span>
//                     <button
//                       onClick={() => navigatePage('next')}
//                       disabled={state.currentPage === state.totalPages - 1}
//                       className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded disabled:opacity-50 transition-colors"
//                     >
//                       Next →
//                     </button>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-lg shadow-lg p-6">
//                   <h2 className="text-xl font-semibold mb-4">Add Elements</h2>
//                   <div className="space-y-3">
//                     <input
//                       type="text"
//                       value={state.textInput}
//                       onChange={handleTextInputChange}
//                       placeholder="Enter text to add"
//                       className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//                     />
//                     <button
//                       onClick={addTextElement}
//                       disabled={!state.textInput.trim()}
//                       className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
//                     >
//                       <Type size={16} />
//                       Add Draggable Text
//                     </button>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-lg shadow-lg p-6">
//                   <h2 className="text-xl font-semibold mb-4">Add Image</h2>
//                   <input
//                     type="file"
//                     accept="image/jpeg,image/png"
//                     onChange={addImageElement}
//                     ref={imageInputRef}
//                     className="hidden"
//                   />
//                   <button
//                     onClick={() => imageInputRef.current?.click()}
//                     className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
//                   >
//                     <Image size={16} />
//                     Add Draggable Image
//                   </button>
//                 </div>

//                 {state.draggableElements.length > 0 && (
//                   <div className="bg-white rounded-lg shadow-lg p-6">
//                     <h2 className="text-xl font-semibold mb-4">Apply Changes</h2>
//                     <button
//                       onClick={applyElementsToPDF}
//                       className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
//                     >
//                       <Check size={16} />
//                       Apply Elements to PDF
//                     </button>
//                     <p className="text-sm text-gray-600 mt-2">
//                       Drag elements to position them, then click to apply to the PDF
//                     </p>
//                   </div>
//                 )}

//                 <div className="bg-white rounded-lg shadow-lg p-6">
//                   <h2 className="text-xl font-semibold mb-4">Download</h2>
//                   <button
//                     onClick={downloadPDF}
//                     className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
//                   >
//                     <Download size={16} />
//                     Download PDF
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>

//           {/* PDF Preview with Draggable Elements */}
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h2 className="text-xl font-semibold mb-4">PDF Preview & Editor</h2>
//               {state.pdfUrl ? (
//                 <div className="relative">
//                   {/* PDF Background */}
//                   <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white relative">
//                     <iframe
//                       src={`${state.pdfUrl}#page=${state.currentPage + 1}&view=FitH`}
//                       className="w-full h-[600px]"
//                       title="PDF Preview"
//                       style={{ border: 'none' }}
//                     />
//                   </div>
                  
//                   {/* Draggable Elements Overlay */}
//                   <div 
//                     ref={previewRef}
//                     className="absolute inset-0 pointer-events-none"
//                     style={{ 
//                       border: '2px solid transparent',
//                       borderRadius: '8px',
//                       margin: '6px'
//                     }}
//                   >
//                     {state.draggableElements.map((element) => (
//                       <div
//                         key={element.id}
//                         className={`absolute pointer-events-auto border-2 border-dashed ${
//                           element.isDragging || element.isResizing 
//                             ? 'border-blue-500 bg-blue-50' 
//                             : 'border-gray-400 bg-white'
//                         } rounded shadow-lg group select-none`}
//                         style={{
//                           left: element.x,
//                           top: element.y,
//                           width: element.width || (element.type === 'image' ? 100 : 200),
//                           height: element.height || (element.type === 'image' ? 100 : 40),
//                           minWidth: element.type === 'text' ? 100 : 50,
//                           minHeight: element.type === 'text' ? 20 : 50
//                         }}
//                       >
//                         {/* Header with drag handle and controls */}
//                         <div 
//                           className="flex items-center justify-between p-1 cursor-move bg-gray-100 rounded-t border-b"
//                           onMouseDown={(e) => {
//                             console.log('Header mousedown - starting drag');
//                             handleMouseDown(element.id, e, 'drag');
//                           }}
//                         >
//                           <Move size={12} className="text-gray-500" />
//                           <span className="text-xs text-gray-600">{element.type}</span>
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               deleteElement(element.id);
//                             }}
//                             className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
//                           >
//                             <X size={12} />
//                           </button>
//                         </div>
                        
//                         {/* Content area */}
//                         <div className="p-1 flex-1" style={{ height: 'calc(100% - 24px)' }}>
//                           {element.type === 'text' ? (
//                             <input
//                               type="text"
//                               value={element.content || ''}
//                               onChange={(e) => {
//                                 console.log('Text change for element:', element.id, 'New value:', e.target.value);
//                                 updateElementContent(element.id, e.target.value);
//                               }}
//                               className="w-full h-full text-sm border-none bg-transparent focus:outline-none px-1"
//                               style={{ 
//                                 fontSize: element.fontSize || 12,
//                                 fontFamily: 'Arial, sans-serif',
//                                 color: '#000',
//                                 backgroundColor: 'transparent'
//                               }}
//                               placeholder="Enter text..."
//                               onMouseDown={(e) => {
//                                 e.stopPropagation();
//                                 console.log('Input clicked, preventing drag');
//                               }}
//                               onFocus={(e) => {
//                                 e.stopPropagation();
//                                 console.log('Input focused');
//                               }}
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 console.log('Input element clicked');
//                               }}
//                             />
//                           ) : (
//                             <div className="flex items-center justify-center h-full">
//                               {element.imageData ? (
//                                 <img
//                                   src={element.imageData}
//                                   alt={element.content}
//                                   className="max-w-full max-h-full object-contain"
//                                 />
//                               ) : (
//                                 <div className="text-xs text-gray-500 text-center">
//                                   {element.content}
//                                 </div>
//                               )}
//                             </div>
//                           )}
//                         </div>
                        
//                         {/* Resize handle */}
//                         <div 
//                           className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
//                           onMouseDown={(e) => handleMouseDown(element.id, e, 'resize')}
//                           style={{
//                             clipPath: 'polygon(100% 0, 0 100%, 100% 100%)'
//                           }}
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
//                   <Upload size={48} className="mx-auto text-gray-400 mb-4" />
//                   <p className="text-gray-500 text-lg mb-2">Upload a PDF file to start editing</p>
//                   <p className="text-gray-400 text-sm">Supported format: PDF files only</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PDFEditor;


