'use client';

import React, { useState, useEffect } from 'react';
import EditBox from '@/components/ui/edit-box';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw } from 'lucide-react';

interface EditContentViewProps {
  content: any;
  onContentUpdate?: (section: string, path: string, content: string) => void;
}

/**
 * EditContentView component provides an editable interface for content
 * It allows users to edit document content, next steps, and references
 */
const EditContentView: React.FC<EditContentViewProps> = ({
  content,
  onContentUpdate,
}) => {
  // Create states for each content section
  const [documentContent, setDocumentContent] = useState<any>(content?.final_document || {});
  const [nextStepsContent, setNextStepsContent] = useState<any>(content?.next_steps_plan || {});
  const [referencesContent, setReferencesContent] = useState<any>(content?.reference_list || []);
  
  // Track active tab
  const [activeTab, setActiveTab] = useState('document');
  
  // Update local state when content prop changes
  useEffect(() => {
    if (content) {
      setDocumentContent(content.final_document || {});
      setNextStepsContent(content.next_steps_plan || {});
      setReferencesContent(content.reference_list || []);
    }
  }, [content]);

  // Function to flatten nested JSON objects into an array of edit boxes
  const flattenJsonForEditing = (obj: any, basePath = '', result: Array<{path: string, key: string, value: string}> = []) => {
    if (!obj) return result;
    
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = basePath ? `${basePath}.${key}` : key;
      
      if (typeof value === 'string') {
        // For string values, create an edit box
        result.push({
          path: currentPath,
          key: key.replace(/_/g, ' '),
          value: value as string,
        });
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // For nested objects, recurse
        flattenJsonForEditing(value, currentPath, result);
      } else if (Array.isArray(value)) {
        // For arrays, stringify for editing
        result.push({
          path: currentPath,
          key: key.replace(/_/g, ' '),
          value: JSON.stringify(value, null, 2),
        });
      } else {
        // For other types, convert to string
        result.push({
          path: currentPath,
          key: key.replace(/_/g, ' '),
          value: value !== null && value !== undefined ? String(value) : '',
        });
      }
    });
    
    return result;
  };

  // Function to handle updates to content
  const handleContentUpdate = (section: string, path: string, newContent: string) => {
    // Split path into parts (e.g., "introduction.background" -> ["introduction", "background"])
    const pathParts = path.split('.');
    
    // Update based on which section is being edited
    if (section === 'document') {
      setDocumentContent((prevContent: any) => {
        const newDocContent = {...prevContent};
        let current: any = newDocContent;
        
        // Navigate to the nested property
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!current[pathParts[i]]) current[pathParts[i]] = {};
          current = current[pathParts[i]];
        }
        
        // Set the value
        current[pathParts[pathParts.length - 1]] = newContent;
        return newDocContent;
      });
    } else if (section === 'nextSteps') {
      setNextStepsContent((prevContent: any) => {
        const newNextStepsContent = {...prevContent};
        let current: any = newNextStepsContent;
        
        // Navigate to the nested property
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!current[pathParts[i]]) current[pathParts[i]] = {};
          current = current[pathParts[i]];
        }
        
        // Set the value
        current[pathParts[pathParts.length - 1]] = newContent;
        return newNextStepsContent;
      });
    } else if (section === 'references') {
      // For references, which is an array, handle differently
      // This is a simplified approach - in a real app, you'd need more sophisticated handling
      try {
        setReferencesContent(JSON.parse(newContent));
      } catch (e) {
        console.error('Invalid JSON for references', e);
      }
    }
    
    // Call the callback if provided
    if (onContentUpdate) {
      onContentUpdate(section, path, newContent);
    }
  };

  // Prepare edit boxes for each section
  const documentEditBoxes = flattenJsonForEditing(documentContent);
  const nextStepsEditBoxes = flattenJsonForEditing(nextStepsContent);
  
  return (
    <div className="p-4 space-y-4">
      <Tabs 
        defaultValue="document" 
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="document">Document</TabsTrigger>
          <TabsTrigger value="nextSteps">Next Steps</TabsTrigger>
          <TabsTrigger value="references">References</TabsTrigger>
        </TabsList>
        
        {/* Document Content */}
        <TabsContent value="document" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Edit Document Content</h2>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate All
            </Button>
          </div>
          <div className="space-y-4">
            {documentEditBoxes.map((item) => (
              <EditBox
                key={item.path}
                id={`doc-${item.path}`}
                title={item.key.charAt(0).toUpperCase() + item.key.slice(1)}
                content={item.value}
                onSave={(newContent) => handleContentUpdate('document', item.path, newContent)}
                initiallyExpanded={false}
              />
            ))}
          </div>
        </TabsContent>
        
        {/* Next Steps Content */}
        <TabsContent value="nextSteps" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Edit Next Steps</h2>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate All
            </Button>
          </div>
          <div className="space-y-4">
            {nextStepsEditBoxes.map((item) => (
              <EditBox
                key={item.path}
                id={`next-${item.path}`}
                title={item.key.charAt(0).toUpperCase() + item.key.slice(1)}
                content={item.value}
                onSave={(newContent) => handleContentUpdate('nextSteps', item.path, newContent)}
                initiallyExpanded={false}
              />
            ))}
          </div>
        </TabsContent>
        
        {/* References Content */}
        <TabsContent value="references" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Edit References</h2>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate References
            </Button>
          </div>
          <EditBox
            id="references-content"
            title="References"
            content={JSON.stringify(referencesContent, null, 2)}
            onSave={(newContent) => handleContentUpdate('references', 'references', newContent)}
            initiallyExpanded={true}
            placeholder="Enter references as JSON array..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditContentView;