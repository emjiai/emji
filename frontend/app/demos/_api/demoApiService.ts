// API service for demo pages
// This service will access the same API endpoints as the main application,
// but with simplified authentication and error handling

/**
 * Sends a request to generate a quiz based on the provided form data
 * @param formData The quiz generation form data
 * @returns The generated quiz in the API response format
 */
export async function generateDemoQuiz(formData: FormData) {
  try {
    // Clone the formData to avoid modifying the original
    const enhancedFormData = new FormData();
    
    // Copy all existing values
    for (const [key, value] of formData.entries()) {
      enhancedFormData.append(key, value);
    }
    
    // Ensure required parameters are present for quiz_v2 endpoint
    if (!enhancedFormData.has('clerk_id')) {
      enhancedFormData.append('clerk_id', 'demo_user');
    }
    
    // Make sure topic and prompt are present (required parameters)
    if (!enhancedFormData.has('topic')) {
      const templateSlug = enhancedFormData.get('template_slug') || 'General Knowledge';
      enhancedFormData.append('topic', templateSlug.toString());
    }
    
    if (!enhancedFormData.has('prompt')) {
      enhancedFormData.append('prompt', 'Create a quiz based on the provided topic');
    }

    // Add other required parameters with defaults if not present
    if (!enhancedFormData.has('provider')) {
      enhancedFormData.append('provider', 'google');
    }
    
    if (!enhancedFormData.has('model')) {
      enhancedFormData.append('model', 'gemini-2.5-flash-preview-05-20');
    }
    
    if (!enhancedFormData.has('difficulty')) {
      enhancedFormData.append('difficulty', 'intermediate');
    }
    
    if (!enhancedFormData.has('num_questions')) {
      enhancedFormData.append('num_questions', '5');
    }

    // Log the parameters for debugging
    console.log('Sending request to /api/v1/quiz_v2 with parameters:', 
      Array.from(enhancedFormData.entries())
        .filter(([key]) => key !== 'file') // Don't log file contents
        .map(([key, value]) => `${key}: ${typeof value === 'string' ? value : '[File]'}`)
    );

    // Try with the full API path
    const response = await fetch('/api/v1/quiz_v2', {
      method: 'POST',
      body: enhancedFormData,
    });

    console.log('Response status:', response.status);

    // Handle error responses
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        // JSON error response
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.detail || 'Failed to generate quiz');
      } else {
        // Non-JSON error (like HTML)
        const textResponse = await response.text();
        console.error('Non-JSON error response:', textResponse.substring(0, 200) + '...');
        throw new Error(`Failed to generate quiz: Server returned ${response.status}`);
      }
    }

    // For successful responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      // Return the entire response data
      return await response.json();
    } else {
      // Handle unexpected non-JSON successful response
      const textResponse = await response.text();
      console.error('Unexpected non-JSON response:', textResponse.substring(0, 200) + '...');
      throw new Error('Server returned non-JSON response');
    }
  } catch (error) {
    console.error('Error generating demo quiz:', error);
    throw error;
  }
}

/**
 * Sends a request to generate a formative assessment based on the provided form data
 * @param formData The assessment generation form data
 * @returns The generated assessment result in the API response format
 */
export async function generateDemoAssessment(formData: FormData) {
  try {
    const response = await fetch('/api/v1/formative-assessment-demo', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate assessment');
    }

    const data = await response.json();
    
    // Return the content object from the response which contains the assessment data
    return data.content;
  } catch (error) {
    console.error('Error generating demo assessment:', error);
    throw error;
  }
}

/**
 * Sends a request to generate a document summary based on the provided form data
 * @param formData The document processing form data 
 * @returns The document summary in the API response format
 */
export async function generateDemoDocumentSummary(formData: FormData) {
  try {
    const response = await fetch('/api/v1/document_summarization', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate document summary');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating demo document summary:', error);
    throw error;
  }
}

/**
 * Sends a request to generate a comprehensive document analysis (summary, flashcards, mind map)
 * @param formData The document processing form data
 * @returns The document analysis in the API response format
 */
export async function generateDemoReadDocument(formData: FormData) {
  try {
    const response = await fetch('/api/v1/read-document-demo', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to process document');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}

/**
 * Sends a request to generate a comprehensive lesson plan
 * @param formData The lesson plan form data containing topic, grade level, time period, and subject
 * @returns The generated lesson plan in the API response format
 */
export async function generateDemoLessonPlan(formData: FormData) {
  try {
    const response = await fetch('/api/v1/lesson-plan', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate lesson plan');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating lesson plan:', error);
    throw error;
  }
}

/**
 * Helper function to prepare form data for API request
 * Handles both form inputs and file uploads
 * @param formValues Form values from the input form
 * @param templateSlug The template slug to use for the request
 * @returns FormData object ready to be sent to the API
 */
export function prepareFormData(formValues: Record<string, any>, templateSlug: string): FormData {
  const formData = new FormData();
  
  // Add template slug to identify which template is being used
  formData.append('template_slug', templateSlug);
  
  // Process each form value
  Object.entries(formValues).forEach(([key, value]) => {
    // Handle file uploads
    if (value instanceof File) {
      formData.append('file', value);
      formData.append('file_type', value.type);
    } 
    // Handle arrays by JSON stringifying them
    else if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } 
    // Handle regular form values
    else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  
  return formData;
}
