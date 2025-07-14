"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import ImageView from "./ImageView";
import VideoView from "./VideoView";
import InfographicView from "./InfographicView";
import { updateSlideVisualUrl } from "./edit/jsonUpdater";
import { extractImageData, extractVideoData, extractInfographicData } from "./utils/mediaExtractors";

type MediaType = "image" | "video" | "infographic";

export default function MediaDisplay({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<MediaType>("image");
  const [jsonData, setJsonData] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load podcast data from API on mount
  useEffect(() => {
    loadPodcastData();
  }, []);

  const loadPodcastData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const apiEndpoint = `${API_BASE_URL}/api/v1/podcast_data`;

      const response = await fetch(apiEndpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setJsonData(result.data);
        console.log('Podcast data loaded successfully from API');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error loading podcast data:', error);
      setError('Failed to load podcast data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Extract data based on current jsonData state
  const imageData = jsonData ? extractImageData(jsonData) : [];
  const videoData = jsonData ? extractVideoData(jsonData) : [];
  const infographicData = jsonData ? extractInfographicData(jsonData) : [];

  const handleInfographicUpdate = (episodeId: string, slideId: string, awsUrl: string) => {
    if (!jsonData) return;
    
    try {
      const updatedData = updateSlideVisualUrl(jsonData, episodeId, slideId, awsUrl);
      setJsonData(updatedData);
      setHasUnsavedChanges(true);
      console.log(`Updated visualUrl for slide ${slideId} in episode ${episodeId} with URL: ${awsUrl}`);
    } catch (error) {
      console.error("Failed to update JSON data:", error);
    }
  };

  const handleSaveChanges = async () => {
    if (!hasUnsavedChanges || !jsonData) return;
    
    setIsSavingChanges(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const apiEndpoint = `${API_BASE_URL}/api/v1/save_podcast_data`;

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: jsonData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setHasUnsavedChanges(false);
        console.log('Podcast data saved successfully to podcast.json');
      } else {
        throw new Error('Failed to save podcast data');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSavingChanges(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between bg-gray-100 px-6 py-4">
          <h2 className="text-xl font-bold">Media Gallery</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-gray-600">Loading podcast data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between bg-gray-100 px-6 py-4">
          <h2 className="text-xl font-bold">Media Gallery</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadPodcastData} variant="outline">
              Retry Loading
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header with close button and save controls */}
      <div className="flex items-center justify-between bg-gray-100 px-6 py-4">
        <h2 className="text-xl font-bold">Media Gallery</h2>
        <div className="flex items-center space-x-4">
          {hasUnsavedChanges && (
            <>
              <span className="text-sm text-orange-600 font-medium">
                • Unsaved changes
              </span>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveChanges}
                disabled={isSavingChanges}
                className="text-white bg-green-600 hover:bg-green-700"
              >
                {isSavingChanges ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex">
        {/* Edit section - left side */}
        <div className="w-1/3 border-r p-6">
          <h3 className="text-lg font-semibold mb-4">Edit Section</h3>
          <Tabs 
            defaultValue="image" 
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as MediaType)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="image">Images</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
              <TabsTrigger value="infographic">Visualizations</TabsTrigger>
            </TabsList>

            <TabsContent value="image" className="pt-4">
              {imageData.length > 0 ? (
                <div className="space-y-4">
                  {activeTab === "image" && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">{imageData.length} images available</p>
                      {/* Properties and edit fields for images could go here */}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No images available</p>
              )}
            </TabsContent>

            <TabsContent value="video" className="pt-4">
              {videoData.length > 0 ? (
                <div className="space-y-4">
                  {activeTab === "video" && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">{videoData.length} videos available</p>
                      {/* Properties and edit fields for videos could go here */}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No videos available</p>
              )}
            </TabsContent>

            <TabsContent value="infographic" className="pt-4">
              {infographicData.length > 0 ? (
                <div className="space-y-4">
                  {activeTab === "infographic" && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">{infographicData.length} visualizations available</p>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Types Available:</h4>
                        <div className="flex flex-wrap gap-1">
                          {Array.from(new Set(infographicData.map(item => item.type))).map(type => (
                            <span key={type} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {type}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          <span>With existing URLs: {infographicData.filter(item => item.hasExistingVisualUrl).length}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No visualizations available</p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Display section - right side */}
        <div className="w-2/3 p-6">
          <h3 className="text-lg font-semibold mb-4">Display Section</h3>
          {activeTab === "image" ? (
            <ImageView images={imageData} />
          ) : activeTab === "video" ? (
            <VideoView videos={videoData} />
          ) : (
            <InfographicView 
              infographics={infographicData} 
              onUpdateJson={handleInfographicUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
}

