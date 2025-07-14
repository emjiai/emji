"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronDown, File, Folder, Globe, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mocked web search extractor - replace with actual implementation
const extractWebSearchData = async () => {
  // This would be replaced with actual API call
  return {
    "web_search_results": [
      {
        "title": "Understanding Web Search Results",
        "url": "https://example.com/web-search-results",
        "snippet": "Web search results provide information from the internet based on user queries...",
        "source": "example.com",
        "published_date": "2023-05-15",
        "relevance_score": 0.92
      },
      {
        "title": "How Search Engines Work",
        "url": "https://searchexample.com/engines",
        "snippet": "Search engines crawl the web, index content, and rank pages based on relevance...",
        "source": "searchexample.com",
        "published_date": "2023-04-10",
        "relevance_score": 0.85
      }
    ],
    "search_query": {
      "original_query": "how do web searches work",
      "refined_query": "web search engine functionality",
      "search_time": "0.45 seconds",
      "results_count": 2,
      "search_filters": ["relevance > 0.8"]
    },
    "search_insights": {
      "key_topics": ["search engines", "web crawling", "indexing", "ranking algorithms"],
      "suggested_queries": ["search engine optimization", "Google search algorithm", "web indexing"]
    }
  };
};

type WebSearchData = Record<string, any>;
type ExtractedField = {
  name: string;
  type: string;
  value: any;
  children?: ExtractedField[];
};

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

interface WebSearchViewerProps {
  onClose?: () => void;
}

// Helper function to process search data into tree structure
const processWebSearchData = (data: any): Record<string, ExtractedField[]> => {
  const result: Record<string, ExtractedField[]> = {};
  
  // Process key sections separately
  if (data) {
    result["Web Search Results"] = createFieldsFromObject(data);
  }
  
  return result;
};

// Helper to create field tree from object
const createFieldsFromObject = (obj: any, parentField?: ExtractedField): ExtractedField[] => {
  if (obj === null || obj === undefined) {
    return [];
  }
  
  if (Array.isArray(obj)) {
    const fields: ExtractedField[] = [];
    obj.forEach((item, index) => {
      const field: ExtractedField = {
        name: `[${index}]`,
        type: typeof item === 'object' ? (Array.isArray(item) ? 'array' : 'object') : typeof item,
        value: item,
      };
      
      if (typeof item === 'object' && item !== null) {
        field.children = createFieldsFromObject(item, field);
      }
      
      fields.push(field);
    });
    return fields;
  }
  
  if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj).map(([key, value]) => {
      const field: ExtractedField = {
        name: key,
        type: typeof value === 'object' ? (Array.isArray(value) ? 'array' : 'object') : typeof value,
        value: value,
      };
      
      if (typeof value === 'object' && value !== null) {
        field.children = createFieldsFromObject(value, field);
      }
      
      return field;
    });
  }
  
  return [];
};

export default function WebSearchViewer({ onClose }: WebSearchViewerProps) {
  const [searchData, setSearchData] = useState<WebSearchData>({});
  const [processedData, setProcessedData] = useState<Record<string, ExtractedField[]>>({});
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [selectedField, setSelectedField] = useState<ExtractedField | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await extractWebSearchData();
      setSearchData(data);
      
      // Process data into tree view structure
      const processed = processWebSearchData(data);
      setProcessedData(processed);
    } catch (err) {
      console.error('Failed to load web search data:', err);
      setError('Failed to load web search data. Please try again.');
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
          <div className="space-y-2 max-h-96 overflow-auto p-2">
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
    const result: Record<string, ExtractedField[]> = {};
    
    Object.entries(processedData).forEach(([category, fields]) => {
      if (!searchTerm) {
        result[category] = fields;
        return;
      }
      
      const searchTermLower = searchTerm.toLowerCase();
      const filteredFields = filterFieldsByTerm(fields, searchTermLower);
      
      if (filteredFields.length > 0) {
        result[category] = filteredFields;
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
          <h2 className="text-xl font-bold">Web Search Viewer</h2>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-gray-600">Loading web search data...</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-white h-screen mx-auto rounded-lg shadow-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between bg-gray-100 px-6 py-4">
          <h2 className="text-xl font-bold">Web Search Viewer</h2>
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
          <Globe className="h-5 w-5 mr-2" />
          <h2 className="text-xl font-bold">Web Search Results</h2>
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
              {Object.entries(filteredData).map(([category, fields]) => (
                <div key={category} className="mb-6">
                  <h3 className="font-semibold text-sm mb-2 text-gray-700">
                    {category}
                  </h3>
                  {fields.map((field, index) => (
                    <FieldNode
                      key={`${category}-${field.name}-${index}`}
                      field={field}
                      path={[category]}
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
                'Select a field to view details'
              )}
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-6">
              {selectedField ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-2 mb-2 flex-wrap">
                    <span className="text-sm font-medium">Type:</span>
                    <Badge variant="outline">{selectedField.type}</Badge>
                    {selectedField.type === 'array' && selectedField.children && (
                      <Badge variant="secondary">
                        {selectedField.children.length} items
                      </Badge>
                    )}
                  </div>
                  
                  <div className="w-full overflow-x-auto">
                    {renderValue(selectedField.value)}
                  </div>
                  
                  {selectedField.type === 'string' && selectedField.name === 'url' && (
                    <div className="mt-4">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedField.value, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4" />
                        Open URL
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Globe className="h-12 w-12 mb-2 text-gray-300" />
                  <p>Select a field from the left panel to view its details</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}