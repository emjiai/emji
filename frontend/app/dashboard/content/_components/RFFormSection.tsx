"use client";
import React, { useState, useRef, useCallback } from "react";
import { TEMPLATE } from "../../_components/TemplateListSection";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Loader2Icon, 
  PlusCircle, 
  ArrowUpDown, 
  Box, 
  Circle, 
  Diamond, 
  MessageSquare, 
  Lightbulb,
  Braces,
  Database,
  FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PROPS {
  selectedTemplate?: TEMPLATE;
  onAddNode?: (nodeType: string, nodeData: any) => void;
}

// Define node types with metadata
const nodeTypes = [
  {
    id: 'conceptNode',
    name: 'Concept Node',
    description: 'For main concepts or topics',
    icon: <Box className="w-8 h-8 text-blue-500" />,
    defaultData: {
      title: 'New Concept',
      description: 'Description of this concept',
      icon: 'Lightbulb'
    }
  },
  {
    id: 'diagramPlaceholder',
    name: 'Diagram Node',
    description: 'For visual explanations',
    icon: <Circle className="w-8 h-8 text-green-500" />,
    defaultData: {
      label: 'Diagram',
      description: 'Visual explanation goes here'
    }
  },
  {
    id: 'default',
    name: 'Text Node',
    description: 'For headers or basic text',
    icon: <FileText className="w-8 h-8 text-purple-500" />,
    defaultData: {
      label: 'New Text Node'
    }
  },
  {
    id: 'group',
    name: 'Group Node',
    description: 'Container for related nodes',
    icon: <Braces className="w-8 h-8 text-amber-500" />,
    defaultData: {
      label: 'Group Title'
    }
  }
];

// Edge types
const edgeTypes = [
  {
    id: 'smoothstep',
    name: 'Regular Connection',
    description: 'Standard connection between nodes',
    icon: <ArrowUpDown className="w-8 h-8 text-slate-500" />
  },
  {
    id: 'animated',
    name: 'Animated Connection',
    description: 'Animated flow between nodes',
    icon: <ArrowUpDown className="w-8 h-8 text-cyan-500 animate-pulse" />
  }
];

function RFFormSection({ selectedTemplate, onAddNode }: PROPS) {
  const [selectedNodeType, setSelectedNodeType] = useState<string>(nodeTypes[0].id);
  const [nodeTitle, setNodeTitle] = useState<string>('');
  const [nodeDescription, setNodeDescription] = useState<string>('');
  const [nodeName, setNodeName] = useState<string>('');

  // Handlers for drag operations
  const onDragStart = (event: React.DragEvent, nodeType: string, data: any) => {
    // Create payload with type and data
    const payload = {
      type: nodeType,
      data: {
        ...data,
        label: nodeTitle || data.title || data.label,
        description: nodeDescription || data.description
      }
    };
    
    // Set the data that will be transferred during drag
    event.dataTransfer.setData('application/reactflow', JSON.stringify(payload));
    event.dataTransfer.effectAllowed = 'move';
  };

  // Handler for adding a node from the form
  const handleAddNode = () => {
    if (!onAddNode) return;
    
    // Find the selected node type
    const nodeType = nodeTypes.find(nt => nt.id === selectedNodeType);
    if (!nodeType) return;
    
    // Create node data with form values
    const nodeData = {
      ...nodeType.defaultData,
      title: nodeTitle || nodeType.defaultData.title || 'New Node',
      description: nodeDescription || nodeType.defaultData.description || '',
      label: nodeTitle || nodeType.defaultData.label || 'New Node',
      nodeName: nodeName || `node-${Date.now()}`
    };
    
    // Call parent handler
    onAddNode(selectedNodeType, nodeData);
    
    // Reset form
    setNodeTitle('');
    setNodeDescription('');
    setNodeName('');
  };

  return (
    <Card className="p-4 bg-white shadow-sm rounded-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Artificial Intelligence Courses</CardTitle>
        <CardDescription>
          Drag and drop nodes to create your diagram or add them using the form
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="nodes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nodes">Nodes</TabsTrigger>
            <TabsTrigger value="edges">Connections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="nodes" className="py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {nodeTypes.map((type) => (
                  <div 
                    key={type.id}
                    className="flex flex-col items-center justify-center p-3 border rounded-md shadow-sm hover:shadow-md cursor-move bg-gray-50"
                    draggable
                    onDragStart={(e) => onDragStart(e, type.id, type.defaultData)}
                    onClick={() => setSelectedNodeType(type.id)}
                  >
                    {type.icon}
                    <span className="mt-2 text-sm font-medium">{type.name}</span>
                    <span className="text-xs text-gray-500 text-center mt-1">{type.description}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t mt-4">
                <h3 className="text-sm font-semibold mb-3">Add Node Via Form</h3>
                
                <div className="space-y-3">
                  <Select
                    value={selectedNodeType}
                    onValueChange={(value) => setSelectedNodeType(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select node type" />
                    </SelectTrigger>
                    <SelectContent>
                      {nodeTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center">
                            <span className="mr-2">{React.cloneElement(type.icon, { className: 'w-4 h-4' })}</span>
                            <span>{type.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Node ID (optional)"
                    value={nodeName}
                    onChange={(e) => setNodeName(e.target.value)}
                    className="w-full"
                  />
                  
                  <Input
                    placeholder="Node Title/Label"
                    value={nodeTitle}
                    onChange={(e) => setNodeTitle(e.target.value)}
                    className="w-full"
                  />
                  
                  <Textarea
                    placeholder="Description (if applicable)"
                    value={nodeDescription}
                    onChange={(e) => setNodeDescription(e.target.value)}
                    className="w-full"
                    rows={3}
                  />
                  
                  <Button 
                    onClick={handleAddNode}
                    className="w-full"
                    variant="default"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Node to Diagram
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="edges" className="py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {edgeTypes.map((type) => (
                  <div 
                    key={type.id}
                    className="flex flex-col items-center justify-center p-3 border rounded-md shadow-sm hover:shadow-md cursor-move bg-gray-50"
                    draggable
                    onDragStart={(e) => onDragStart(e, `edge-${type.id}`, { type: type.id })}
                  >
                    {type.icon}
                    <span className="mt-2 text-sm font-medium">{type.name}</span>
                    <span className="text-xs text-gray-500 text-center mt-1">{type.description}</span>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mt-4">
                <h3 className="text-sm font-semibold text-amber-800 mb-2">Creating Connections</h3>
                <p className="text-xs text-amber-700">
                  To create connections between nodes, click and drag from one node's handle to another node's handle.
                  Handles are the small dots on nodes' edges.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-4 border-t">
        <div className="text-xs text-gray-500">
          Tip: You can also connect nodes by dragging between connection points
        </div>
      </CardFooter>
    </Card>
  );
}

export default RFFormSection;