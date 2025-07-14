"use client";
import React, { useState, useEffect } from "react";
import { TEMPLATE } from "../../_components/TemplateListSection";
import { Loader2Icon, Upload as UploadIcon } from "lucide-react";
import TemplateOptions, { getModelsByProvider } from "@/app/(data)/TemplateOptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PROPS {
  selectedTemplate?: TEMPLATE;
  userFormInput: (data: any) => void;
  loading: boolean;
}

function HorizontalFormSection({ selectedTemplate, userFormInput, loading }: PROPS) {
  const [formData, setFormData] = useState<any>({
    provider: "openai", // Default provider
  });
  const [taskBriefFile, setTaskBriefFile] = useState<File | null>(null);
  const [availableModels, setAvailableModels] = useState(getModelsByProvider("openai"));
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [fileType, setFileType] = useState<string | null>(null);

  // Update available models when provider changes
  useEffect(() => {
    if (formData.provider) {
      setAvailableModels(getModelsByProvider(formData.provider));
      
      // Clear the model selection if changing providers
      if (formData.model && !getModelsByProvider(formData.provider).some(m => m.value === formData.model)) {
        setFormData((prev: any) => ({ ...prev, model: undefined }));
      }
    }
  }, [formData.provider]);

  const handleSelectChange = (value: string, name: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTaskBriefFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    console.log("Task Brief file selected:", file?.name);
    setTaskBriefFile(file); // Update local state for UI display

    // Update the main formData state as well
    setFormData((prevData: any) => ({
        ...prevData,
        task_file: file
    }));
  };

  const handleFileChange = async (file: File | null, fileType: string | null, fileUrl: string | null) => {
    try {
      // If we have a file, process it
      if (file) {
        console.log('HorizontalFormSection processing file:', file.name, 'type:', fileType);
        
        // Convert file to blob and create a new File object with correct mime type
        const fileBlob = await new Response(file).blob();
        const mimeType = file.type || 'application/octet-stream';
        const processedFile = new File([fileBlob], file.name, { type: mimeType });
        
        // Update form data with the processed file
        setFormData({
          ...formData,
          uploadedFile: processedFile.name,
          file: processedFile,
          file_type: fileType,
          file_url: null, // Clear any previous URL
        });
        
        // Update state for UI
        setFileType(fileType);
        setFileUrl("");
      } else if (fileUrl) {
        // No file, just URL
        setFormData({
          ...formData,
          uploadedFile: null,
          file: null, 
          file_type: fileType,
          file_url: fileUrl,
        });
        
        // Update state for UI
        setFileType(fileType);
      }
    } catch (error) {
      console.error('Error processing file:', error);
    }
  };
  
  const handleFileUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFileUrl(url);
    
    // If there's a URL, update the form data
    if (url) {
      handleFileChange(null, fileType, url);
    }
  };
  
  const handleFileTypeChange = (value: string) => {
    setFileType(value);
    
    // Update form data with the new file type
    if (uploadMethod === "file" && formData.file) {
      handleFileChange(formData.file, value, null);
    } else if (uploadMethod === "url" && fileUrl) {
      handleFileChange(null, value, fileUrl);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass data to parent component through callback
    userFormInput(formData);
  };

  // Check if a field name is in our options list
  const hasOptions = (fieldName: string): boolean => {
    return Object.keys(TemplateOptions).includes(fieldName);
  };

  return (
    <div className="w-full bg-white border rounded-lg shadow-sm p-3 mb-4">
      <form onSubmit={onSubmit}>
        {/* Single-row horizontal layout */}
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          
          {/* Upload Component with toggle between file and URL */}
          <div className="flex-grow md:flex-grow-0 md:w-[250px]">
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-xs">Content Source</label>
              <div className="flex text-xs space-x-1">
                <button
                  type="button"
                  onClick={() => setUploadMethod("file")}
                  className={`px-2 py-0.5 rounded-sm ${uploadMethod === "file" ? "bg-primary text-white" : "bg-gray-100"}`}
                >
                  File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod("url")}
                  className={`px-2 py-0.5 rounded-sm ${uploadMethod === "url" ? "bg-primary text-white" : "bg-gray-100"}`}
                >
                  URL
                </button>
              </div>
            </div>
            
            {/* File Upload Input */}
            {uploadMethod === "file" && (
              <Input 
                type="file" 
                id="fileUpload"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    // Try to determine file type from extension
                    const extension = file.name.split('.').pop()?.toLowerCase();
                    let detectedType = 'pdf'; // Default
                    
                    if (extension === 'pdf') detectedType = 'pdf';
                    else if (extension === 'docx') detectedType = 'docx';
                    else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) detectedType = 'images';
                    
                    handleFileChange(file, detectedType, null);
                    setFileType(detectedType);
                  }
                }}
                className="h-9 text-xs file:text-xs file:py-1"
              />
            )}
            
            {/* URL Input */}
            {uploadMethod === "url" && (
              <Input
                type="url"
                value={fileUrl}
                onChange={handleFileUrlChange}
                placeholder="Enter URL"
                className="h-9 text-xs"
              />
            )}
          </div>
          
          {/* File Type Selection - only shown when a file is selected or URL is entered */}
          {((uploadMethod === "file" && formData.file) || (uploadMethod === "url" && fileUrl)) && (
            <div className="md:w-auto md:flex-shrink-0">
              <label className="font-bold text-xs block mb-1">File Type</label>
              <Select
                value={fileType || undefined}
                onValueChange={handleFileTypeChange}
                required
              >
                <SelectTrigger className="w-full md:w-[140px] h-9">
                  <SelectValue placeholder="Select type" />
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

          {/* Dynamic dropdown fields based on template in a horizontal row */}
          {selectedTemplate?.form?.map((item, index) => (
            item.field === "input" && hasOptions(item.name) ? (
              <div key={index} className="md:w-auto md:flex-shrink-0">
                <label className="font-bold text-xs block mb-1">{item.label}</label>
                <Select
                  onValueChange={(value) => handleSelectChange(value, item.name)}
                  required={item?.required}
                >
                  <SelectTrigger className="w-full md:w-[140px] h-9">
                    <SelectValue placeholder={`Select ${item.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {TemplateOptions[item.name]?.map((option, i) => (
                      <SelectItem key={i} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null
          ))}

          {/* Provider Selection */}
          <div className="md:w-auto md:flex-shrink-0">
            <label className="font-bold text-xs block mb-1">AI Provider</label>
            <Select
              defaultValue="openai"
              onValueChange={(value) => handleSelectChange(value, "provider")}
              required
            >
              <SelectTrigger className="w-full md:w-[140px] h-9">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                {TemplateOptions.providers?.map((option, i) => (
                  <SelectItem key={i} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Selection */}
          <div className="md:w-auto md:flex-shrink-0">
            <label className="font-bold text-xs block mb-1">AI Model</label>
            <Select
              value={formData.model}
              onValueChange={(value) => handleSelectChange(value, "model")}
              required
            >
              <SelectTrigger className="w-full md:w-[140px] h-9">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((option, i) => (
                  <SelectItem key={i} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="md:w-auto md:flex-shrink-0 md:self-end">
            <Button 
              type="submit" 
              className="w-full md:w-auto h-9 text-sm px-4" 
              disabled={loading}
            >
              {loading ? (
                <Loader2Icon className="animate-spin mr-1" size={16} />
              ) : null}
              Generate
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default HorizontalFormSection;