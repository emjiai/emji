"use client";
import React, { useState } from "react";
import { FullScreen } from "@/components/ui/full-screen";
import Speaker from "@/components/ui/speaker";
import DocumentView from "./DocumentView";
import { Avatar } from "@/components/ui/avatar";

interface InterviewScreenProps {
  audioUrl?: string;
  documentUrl?: string;
  messages?: {
    role: 'ai' | 'user';
    airesponse: string;
  }[];
  content?: string;
}

const InterviewScreen: React.FC<InterviewScreenProps> = ({
  audioUrl,
  documentUrl,
  messages = [],
  content
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <FullScreen content={content}>
      <div className="grid grid-cols-1 md:grid-cols-2 h-full">
        {/* Left side: Document View */}
        <div className="h-full border-r border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
            <h3 className="font-medium text-gray-900">Document</h3>
          </div>
          <DocumentView 
            url={documentUrl} 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Right side: Chat Interface */}
        <div className="flex flex-col h-full">
          {/* Speaker Header */}
          <div className="flex items-center justify-between p-3 bg-blue-50 border-b">
            <h3 className="font-medium text-gray-900">Interview Assistant</h3>
            <Speaker audioUrl={audioUrl} className="mr-2" />
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className="h-8 w-8 mt-1">
                      {message.role === 'ai' ? 'AI' : 'You'}
                    </Avatar>
                    <div 
                      className={`mx-2 p-3 rounded-lg ${
                        message.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {message.airesponse}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p>Interview session will appear here</p>
                  <p className="text-sm">Upload a document to start the interview process</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FullScreen>
  );
};

export default InterviewScreen;