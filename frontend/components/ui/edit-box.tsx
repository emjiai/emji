'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Edit, Save, RotateCw } from 'lucide-react';
import { Button } from './button';
import { Textarea } from './textarea';
import { cn } from '@/lib/utils';

export interface EditBoxProps {
  id: string;
  title: string;
  content: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
  onEdit?: () => void;
  onSave?: (content: string) => void;
  onContentChange?: (content: string) => void;
  initiallyExpanded?: boolean;
}

/**
 * EditBox - A reusable component for editing content with a header containing edit and save icons
 */
export const EditBox = ({
  id,
  title,
  content,
  placeholder = 'Enter content...',
  disabled = false,
  className = '',
  isLoading = false,
  onEdit,
  onSave,
  onContentChange,
  initiallyExpanded = false,
}: EditBoxProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update local state when content prop changes
  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editedContent, expanded]);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    if (onEdit) onEdit();
  };

  const handleSave = () => {
    setIsEditing(false);
    if (onSave) onSave(editedContent);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditedContent(newContent);
    if (onContentChange) onContentChange(newContent);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={cn('border rounded-md shadow-sm mb-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
        <div 
          className="font-medium cursor-pointer flex items-center gap-1" 
          onClick={toggleExpand}
        >
          <span className="select-none">{expanded ? '▼' : '►'}</span>
          <h3>{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Button size="sm" variant="ghost" disabled>
              <RotateCw className="h-4 w-4 animate-spin" />
            </Button>
          ) : isEditing ? (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleSave}
              disabled={disabled}
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleEdit}
              disabled={disabled}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-3">
          <Textarea
            ref={textareaRef}
            id={id}
            value={editedContent}
            onChange={handleContentChange}
            placeholder={placeholder}
            className="w-full min-h-[100px] resize-y font-mono text-sm"
            disabled={disabled || isLoading || !isEditing}
          />
        </div>
      )}
    </div>
  );
};

export default EditBox;