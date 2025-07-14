"use client";
import React, { useState, useEffect } from "react";
import { TEMPLATE } from "../../_components/TemplateListSection";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2Icon, Upload as UploadIcon, X } from "lucide-react";
import TemplateOptions, { getModelsByProvider } from "@/app/(data)/TemplateOptions";
import UploadComponent from "@/app/components/Upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PROPS {
  selectedTemplate?: TEMPLATE;
  userFormInput: any;
  loading: boolean;
}

function FormSection({ selectedTemplate, userFormInput, loading }: PROPS) {
  const [formData, setFormData] = useState<any>({
    provider: "openai", // Default provider
  });
  const [taskBriefFile, setTaskBriefFile] = useState<File | null>(null);
  const [availableModels, setAvailableModels] = useState(getModelsByProvider("openai"));

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

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Add this new function inside the FormSection component
const handleTaskBriefFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0] || null;
  console.log("Task Brief file selected:", file?.name);
  setTaskBriefFile(file); // Update local state for UI display

  // Update the main formData state as well, using the key expected by your backend ('task_file')
  setFormData((prevData: any) => ({
      ...prevData,
      task_file: file // Add/update the task_file in formData
  }));
};
  const handleFileChange = async (file: File | null, fileType: string | null, fileUrl: string | null) => {
    try {
      // If we have a file, process it using the Blob approach that works in the test component
      if (file) {
        console.log('FormSection processing file:', file.name, 'type:', fileType);
        
        // Convert file to blob and create a new File object with correct mime type
        const fileBlob = await new Response(file).blob();
        const mimeType = file.type || 'application/octet-stream';
        const processedFile = new File([fileBlob], file.name, { type: mimeType });
        
        console.log('FormSection processed file with Blob approach:', processedFile.name, 
                   'size:', processedFile.size, 'type:', processedFile.type);
        
        // Update form data with the processed file
        setFormData({
          ...formData,
          uploadedFile: processedFile.name,
          file: processedFile, // Store the processed file object
          file_type: fileType, // Make sure we explicitly set the file_type
          file_url: fileUrl, // Store the URL if provided
        });
      } else {
        // No file, just URL possibly
        setFormData({
          ...formData,
          uploadedFile: null,
          file: null, 
          file_type: fileType,
          file_url: fileUrl,
        });
      }
    } catch (error) {
      console.error('Error processing file with Blob approach:', error);
      // Fallback to original approach
      setFormData({
        ...formData,
        uploadedFile: file?.name,
        file: file,
        file_type: fileType,
        file_url: fileUrl,
      });
    }
  };

  const onSubmit = (e: any) => {
    e.preventDefault();
    
    // Log the final form data before submission
    console.log('FormSection submitting formData:', {
      ...formData, 
      file: formData.file ? `File: ${formData.file.name}` : null
    });
    
    // Pass the formData directly without trying to read the file content
    // The file object will be properly sent in the FormData by the parent component
    userFormInput(formData);
  };

  // Check if a field name is in our options list
  const hasOptions = (fieldName: string): boolean => {
    return Object.keys(TemplateOptions).includes(fieldName);
  };

  return (
    <div className="p-5 shadow-md border rounded-lg bg-white">
      {/* @ts-ignore */}
      <Image src={selectedTemplate?.icon} alt="icon" width={70} height={70} />
      <h2 className="font-bold text-2xl mb-2 text-primary">
        {selectedTemplate?.name}
      </h2>
      <p className="text-gray-500 text-sm">{selectedTemplate?.desc}</p>

      <form className="mt-6" onSubmit={onSubmit}>
        {/* File Upload Component (for main content) */}
        <UploadComponent 
          onFileChange={handleFileChange}
          selectedTemplate={selectedTemplate}
        />
        
        {/* Only show this section if the template name is 'Formative Assessment' or 'Academic Papers' */}
        {(selectedTemplate?.name === 'Formative Assessment' || selectedTemplate?.name === 'Academic Papers' || selectedTemplate?.name === 'Proposal Writer') && (
          <div className="my-2 flex flex-col gap-2 mb-7">
            <label htmlFor="taskBriefUpload" className="font-bold">
              {selectedTemplate?.name === 'Academic Papers' ? 'Upload Marking Criteria' : 'Upload Task Brief'}
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="taskBriefUpload"
                name="task_file" // Ensure this matches the backend expected field name
                type="file"
                className="hidden" // Hide default input, use styled label instead
                onChange={handleTaskBriefFileChange} // Ensure this handler is defined
                accept=".pdf,.doc,.docx,.txt,.md" // Define acceptable file types
              />
              {/* Styled Label acting as button */}
              <label
                htmlFor="taskBriefUpload"
                className="flex items-center gap-2 border rounded-md px-4 py-2 bg-slate-100 hover:bg-slate-200 cursor-pointer text-sm transition-colors flex-grow"
              >
                {/* Make sure UploadIcon is imported */}
                <UploadIcon size={16} className="mr-2" />
                {/* Make sure taskBriefFile state is defined */}
                {taskBriefFile ? taskBriefFile.name : selectedTemplate?.name === 'Academic Papers' ? "Choose Marking Criteria File" : "Choose Task Brief File"}
              </label>
              {/* Clear Button */}
              {taskBriefFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    // Make sure setTaskBriefFile state setter is defined
                    setTaskBriefFile(null);
                    // Make sure setFormData state setter is defined
                    setFormData((prevData: any) => ({
                       ...prevData,
                       task_file: null // Clear the file from main form data
                    }));
                    // Optionally reset the hidden input's value
                    const input = document.getElementById('taskBriefUpload') as HTMLInputElement;
                    if (input) input.value = '';
                  }}
                >
                   {/* Make sure X icon is imported */}
                  <X size={16} />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {selectedTemplate?.name === 'Academic Papers' 
                ? 'Upload the document containing the marking criteria or grading rubric for the academic paper.' 
                : 'Upload the document containing the task instructions or marking criteria.'}
             </p>
          </div>
        )}
        {/* === END: Conditional Task Brief Upload Section === */}


        {/* Dynamically generated fields based on the selected template */}
        {selectedTemplate?.form?.map((item, index) => (
          <div key={index} className="my-2 flex flex-col gap-2 mb-7">
            <label className="font-bold">{item.label}</label>

            {/* Input field */}
            {item.field === "input" && !hasOptions(item.name) && (
              <Input
                name={item.name}
                required={item?.required}
                onChange={handleInputChange}
              />
            )}

            {/* Textarea field */}
            {item.field === "textarea" && (
              <Textarea
                rows={5}
                name={item.name}
                required={item?.required}
                onChange={handleInputChange}
              />
            )}

            {/* Dropdown field - for inputs that have predefined options */}
            {item.field === "input" && hasOptions(item.name) && (
              <Select
                onValueChange={(value) => handleSelectChange(value, item.name)}
                required={item?.required}
              >
                <SelectTrigger className="w-full">
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
            )}
          </div>
        ))}

        {/* Provider Selection */}
        <div className="my-2 flex flex-col gap-2 mb-7">
          <label className="font-bold">AI Provider</label>
          <Select
            defaultValue="openai"
            onValueChange={(value) => handleSelectChange(value, "provider")}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select AI Provider" />
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

        {/* Model Selection - Depends on selected provider */}
        <div className="my-2 flex flex-col gap-2 mb-7">
          <label className="font-bold">AI Model</label>
          <Select
            value={formData.model} // Controlled component: value linked to state
            onValueChange={(value) => handleSelectChange(value, "model")}
            required
          >
            <SelectTrigger className="w-full">
              {/* Ensure placeholder shows if no model selected */}
              <SelectValue placeholder="Select AI Model" />
            </SelectTrigger>
            <SelectContent>
              {/* Ensure availableModels state updates correctly */}
              {availableModels.map((option, i) => (
                <SelectItem key={i} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Available models depend on the selected provider.
          </p>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full py-6" disabled={loading}>
          {loading && <Loader2Icon className="animate-spin mr-2" />}
          Generate Content
        </Button>
      </form>
    </div>
  );
}

export default FormSection;
