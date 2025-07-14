"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, X, LinkIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TemplateOptions from "@/app/(data)/TemplateOptions";
import { TEMPLATE } from "@/app/dashboard/_components/TemplateListSection";

interface UploadProps {
  onFileChange: (file: File | null, fileType: string | null, fileUrl: string | null) => void;
  selectedTemplate?: TEMPLATE;
  className?: string;
}

export default function UploadComponent({ onFileChange, selectedTemplate, className = "" }: UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");

  // Process file using the Blob approach for more reliable handling
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    console.log("Upload component - Selected file:", selectedFile?.name);
    
    if (selectedFile) {
      try {
        // Extract the file extension in lowercase
        const extension = selectedFile.name.split('.').pop()?.toLowerCase();
        let detectedType: string | null = null;
        let mimeType = '';
        
        // Determine MIME type based on extension
        switch (extension) {
          case 'txt':
            detectedType = 'txt';
            mimeType = 'text/plain';
            break;
          case 'pdf':
            detectedType = 'pdf';
            mimeType = 'application/pdf';
            break;
          case 'docx':
            detectedType = 'docx';
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
          case 'pptx':
            detectedType = 'power point';
            mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
            break;
          case 'xlsx':
            detectedType = 'excel';
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            break;
          case 'md':
            detectedType = 'md';
            mimeType = 'text/markdown';
            break;
          case 'csv':
            detectedType = 'csv';
            mimeType = 'text/csv';
            break;
          case 'json':
            detectedType = 'json';
            mimeType = 'application/json';
            break;
          case 'jpg':
          case 'jpeg':
            detectedType = 'images';
            mimeType = 'image/jpeg';
            break;
          case 'png':
            detectedType = 'images';
            mimeType = 'image/png';
            break;
          case 'gif':
            detectedType = 'images';
            mimeType = 'image/gif';
            break;
          case 'webp':
            detectedType = 'images';
            mimeType = 'image/webp';
            break;
          case 'mp3':
            detectedType = 'audio';
            mimeType = 'audio/mpeg';
            break;
          case 'wav':
            detectedType = 'audio';
            mimeType = 'audio/wav';
            break;
          case 'ogg':
            detectedType = 'audio';
            mimeType = 'audio/ogg';
            break;
          case 'mp4':
            detectedType = 'video';
            mimeType = 'video/mp4';
            break;
          case 'mov':
            detectedType = 'video';
            mimeType = 'video/quicktime';
            break;
          case 'webm':
            detectedType = 'video';
            mimeType = 'video/webm';
            break;
          case 'zip':
            detectedType = 'zip';
            mimeType = 'application/zip';
            break;
          default:
            console.log(`Unknown file extension: ${extension}. Trying MIME type fallback.`);
            if (selectedFile.type.includes('pdf')) {
              detectedType = 'pdf';
              mimeType = 'application/pdf';
            } else if (selectedFile.type.includes('word')) {
              detectedType = 'docx';
              mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            } else if (selectedFile.type.includes('image')) {
              detectedType = 'images';
              mimeType = selectedFile.type || 'image/jpeg';
            } else {
              detectedType = null;
              mimeType = selectedFile.type || 'application/octet-stream';
            }
        }
        
        console.log(`Detected file type: ${detectedType} for file ${selectedFile.name}`);
        
        // Convert file to blob and create a new File object
        const fileBlob = await new Response(selectedFile).blob();
        const processedFile = new File([fileBlob], selectedFile.name, { 
          type: mimeType || selectedFile.type || 'application/octet-stream' 
        });
        
        console.log('File processed with Blob approach:', processedFile.name, 'size:', processedFile.size, 'type:', processedFile.type);
        
        // Set the processed file and detected type
        setFile(processedFile);
        setFileType(detectedType);
      } catch (error) {
        console.error('Error processing file with Blob approach:', error);
        // Fallback to original approach
        setFile(selectedFile);
        setFileType(selectedFile.name.split('.').pop()?.toLowerCase() === 'pdf' ? 'pdf' : null);
      }
    } else {
      setFile(null);
      setFileType(null);
    }
  };

  const handleFileTypeChange = (value: string) => {
    setFileType(value);
  };

  const handleFileUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileUrl(event.target.value);
  };

  const clearFile = () => {
    setFile(null);
    setFileType(null);
  };

  // Notify parent component when file, fileType, or fileUrl changes.
  useEffect(() => {
    console.log("Upload component - Current file state:", file?.name);
    console.log("Upload component - Current fileType:", fileType);
    console.log("Upload component - Current uploadMethod:", uploadMethod);
    
    if (uploadMethod === "file") {
      onFileChange(file, fileType, null);
    } else if (uploadMethod === "url") {
      onFileChange(null, fileType, fileUrl || null);
    }
  }, [file, fileType, fileUrl, uploadMethod]);

  return (
    <div className={`mb-7 ${className}`}>
      <label className="font-bold mb-2 block">
  Upload Content
  {/* Conditionally add " (Optional)" if template is NOT Formative Assessment */}
  {selectedTemplate?.name !== 'Formative Assessment' && ' (Optional)'}
</label>
      
      {/* Toggle between file upload and URL */}
      <div className="flex gap-2 mb-4">
        <Button 
          type="button" 
          variant={uploadMethod === "file" ? "default" : "outline"}
          onClick={() => setUploadMethod("file")}>
          <UploadIcon size={16} className="mr-2" />
          File Upload
        </Button>
        <Button 
          type="button" 
          variant={uploadMethod === "url" ? "default" : "outline"}
          onClick={() => setUploadMethod("url")}>
          <LinkIcon size={16} className="mr-2" />
          URL Input
        </Button>
      </div>

      {/* File Upload UI */}
      {uploadMethod === "file" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input 
              type="file" 
              id="fileUpload"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label 
              htmlFor="fileUpload" 
              className="flex items-center gap-2 border rounded-md px-4 py-2 bg-slate-100 hover:bg-slate-200 cursor-pointer text-sm transition-colors flex-grow"
            >
              <UploadIcon size={16} />
              {file ? file.name : "Choose a file"}
            </label>
            {file && (
              <Button 
                type="button"
                variant="ghost" 
                size="icon"
                onClick={clearFile}
              >
                <X size={16} />
              </Button>
            )}
          </div>

          {/* File type selection */}
          {file && (
            <div>
              <label className="text-sm font-medium mb-1 block">File Type</label>
              <Select 
                value={fileType || undefined} 
                onValueChange={handleFileTypeChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent>
                  {TemplateOptions.fileTypes?.map((option, i) => (
                    <SelectItem key={i} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* URL Input UI */}
      {uploadMethod === "url" && (
        <div className="space-y-4">
          <div>
            <Input 
              type="url" 
              value={fileUrl}
              onChange={handleFileUrlChange}
              placeholder="Enter URL to content (e.g., https://example.com/document.pdf)" 
            />
          </div>

          {/* File type selection for URL */}
          {fileUrl && (
            <div>
              <label className="text-sm font-medium mb-1 block">File Type</label>
              <Select 
                value={fileType || undefined} 
                onValueChange={handleFileTypeChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent>
                  {TemplateOptions.fileTypes?.map((option, i) => (
                    <SelectItem key={i} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-1">
        Upload a file or provide a URL to use as input for content generation
      </p>
    </div>
  );
}
