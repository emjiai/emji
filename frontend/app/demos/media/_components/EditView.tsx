"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import FieldSelector from "./edit/FieldSelector";
import FieldEditor from "./edit/FieldEditor";
import { extractEditableFields } from "./edit/fieldExtractor";
import type { EditableField } from "./edit/type";

export default function EditView({ onClose }: { onClose: () => void }) {
  const [selectedField, setSelectedField] = useState<EditableField | null>(null);
  const [jsonData, setJsonData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);

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
        console.log('Podcast data loaded successfully for editing');
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

  // Extract all editable fields from the JSON
  const editableFields = jsonData ? extractEditableFields(jsonData) : [];

  // Filter fields based on search term
  const filteredFields = editableFields.filter(field =>
    field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFieldSelect = (field: EditableField) => {
    setSelectedField(field);
  };

  const handleFieldUpdate = (fieldPath: string, newValue: string) => {
    if (!jsonData) return;
    
    // Deep clone the data
    const updatedData = JSON.parse(JSON.stringify(jsonData));
    
    // Navigate to the field and update it
    const pathParts = fieldPath.split('.');
    let current = updatedData;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (part.includes('[') && part.includes(']')) {
        const [arrayName, indexStr] = part.split('[');
        const index = parseInt(indexStr.replace(']', ''));
        current = current[arrayName][index];
      } else {
        current = current[part];
      }
    }
    
    const finalKey = pathParts[pathParts.length - 1];
    if (finalKey.includes('[') && finalKey.includes(']')) {
      const [arrayName, indexStr] = finalKey.split('[');
      const index = parseInt(indexStr.replace(']', ''));
      current[arrayName][index] = newValue;
    } else {
      current[finalKey] = newValue;
    }
    
    setJsonData(updatedData);
    setHasUnsavedChanges(true);
    
    // Update the selected field value
    if (selectedField) {
      setSelectedField({
        ...selectedField,
        value: newValue
      });
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
        console.log('Edit changes saved successfully to podcast.json');
      } else {
        throw new Error('Failed to save edit changes');
      }
    } catch (error) {
      console.error('Error saving edit changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSavingChanges(false);
    }
  };

  const handleAIRegenerate = (field: EditableField) => {
    // Placeholder for AI functionality
    console.log("AI Regenerate requested for:", field.path);
    // TODO: Implement AI regeneration logic
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[85vh]">
        <div className="flex items-center justify-between bg-gray-100 px-6 py-4">
          <h2 className="text-xl font-bold">Content Editor</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-gray-600">Loading podcast data for editing...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[85vh]">
        <div className="flex items-center justify-between bg-gray-100 px-6 py-4">
          <h2 className="text-xl font-bold">Content Editor</h2>
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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[85vh] flex flex-col">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between bg-gray-100 px-6 py-4 flex-shrink-0">
        <h2 className="text-xl font-bold">Content Editor</h2>
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
                  'Save All Changes'
                )}
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main content - Flexible with proper height */}
      <div className="flex flex-1 min-h-0">
        {/* Left side - Field Selector with independent scroll */}
        <div className="w-1/3 border-r flex flex-col">
          <FieldSelector
            fields={filteredFields}
            selectedField={selectedField}
            onFieldSelect={handleFieldSelect}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* Right side - Field Editor with independent scroll */}
        <div className="w-2/3 flex flex-col">
          <FieldEditor
            selectedField={selectedField}
            onUpdate={handleFieldUpdate}
            onAIRegenerate={handleAIRegenerate}
          />
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { X } from "lucide-react";
// import FieldSelector from "./edit/FieldSelector";
// import FieldEditor from "./edit/FieldEditor";
// import { extractEditableFields } from "./edit/fieldExtractor";
// import type { EditableField } from "./edit/type";

// export default function EditView({ onClose }: { onClose: () => void }) {
//   const [selectedField, setSelectedField] = useState<EditableField | null>(null);
//   const [jsonData, setJsonData] = useState<any>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
//   const [isSavingChanges, setIsSavingChanges] = useState(false);

//   // Load podcast data from API on mount
//   useEffect(() => {
//     loadPodcastData();
//   }, []);

//   const loadPodcastData = async () => {
//     setIsLoading(true);
//     setError(null);
    
//     try {
//       const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
//       const apiEndpoint = `${API_BASE_URL}/api/v1/podcast_data`;

//       const response = await fetch(apiEndpoint);
      
//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       const result = await response.json();
      
//       if (result.success && result.data) {
//         setJsonData(result.data);
//         console.log('Podcast data loaded successfully for editing');
//       } else {
//         throw new Error('Invalid response format');
//       }
//     } catch (error) {
//       console.error('Error loading podcast data:', error);
//       setError('Failed to load podcast data. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Extract all editable fields from the JSON
//   const editableFields = jsonData ? extractEditableFields(jsonData) : [];

//   // Filter fields based on search term
//   const filteredFields = editableFields.filter(field =>
//     field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     field.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     field.category.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleFieldSelect = (field: EditableField) => {
//     setSelectedField(field);
//   };

//   const handleFieldUpdate = (fieldPath: string, newValue: string) => {
//     if (!jsonData) return;
    
//     // Deep clone the data
//     const updatedData = JSON.parse(JSON.stringify(jsonData));
    
//     // Navigate to the field and update it
//     const pathParts = fieldPath.split('.');
//     let current = updatedData;
    
//     for (let i = 0; i < pathParts.length - 1; i++) {
//       const part = pathParts[i];
//       if (part.includes('[') && part.includes(']')) {
//         const [arrayName, indexStr] = part.split('[');
//         const index = parseInt(indexStr.replace(']', ''));
//         current = current[arrayName][index];
//       } else {
//         current = current[part];
//       }
//     }
    
//     const finalKey = pathParts[pathParts.length - 1];
//     if (finalKey.includes('[') && finalKey.includes(']')) {
//       const [arrayName, indexStr] = finalKey.split('[');
//       const index = parseInt(indexStr.replace(']', ''));
//       current[arrayName][index] = newValue;
//     } else {
//       current[finalKey] = newValue;
//     }
    
//     setJsonData(updatedData);
//     setHasUnsavedChanges(true);
    
//     // Update the selected field value
//     if (selectedField) {
//       setSelectedField({
//         ...selectedField,
//         value: newValue
//       });
//     }
//   };

//   const handleSaveChanges = async () => {
//     if (!hasUnsavedChanges || !jsonData) return;
    
//     setIsSavingChanges(true);
//     try {
//       const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
//       const apiEndpoint = `${API_BASE_URL}/api/v1/save_podcast_data`;

//       const response = await fetch(apiEndpoint, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           data: jsonData
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
//       }

//       const result = await response.json();
      
//       if (result.success) {
//         setHasUnsavedChanges(false);
//         console.log('Edit changes saved successfully to podcast.json');
//       } else {
//         throw new Error('Failed to save edit changes');
//       }
//     } catch (error) {
//       console.error('Error saving edit changes:', error);
//       alert('Failed to save changes. Please try again.');
//     } finally {
//       setIsSavingChanges(false);
//     }
//   };

//   const handleAIRegenerate = (field: EditableField) => {
//     // Placeholder for AI functionality
//     console.log("AI Regenerate requested for:", field.path);
//     // TODO: Implement AI regeneration logic
//   };

//   // Show loading state
//   if (isLoading) {
//     return (
//       <div className="bg-white rounded-lg shadow-lg overflow-hidden min-h-[80vh]">
//         <div className="flex items-center justify-between bg-gray-100 px-6 py-4">
//           <h2 className="text-xl font-bold">Content Editor</h2>
//           <Button variant="ghost" size="icon" onClick={onClose}>
//             <X className="h-5 w-5" />
//           </Button>
//         </div>
//         <div className="flex items-center justify-center h-64">
//           <div className="flex items-center space-x-2">
//             <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
//             <span className="text-gray-600">Loading podcast data for editing...</span>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Show error state
//   if (error) {
//     return (
//       <div className="bg-white rounded-lg shadow-lg overflow-hidden min-h-[80vh]">
//         <div className="flex items-center justify-between bg-gray-100 px-6 py-4">
//           <h2 className="text-xl font-bold">Content Editor</h2>
//           <Button variant="ghost" size="icon" onClick={onClose}>
//             <X className="h-5 w-5" />
//           </Button>
//         </div>
//         <div className="flex items-center justify-center h-64">
//           <div className="text-center">
//             <p className="text-red-600 mb-4">{error}</p>
//             <Button onClick={loadPodcastData} variant="outline">
//               Retry Loading
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-lg shadow-lg overflow-hidden min-h-[80vh]">
//       {/* Header */}
//       <div className="flex items-center justify-between bg-gray-100 px-6 py-4">
//         <h2 className="text-xl font-bold">Content Editor</h2>
//         <div className="flex items-center space-x-4">
//           {hasUnsavedChanges && (
//             <>
//               <span className="text-sm text-orange-600 font-medium">
//                 • Unsaved changes
//               </span>
//               <Button
//                 variant="default"
//                 size="sm"
//                 onClick={handleSaveChanges}
//                 disabled={isSavingChanges}
//                 className="text-white bg-green-600 hover:bg-green-700"
//               >
//                 {isSavingChanges ? (
//                   <>
//                     <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
//                     Saving...
//                   </>
//                 ) : (
//                   'Save All Changes'
//                 )}
//               </Button>
//             </>
//           )}
//           <Button variant="ghost" size="icon" onClick={onClose}>
//             <X className="h-5 w-5" />
//           </Button>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="flex h-full">
//         {/* Left side - Field Selector */}
//         <div className="w-1/3 border-r">
//           <FieldSelector
//             fields={filteredFields}
//             selectedField={selectedField}
//             onFieldSelect={handleFieldSelect}
//             searchTerm={searchTerm}
//             onSearchChange={setSearchTerm}
//           />
//         </div>

//         {/* Right side - Field Editor */}
//         <div className="w-2/3">
//           <FieldEditor
//             selectedField={selectedField}
//             onUpdate={handleFieldUpdate}
//             onAIRegenerate={handleAIRegenerate}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
