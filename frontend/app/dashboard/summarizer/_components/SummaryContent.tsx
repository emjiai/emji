"use client";
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CopyIcon, CheckIcon } from "lucide-react";

interface SummaryContentProps {
  summaryData: any;
}

const SummaryContent: React.FC<SummaryContentProps> = ({ summaryData }) => {
  const [copied, setCopied] = useState<string | null>(null);
  
  // Define tab content types
  const contentTypes = [
    { id: "summary", label: "Summary" },
    { id: "map", label: "Map" },
    { id: "key-concepts", label: "Key COncepts" },
    { id: "notes", label: "Notes" }
  ];

  // Function to copy content to clipboard
  const copyToClipboard = (content: string, tabId: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(tabId);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  // Helper to render each tab's content
  const renderTabContent = (tabId: string) => {
    let content = "";
    
    switch (tabId) {
      case "summary":
        content = summaryData?.detailed || "No detailed summary available.";
        break;
      case "map":
        content = summaryData?.all || "No map available.";
        break;
      case "key concepts":
        content = summaryData?.summary || "No Key Conceptsavailable.";
        break;
      case "notes":
        content = summaryData?.notes || "No notes available.";
        break;
      default:
        content = "Content not available for this tab.";
    }

    return (
      <div className="relative">
        <div className="absolute top-0 right-0 p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(content, tabId)}
            className="h-8 w-8 p-0"
            title="Copy content"
          >
            {copied === tabId ? (
              <CheckIcon className="h-4 w-4 text-green-500" />
            ) : (
              <CopyIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="p-4 pt-10 whitespace-pre-line">
          {content}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full">
      <Tabs defaultValue="detailed" className="h-full flex flex-col">
        <div className="px-4 pt-4">
          <TabsList className="grid grid-cols-4">
            {contentTypes.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-auto">
          {contentTypes.map(tab => (
            <TabsContent key={tab.id} value={tab.id} className="h-full overflow-auto">
              {renderTabContent(tab.id)}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default SummaryContent;
