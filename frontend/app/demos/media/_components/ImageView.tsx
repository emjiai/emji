"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ChevronRight, Cloud, Upload } from "lucide-react";

interface ImageItem {
  id: string;
  title: string;
  url: string;
  episodeId?: string;
  slideId?: string;
}

interface ImageViewProps {
  images: ImageItem[];
}

export default function ImageView({ images }: ImageViewProps) {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(
    images.length > 0 ? images[0] : null
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imagesPerPage = 5; // Number of images to show in the carousel at once
  const totalPages = Math.ceil(images.length / imagesPerPage);

  const handleDownload = useCallback(async () => {
    if (!selectedImage) return;

    try {
      const response = await fetch(selectedImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      // Extract filename from URL or use title
      const filename = selectedImage.url.split("/").pop() || `${selectedImage.title}.png`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  }, [selectedImage]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !selectedImage) return;
    
    const file = event.target.files[0];
    
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // Get episode and slide IDs, with better logging
      const slideId = selectedImage.slideId || '';
      const episodeId = selectedImage.episodeId || '';
      
      console.log('Uploading image with metadata:', {
        slideId,
        episodeId,
        title: selectedImage.title,
        imageInfo: selectedImage
      });
      
      // Prepare form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('slide_id', slideId);
      formData.append('episode_id', episodeId);
      formData.append('image_title', selectedImage.title);
      
      // Configure API endpoint using environment variable
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const apiEndpoint = `${API_BASE_URL}/api/v1/media_upload_image`;
      
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
        console.log('Image upload successful:', result.data.aws_url);
        setSaveStatus('success');
        
        // Update local image object with new URL
        setSelectedImage({
          ...selectedImage,
          url: result.data.aws_url
        });
        
        // Reset status after 5 seconds
        setTimeout(() => setSaveStatus('idle'), 5000);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error uploading image to AWS:", error);
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
  }, [selectedImage]);

  const handleUploadToAWS = useCallback(async () => {
    if (!selectedImage) return;
    
    setIsSaving(true);
    setSaveStatus('saving');

    try {
      // Fetch the image from the URL
      const imageResponse = await fetch(selectedImage.url);
      const imageBlob = await imageResponse.blob();
      
      // Get episode and slide IDs, with better logging
      const slideId = selectedImage.slideId || '';
      const episodeId = selectedImage.episodeId || '';
      
      console.log('Uploading image to AWS with metadata:', {
        slideId,
        episodeId,
        title: selectedImage.title,
        imageInfo: selectedImage
      });
      
      // Prepare form data for upload
      const formData = new FormData();
      formData.append('file', imageBlob, `${selectedImage.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`);
      formData.append('slide_id', slideId);
      formData.append('episode_id', episodeId);
      formData.append('image_title', selectedImage.title);
      
      // Configure API endpoint using environment variable
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const apiEndpoint = `${API_BASE_URL}/api/v1/media_upload_image`;
      
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
        console.log('Image upload to AWS successful:', result.data.aws_url);
        setSaveStatus('success');
        
        // Reset status after 5 seconds
        setTimeout(() => setSaveStatus('idle'), 5000);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error uploading image to AWS:", error);
      setSaveStatus('error');
      
      // Reset status after 5 seconds
      setTimeout(() => setSaveStatus('idle'), 5000);
    } finally {
      setIsSaving(false);
    }
  }, [selectedImage]);

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

  // Get current page images
  const currentImages = images.slice(
    currentPage * imagesPerPage,
    (currentPage + 1) * imagesPerPage
  );

  return (
    <div className="space-y-4">
      {selectedImage && (
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-lg font-medium leading-6">{selectedImage.title}</h3>
              <p className="text-sm text-gray-500">
                {selectedImage.episodeId && `Episode: ${selectedImage.episodeId}`}
                {selectedImage.slideId && ` • Slide: ${selectedImage.slideId}`}
              </p>
            </div>
            <div className="flex space-x-2">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={triggerFileSelector}
                disabled={isSaving || !selectedImage}
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
                    <span>Upload New Image</span>
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
                ✓ Image uploaded to AWS and JSON updated successfully!
              </p>
            </div>
          )}
          
          {saveStatus === 'error' && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                ✗ Failed to upload image. Please try again.
              </p>
            </div>
          )}
          
          <div className="relative h-80 border rounded-lg overflow-hidden bg-gray-50">
            <Image
              src={selectedImage.url}
              alt={selectedImage.title}
              fill
              style={{ objectFit: "contain" }}
              className="p-2"
            />
          </div>
        </div>
      )}

      {/* Carousel/slider for other images */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-600">All Images</h4>
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
          {currentImages.map((image) => (
            <div
              key={image.id}
              className={`relative h-20 w-32 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 transition-all ${
                selectedImage?.id === image.id
                  ? "border-blue-500"
                  : "border-transparent hover:border-gray-300"
              }`}
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={image.url}
                alt={image.title}
                fill
                style={{ objectFit: "cover" }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                {image.slideId ? image.slideId.split('_').pop() : image.episodeId}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}