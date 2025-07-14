"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import InterviewScreen from "./_components/InterviewScreen";

interface InterviewData {
  content?: string;
  audio_url?: string;
  task_brief_s3_url?: string;
  url_s3?: string;
}

export default function InterviewPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("document");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      // Get values from form
      const content = formData.get("content") as string;
      const documentUrl = formData.get("document_url") as string;
      const file = formData.get("file") as File;

      // Create form data for API request
      const apiFormData = new FormData();
      
      // Add content as context if provided
      if (content) {
        apiFormData.append("context", content);
      }
      
      // Add document URL as web_urls if provided
      if (documentUrl) {
        apiFormData.append("web_urls", documentUrl);
      }
      
      // Add file as task_file if provided
      if (file && file.size > 0) {
        apiFormData.append("task_file", file);
      }

      // Configure API endpoint using environment variable
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      // const apiEndpoint = `${API_BASE_URL}/api/v1/generate_document_audio_form`;
      const apiEndpoint = `${API_BASE_URL}/api/v1/load_interview_data`;

      // Make API request
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: apiFormData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      
      // Save the response data
      setInterviewData({
        content: data.content || "",
        audio_url: data.audio_url,
        task_brief_s3_url: data.task_brief_s3_url,
      });
      
    } catch (error) {
      console.error("Error generating interview:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const documentUrl = interviewData?.task_brief_s3_url;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">AI Interview Assistant</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs defaultValue="document" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="document">Document URL</TabsTrigger>
                <TabsTrigger value="file">Upload File</TabsTrigger>
                <TabsTrigger value="text">Text Content</TabsTrigger>
              </TabsList>
              
              <TabsContent value="document" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="document_url">Document URL</Label>
                  <Input 
                    id="document_url" 
                    name="document_url" 
                    placeholder="https://example.com/document.pdf"
                    className="w-full"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="file" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Upload File</Label>
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    className="w-full"
                    accept=".pdf,.doc,.docx,.txt"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="text" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Text Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Enter document content here..."
                    className="min-h-[200px] w-full"
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Start Interview"
              )}
            </Button>
          </form>
        </div>
        
        {/* Interview Display Section */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md h-[600px] overflow-hidden">
          <InterviewScreen 
            audioUrl={interviewData?.audio_url}
            documentUrl={documentUrl}
            content={interviewData?.content}
            messages={[]} 
          />
        </div>
      </div>
    </div>
  );
}