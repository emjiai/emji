'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface SummaryData {
  overview: string;
  keyPoints: string[];
  insights: string[];
}

interface RelatedDocument {
  title: string;
  relevance: string;
  link?: string;
}

interface SummaryViewProps {
  data: SummaryData;
  relatedDocuments?: RelatedDocument[];
}

const SummaryView: React.FC<SummaryViewProps> = ({ data, relatedDocuments }) => {
  // Check if summary is available
  if (!data || !data.overview) {
    return (
      <div className="flex-1 overflow-y-auto border rounded-md bg-gray-50 p-4">
        <p className="text-gray-500">No summary available</p>
      </div>
    );
  }

  const { overview, keyPoints, insights } = data;

  return (
    <div className="flex-1 overflow-auto border rounded-md bg-gray-50 p-4">
      <div className="prose prose-sm max-w-none">
        {/* Overview Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Overview</h2>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {overview}
          </div>
        </div>
        
        {/* Key Points Section */}
        {keyPoints && keyPoints.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Key Points</h2>
            <div className="space-y-3">
              {keyPoints.map((point, index) => (
                <div key={index} className="text-gray-700 leading-relaxed">
                  <div className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <div 
                      className="flex-1"
                      dangerouslySetInnerHTML={{ 
                        __html: point.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Insights Section */}
        {insights && insights.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Key Insights</h2>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div key={index} className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r">
                  <div className="text-gray-700 leading-relaxed">
                    {insight}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Related Documents Section */}
      {relatedDocuments && relatedDocuments.length > 0 && (
        <>
          <h3 className="font-medium text-lg mb-2 mt-6">Related Documents</h3>
          <div className="space-y-2">
            {relatedDocuments.map((doc, index) => (
              <div key={index} className="flex justify-between bg-white p-2 rounded border overflow-auto">
                <div>
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-xs text-gray-500">Relevance: {doc.relevance}</p>
                </div>
                {doc.link && (
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SummaryView;