/**
 * QuizApiClient.ts
 * Handles API interactions for generating quizzes
 */

export interface QuizRequestData {
  clerk_id: string;
  prompt: string;
  num_questions: number;
  difficulty: string;
  provider: string;
  model: string;
  question_types: string[];
  file_url?: string;
  file_type?: string;
}

/**
 * Sends a quiz generation request to the API using FormData
 */
export async function generateQuiz(quizRequestData: QuizRequestData) {
  // Create a FormData object
  const formData = new FormData();
  
  // Add all fields to the FormData
  formData.append('clerk_id', quizRequestData.clerk_id);
  formData.append('prompt', quizRequestData.prompt);
  formData.append('num_questions', quizRequestData.num_questions.toString());
  formData.append('difficulty', quizRequestData.difficulty);
  formData.append('provider', quizRequestData.provider);
  formData.append('model', quizRequestData.model);
  
  // Handle array parameter
  quizRequestData.question_types.forEach(type => {
    formData.append('question_types', type);
  });
  
  // Add optional parameters if they exist
  if (quizRequestData.file_url) {
    formData.append('file_url', quizRequestData.file_url);
  }
  
  if (quizRequestData.file_type) {
    formData.append('file_type', quizRequestData.file_type);
  }
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  // Send the request
  const apiEndpoint = `${API_BASE_URL}/api/content/quiz`;
  console.log('Sending quiz request to:', apiEndpoint);
  
  const response = await fetch(apiEndpoint, {
    method: "POST",
    credentials: "include",
    body: formData // Send FormData in the request body
  });
  
  console.log('API response status:', response.status);
  
  if (!response.ok) {
    // Try to get the error message from the response body
    const errorText = await response.text();
    console.error('API error response:', errorText);
    throw new Error(`API request failed with status ${response.status}: ${errorText}`);
  }
  
  return await response.json();
}
