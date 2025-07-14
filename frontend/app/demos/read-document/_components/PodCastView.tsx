'use client';

import React from 'react';
import EnhancedPodcast from '@/components/ui/podcast'; // Import the enhanced component
import FullScreen from '@/components/ui/full-screen';


// Enhanced episode interface with visual content and video structure
interface VisualContent {
  type: 'slide' | 'chart' | 'map' | 'video' | 'infographic' | 'interactive';
  title: string;
  content: any;
  timestamp: number; // When to show this content (in seconds)
  duration?: number; // How long to show it
}

interface EnhancedPodcastEpisode {
  id: string;
  title: string;
  description: string;
  duration: string;
  publishDate: string;
  audioUrl: string;
  videoUrl?: string; // Optional video track
  imageUrl?: string;
  hostName?: string;
  guestName?: string;
  topics: string[];
  learningObjectives: string[];
  audioScript?: string;
  visualContent?: VisualContent[]; // Dynamic visual content
  keyTimestamps?: { time: number; title: string; description: string }[];
  // New properties from JSON structure
  videoStructure?: {
    episodeOutput?: {
      finalVideoUrl?: string;
      totalDuration?: number;
      status?: string;
    };
  };
}

interface EnhancedPodcastData {
  title: string;
  description?: string;
  fullVideoUrl?: string; // Main video URL from JSON
  episodes: EnhancedPodcastEpisode[];
}

interface PodCastViewProps {  
  data: EnhancedPodcastData;
}

const PodCastView: React.FC<PodCastViewProps> = ({ data }) => {
  return (
    <FullScreen buttonPosition="absolute right-2 top-2 z-10">
      <div className="h-full overflow-y-auto p-4">
        <div className="relative">
          <EnhancedPodcast data={data} />
        </div>
      </div>
    </FullScreen>
  );
};

export default PodCastView;