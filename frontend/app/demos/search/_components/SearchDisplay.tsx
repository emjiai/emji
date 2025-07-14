"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronDown, File, Folder, Database, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractSearchData, SearchData, ExtractedField, getSearchDataInsights } from "./utils/searchExtractor";

interface FieldNodeProps {
  field: ExtractedField;
  path: string[];
  onSelect: (path: string[], field: ExtractedField) => void;
  level?: number;
}

const FieldNode: React.FC<FieldNodeProps> = ({ field, path, onSelect, level = 0 }) => {
  const [expanded, setExpanded] = useState(level < 2); // Auto-expand first two levels
  const hasChildren = field.children && field.children.length > 0;
  const currentPath = [...path, field.name];
  
  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    }
    onSelect(currentPath, field);
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'string': return 'text-green-600';
      case 'number': return 'text-blue-600';
      case 'boolean': return 'text-purple-600';
      case 'array': return 'text-orange-600';
      case 'object': return 'text-indigo-600';
      case 'null': return 'text-gray-400';
      default: return 'text-gray-600';
    }
  };
  
  const getIcon = () => {
    if (hasChildren) {
      return expanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />;
    }
    return <File className="h-4 w-4 mr-1 text-gray-400" />;
  };
  
  return (
    <div>
      <div
        className="flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 py-1 px-2 rounded group"
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={handleClick}
      >
        {getIcon()}
        {hasChildren && <Folder className="h-4 w-4 mr-1 text-yellow-600" />}
        <span className="text-sm font-medium">{field.name}</span>
        <Badge variant="outline" className={`ml-2 text-xs ${getTypeColor(field.type)}`}>
          {field.type}
        </Badge>
        {field.type === 'array' && field.children && (
          <span className="ml-1 text-xs text-gray-500">({field.children.length})</span>
        )}
      </div>
      
      {expanded && hasChildren && (
        <div>
          {field.children!.map((child, index) => (
            <FieldNode
              key={`${child.name}-${index}`}
              field={child}
              path={currentPath}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SearchDisplayProps {
  searchType: 'mixed' | 'document' | 'web';
  onClose?: () => void;
}

export default function SearchDisplay({ searchType, onClose }: SearchDisplayProps) {
  const [searchData, setSearchData] = useState<SearchData>({});
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [selectedField, setSelectedField] = useState<ExtractedField | null>(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await extractSearchData();
      setSearchData(data);
      
      // Get insights for each file
      const fileInsights: any = {};
      for (const [filename, fields] of Object.entries(data)) {
        if (fields.length > 0 && fields[0].type !== 'error') {
          // Assuming the first field contains the full data
          const rawData = fields.reduce((acc, field) => {
            if (field.value && typeof field.value === 'object') {
              return { ...acc, [field.name]: field.value };
            }
            return acc;
          }, {});
          fileInsights[filename] = getSearchDataInsights(rawData);
        }
      }
      setInsights(fileInsights);
    } catch (err) {
      console.error('Failed to load search data:', err);
      setError('Failed to load search data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFieldSelect = (path: string[], field: ExtractedField) => {
    setSelectedPath(path);
    setSelectedField(field);
  };
  
  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }
    
    if (value === '') {
      return <span className="text-gray-400 italic">empty string</span>;
    }

    if (value === 0) {
      return <span>0</span>;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-400 italic">empty array</span>;
      }
      return (
        <div className="max-h-96 overflow-auto rounded-md bg-gray-50 dark:bg-gray-900 p-4">
          {value.map((item, index) => (
            <div key={index} className="mb-2 pb-2 border-b border-gray-100 last:border-0">
              <div className="font-bold mb-1">[{index}]</div>
              <div className="pl-4">{renderValue(item)}</div>
            </div>
          ))}
        </div>
      );
    }
    
    if (typeof value === 'object' && value !== null) {
      if (Object.keys(value).length === 0) {
        return <span className="text-gray-400 italic">empty object</span>;
      }
      return (
        <div className="max-h-96 overflow-auto rounded-md bg-gray-50 dark:bg-gray-900 p-4">
          {Object.entries(value).map(([key, val], index) => (
            <div key={key} className="mb-2 pb-2 border-b border-gray-100 last:border-0">
              <div className="font-bold mb-1">{key}</div>
              <div className="pl-4">{renderValue(val)}</div>
            </div>
          ))}
        </div>
      );
    }
    
    if (typeof value === 'string') {
      if (value.startsWith('http')) {
        return (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {value}
          </a>
        );
      }
      
      if (value.length > 200) {
        return (
          <div className="space-y-2">
            {value.split('\n').map((line, i) => (
              <p key={i} className="text-sm">{line || '\u00A0'}</p>
            ))}
          </div>
        );
      }
    }
    
    if (typeof value === 'boolean') {
      return <Badge variant={value ? 'default' : 'secondary'}>{String(value)}</Badge>;
    }
    
    return <span className="text-sm">{String(value)}</span>;
  };
  
  // Filter fields based on search term
  const getFilteredFields = () => {
    const result: SearchData = {};
    
    Object.entries(searchData).forEach(([filename, fields]) => {
      if (!searchTerm) {
        result[filename] = fields;
        return;
      }
      
      const searchTermLower = searchTerm.toLowerCase();
      
      const filteredFields = filterFieldsByTerm(fields, searchTermLower);
      
      if (filteredFields.length > 0) {
        result[filename] = filteredFields;
      }
    });
    
    return result;
  };
  
  const filterFieldsByTerm = (fields: ExtractedField[], searchTermLower: string): ExtractedField[] => {
    return fields.filter(field => {
      // Check if the field name matches
      if (field.name.toLowerCase().includes(searchTermLower)) {
        return true;
      }
      
      // Check if string values match
      if (typeof field.value === 'string' && field.value.toLowerCase().includes(searchTermLower)) {
        return true;
      }
      
      // Recursively check children
      if (field.children && field.children.length > 0) {
        field.children = filterFieldsByTerm(field.children, searchTermLower);
        return field.children.length > 0;
      }
      
      return false;
    });
  };
  
  const filteredData = getFilteredFields();
  
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-white h-screen mx-auto rounded-lg shadow-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between bg-gray-100 px-6 py-4">
          <h2 className="text-xl font-bold">
            {searchType.charAt(0).toUpperCase() + searchType.slice(1)} Search Viewer
          </h2>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-gray-600">Loading search data...</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-white h-screen mx-auto rounded-lg shadow-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between bg-gray-100 px-6 py-4">
          <h2 className="text-xl font-bold">
            {searchType.charAt(0).toUpperCase() + searchType.slice(1)} Search Viewer
          </h2>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadData} variant="outline">
              Retry Loading
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-white h-screen mx-auto rounded-lg shadow-md overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-100 px-6 py-4">
        <div className="flex items-center">
          <Database className="h-5 w-5 mr-2" />
          <h2 className="text-xl font-bold">
            {searchType.charAt(0).toUpperCase() + searchType.slice(1)} Search Results
          </h2>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Left panel - Field selector */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                type="text"
                placeholder="Search fields..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4">
              {Object.entries(filteredData).map(([filename, fields]) => (
                <div key={filename} className="mb-6">
                  <div className="font-semibold text-sm mb-2 text-gray-700 flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    {filename}
                    {insights[filename] && (
                      <div className="ml-2 flex flex-wrap gap-1">
                        {insights[filename].documentCount && (
                          <Badge variant="secondary" className="text-xs">
                            {insights[filename].documentCount} docs
                          </Badge>
                        )}
                        {insights[filename].searchEngines && (
                          <Badge variant="secondary" className="text-xs">
                            {insights[filename].searchEngines.join(", ")}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  {fields.map((field, index) => (
                    <FieldNode
                      key={`${filename}-${field.name}-${index}`}
                      field={field}
                      path={[filename]}
                      onSelect={handleFieldSelect}
                    />
                  ))}
                </div>
              ))}

              {Object.keys(filteredData).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No fields match your search.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* Right panel - Field viewer */}
        <div className="w-2/3 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <div className="font-medium text-gray-700 overflow-hidden text-ellipsis">
              {selectedPath.length > 0 ? (
                <div className="flex items-center flex-wrap gap-1">
                  {selectedPath.map((part, index) => (
                    <React.Fragment key={index}>
                      <span className="text-sm">{part}</span>
                      {index < selectedPath.length - 1 && (
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <span>Select a field to view details</span>
              )}
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-6">
              {selectedField ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-2 mb-2 flex-wrap">
                    <Badge className="mt-0.5" variant="outline">
                      {selectedField.type}
                    </Badge>
                    <h3 className="text-lg font-semibold break-all">{selectedField.name}</h3>
                  </div>
                  <div className="w-full overflow-x-auto">
                    {renderValue(selectedField.value)}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Select a field to view its details
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}