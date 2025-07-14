'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import MindMapView from '@/components/ui/mind-maps';

interface MindMapData {
  result?: any;
  mind_map?: any;
  [key: string]: any;
}

interface MindMapDisplayProps {
  data: MindMapData | null;
  isLoading: boolean;
  isActive?: boolean;
  message?: string;
}

const MindMapDisplay: React.FC<MindMapDisplayProps> = ({
  data,
  isLoading,
  isActive = false,
  message,
}) => {
  if (isLoading) {
    return (
      <Card className="w-full h-full min-h-[400px]">
        <CardContent className="p-6">
          <Skeleton className="h-[400px] w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="w-full h-full min-h-[400px]">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-[400px] text-gray-500">
            {message || "No mind map data available. Try generating a mind map first."}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extract the mind map data from the API response
  let mindMapData;
  
  if (data.result?.mind_map) {
    // Check if it's a string that needs parsing
    if (typeof data.result.mind_map === 'string') {
      try {
        // Remove code fence markers if present
        const jsonContent = data.result.mind_map.replace(/```json\n|\n```/g, '');
        mindMapData = JSON.parse(jsonContent);
      } catch (e) {
        console.error('Error parsing mind map data:', e);
      }
    } else {
      // Already an object
      mindMapData = data.result.mind_map;
    }
  } else if (data.mind_map) {
    // Direct mind_map property
    mindMapData = data.mind_map;
  } else if (data.result) {
    // Direct result might be the mind map
    mindMapData = data.result;
  }

  if (!mindMapData) {
    return (
      <Card className="w-full h-full min-h-[400px]">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-[400px] text-gray-500">
            Error processing mind map data. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full min-h-[500px]">
      <CardContent className="p-0 relative">
        <div className="w-full h-[500px]">
          <MindMapView data={mindMapData} />
        </div>
      </CardContent>
    </Card>
  );
};

export default MindMapDisplay;