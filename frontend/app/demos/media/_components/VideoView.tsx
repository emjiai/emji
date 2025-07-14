"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ChevronRight, Play, Cloud, Upload } from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  url: string;
  episodeId?: string;
  slideId?: string;
}

interface VideoViewProps {
  videos: VideoItem[];
}

export default function VideoView({ videos }: VideoViewProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(
    videos.length > 0 ? videos[0] : null
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const videosPerPage = 5; // Number of videos to show in the carousel at once
  const totalPages = Math.ceil(videos.length / videosPerPage);

  const handleDownload = useCallback(async () => {
    if (!selectedVideo) return;

    try {
      const response = await fetch(selectedVideo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      // Extract filename from URL or use title
      const filename = selectedVideo.url.split("/").pop() || `${selectedVideo.title}.mp4`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading video:", error);
    }
  }, [selectedVideo]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !selectedVideo) return;
    
    const file = event.target.files[0];
    
    // Check if the file is a video
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file');
      return;
    }
    
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // Get episode and slide IDs, with better logging
      const slideId = selectedVideo.slideId || '';
      const episodeId = selectedVideo.episodeId || '';
      
      console.log('Uploading video with metadata:', {
        slideId,
        episodeId,
        title: selectedVideo.title,
        videoInfo: selectedVideo
      });
      
      // Prepare form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slide_id', slideId);
      formData.append('episode_id', episodeId);
      formData.append('video_title', selectedVideo.title);
      
      // Configure API endpoint using environment variable
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const apiEndpoint = `${API_BASE_URL}/api/v1/media_upload_video`;
      
      // Make the request to the API
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data?.aws_url) {
        console.log('Video upload successful:', result.data.aws_url);
        setSaveStatus('success');
        
        // Update local video object with new URL
        setSelectedVideo({
          ...selectedVideo,
          url: result.data.aws_url
        });
        
        // Reset video player when updating the URL
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.load();
        }
        
        // Reset status after 5 seconds
        setTimeout(() => setSaveStatus('idle'), 5000);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error uploading video to AWS:", error);
      setSaveStatus('error');
      
      // Reset status after 5 seconds
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setIsSaving(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [selectedVideo]);

  const handleUploadToAWS = useCallback(async () => {
    if (!selectedVideo) return;
    
    setIsSaving(true);
    setSaveStatus('saving');

    try {
      // Fetch the video from the URL
      const videoResponse = await fetch(selectedVideo.url);
      const videoBlob = await videoResponse.blob();
      
      // Get episode and slide IDs, with better logging
      const slideId = selectedVideo.slideId || '';
      const episodeId = selectedVideo.episodeId || '';
      
      console.log('Uploading video to AWS with metadata:', {
        slideId,
        episodeId,
        title: selectedVideo.title,
        videoInfo: selectedVideo
      });
      
      // Prepare form data for upload
      const formData = new FormData();
      formData.append('file', videoBlob, `${selectedVideo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`);
      formData.append('slide_id', slideId);
      formData.append('episode_id', episodeId);
      formData.append('video_title', selectedVideo.title);
      
      // Configure API endpoint using environment variable
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const apiEndpoint = `${API_BASE_URL}/api/v1/media_upload_video`;
      
      // Make the request to the API
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data?.aws_url) {
        console.log('Video upload to AWS successful:', result.data.aws_url);
        setSaveStatus('success');
        
        // Reset status after 5 seconds
        setTimeout(() => setSaveStatus('idle'), 5000);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error uploading video to AWS:", error);
      setSaveStatus('error');
      
      // Reset status after 5 seconds
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setIsSaving(false);
    }
  }, [selectedVideo]);

  const triggerFileSelector = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  // Get current page videos
  const currentVideos = videos.slice(
    currentPage * videosPerPage,
    (currentPage + 1) * videosPerPage
  );

  // Generate a thumbnail from the video URL (this would normally be a separate thumbnail image)
  function getVideoThumbnail(url: string) {
    return (
      <div className="relative w-full h-full bg-gray-800 flex items-center justify-center">
        <Play className="h-8 w-8 text-white opacity-70" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedVideo && (
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-lg font-medium leading-6">{selectedVideo.title}</h3>
              <p className="text-sm text-gray-500">
                {selectedVideo.episodeId && `Episode: ${selectedVideo.episodeId}`}
                {selectedVideo.slideId && ` • Slide: ${selectedVideo.slideId}`}
              </p>
            </div>
            <div className="flex space-x-2">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="video/*"
                style={{ display: 'none' }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={triggerFileSelector}
                disabled={isSaving || !selectedVideo}
                className="flex items-center space-x-1 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-1" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-1" />
                    <span>Upload New Video</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUploadToAWS}
                disabled={isSaving}
                className="flex items-center space-x-1 text-green-600 border-green-200 hover:bg-green-50"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full mr-1" />
                    <span>Uploading & Saving...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="h-4 w-4 mr-1" />
                    <span>Upload to AWS</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4 mr-1" />
                <span>Download</span>
              </Button>
            </div>
          </div>
          
          {saveStatus === 'success' && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                Video uploaded to AWS and JSON updated successfully!
              </p>
            </div>
          )}
          
          {saveStatus === 'error' && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                Failed to upload video. Please try again.
              </p>
            </div>
          )}
          
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <video 
              ref={videoRef}
              src={selectedVideo.url} 
              controls 
              className="w-full h-full"
              poster=""
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Carousel/slider for other videos */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-600">All Videos</h4>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevPage}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextPage}
              disabled={currentPage >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex space-x-2 overflow-x-auto py-2">
          {currentVideos.map((video) => (
            <div
              key={video.id}
              className={`relative h-24 w-40 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 transition-all ${
                selectedVideo?.id === video.id
                  ? "border-blue-500"
                  : "border-transparent hover:border-gray-300"
              }`}
              onClick={() => {
                setSelectedVideo(video);
                // Reset video player when selecting a new video
                if (videoRef.current) {
                  videoRef.current.pause();
                  videoRef.current.currentTime = 0;
                }
              }}
            >
              {getVideoThumbnail(video.url)}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                <span>{video.title}</span>
                <span className="block text-xs text-gray-300">
                  {video.slideId ? video.slideId.split('_').pop() : video.episodeId || ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}