"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { 
  Select,
  SelectContent,
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import AcademicSearchViewer from "./_components/AcademicSearchViewer";
import SearchDisplay from "./_components/SearchDisplay";
import WebSearchViewer from "./_components/WebSearchViewer";

type SearchType = 'academic' | 'mixed' | 'document' | 'web';

interface SearchState {
  type: SearchType;
  isLoading: boolean;
  results: any;
}

export default function SearchPage() {
  const { userId } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchState, setSearchState] = useState<SearchState>({
    type: 'academic',
    isLoading: false,
    results: null,
  });
  
  const [showResults, setShowResults] = useState(false);
  
  // Common form fields
  const [topic, setTopic] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  
  // Academic search specific fields
  const [mainTopic, setMainTopic] = useState<string>("");
  const [searchContext, setSearchContext] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [startYear, setStartYear] = useState<string>("");
  const [endYear, setEndYear] = useState<string>("");
  const [searchOption, setSearchOption] = useState<string>("deep");
  const [peerReviewedOnly, setPeerReviewedOnly] = useState<boolean>(false);
  const [llmProvider, setLlmProvider] = useState<string>("openai");
  const [docCreationType, setDocCreationType] = useState<string>("course");
  
  // Document search specific fields
  const [files, setFiles] = useState<FileList | null>(null);
  const [urls, setUrls] = useState<string>("");
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };
  
  const handleSearchTypeChange = (value: string) => {
    setSearchState({
      ...searchState,
      type: value as SearchType,
    });
    setShowResults(false); // Hide results when changing search type
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form based on search type
    if (searchState.type === 'academic') {
      if (!mainTopic || !searchContext) {
        toast.error('Please fill in the required fields');
        return;
      }
    } else {
      if (!topic || !prompt) {
        toast.error('Please fill in the required fields');
        return;
      }
    }
    
    // Show loading state briefly for better UX
    setSearchState({
      ...searchState,
      isLoading: true,
    });
    
    // Simulate loading
    setTimeout(() => {
      setSearchState({
        ...searchState,
        isLoading: false,
      });
      setShowResults(true);
      toast.success('Displaying search results!');
    }, 500);
  };
  
  const handleCloseResults = () => {
    setShowResults(false);
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Research Search</h1>
      
      {!showResults ? (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Search Options</CardTitle>
            <CardDescription>
              Select a search type and fill in the required information.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="searchType">Search Type</Label>
                  <Select
                    value={searchState.type}
                    onValueChange={handleSearchTypeChange}
                  >
                    <SelectTrigger id="searchType">
                      <SelectValue placeholder="Select a search type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic Search</SelectItem>
                      <SelectItem value="mixed">Mixed Search</SelectItem>
                      <SelectItem value="document">Document Search</SelectItem>
                      <SelectItem value="web">Web Search</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                {searchState.type === 'academic' ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="mainTopic">Main Research Topic *</Label>
                      <Input
                        id="mainTopic"
                        value={mainTopic}
                        onChange={(e) => setMainTopic(e.target.value)}
                        placeholder="Enter main research topic"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="searchContext">Search Context *</Label>
                      <Textarea
                        id="searchContext"
                        value={searchContext}
                        onChange={(e) => setSearchContext(e.target.value)}
                        placeholder="Provide detailed context for the search"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startYear">Start Year</Label>
                        <Input
                          id="startYear"
                          type="number"
                          value={startYear}
                          onChange={(e) => setStartYear(e.target.value)}
                          placeholder="e.g., 2010"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endYear">End Year</Label>
                        <Input
                          id="endYear"
                          type="number"
                          value={endYear}
                          onChange={(e) => setEndYear(e.target.value)}
                          placeholder="e.g., 2023"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="country">Country/Region Focus (Optional)</Label>
                      <Input
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="e.g., United States, Global, etc."
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="peerReviewed"
                        checked={peerReviewedOnly}
                        onCheckedChange={(checked) => setPeerReviewedOnly(!!checked)}
                      />
                      <Label htmlFor="peerReviewed" className="cursor-pointer">
                        Peer-reviewed publications only
                      </Label>
                    </div>
                    
                    <div>
                      <Label htmlFor="searchOption">Search Depth</Label>
                      <Select
                        value={searchOption}
                        onValueChange={setSearchOption}
                      >
                        <SelectTrigger id="searchOption">
                          <SelectValue placeholder="Select search depth" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quick">Quick Search</SelectItem>
                          <SelectItem value="deep">Deep Search</SelectItem>
                          <SelectItem value="comprehensive">Comprehensive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="llmProvider">AI Provider</Label>
                      <Select
                        value={llmProvider}
                        onValueChange={setLlmProvider}
                      >
                        <SelectTrigger id="llmProvider">
                          <SelectValue placeholder="Select AI provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="anthropic">Anthropic</SelectItem>
                          <SelectItem value="cohere">Cohere</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="docCreationType">Document Type</Label>
                      <Select
                        value={docCreationType}
                        onValueChange={setDocCreationType}
                      >
                        <SelectTrigger id="docCreationType">
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="course">Course Material</SelectItem>
                          <SelectItem value="report">Research Report</SelectItem>
                          <SelectItem value="summary">Executive Summary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="topic">Topic/Question *</Label>
                      <Input
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter research topic"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="prompt">Prompt/Instructions *</Label>
                      <Textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Provide detailed instructions for the search"
                        required
                      />
                    </div>
                    
                    {(searchState.type === 'mixed' || searchState.type === 'web') && (
                      <div>
                        <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                        <Textarea
                          id="additionalInfo"
                          value={additionalInfo}
                          onChange={(e) => setAdditionalInfo(e.target.value)}
                          placeholder="Any additional context or requirements"
                        />
                      </div>
                    )}
                    
                    {(searchState.type === 'mixed' || searchState.type === 'document') && (
                      <>
                        <div>
                          <Label htmlFor="urls">URLs (Optional, comma separated)</Label>
                          <Input
                            id="urls"
                            value={urls}
                            onChange={(e) => setUrls(e.target.value)}
                            placeholder="e.g., https://example.com, https://another-site.com"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="files">Upload Files (Optional)</Label>
                          <div className="mt-1 flex items-center">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Choose Files
                            </Button>
                            <Input
                              ref={fileInputRef}
                              id="files"
                              type="file"
                              onChange={handleFileChange}
                              className="hidden"
                              multiple
                            />
                            {files && (
                              <span className="ml-3 text-sm text-gray-500">
                                {files.length} file(s) selected
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <Button 
                  type="submit" 
                  disabled={searchState.isLoading}
                  className="w-full"
                >
                  {searchState.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Processing...
                    </>
                  ) : 'Submit Search'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4">
          {searchState.type === 'academic' ? (
            <AcademicSearchViewer onClose={handleCloseResults} />
          ) : searchState.type === 'web' ? (
            <WebSearchViewer onClose={handleCloseResults} />
          ) : (
            <SearchDisplay searchType={searchState.type as 'mixed' | 'document'} onClose={handleCloseResults} />
          )}
        </div>
      )}
    </div>
  );
}