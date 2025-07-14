"use client";
import React, { useContext, useState } from "react";
import FormSection from "../_components/FormSection";
import OutputSection from "../_components/OutputSection";
import { TEMPLATE } from "../../_components/TemplateListSection";
import Templates from "@/app/(data)/Templates";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { chatSession } from "@/utils/AiModal";
import { db } from "@/utils/db";
import { AIOutput } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useUserSubscription } from "@/app/(context)/TotalUsageContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { UpdateCreditUsageContext } from "@/app/(context)/UpdateCreditUsageContext";
import SummativeAssessment from "@/app/dashboard/assessment/_components/SummativeAssessment";
import FormativeAssessmentResult from "@/app/dashboard/assessment/_components/FormativeAssessmentResult";
import NodeDisplay from "@/app/dashboard/class/_components/NodeDisplay";
import WhiteBoard from "@/app/dashboard/class/_components/WhiteBoard";
import PersonalizationDisplay from "@/app/dashboard/personalization/_components/PersonalizationDisplay";
import SummarizerDisplay from "@/app/dashboard/summarizer/_components/SummarizerDisplay";
import RFFormSection from "@/app/dashboard/content/_components/RFFormSection";
import HorizontalFormSection from "@/app/dashboard/content/_components/HorizontalFormSection";
import ClassDisplay from "@/app/dashboard/class/_components/ClassDisplay";
import { personalizationApiClient } from "@/app/api/fastapi/personalizationDisplay";


interface PROPS {
  params: {
    "template-slug": string;
  };
}

// Define interfaces for the quiz data structure
interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  type: string;
  text: string;
  options: QuizOption[];
  correct_answer: string;
  explanation: string;
}

interface ProcessedQuestionData {
  id: string;
  type: string;
  text: string;
  options?: QuizOption[];        // For MC/TF
  correct_answer?: string;     // For MC/TF/ShortAnswer
  explanation?: string;
  front?: string;                // For Flashcard
  back?: string;                 // For Flashcard
  text_parts?: string[];         // For Fill Blanks
  correct_answers?: string[];    // For Fill Blanks
}

// Interface for the final Quiz data structure passed to the Quiz component
interface QuizData {
  id: string;
  title: string;
  description: string;
  timeLimit?: number; // Optional, ensure it's number if present
  difficulty: string;
  category: string;
  questions: ProcessedQuestionData[]; // Use the more inclusive interface
}

interface AssessmentResult {
  criteriaFeedback: {
    [key: string]: {
      feedback: string;
      score?: number;
      max_score?: number;
    };
  };
  overallFeedback: string;
  score: number;
  maxMark: number;
  question: string;
  title: string;
  // Add other fields as necessary based on the actual API response
}

interface Trend {
  trend: string;
  postings: string[];
}

interface SkillGap {
  gap: string;
  suggestedDevelopment: string;
}

interface JobPosting {
  positionTitle?: string | null;
  company?: string | null;
  location?: string | null;
  jobUrl?: string | null;
  salaryRange?: string | null;
  employmentType?: string | null;
  relevanceScore?: number | null;
  requiredSkills?: string[] | null;
  preferredSkills?: string[] | null;
  keyResponsibilities?: string[] | null;
  experienceRequirements?: string | null;
  educationRequirements?: string | null;
  companyBenefits?: string | null;
  applicationDeadline?: string | null;
  matchAnalysis?: string | null;
  redFlagsConcerns?: string | null;
  applicationTips?: string | null;
  companyBackground?: string | null;
  growthPotential?: string | null;
  tailoredResume?: string | null;
  tailoredCoverLetter?: string | null;
}

interface ResultsObject {
  analyzedJobPostings?: JobPosting[] | null;
  industryTrends?: Trend[] | null;
  skillGapAnalysis?: SkillGap[] | null;
  strategicApplicationRecommendations?: string | null;
  salaryCompensationAnalysis?: string | null;
  geographicConsiderations?: string | null;
  applicationTimelinePlanning?: string | null;
  industrySpecificInterviewPreparation?: string | null;
}

// Type for the expected API response structure
interface ApiResponse {
    results: string; // Assuming 'results' is always a stringified JSON
    // Include other potential fields if known
    [key: string]: any;
}

/**
 * Utility function to send quiz request using FormData
 */
async function sendQuizRequest(requestData: any) {
  console.log('QUIZ REQUEST DATA:', requestData);
  // Create a FormData object for the request body
  const formData = new FormData();
  formData.append('clerk_id', requestData.clerk_id);
  formData.append('topic', requestData.topic || 'General Knowledge');
  formData.append('prompt', requestData.prompt);
  formData.append('provider', requestData.provider || 'openai');
  formData.append('model', requestData.model || 'gpt-4o');
  formData.append('num_questions', (requestData.num_questions || 5).toString());
  formData.append('difficulty', requestData.difficulty || 'medium');

  // Handle question_types - might be a string or array
  if (requestData.question_types) {
    if (Array.isArray(requestData.question_types)) {
      // If it's already an array, use it directly
      requestData.question_types.forEach((type: string) => {
        formData.append('question_types', type);
      });
    } else if (typeof requestData.question_types === 'string') {
      // If it's a comma-separated string, split it
      const types = requestData.question_types.split(',').map((t: string) => t.trim());
      types.forEach((type: string) => {
        formData.append('question_types', type);
      });
    } else {
      // Default to multiple_choice and true_false if invalid
      formData.append('question_types', 'multiple_choice');
      formData.append('question_types', 'true_false');
    }
  } else {
    // Default if missing
    formData.append('question_types', 'multiple_choice');
    formData.append('question_types', 'true_false');
  }

  // Add file if available
  if (requestData.file && requestData.file instanceof File) {
    console.log('Attaching file to request:', requestData.file.name, 'size:', requestData.file.size, 'type:', requestData.file.type);

    // Use the original filename to help the server identify the file type
    formData.append('file', requestData.file, requestData.file.name);

    // CRITICAL: Set file_type explicitly
    if (requestData.file_type) {
      console.log('Setting file_type from requestData:', requestData.file_type);
      formData.append('file_type', requestData.file_type);
    } else {
      // If file is present but file_type is missing, auto-detect from extension
      const extension = requestData.file.name.split('.').pop()?.toLowerCase();
      let detectedType = '';

      // Map extensions to the exact file_type values expected by the backend
      if (extension === 'pdf') detectedType = 'pdf';
      else if (extension === 'docx') detectedType = 'docx';
      else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) detectedType = 'images';
      else if (['mp4', 'mov', 'webm'].includes(extension || '')) detectedType = 'video';
      else if (['mp3', 'wav', 'ogg'].includes(extension || '')) detectedType = 'audio';
      else if (extension === 'pptx') detectedType = 'power point';
      else if (['xlsx', 'xls'].includes(extension || '')) detectedType = 'excel';
      else if (extension === 'csv') detectedType = 'csv';
      else if (extension === 'json') detectedType = 'json';

      if (detectedType) {
        console.log('Auto-detected file_type from extension:', detectedType);
        formData.append('file_type', detectedType);
        // Also update the requestData for logging
        requestData.file_type = detectedType;
      }
    }
  }

  // Add file URL if available
  if (requestData.file_url) {
    formData.append('file_url', requestData.file_url);
  }
  if (requestData.file_type) {
    console.log('Setting file_type to:', requestData.file_type);
    formData.append('file_type', requestData.file_type);
  }

  console.log('Quiz request data being sent to API:', formData);
  console.log('Sending quiz request with FormData...');

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const apiEndpoint = `${API_BASE_URL}/api/v1/quiz`;
  console.log('Sending quiz request to:', apiEndpoint);

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    credentials: 'include',
    body: formData // Send FormData in the request body
  });

  console.log('API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API error response:', errorText);
    throw new Error(`API request failed with status ${response.status}: ${errorText}`);
  }

  return await response.json();
}

function CreateContentSection(props: PROPS) {
  const selectedTemplate: TEMPLATE | undefined = Templates?.find(
    (item) => item.slug === props.params["template-slug"]
  );

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [AiOutput, setAiOutput] = useState<string>("");
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [showAlert, setShowAlert] = useState(false);
  const { user } = useUser();
  const { totalUsage, setTotalUsage, credits, plan } = useUserSubscription();
  const { updateCreditUsage, setUpdateCreditUsage } = useContext(
    UpdateCreditUsageContext
  );
  const [summativeAssessmentResults, setSummativeAssessmentResults] = useState<AssessmentResult | null>(null);
  const [formativeAssessmentResults, setFormativeAssessmentResults] = useState<AssessmentResult | null>(null);
  // Fix the state type to accept a function that receives node type and data
  const [addNodeFunction, setAddNodeFunction] = useState<((nodeType: string, nodeData: any) => void) | null>(null);

  /**
   * Used to generate content using AI
   * @param formData
   * @returns
   */
  const GenerateAIContent = async (formData: any) => {
    if (totalUsage >= credits) {
      setShowAlert(true);
      return;
    }

    setLoading(true);

    // Check if this is a map generation request
    if (selectedTemplate?.category === "Maps") {
      try {
        // Get the current user ID from Clerk
        const userId = user?.id || 'anonymous';

        // Create a FormData object for the request body (same approach as quiz generation)
        const mapFormData = new FormData();

        // Add clerk_id for authentication
        mapFormData.append('clerk_id', userId);

        // Determine map type based on the template
        let mapType = "";
        let prompt = "";

        if (selectedTemplate?.slug === "process-map-creator") {
          mapType = "process_map";

          // Construct the prompt for process map
          prompt = `Create a process map for '${formData.process}'. Purpose: ${formData.purpose}. ${formData.endpoints ? `Start and End: ${formData.endpoints}.` : ''} ${formData.stakeholders ? `Stakeholders: ${formData.stakeholders}.` : ''}`;

        } else if (selectedTemplate?.slug === "knowledge-map-generator") {
          mapType = "knowledge_map";

          // Construct the prompt for knowledge map
          prompt = `Create a knowledge map about '${formData.subject}' covering these concepts: ${formData.mainConcepts}. ${formData.depth ? `Depth level: ${formData.depth}.` : ''} ${formData.focus ? `Focus on: ${formData.focus}.` : ''}`;

          // Add focus areas if specified
          if (formData.focus) {
            try {
              const focusAreas = formData.focus.split(',').map((item: string) => item.trim());
              focusAreas.forEach((area: string) => {
                mapFormData.append('focus_areas', area);
              });
            } catch (e) {
              mapFormData.append('focus_areas', formData.focus);
            }
          } else {
            // Default focus areas
            mapFormData.append('focus_areas', 'Key concepts');
            mapFormData.append('focus_areas', 'Relationships');
          }
        }

        // Add all required parameters to FormData
        mapFormData.append('prompt', prompt);
        mapFormData.append('map_type', mapType);
        mapFormData.append('provider', formData.provider || 'openai');
        mapFormData.append('model', formData.model || 'gpt-4o');
        mapFormData.append('depth', formData.depth || 'medium');

        // Add file if available using the same approach as quiz generation
        if (formData.file && formData.file instanceof File) {
          console.log('Map generation - Attaching file:', formData.file.name, 'size:', formData.file.size);
          mapFormData.append('file', formData.file, formData.file.name);

          // Set file_type explicitly if available
          if (formData.file_type) {
            mapFormData.append('file_type', formData.file_type);
          } else {
            // Auto-detect from extension if needed
            const extension = formData.file.name.split('.').pop()?.toLowerCase();
            if (extension === 'pdf') mapFormData.append('file_type', 'pdf');
            else if (extension === 'docx') mapFormData.append('file_type', 'docx');
            else if (['jpg', 'jpeg', 'png'].includes(extension || '')) mapFormData.append('file_type', 'images');
          }
        }

        // Add file_url if available
        if (formData.file_url) {
          mapFormData.append('file_url', formData.file_url);
        }

        // Log the FormData entries before sending
        console.log('Map FormData entries:');
        for (let pair of mapFormData.entries()) {
          console.log(pair[0], typeof pair[1] === 'object' ? 'File object: ' + pair[1].name : pair[1]);
        }
        const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        // Use the correct API endpoint URL
        const apiEndpoint = `${API_BASE_URL}/api/v1/maps`;
        console.log('Sending map generation request to:', apiEndpoint);

        // Make the API request using FormData
        const response = await fetch(apiEndpoint, {
          method: "POST",
          body: mapFormData,
          credentials: "include",
        });

        console.log('API response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Map API error response:', errorText);
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }

        const apiResponse = await response.json();
        console.log('API response:', apiResponse);

        // Extract the React Flow map data from the API response
        // The new API now returns a structured object with content containing nodes and edges
        const mapData = apiResponse.content ? apiResponse : { content: apiResponse };
        
        console.log('React Flow map data:', mapData);

        // Validate that we have the expected React Flow format
        if (!mapData.content || !mapData.content.nodes || !mapData.content.edges) {
          console.error('Invalid map data structure received:', mapData);
          throw new Error('The map data received does not have the expected React Flow structure');
        }

        // Store the map in session storage for immediate access on the maps page
        sessionStorage.setItem("generatedMap", JSON.stringify(mapData));
        sessionStorage.setItem("mapType", mapType); // Store map type for rendering preferences

        // Save the generated map to DB
        await SaveInDb(
          JSON.stringify(formData),
          selectedTemplate?.slug,
          JSON.stringify(mapData)
        );

        setTotalUsage(totalUsage + 1); // Increment usage
        setLoading(false);
        setUpdateCreditUsage(Date.now());

        // Redirect to maps page with the React Flow map
        router.push(`/dashboard/maps?template=${selectedTemplate?.slug}&mapId=latest`);
        return;

      } catch (error: any) {
        console.error("Error generating map:", error);
        setAiOutput(`Error generating map: ${error?.message || 'Unknown error'}`);
        setLoading(false);
        return;
      }
    }

    // Check if this is a quiz generation request
    // *** Check if this is a quiz generation request ***
    if (selectedTemplate?.slug === "quiz-generator") {
      try {
        const userId = user?.id || 'anonymous';
        const quizRequestData = {
           clerk_id: userId,
           topic: formData.topic,
           prompt: formData.prompt || "Create a quiz based on the context",
           // Use specific types if provided, otherwise default
           question_types: formData.questionTypes?.split(',').map((t:string) => t.trim()) || ["multiple_choice", "true_false", "flashcard"],
           num_questions: parseInt(formData.questionCount) || 5,
           difficulty: formData.difficulty || "medium",
           file: formData.file, // Pass file if present
           // Add file_type logic if needed (ensure consistent with sendQuizRequest)
           file_type: formData.file_type || (formData.file ? formData.file.name.split('.').pop()?.toLowerCase() : undefined),
           // Add provider/model if needed by your sendQuizRequest implementation
           provider: formData.provider || 'openai',
           model: formData.model || 'gpt-4o',
         };
        console.log('Quiz request data being prepared:', quizRequestData);


        let quizData: QuizData; // Use the updated interface

        try {
          // Use the utility function to send the request
          console.log('Sending quiz request...');
          const apiResponse = await sendQuizRequest(quizRequestData); // Assuming this function exists and works
          console.log('API response received:', apiResponse);

          // Process the API response - find the actual quiz object
          let extractedQuizObject: any;
            if (apiResponse?.quiz) {
               extractedQuizObject = apiResponse.quiz;
               console.log('Found quiz data in apiResponse.quiz');
            } else if (apiResponse?.content?.quiz) {
               extractedQuizObject = apiResponse.content.quiz;
                console.log('Found quiz data in apiResponse.content.quiz');
            } else if (apiResponse?.result?.quiz) {
                extractedQuizObject = apiResponse.result.quiz;
                console.log('Found quiz data in apiResponse.result.quiz');
            } else if (typeof apiResponse === 'object' && apiResponse !== null && apiResponse.questions) {
                 // Maybe the root object is the quiz itself?
                 extractedQuizObject = apiResponse;
                 console.log('Using entire response object as quiz data');
            } else {
                console.error("Could not find 'quiz' object in API response:", apiResponse);
                throw new Error("Invalid API response structure: 'quiz' object missing.");
            }

          console.log('Extracted quiz object before processing:', extractedQuizObject);

          // *** Critical: Ensure the extracted object has the expected structure ***
          if (extractedQuizObject && typeof extractedQuizObject === 'object' && Array.isArray(extractedQuizObject.questions)) {
             console.log('Processing extracted questions...');
             // Map questions, correctly handling flashcards
             const processedQuestions: ProcessedQuestionData[] = extractedQuizObject.questions.map((q: any, index: number) => {
                const baseQuestion = {
                    id: q.id || `q${index + 1}`,
                    type: q.type || "multiple_choice", // Default type if missing
                    text: q.text || `Question ${index + 1}`, // Default text
                    explanation: q.explanation || "No explanation provided." // Default explanation
                };

                // --- Handle Different Question Types ---
                switch (baseQuestion.type) {
                  case 'flashcard':
                     // For flashcards, ensure front and back exist
                     if (!q.front || !q.back) {
                        console.warn(`Flashcard question ID ${baseQuestion.id} is missing 'front' or 'back'. Skipping specific fields.`);
                         return {
                            ...baseQuestion,
                            // Keep type as flashcard, but front/back might be undefined/null
                            front: q.front,
                            back: q.back,
                        };
                     }
                     return {
                        ...baseQuestion,
                        front: q.front,
                        back: q.back,
                        // NO options or correct_answer for flashcards
                     };

                   case 'multiple_choice':
                   case 'true_false':
                     // Ensure options is an array of objects with id and text
                     const processedOptions = Array.isArray(q.options) ? q.options.map((opt: any, optIndex: number) => {
                        if (typeof opt === 'object' && opt.id && opt.text) return opt;
                        if (typeof opt === 'object') return { id: opt.id || String.fromCharCode(97 + optIndex), text: opt.text || `Option ${optIndex + 1}` };
                        return { id: String.fromCharCode(97 + optIndex), text: opt || `Option ${optIndex + 1}` };
                      }) : [ // Default options if missing/invalid
                          { id: "a", text: "Option A" }, { id: "b", text: "Option B" }
                      ];
                     // Ensure correct_answer is present and matches an option id
                     const validCorrectAnswer = processedOptions.some((opt: QuizOption) => opt.id === q.correct_answer)
                                                  ? q.correct_answer
                                                  : processedOptions[0]?.id || "a"; // Default to first option ID if invalid
                     return {
                         ...baseQuestion,
                         options: processedOptions,
                         correct_answer: validCorrectAnswer,
                     };

                   case 'short_answer':
                     return {
                       ...baseQuestion,
                       correct_answer: q.correct_answer || "", // Default empty string
                       // NO options
                     };

                   case 'fill_blanks':
                     return {
                         ...baseQuestion,
                         text_parts: Array.isArray(q.text_parts) ? q.text_parts : [], // Default empty array
                         correct_answers: Array.isArray(q.correct_answers) ? q.correct_answers : [], // Default empty array
                         // NO options
                     };

                   default:
                     console.warn(`Unsupported question type "${q.type}" for question ID ${baseQuestion.id}. Treating as generic.`);
                     // Handle unknown types gracefully (maybe include raw data or omit specific fields)
                     return {
                         ...baseQuestion,
                         // Include any other fields present in q, or return just base
                         ...(q.options && { options: q.options }), // Keep fields if they exist, though maybe invalid
                         ...(q.correct_answer && { correct_answer: q.correct_answer }),
                     };
                 }
             }); // End map

             // Construct the final QuizData object
             quizData = {
                 id: extractedQuizObject.id || "generated-quiz-" + Date.now(),
                 title: extractedQuizObject.title || `Generated Quiz`,
                 description: extractedQuizObject.description || `Quiz based on provided context.`,
                 // Ensure timeLimit is a number or undefined
                 timeLimit: typeof extractedQuizObject.timeLimit === 'number' ? extractedQuizObject.timeLimit : undefined,
                 difficulty: extractedQuizObject.difficulty || quizRequestData.difficulty,
                 category: extractedQuizObject.category || "Generated",
                 questions: processedQuestions, // Use the correctly processed questions
             };

          } else {
             // Handle cases where the extracted data or questions array is missing/invalid
             console.error('Extracted data is invalid or missing questions array:', extractedQuizObject);
             throw new Error("Failed to process quiz data structure from API response.");
          }

          console.log('Final quiz data structure ready for Quiz component:', quizData);

        } catch (apiError) {
           console.error("API call or processing failed:", apiError);
           // Optionally use sample data as fallback for UI testing, but log error clearly
           // For now, let's just re-throw or set an error state
           throw apiError; // Re-throw the error to be caught by the outer catch block
         // quizData = sampleQuizData; // Or use sample data if preferred for fallback
        }

        // Save the processed quiz data to session storage
        sessionStorage.setItem("generatedQuiz", JSON.stringify(quizData));

        // Save history to DB (use the processed data)
        await SaveInDb(
          JSON.stringify(formData),      // Original form input
          selectedTemplate?.slug,
          JSON.stringify(quizData)       // Store the *processed* data that matches the frontend structure
        );

        setTotalUsage(totalUsage + 1); // Increment usage
        setLoading(false);
        setUpdateCreditUsage(Date.now());

        // Redirect to the assessment page
        router.push("/dashboard/assessment?quizId=latest");
        return;

      } catch (error: any) {
        console.error("Error in quiz generation flow:", error);
        setAiOutput(`Error generating quiz: ${error?.message || 'Unknown error'}`);
        setLoading(false);
        // Potentially show an alert to the user here
        return;
      }
    } // End Quiz Generation block
    // Check if this is a formative assessment request
    if (selectedTemplate?.slug === "formative-assessment") {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const apiEndpoint = `${API_BASE_URL}/api/v1/formative-assessment`;
        const userId = user?.id || 'anonymous';

        const assessmentFormData = new FormData();
        assessmentFormData.append('clerk_id', userId);
        assessmentFormData.append('question_id', formData.questionId);
        assessmentFormData.append('title', formData.title);
        assessmentFormData.append('question_text', formData.questionText);
        assessmentFormData.append('max_mark', formData.maxMark || '100');
        if (formData.file && formData.file instanceof File) {
          assessmentFormData.append('file', formData.file, formData.file.name);
        }
        if (formData.task_file && formData.task_file instanceof File) {
          assessmentFormData.append('task_file', formData.task_file, formData.task_file.name);
        }
        assessmentFormData.append('file_type', formData.fileType || '');
        assessmentFormData.append('grading_criteria', formData.gradingCriteria || 'string');
        assessmentFormData.append('include_image', formData.includeImage ? 'true' : 'false');
        assessmentFormData.append('level', formData.level || 'high');

        console.log('Formative assessment request data being sent to API:', assessmentFormData);

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          credentials: 'include',
          body: assessmentFormData,
        });

        console.log('Formative assessment API response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Formative assessment API error response:', errorText);
          throw new Error(`Formative assessment API request failed with status ${response.status}: ${errorText}`);
        }

        const apiResponse = await response.json();
        console.log('Formative assessment API response:', apiResponse);

        // Assuming the API response matches the AssessmentResult interface
        setFormativeAssessmentResults(apiResponse);

        await SaveInDb(
          JSON.stringify(formData),
          selectedTemplate?.slug,
          JSON.stringify(apiResponse)
        );

        setTotalUsage(totalUsage + 1);
        setLoading(false);
        setUpdateCreditUsage(Date.now());

      } catch (error: any) {
        console.error("Error submitting formative assessment:", error);
        setAiOutput(`Error submitting formative assessment: ${error?.message || 'Unknown error'}`);
        setLoading(false);
      }
      return;
    }

    // Check if this is a summative assessment request
    if (selectedTemplate?.slug === "summative-assessment") {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const apiEndpoint = `${API_BASE_URL}/api/v1/summative-assessment`;
        const userId = user?.id || 'anonymous';

        const assessmentFormData = new FormData();
        assessmentFormData.append('clerk_id', userId);
        assessmentFormData.append('question_id', formData.questionId);
        assessmentFormData.append('title', formData.title);
        assessmentFormData.append('question_text', formData.questionText);
        assessmentFormData.append('max_mark', formData.maxMark || '100');
        if (formData.file && formData.file instanceof File) {
          assessmentFormData.append('file', formData.file, formData.file.name);
        }
        if (formData.task_file && formData.task_file instanceof File) {
          assessmentFormData.append('task_file', formData.task_file, formData.task_file.name);
        }
        assessmentFormData.append('file_type', formData.fileType || '');
        assessmentFormData.append('grading_criteria', formData.gradingCriteria || 'string');
        assessmentFormData.append('include_image', formData.includeImage ? 'true' : 'false');
        assessmentFormData.append('level', formData.level || 'high');

        console.log('Summative assessment request data being sent to API:', assessmentFormData);

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          credentials: 'include',
          body: assessmentFormData,
        });

        console.log('Summative assessment API response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Summative assessment API error response:', errorText);
          throw new Error(`Summative assessment API request failed with status ${response.status}: ${errorText}`);
        }
        
        const apiResponse = await response.json();
        console.log('Summative assessment API response:', apiResponse);
        
        // Assuming the API response matches the AssessmentResult interface
        setSummativeAssessmentResults(apiResponse);
        
        await SaveInDb(
          JSON.stringify(formData),
          selectedTemplate?.slug,
          JSON.stringify(apiResponse)
        );

        setTotalUsage(totalUsage + 1);
        setLoading(false);
        setUpdateCreditUsage(Date.now());

      } catch (error: any) {
        console.error("Error submitting summative assessment:", error);
        setAiOutput(`Error submitting summative assessment: ${error?.message || 'Unknown error'}`);
        setLoading(false);
      }
      return;
    }

    // Check if this is an academic paper request
    if (selectedTemplate?.slug === "academic-writer") {
      try {
        const userId = user?.id || 'anonymous';
        const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const apiEndpoint = `${API_BASE_URL}/api/v1/writing/academic-writer`;

        const academicFormData = new FormData();

        // Add required fields from the form data
        academicFormData.append('clerk_id', userId);
        academicFormData.append('title', formData.topic || 'Academic Paper');
        academicFormData.append('prompt', formData.prompt || '');
        academicFormData.append('doc_type', formData.paper_type);
        academicFormData.append('task_type', 'academic-writer');

        // Add additional info if available
        if (formData.additional_info) {
          academicFormData.append('additional_info', formData.additional_info);
        }

        // Add key ideas if available
        if (formData.keyIdeas) {
          academicFormData.append('key_ideas', formData.keyIdeas);
        }

        // Add main content file if available
        if (formData.file && formData.file instanceof File) {
          academicFormData.append('task_file', formData.file, formData.file.name);
          if (formData.file_type) {
            academicFormData.append('file_type', formData.file_type);
          }
        }

        // Add marking criteria file if available
        if (formData.task_file && formData.task_file instanceof File) {
          academicFormData.append('marking_criteria_file', formData.task_file, formData.task_file.name);
          academicFormData.append('marking_criteria_file_type', formData.task_file.type || '');
        }

        console.log('Academic writing request data being sent to API:', academicFormData);

        // Log the FormData entries before sending
        console.log('Academic FormData entries:');
        for (let pair of academicFormData.entries()) {
          console.log(pair[0], typeof pair[1] === 'object' ? 'File object: ' + pair[1].name : pair[1]);
        }

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          credentials: 'include',
          body: academicFormData,
        });

        console.log('Academic writing API response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Academic writing API error response:', errorText);
          throw new Error(`Academic writing API request failed with status ${response.status}: ${errorText}`);
        }

        const apiResponse = await response.json();
        console.log('Academic writing API response:', apiResponse);

        // Check if the API response contains the final content
        if (apiResponse.final_content) {
          // Set the AI output to the final content preview
          setAiOutput(apiResponse.final_content);
        } else if (apiResponse.output_file_path) {
          // If there's a file path but no preview, we'll need to fetch the file content
          // For now, just inform the user where the file is saved
          setAiOutput(`Academic paper has been generated and saved to: ${apiResponse.output_file_path}`);
        } else {
          // If there's no content or file path, display the message or error
          setAiOutput(apiResponse.message || "Academic paper has been generated");
        }

        await SaveInDb(
          JSON.stringify(formData),
          selectedTemplate?.slug,
          JSON.stringify(apiResponse)
        );

        setTotalUsage(totalUsage + 1);
        setLoading(false);
        setUpdateCreditUsage(Date.now());

      } catch (error: any) {
        console.error("Error generating academic paper:", error);
        setAiOutput(`Error generating academic paper: ${error?.message || 'Unknown error'}`);
        setLoading(false);
      }
      return;
    }

    // Check if this is an academic paper request
    if (selectedTemplate?.slug === "proposal-writer") {
      try {
        const userId = user?.id || 'anonymous';
        const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const apiEndpoint = `${API_BASE_URL}/api/v1/proposal/proposal-writer`;

        const proposalFormData = new FormData();

        // Add required fields from the form data
        proposalFormData.append('clerk_id', userId);
        proposalFormData.append('title', formData.topic || 'Proposal');
        proposalFormData.append('prompt', formData.prompt || '');
        proposalFormData.append('doc_type', formData.proposal_type || 'job_application');
        proposalFormData.append('start_date', formData.start_date || '');
        proposalFormData.append('end_date', formData.end_date || '');
        proposalFormData.append('search_term', formData.search_term || '');
        proposalFormData.append('location', formData.location || '');
        proposalFormData.append('experience', formData.experience || '');
        proposalFormData.append('job_type', formData.job_type || '');
        proposalFormData.append('provider', formData.provider || 'google');

        // Add additional info if available
        if (formData.additional_info) {
          proposalFormData.append('additional_info', formData.additional_info);
        }

        // Add key ideas if available
        if (formData.keyIdeas) {
          proposalFormData.append('key_ideas', formData.keyIdeas);
        }

        // Add main content file if available
        if (formData.file && formData.file instanceof File) {
          proposalFormData.append('doc_file', formData.file, formData.file.name);
          if (formData.file_type) {
            proposalFormData.append('doc_file_type', formData.file_type);
          }
        }

        // Add task file if available
        if (formData.task_file && formData.task_file instanceof File) {
            proposalFormData.append('task_file', formData.task_file, formData.task_file.name);
            proposalFormData.append('task_file_type', formData.task_file_type);
        }

        console.log('Proposal writing request data being sent to API:', proposalFormData);

        // Log the FormData entries before sending
        console.log('Proposal FormData entries:');
        for (let pair of proposalFormData.entries()) {
          console.log(pair[0], typeof pair[1] === 'object' ? 'File object: ' + pair[1].name : pair[1]);
        }

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          credentials: 'include',
          body: proposalFormData,
        });

        console.log('Proposal writing API response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Proposal writing API error response:', errorText);
          throw new Error(`Proposal writing API request failed with status ${response.status}: ${errorText}`);
        }

        console.log('Proposal writing API response:', response);
        const apiResponse = await response.json();
        console.log('Proposal writing API response:', apiResponse);

        // Assuming the API response matches the ApiResponse interface
        const resultsObject = JSON.parse(apiResponse.results);

        const formattedJsonString = JSON.stringify(resultsObject, null, 2);

        const markdownFormattedOutput = `\`\`\`json\n${formattedJsonString}\n\`\`\``;
        setAiOutput(markdownFormattedOutput);

        await SaveInDb(
          JSON.stringify(formData),
          selectedTemplate?.slug,
          JSON.stringify(apiResponse)
        );

        setTotalUsage(totalUsage + 1);
        setLoading(false);
        setUpdateCreditUsage(Date.now());

      } catch (error: any) {
        console.error("Error generating proposal:", error);
        setAiOutput(`Error generating proposal: ${error?.message || 'Unknown error'}`);
        setLoading(false);
      }
      return;
    }

    // Document Processing
    // Check if this is an academic paper request
    if (selectedTemplate?.slug === "document-processing") {
      try {
        const userId = user?.id || 'anonymous';
        const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const apiEndpoint = `${API_BASE_URL}/api/v1/document-processing`;

        const documentProcessingFormData = new FormData();

        // Add required fields from the form data
        documentProcessingFormData.append('clerk_id', userId);
        documentProcessingFormData.append('processing_type', formData.processing_type || '');
        documentProcessingFormData.append('target_language', formData.target_language || '');
        documentProcessingFormData.append('provider', 'google');
        
        // Add prompt as doc_text if available
        if (formData.prompt) {
          documentProcessingFormData.append('doc_text', formData.prompt);
        }

        // Add main content file if available
        if (formData.file && formData.file instanceof File) {
          documentProcessingFormData.append('doc_file', formData.file, formData.file.name);
          documentProcessingFormData.append('doc_type', formData.file_type || '');
        }
        
        // Add file URL if available
        if (formData.file_url) {
          documentProcessingFormData.append('doc_file_url', formData.file_url);
        }

        console.log('Document processing request data being sent to API:', documentProcessingFormData);

        // Log the FormData entries before sending
        console.log('Document processing FormData entries:');
        for (let pair of documentProcessingFormData.entries()) {
          console.log(pair[0], typeof pair[1] === 'object' ? 'File object: ' + pair[1].name : pair[1]);
        }

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          credentials: 'include',
          body: documentProcessingFormData,
        });

        console.log('Document processing API response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Document processing API error response:', errorText);
          throw new Error(`Document processing API request failed with status ${response.status}: ${errorText}`);
        }

        const apiResponse = await response.json();
        console.log('Document processing API response:', apiResponse);

        // Check if the API response contains the final content
        if (apiResponse.text) {
          // Set the AI output to the final content preview
          setAiOutput(apiResponse.text);
        } else if (apiResponse.output_file_path) {
          // If there's a file path but no preview, we'll need to fetch the file content
          // For now, just inform the user where the file is saved
          setAiOutput(`Document has been processed and saved to: ${apiResponse.output_file_path}`);
        } else {
          // If there's no content or file path, display the message or error
          setAiOutput(apiResponse.message || "Document has been processed");
        }

        await SaveInDb(
          JSON.stringify(formData),
          selectedTemplate?.slug,
          JSON.stringify(apiResponse)
        );

        setTotalUsage(totalUsage + 1);
        setLoading(false);
        setUpdateCreditUsage(Date.now());

      } catch (error: any) {
        console.error("Error generating document:", error);
        setAiOutput(`Error generating document: ${error?.message || 'Unknown error'}`);
        setLoading(false);
      }
      return;
    }

    if (selectedTemplate?.slug === "document-summarizer") {
          try {
            const userId = user?.id || 'anonymous';
            const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
            const apiEndpoint = `${API_BASE_URL}/api/v1/document_summarization`;
    
            const documentSummarizingFormData = new FormData();
    
            // Add required fields from the form data
            documentSummarizingFormData.append('clerk_id', userId);
            documentSummarizingFormData.append('processing_type', formData.processing_type || '');
            documentSummarizingFormData.append('target_language', formData.target_language || '');
            documentSummarizingFormData.append('provider', 'google');
            
            // Add prompt as doc_text if available
            if (formData.prompt) {
              documentSummarizingFormData.append('doc_text', formData.prompt);
            }
    
            // Add main content file if available
            if (formData.file && formData.file instanceof File) {
              documentSummarizingFormData.append('doc_file', formData.file, formData.file.name);
              documentSummarizingFormData.append('doc_type', formData.file_type || '');
            }
            
            // Add file URL if available
            if (formData.file_url) {
              documentSummarizingFormData.append('doc_file_url', formData.file_url);
            }
    
            console.log('Document Summarizing request data being sent to API:', documentSummarizingFormData);
            setDocumentUrl(formData.file_url);
            // Log the FormData entries before sending
            console.log('Document Summarizing FormData entries:');
            for (let pair of documentSummarizingFormData.entries()) {
              console.log(pair[0], typeof pair[1] === 'object' ? 'File object: ' + pair[1].name : pair[1]);
            }
    
            const response = await fetch(apiEndpoint, {
              method: 'POST',
              credentials: 'include',
              body: documentSummarizingFormData,
            });
    
            console.log('Document summarizer API response status:', response.status);
    
            if (!response.ok) {
              const errorText = await response.text();
              console.error('Document summarizer API error response:', errorText);
              throw new Error(`Document summarizer API request failed with status ${response.status}: ${errorText}`);
            }
    
            const apiResponse = await response.json();
            console.log('Document summarizer API response:', apiResponse);
    
            // Process API response for the SummarizerDisplay component
            const summaryData = {
              detailed: apiResponse.text || "No detailed summary available",
              summary: apiResponse.summary || apiResponse.text || "No summary available",
              all: apiResponse.full_text || apiResponse.text || "No full content available",
              notes: apiResponse.notes || "No notes available",
            };
            
            console.log('Form Data Document Url:', formData.file_url);
            // Set document URL either from the API response or the original form input
            let documentUrl = apiResponse.source_url || formData.file_url || null;
            
            // Prepend the backend API URL if the document URL starts with '/static/'
            if (documentUrl && documentUrl.startsWith('/static/')) {
              const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
              documentUrl = `${API_BASE_URL}${documentUrl}`;
              console.log('Complete document URL:', documentUrl);
            }

            // Create a structured response for the SummarizerDisplay component
            const structuredResponse = {
              documentUrl: documentUrl,
              content: summaryData,
              title: apiResponse.title || "Document Summary",
              description: apiResponse.description || "",
              documentType: formData.file_type || "document"
            };

            // Set the AI output to the structured response JSON
            setAiOutput(JSON.stringify(structuredResponse));

            // Store document URL and summary data in state variables for direct access
            setDocumentUrl(documentUrl);
            setSummaryData(summaryData);
    
            await SaveInDb(
              JSON.stringify(formData),
              selectedTemplate?.slug,
              JSON.stringify(apiResponse)
            );
    
            setTotalUsage(totalUsage + 1);
            setLoading(false);
            setUpdateCreditUsage(Date.now());
    
          } catch (error: any) {
            console.error("Error generating document:", error);
            setAiOutput(`Error generating document: ${error?.message || 'Unknown error'}`);
            setLoading(false);
          }
          return;
        }

        if (selectedTemplate?.slug === "personalised-courses") {
          try {
            setLoading(true);
            
            // Extract data from form inputs
            const topicInput = formData.subject_topic || '';
            const lessonDescription = formData.lesson_description || '';
            const displayType = formData.display_type || 'mind_map';
            
            // Call personalization API directly
            const result = await personalizationApiClient.generatePersonalizedContent(
              topicInput,
              lessonDescription,
              displayType
            );

            console.log("Mind Map result", result);

            // For mind_map, parse the JSON string inside the markdown code block
            if (result && result.mind_map) {
              // Extract the JSON part from the markdown code block
              try {
                const jsonMatch = result.mind_map.match(/```json\n([\s\S]*?)\n```/) as RegExpMatchArray | null;
                if (jsonMatch && jsonMatch[1]) {
                  const parsedData = JSON.parse(jsonMatch[1]);
                  result.parsedMindMap = parsedData;
                  console.log("Successfully parsed mind map JSON:", parsedData);
                }
              } catch (parseError) {
                console.error("Error parsing mind map JSON:", parseError);
              }
            }
            
            // Set the AiOutput state to the entire result object
            // Important: Don't stringify the object when setting state
            setAiOutput(JSON.stringify(result));
            console.log("Setting AiOutput state with:", result);
            // Save result to database
            await SaveInDb(
              JSON.stringify(formData),
              selectedTemplate?.slug,
              JSON.stringify(result)
            );
            
            setTotalUsage(totalUsage + 1);
            setLoading(false);
            setUpdateCreditUsage(Date.now());
            
            // The PersonalizationDisplay component will now render the content
            return;
          } catch (error: any) {
            console.error("Error generating personalized content:", error);
            setAiOutput(`Error generating personalized content: ${error?.message || 'Unknown error'}`);
            setLoading(false);
            return;
          }
        }

    // Default AI generation for non-quiz templates
    const selectedPrompt = selectedTemplate?.aiPrompt;
    const FinalAIPrompt = JSON.stringify(formData) + ", " + selectedPrompt;

    const result = await chatSession.sendMessage(FinalAIPrompt);

    setAiOutput(result?.response.text());
    await SaveInDb(
      JSON.stringify(formData),
      selectedTemplate?.slug,
      result?.response.text()
    );
    setTotalUsage(totalUsage + 1); // Increment usage
    setLoading(false);
    setUpdateCreditUsage(Date.now());
  };

  const SaveInDb = async (formData: any, slug: any, aiResp: string) => {
    const result = await db.insert(AIOutput).values({
      formData: formData,
      templateSlug: slug,
      aiResponse: aiResp,
      createdBy: user?.primaryEmailAddress?.emailAddress,
      createdAt: moment().format("DD/MM/YYYY"),
    });

    console.log(result);
  };

  const [classboard, setClassboard] = useState('nodedisplay')

  return (
    <div className="p-5 bg-slate-100">
    <Link href={"/dashboard"}>
      <Button className="flex gap-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>
    </Link>

    {selectedTemplate?.slug === "live-class" ? (
      // Special layout for AI courses with diagram builder
      <>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 py-5">
          {/* Node Builder Panel - 1 column */}
          <div className="md:col-span-1 col-span-2">
            <RFFormSection 
              selectedTemplate={selectedTemplate}
              onAddNode={(node, data) => addNodeFunction && addNodeFunction(node, data)} 
            />
          </div>
          
          {/* Visual Flow Diagram - 3 columns */}
          <div className="md:col-span-3">
            <ClassDisplay onAddNode={setAddNodeFunction} />
          </div>
        </div>
      </>

    ) : selectedTemplate?.slug === "personalised-courses" ? (
      // Personalized courses with learning style cards
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 py-5">
        {/* Form Section - 1 column */}
        <div className="md:col-span-1">
          <FormSection
            selectedTemplate={selectedTemplate}
            userFormInput={(formData: any) => GenerateAIContent(formData)}
            loading={loading}
          />
        </div>
        
        {/* Course Output Display - 3 columns */}
        <div className="md:col-span-3">
        <PersonalizationDisplay 
            displayType= "mind_map"
            data={
              AiOutput && typeof AiOutput === 'string' ? 
                JSON.parse(AiOutput) : 
                AiOutput
            }
            isLoading={loading}
          />

        </div>
      </div>
    ) : selectedTemplate?.slug === "document-summarizer" ? (
      // Summarizer layout - stacked with form on top
      <div className="flex flex-col space-y-4 py-2">

        
        {/* Summarizer Display - full width */}
        <div className="w-full">
          {loading ? (
            <div className="flex items-center justify-center h-64 bg-white border rounded-lg shadow-md p-6">
              <Loader2Icon className="animate-spin mr-2" size={40} />
              <span>Processing document...</span>
            </div>
          ) : AiOutput ? (
            <SummarizerDisplay 
              documentUrl={documentUrl}
              summaryData={summaryData}
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-white border rounded-lg shadow-md p-6">
              <div className="text-center">
                <p className="text-gray-500 mb-2">Upload a document or provide a URL to generate a summary</p>
                <p className="text-sm text-gray-400">The summary will appear here with the document preview</p>
              </div>
            </div>
          )}
        </div>

                {/* Horizontal Form Section - full width, smaller height */}
                <div className="w-full">
          <HorizontalFormSection
            selectedTemplate={selectedTemplate}
            userFormInput={(formData: any) => GenerateAIContent(formData)}
            loading={loading}
          />
        </div>
      </div>
    ) : (
      // Regular layout for other templates
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 py-5">
        {/* Form Section */}
        <FormSection
          selectedTemplate={selectedTemplate}
          userFormInput={(formData: any) => GenerateAIContent(formData)}
          loading={loading}
        />

        {/* Combined Assessment Output Section */}
        <div className="col-span-2">
          {formativeAssessmentResults ? (
            <FormativeAssessmentResult
              assessmentId="generated-assessment-"
              assessmentTitle={formativeAssessmentResults.title || selectedTemplate?.name || "Formative Assessment"}
              score={formativeAssessmentResults.score}
              maxScore={formativeAssessmentResults.maxMark}
              results={formativeAssessmentResults}
            />
          ) : summativeAssessmentResults ? (
            <SummativeAssessment
              assessmentId="generated-assessment-"
              assessmentTitle={summativeAssessmentResults.title || selectedTemplate?.name || "Summative Assessment"}
              score={summativeAssessmentResults.score}
              maxScore={summativeAssessmentResults.maxMark}
              results={summativeAssessmentResults}
            />
          ) : (
            <OutputSection AiOutput={AiOutput} />
          )}
        </div>
      </div>
    )}

    {/* Alert Dialog */}
    <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Usage Limit Reached</AlertDialogTitle>
          <AlertDialogDescription>
            You have reached your usage limit. Please upgrade your plan or
            contact support.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setShowAlert(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              router.push("/dashboard/billing");
              setShowAlert(false);
            }}
          >
            Upgrade Plan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
  );
}

export default CreateContentSection;
