"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Save, Sparkles, Copy, RotateCcw, AlertCircle } from "lucide-react";
import type { EditableField } from "./type";

interface FieldEditorProps {
  selectedField: EditableField | null;
  onUpdate: (fieldPath: string, newValue: string) => void;
  onAIRegenerate: (field: EditableField) => void;
}

export default function FieldEditor({
  selectedField,
  onUpdate,
  onAIRegenerate
}: FieldEditorProps) {
  const [editValue, setEditValue] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Update edit value when selected field changes
  useEffect(() => {
    if (selectedField) {
      setEditValue(selectedField.value);
      setHasChanges(false);
      setSaveStatus('idle');
    }
  }, [selectedField]);

  // Track changes
  useEffect(() => {
    if (selectedField) {
      setHasChanges(editValue !== selectedField.value);
    }
  }, [editValue, selectedField]);

  const handleSave = async () => {
    if (!selectedField || !hasChanges) return;

    setSaveStatus('saving');

    try {
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Call the parent's update function which will set hasUnsavedChanges to true
      onUpdate(selectedField.path, editValue);
      
      setHasChanges(false);
      setSaveStatus('saved');
      
      // Reset status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleReset = () => {
    if (selectedField) {
      setEditValue(selectedField.value);
      setHasChanges(false);
      setSaveStatus('idle');
    }
  };

  const handleCopy = async () => {
    if (selectedField) {
      try {
        await navigator.clipboard.writeText(selectedField.value);
        // Could add a toast notification here
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleAIRegenerate = () => {
    if (selectedField) {
      onAIRegenerate(selectedField);
    }
  };

  const getInputComponent = () => {
    if (!selectedField) return null;

    const commonProps = {
      value: editValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEditValue(e.target.value),
      className: "min-h-[200px] font-mono text-sm"
    };

    switch (selectedField.type) {
      case 'textarea':
        return <Textarea {...commonProps} placeholder="Enter your content here..." />;
      case 'url':
        return <Input {...commonProps} type="url" placeholder="https://..." />;
      case 'number':
        return <Input {...commonProps} type="number" />;
      case 'date':
        return <Input {...commonProps} type="date" />;
      default:
        return <Input {...commonProps} type="text" />;
    }
  };

  const getSaveButtonVariant = () => {
    switch (saveStatus) {
      case 'saved':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved!';
      case 'error':
        return 'Error';
      default:
        return 'Apply Changes';
    }
  };

  if (!selectedField) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No Field Selected</h3>
          <p>Select a field from the left panel to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header - Fixed */}
      <div className="p-6 border-b bg-gray-50 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{selectedField.label}</h3>
            <p className="text-sm text-gray-600 mt-1">{selectedField.path}</p>
            {selectedField.description && (
              <p className="text-sm text-gray-500 mt-2">{selectedField.description}</p>
            )}
            {selectedField.context && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedField.context.episode && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {selectedField.context.episode}
                  </span>
                )}
                {selectedField.context.slide && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {selectedField.context.slide}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              selectedField.type === 'textarea' ? 'bg-green-100 text-green-800' :
              selectedField.type === 'url' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {selectedField.type}
            </span>
          </div>
        </div>
      </div>

      {/* Editor - Scrollable */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {/* Current Value Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Value
            </label>
            <div className="bg-gray-50 p-3 rounded-md border">
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {selectedField.value || <em className="text-gray-400">Empty</em>}
              </p>
            </div>
          </div>

          {/* Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Edit Value
            </label>
            {getInputComponent()}
          </div>

          {/* Character Count */}
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>
              Characters: {editValue.length}
              {selectedField.type === 'textarea' && editValue.length > 500 && (
                <span className="text-amber-600 ml-1">(Long content)</span>
              )}
            </span>
            {hasChanges && (
              <span className="text-blue-600 font-medium">• Unsaved changes</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div className="p-6 border-t bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy Original
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={!hasChanges}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleAIRegenerate}
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              AI Regenerate
            </Button>
            <Button
              variant={getSaveButtonVariant()}
              onClick={handleSave}
              disabled={!hasChanges || saveStatus === 'saving'}
            >
              <Save className="h-4 w-4 mr-1" />
              {getSaveButtonText()}
            </Button>
          </div>
        </div>

        {/* Save Status */}
        {saveStatus === 'saved' && (
          <div className="mt-2 text-sm text-green-600">
            ✓ Changes applied successfully. Use "Save All Changes" to persist to file.
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="mt-2 text-sm text-red-600">
            ✗ Failed to apply changes. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Input } from "@/components/ui/input";
// import { Save, Sparkles, Copy, RotateCcw, AlertCircle } from "lucide-react";
// import type { EditableField } from "./type";

// interface FieldEditorProps {
//   selectedField: EditableField | null;
//   onUpdate: (fieldPath: string, newValue: string) => void;
//   onAIRegenerate: (field: EditableField) => void;
// }

// export default function FieldEditor({
//   selectedField,
//   onUpdate,
//   onAIRegenerate
// }: FieldEditorProps) {
//   const [editValue, setEditValue] = useState("");
//   const [hasChanges, setHasChanges] = useState(false);
//   const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

//   // Update edit value when selected field changes
//   useEffect(() => {
//     if (selectedField) {
//       setEditValue(selectedField.value);
//       setHasChanges(false);
//       setSaveStatus('idle');
//     }
//   }, [selectedField]);

//   // Track changes
//   useEffect(() => {
//     if (selectedField) {
//       setHasChanges(editValue !== selectedField.value);
//     }
//   }, [editValue, selectedField]);

//   const handleSave = async () => {
//     if (!selectedField || !hasChanges) return;

//     setSaveStatus('saving');

//     try {
//       // Simulate save delay
//       await new Promise(resolve => setTimeout(resolve, 300));
      
//       // Call the parent's update function which will set hasUnsavedChanges to true
//       onUpdate(selectedField.path, editValue);
      
//       setHasChanges(false);
//       setSaveStatus('saved');
      
//       // Reset status after 2 seconds
//       setTimeout(() => setSaveStatus('idle'), 2000);
//     } catch (error) {
//       setSaveStatus('error');
//       setTimeout(() => setSaveStatus('idle'), 3000);
//     }
//   };

//   const handleReset = () => {
//     if (selectedField) {
//       setEditValue(selectedField.value);
//       setHasChanges(false);
//       setSaveStatus('idle');
//     }
//   };

//   const handleCopy = async () => {
//     if (selectedField) {
//       try {
//         await navigator.clipboard.writeText(selectedField.value);
//         // Could add a toast notification here
//       } catch (error) {
//         console.error('Failed to copy:', error);
//       }
//     }
//   };

//   const handleAIRegenerate = () => {
//     if (selectedField) {
//       onAIRegenerate(selectedField);
//     }
//   };

//   const getInputComponent = () => {
//     if (!selectedField) return null;

//     const commonProps = {
//       value: editValue,
//       onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEditValue(e.target.value),
//       className: "min-h-[200px] font-mono text-sm"
//     };

//     switch (selectedField.type) {
//       case 'textarea':
//         return <Textarea {...commonProps} placeholder="Enter your content here..." />;
//       case 'url':
//         return <Input {...commonProps} type="url" placeholder="https://..." />;
//       case 'number':
//         return <Input {...commonProps} type="number" />;
//       case 'date':
//         return <Input {...commonProps} type="date" />;
//       default:
//         return <Input {...commonProps} type="text" />;
//     }
//   };

//   const getSaveButtonVariant = () => {
//     switch (saveStatus) {
//       case 'saved':
//         return 'default';
//       case 'error':
//         return 'destructive';
//       default:
//         return 'default';
//     }
//   };

//   const getSaveButtonText = () => {
//     switch (saveStatus) {
//       case 'saving':
//         return 'Saving...';
//       case 'saved':
//         return 'Saved!';
//       case 'error':
//         return 'Error';
//       default:
//         return 'Apply Changes';
//     }
//   };

//   if (!selectedField) {
//     return (
//       <div className="h-full flex items-center justify-center p-8">
//         <div className="text-center text-gray-500">
//           <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
//           <h3 className="text-lg font-medium mb-2">No Field Selected</h3>
//           <p>Select a field from the left panel to start editing</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-full flex flex-col">
//       {/* Header */}
//       <div className="p-6 border-b bg-gray-50">
//         <div className="flex items-start justify-between">
//           <div className="flex-1">
//             <h3 className="text-lg font-semibold text-gray-900">{selectedField.label}</h3>
//             <p className="text-sm text-gray-600 mt-1">{selectedField.path}</p>
//             {selectedField.description && (
//               <p className="text-sm text-gray-500 mt-2">{selectedField.description}</p>
//             )}
//             {selectedField.context && (
//               <div className="flex flex-wrap gap-2 mt-2">
//                 {selectedField.context.episode && (
//                   <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
//                     {selectedField.context.episode}
//                   </span>
//                 )}
//                 {selectedField.context.slide && (
//                   <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
//                     {selectedField.context.slide}
//                   </span>
//                 )}
//               </div>
//             )}
//           </div>
//           <div className="flex items-center space-x-2">
//             <span className={`px-2 py-1 text-xs rounded-full ${
//               selectedField.type === 'textarea' ? 'bg-green-100 text-green-800' :
//               selectedField.type === 'url' ? 'bg-red-100 text-red-800' :
//               'bg-blue-100 text-blue-800'
//             }`}>
//               {selectedField.type}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Editor */}
//       <div className="flex-1 p-6">
//         <div className="space-y-4">
//           {/* Current Value Display */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Current Value
//             </label>
//             <div className="bg-gray-50 p-3 rounded-md border">
//               <p className="text-sm text-gray-600 whitespace-pre-wrap">
//                 {selectedField.value || <em className="text-gray-400">Empty</em>}
//               </p>
//             </div>
//           </div>

//           {/* Editor */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Edit Value
//             </label>
//             {getInputComponent()}
//           </div>

//           {/* Character Count */}
//           <div className="flex justify-between items-center text-xs text-gray-500">
//             <span>
//               Characters: {editValue.length}
//               {selectedField.type === 'textarea' && editValue.length > 500 && (
//                 <span className="text-amber-600 ml-1">(Long content)</span>
//               )}
//             </span>
//             {hasChanges && (
//               <span className="text-blue-600 font-medium">• Unsaved changes</span>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="p-6 border-t bg-gray-50">
//         <div className="flex items-center justify-between">
//           <div className="flex space-x-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handleCopy}
//             >
//               <Copy className="h-4 w-4 mr-1" />
//               Copy Original
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handleReset}
//               disabled={!hasChanges}
//             >
//               <RotateCcw className="h-4 w-4 mr-1" />
//               Reset
//             </Button>
//           </div>

//           <div className="flex space-x-2">
//             <Button
//               variant="outline"
//               onClick={handleAIRegenerate}
//               className="text-purple-600 border-purple-200 hover:bg-purple-50"
//             >
//               <Sparkles className="h-4 w-4 mr-1" />
//               AI Regenerate
//             </Button>
//             <Button
//               variant={getSaveButtonVariant()}
//               onClick={handleSave}
//               disabled={!hasChanges || saveStatus === 'saving'}
//             >
//               <Save className="h-4 w-4 mr-1" />
//               {getSaveButtonText()}
//             </Button>
//           </div>
//         </div>

//         {/* Save Status */}
//         {saveStatus === 'saved' && (
//           <div className="mt-2 text-sm text-green-600">
//             ✓ Changes applied successfully. Use "Save All Changes" to persist to file.
//           </div>
//         )}
//         {saveStatus === 'error' && (
//           <div className="mt-2 text-sm text-red-600">
//             ✗ Failed to apply changes. Please try again.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

