"use client";

import React, { useState, useCallback, useEffect } from "react";
import NodeDisplay from "./NodeDisplay";
import WhiteBoard from "./WhiteBoard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Maximize2Icon, Minimize2Icon } from 'lucide-react';
import VoiceButton from '@/components/chatbot/VoiceButton.jsx';

interface ClassDisplayProps {
  onAddNode?: (addNodeFunc: any) => void;
}

const ClassDisplay = ({ onAddNode }: ClassDisplayProps) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("concept-map");
  
  // Fullscreen toggle handlers
  const enterFullscreen = useCallback(() => {
    setIsFullscreen(true);
  }, []);

  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        exitFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, exitFullscreen]);

  // Determine the container class based on fullscreen state
  const containerClass = isFullscreen
    ? "fixed inset-0 z-50 bg-white flex flex-col" // Fullscreen mode
    : "w-full h-full flex flex-col space-y-4"; // Normal mode

  // Determine content height based on fullscreen state
  const contentHeight = isFullscreen ? "calc(100vh - 60px)" : "900px";

  return (
    <div className={containerClass}>
      <div className="p-2 flex items-center justify-between bg-white border-b">
        <Tabs 
          defaultValue="concept-map" 
          className="flex-1 w-full"
          onValueChange={(value) => setActiveTab(value)}
        >
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="concept-map">Concept Map</TabsTrigger>
              <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
            </TabsList>
            
            {/* Control buttons - moved to the right */}
            <div className="flex items-center gap-2">
              {/* Voice Button */}
              <VoiceButton />
              
              {/* Fullscreen Button */}
              <button
                onClick={isFullscreen ? exitFullscreen : enterFullscreen}
                className="px-2 py-1 bg-white border border-gray-300 rounded-md shadow-sm flex items-center justify-center text-sm text-gray-700 hover:bg-gray-100"
              >
                {isFullscreen ? (
                  <Minimize2Icon size={16} />
                ) : (
                  <Maximize2Icon size={16} />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden w-full">
            <TabsContent value="concept-map" className="h-full">
              <div style={{ height: contentHeight }}>
                <NodeDisplay onAddNode={onAddNode} />
              </div>
            </TabsContent>
            
            <TabsContent value="whiteboard" className="h-full">
              <div style={{ height: contentHeight }}>
                <WhiteBoard />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ClassDisplay;