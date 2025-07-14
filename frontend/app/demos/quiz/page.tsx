'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2Icon, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DemoHeader from '../_components/DemoHeader';
import QuizOutputDisplay from './_components/QuizOutputDisplay';
import quizDataCollection from '../_data/quiz-data.json';
import { demoQuizTemplate } from '../_data/DemoTemplates';

// Interface for quiz results
interface QuizResults {
  score: number;
  answers: Record<string, string>;
}

// Define available question types
const QUESTION_TYPES = [
  { label: "Multiple Choice", value: "multiple-choice" },
  { label: "True/False", value: "true-false" },
  { label: "Short Answer", value: "short-answer" },
  { label: "Flash Card", value: "flash-card" },
  { label: "Matching", value: "matching" },
  { label: "Sequence Ordering", value: "step-ordering" },
  { label: "Multiple Answer", value: "multiple-answer" },
  { label: "Case Study", value: "case-study" },
  { label: "Fill in the Blanks", value: "fill-in-the-blanks" },
  { label: "Viva (Voice Interview)", value: "viva" },
];

interface QuizQuestion {
  type: string;
  // Add other properties as needed
}

export default function QuizDemo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({
    questionTypes: 'multiple-choice' // Default to multiple choice
  });
  const [generatedQuizData, setGeneratedQuizData] = useState<any>(null);
  const [useTestData, setUseTestData] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResults>({ score: 0, answers: {} });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New states for the question type selection flow
  const [fullQuizData, setFullQuizData] = useState<any>(null);
  const [selectedQuestionType, setSelectedQuestionType] = useState<string | null>(null);
  const [availableQuestionTypes, setAvailableQuestionTypes] = useState<string[]>([]);

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
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get the selected quiz data based on question type
  const getSelectedQuizData = () => {
    const questionType = formValues.questionTypes || 'multiple-choice';
    return (quizDataCollection as any)[questionType];
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    // Reset the question type selection
    setSelectedQuestionType(null);
    
    try {
      if (useTestData) {
        // Use the sample test data based on selected question type
        const selectedData = getSelectedQuizData();
        if (selectedData) {
          setGeneratedQuizData(selectedData);
        } else {
          setError('Invalid question type selected');
        }
      } else {
        // Prepare form data for direct API call
        const formData = new FormData();
        
        // Add necessary parameters
        formData.append('clerk_id', 'demo_user');
        formData.append('template_slug', demoQuizTemplate.slug);
        
        // Add all form values
        if (formValues.topic) {
          formData.append('topic', formValues.topic);
        }
        
        if (formValues.questionTypes) {
          formData.append('question_types', formValues.questionTypes);
        }
        
        if (formValues.difficulty) {
          formData.append('difficulty', formValues.difficulty);
        }
        
        if (formValues.questionCount) {
          formData.append('num_questions', formValues.questionCount.toString());
        }
        
        if (formValues.additionalInfo) {
          formData.append('prompt', formValues.additionalInfo);
        } else {
          formData.append('prompt', 'Create a quiz based on the provided topic');
        }
        
        // Add file if present
        if (formValues.document instanceof File) {
          formData.append('file', formValues.document);
          formData.append('file_type', formValues.document.type);
        }
        
        try {
          // Get the API base URL from environment variables
          const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
          const apiEndpoint = `${API_BASE_URL}/api/v1/quiz_v2`;
          
          // Log what we're sending
          console.log('Sending form data to backend:', 
            Array.from(formData.entries())
              .filter(([key]) => key !== 'file')
              .map(([key, value]) => `${key}: ${value}`)
          );
          console.log('API endpoint:', apiEndpoint);
          
          // Log the FormData entries before sending
          console.log('Quiz FormData entries:');
          for (let pair of formData.entries()) {
            console.log(pair[0], typeof pair[1] === 'object' ? 'File object: ' + (pair[1] as File).name : pair[1]);
          }
          
          // Make direct API call to the quiz_v2 endpoint
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            credentials: 'include',
            body: formData
          });
          
          console.log('API response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            throw new Error(`API request failed with status ${response.status}: ${errorText}`);
          }
          
          // Parse the response
          const data = await response.json();
          console.log('API response data:', data);
          
          // Store the full quiz data for later filtering
          setFullQuizData(data);
          
          // Extract available question types from the response
          const availableTypes: string[] = [];
          
          // Add question types that have data
          if (data.multiple_choice_questions_answers?.length > 0) availableTypes.push('multiple-choice');
          if (data.true_false_questions_answers?.length > 0) availableTypes.push('true-false');
          if (data.short_answer_questions_answers?.length > 0) availableTypes.push('short-answer');
          if (data.flash_cards_questions_answers?.length > 0) availableTypes.push('flash-card');
          if (data.sequence_ordering_questions_answers?.length > 0) availableTypes.push('step-ordering');
          if (data.matching_questions_answers?.length > 0) availableTypes.push('matching');
          if (data.multiple_answer_questions_answers?.length > 0) availableTypes.push('multiple-answer');
          if (data.case_study_questions_answers?.length > 0) availableTypes.push('case-study');
          if (data.fill_in_the_blanks_questions_answers?.length > 0) availableTypes.push('fill-in-the-blanks');
          if (data.viva_questions_answers?.length > 0) availableTypes.push('viva');
          
          setAvailableQuestionTypes(availableTypes);
          
          // If no question types available, show an error
          if (availableTypes.length === 0) {
            setError('No questions were generated. Please try again.');
          }
        } catch (e) {
          console.error('Error calling quiz API:', e);
          setError(e instanceof Error ? e.message : 'Failed to generate quiz');
        }
      }
    } catch (err) {
      setError('An error occurred while generating the quiz');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle question type selection
  const handleQuestionTypeSelect = (type: string) => {
    setSelectedQuestionType(type);
    
    if (fullQuizData) {
      // Format the selected quiz data
      const formattedQuizData: {
        id: string;
        title: string;
        description: string;
        difficulty: string;
        totalQuestions: number;
        timeLimit?: number;
        questions: QuizQuestion[]; 
      } = {
        id: "generated-quiz",
        title: fullQuizData.quiz_plan?.quiz_metadata?.title || formValues.topic || "Generated Quiz",
        description: fullQuizData.quiz_plan?.quiz_metadata?.description || `${type} Quiz based on your input`,
        difficulty: fullQuizData.difficulty || "intermediate",
        totalQuestions: fullQuizData.quiz_plan?.quiz_metadata?.total_questions || 
                        fullQuizData.num_questions || 5,
        timeLimit: fullQuizData.quiz_plan?.quiz_metadata?.estimated_time || undefined,
        questions: []
      };
      
      // Add only the questions of the selected type
      let sourceQuestions: any[] = [];
      
      switch(type) {
        case 'multiple-choice':
          sourceQuestions = fullQuizData.multiple_choice_questions_answers || [];
          break;
        case 'true-false':
          sourceQuestions = fullQuizData.true_false_questions_answers || [];
          break;
        case 'short-answer':
          sourceQuestions = fullQuizData.short_answer_questions_answers || [];
          break;
        case 'flash-card':
          sourceQuestions = fullQuizData.flash_cards_questions_answers || [];
          break;
        case 'step-ordering':
          sourceQuestions = fullQuizData.sequence_ordering_questions_answers || [];
          break;
        case 'matching':
          sourceQuestions = fullQuizData.matching_questions_answers || [];
          break;
        case 'multiple-answer':
          sourceQuestions = fullQuizData.multiple_answer_questions_answers || [];
          break;
        case 'case-study':
          sourceQuestions = fullQuizData.case_study_questions_answers || [];
          break;
        case 'fill-in-the-blanks':
          sourceQuestions = fullQuizData.fill_in_the_blanks_questions_answers || [];
          break;
        case 'viva':
          sourceQuestions = fullQuizData.viva_questions_answers || [];
          break;
      }
      
      if (sourceQuestions.length > 0) {
        formattedQuizData.questions = sourceQuestions.map(q => ({
          ...q,
          type: type as QuizQuestion['type']
        }));
        
        setGeneratedQuizData(formattedQuizData);
      } else {
        setError(`No ${type} questions available. Please select another type.`);
      }
    }
  };

  // Handle going back to question type selection
  const handleBackToQuestionTypes = () => {
    setSelectedQuestionType(null);
    setGeneratedQuizData(null);
  };

  // Handle quiz completion
  const handleQuizComplete = (results: { score: number; answers: Record<string, string>; }) => {
    setQuizResults(results);
    setQuizCompleted(true);
  };

  // Handle retaking the same quiz
  const handleRetakeQuiz = () => {
    setQuizCompleted(false);
  };

  // Handle reset to create a new quiz
  const handleReset = () => {
    setGeneratedQuizData(null);
    setFullQuizData(null);
    setSelectedQuestionType(null);
    setQuizCompleted(false);
    setQuizResults({ score: 0, answers: {} });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Reset form values to defaults
    setFormValues({
      questionTypes: 'multiple-choice'
    });
  };

  // Toggle between API and test data
  const toggleDataSource = () => {
    setUseTestData(!useTestData);
  };

  // Get the current selected question type for display
  const getCurrentQuestionTypeLabel = () => {
    const questionType = formValues.questionTypes || 'multiple-choice';
    const type = QUESTION_TYPES.find(t => t.value === questionType);
    return type ? type.label : 'Multiple Choice';
  };

  // Render question type selection cards
  const renderQuestionTypeSelection = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Select Question Type</h2>
        <p className="text-center text-gray-600">Choose a question type to begin the quiz</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {availableQuestionTypes.map(type => {
            const typeInfo = QUESTION_TYPES.find(t => t.value === type);
            return (
              <div 
                key={type}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleQuestionTypeSelect(type)}
              >
                <h3 className="text-xl font-semibold mb-2">{typeInfo?.label || type}</h3>
                <p className="text-gray-600 text-sm">Click to start quiz with this question type</p>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-center mt-8">
          <Button onClick={handleReset} variant="outline" className="mx-2">
            <RotateCcw className="w-4 h-4 mr-2" />
            Create New Quiz
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <DemoHeader 
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {!generatedQuizData && !fullQuizData && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Create Your Quiz</h2>
            <Button onClick={toggleDataSource} variant="outline" size="sm">
              {useTestData ? 'Use API' : 'Use Sample Data'}
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Topic*</label>
              <Input
                placeholder="Enter a topic for your quiz"
                value={formValues.topic || ''}
                onChange={(e) => handleInputChange('topic', e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Question Type</label>
              <Select
                value={formValues.questionTypes || 'multiple-choice'}
                onValueChange={(value) => handleSelectChange('questionTypes', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Number of Questions</label>
              <Input
                type="number"
                placeholder="5"
                min="1"
                max="20"
                value={formValues.questionCount || ''}
                onChange={(e) => handleInputChange('questionCount', e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Difficulty Level</label>
              <Select
                value={formValues.difficulty || 'intermediate'}
                onValueChange={(value) => handleSelectChange('difficulty', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Additional Instructions (Optional)</label>
              <Textarea
                placeholder="Add any specific instructions or context for the quiz"
                value={formValues.additionalInfo || ''}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                className="w-full min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Upload Document (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                  accept=".pdf,.docx,.txt"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  variant="outline"
                  className="mb-2"
                >
                  Select File
                </Button>
                <p className="text-sm text-gray-500">
                  {selectedFile ? `Selected: ${selectedFile.name}` : 'PDF, DOCX, or TXT up to 10MB'}
                </p>
              </div>
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={loading || !formValues.topic}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                'Generate Quiz'
              )}
            </Button>
          </div>
        </div>
      )}

      {fullQuizData && !selectedQuestionType && (
        renderQuestionTypeSelection()
      )}

      {generatedQuizData && selectedQuestionType && !quizCompleted && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="mb-4">
            <Button 
              onClick={handleBackToQuestionTypes} 
              variant="outline" 
              size="sm"
              className="mb-4"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Back to Question Types
            </Button>
          </div>
          <QuizOutputDisplay
            quizData={generatedQuizData}
            onComplete={handleQuizComplete}
            onReset={handleReset}
          />
        </div>
      )}

      {quizCompleted && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
            <p className="text-xl mb-6">Your score: <span className="font-bold text-green-600">{quizResults.score}%</span></p>
            
            <div className="flex justify-center space-x-4">
              <Button onClick={handleRetakeQuiz} variant="outline">
                Retake Quiz
              </Button>
              <Button onClick={handleReset}>
                Create New Quiz
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}