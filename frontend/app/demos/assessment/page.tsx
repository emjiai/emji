'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2Icon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { demoAssessmentTemplate } from '../_data/DemoTemplates';
import { generateDemoAssessment, prepareFormData } from '../_api/demoApiService';
import DemoHeader from '../_components/DemoHeader';
import AssessmentOutputDisplay from './_components/AssessmentOutputDisplay';
import assessmentData from '../_data/assessment-data.json';

// Interface for assessment result structure
interface AssessmentResult {
  criteriaFeedback?: {
    [key: string]: {
      feedback: string;
      score?: number;
      max_score?: number;
    };
  };
  overallFeedback?: string;
  score?: number;
  maxMark?: number;
  question?: string;
  title?: string;
  error?: string;
  original_response?: string;
}

export default function AssessmentDemo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [useTestData, setUseTestData] = useState(false);
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFormValues(prev => ({
        ...prev,
        document: file
      }));
    }
  };

  // Handle form input changes
  const handleInputChange = (name: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Save the topic as the assessment title
    if (name === 'topic') {
      setAssessmentTitle(value);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (useTestData) {
        // Use the sample test data
        setAssessmentResult({
          title: assessmentData.title,
          score: assessmentData.overallScore,
          maxMark: 100
        });
      } else {
        // Add clerk_id to form data (required by backend)
        const formDataWithDefaults = new FormData();
        
        // Required fields for the formative assessment demo endpoint
        formDataWithDefaults.append('clerk_id', 'demo_user_' + Math.random().toString(36).substring(2, 9)); // Generate a random ID for demo users
        formDataWithDefaults.append('topic', formValues.topic || 'General Essay Assessment');
        formDataWithDefaults.append('prompt', formValues.content || 'Provide a detailed assessment of this document.');
        formDataWithDefaults.append('student_level', formValues.student_level || 'High School');
        formDataWithDefaults.append('subject', formValues.subject || 'General');
        
        // Add any file if selected
        if (formValues.document && formValues.document instanceof File) {
          formDataWithDefaults.append('file', formValues.document);
          formDataWithDefaults.append('file_type', formValues.document.type);
        }
        
        // Call the API to generate the assessment
        const response = await generateDemoAssessment(formDataWithDefaults);
        
        // The generateDemoAssessment function now returns the content field directly
        if (response) {
          // Normalize to the structure expected by AssessmentOutputDisplay
          setAssessmentResult({
            ...response
          });
        } else {
          setError('No assessment data received from the API');
        }
      }
    } catch (error) {
      console.error('API error:', error);
      setError('Failed to generate the assessment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Reset the form and start over
  const handleRetake = () => {
    setAssessmentResult(null);
    setFormValues({});
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Toggle between API and test data
  const toggleDataSource = () => {
    setUseTestData(!useTestData);
  };

  return (
    <>
      <DemoHeader />
      
      <div className="container mx-auto pt-20 p-4">
        {!assessmentResult ? (
          // Assessment Submission Form
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-semibold">AI Formative Assessment</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleDataSource}
                >
                  {useTestData ? "Use AI Assessment" : "Use Sample Assessment"}
                </Button>
              </div>
              
              {useTestData ? (
                <div className="mb-6">
                  <p className="mb-4">Using sample assessment data for an essay on the impact of technology on education.</p>
                  <Button 
                    onClick={handleSubmit} 
                    className="w-full py-6" 
                    disabled={loading}
                  >
                    {loading && <Loader2Icon className="animate-spin mr-2" />}
                    Load Sample Assessment
                  </Button>
                </div>
              ) : (
                <div>
                  {demoAssessmentTemplate.form.map((field) => (
                    <div key={field.name} className="mb-4">
                      <label className="block font-medium mb-1">{field.label}</label>
                      {field.field === 'file' ? (
                        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept=".pdf,.docx,.txt"
                            onChange={handleFileChange}
                          />
                          <Button 
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            className="mb-2"
                          >
                            Choose File
                          </Button>
                          {selectedFile ? (
                            <p className="text-sm text-gray-600">{selectedFile.name}</p>
                          ) : (
                            <p className="text-sm text-gray-500">Upload a document for assessment (optional)</p>
                          )}
                        </div>
                      ) : field.field === 'textarea' ? (
                        <Textarea
                          rows={10}
                          name={field.name}
                          required={field.required}
                          placeholder={field.placeholder}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                        />
                      ) : (
                        <Input
                          name={field.name}
                          required={field.required}
                          placeholder={field.placeholder}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                  
                  {/* Add file upload option if not already in template */}
                  {!demoAssessmentTemplate.form.some(field => field.field === 'file') && (
                    <div className="my-2 flex flex-col gap-2 mb-7">
                      <label className="font-bold">Upload Document (Optional)</label>
                      <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept=".pdf,.docx,.txt"
                          onChange={handleFileChange}
                        />
                        <Button 
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="mb-2"
                        >
                          Choose File
                        </Button>
                        {selectedFile ? (
                          <p className="text-sm text-gray-600">{selectedFile.name}</p>
                        ) : (
                          <p className="text-sm text-gray-500">Upload a document for assessment</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleSubmit} 
                    className="w-full py-6" 
                    disabled={loading}
                  >
                    {loading && <Loader2Icon className="animate-spin mr-2" />}
                    Submit for Assessment
                  </Button>
                </div>
              )}
              
              {loading && (
                <div className="mt-6 flex items-center justify-center">
                  <Loader2Icon className="animate-spin mr-2" size={24} />
                  <span>Generating your assessment...</span>
                </div>
              )}
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Assessment Result using our new component
          useTestData ? (
            <AssessmentOutputDisplay
              assessment={assessmentData}
              onReset={handleRetake}
            />
          ) : (
            <div className="max-w-3xl mx-auto">
              {/* Fallback to original component for API-generated assessments 
                since they may have a different format than our test data */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">{assessmentTitle || 'Assessment Results'}</h2>
                
                <div className="mb-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Score:</span>
                    <span>{assessmentResult.score} / {assessmentResult.maxMark}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${(assessmentResult.score! / assessmentResult.maxMark!) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {assessmentResult.overallFeedback && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Overall Feedback</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="whitespace-pre-line">{assessmentResult.overallFeedback}</p>
                    </div>
                  </div>
                )}
                
                {assessmentResult.criteriaFeedback && Object.keys(assessmentResult.criteriaFeedback).length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Criteria Feedback</h3>
                    {Object.entries(assessmentResult.criteriaFeedback).map(([criterion, data], index) => (
                      <div key={index} className="mb-3 p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between mb-1">
                          <h4 className="font-medium">{criterion}</h4>
                          {data.score !== undefined && data.max_score !== undefined && (
                            <span>{data.score} / {data.max_score}</span>
                          )}
                        </div>
                        <p>{data.feedback}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <Button 
                  onClick={handleRetake} 
                  className="w-full"
                >
                  Submit Another Assessment
                </Button>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}