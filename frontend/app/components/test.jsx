// "use client";

// import React, { useState, useEffect } from "react";

// /**
//  * A test component to demonstrate proper FormData handling with file uploads
//  * This shows exactly how FormData should be constructed with files and other fields
//  */
// export default function TestFormData() {
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Test function to demonstrate proper FormData creation and API submission
//   const testFormDataSubmission = async () => {
//     setLoading(true);
    
//     try {
//       // Create a FormData object exactly as it would be in a real form submission
//       const formData = new FormData();
      
//       // Add standard form fields
//       formData.append('clerk_id', 'user_2vFzPt1XmKYNS9jmY6k9yHQclOR');
//       formData.append('topic', 'ARC ESM');
//       formData.append('prompt', 'Create a quiz about the MoU');
//       formData.append('provider', 'openai');
//       formData.append('model', 'gpt-4o');
//       formData.append('num_questions', '6');
//       formData.append('difficulty', 'medium');
      
//       // Add question types as separate entries
//       formData.append('question_types', 'multiple_choice');
//       formData.append('question_types', 'true_false');
      
//       // IMPORTANT: Import the file - for testing we'll use a fetch to get it as a Blob
//       const fileResponse = await fetch('/Workerbull Limited (SooS) and ARC ESM MoU.pdf');
//       const fileBlob = await fileResponse.blob();
      
//       // Create a File object from the Blob with the correct name and type
//       const file = new File([fileBlob], 'Workerbull Limited (SooS) and ARC ESM MoU.pdf', { type: 'application/pdf' });
      
//       // Add file to FormData
//       formData.append('file', file);
      
//       // IMPORTANT: Set file_type explicitly - this is crucial
//       formData.append('file_type', 'pdf');
      
//       // For debugging, log the content of FormData
//       console.log('FormData entries:');
//       for (let pair of formData.entries()) {
//         console.log(pair[0], typeof pair[1] === 'object' ? 'File object: ' + pair[1].name : pair[1]);
//       }
      
//       // Send the form data to the backend API
//       const response = await fetch('http://localhost:8000/api/content/quiz', {
//         method: 'POST',
//         body: formData,
//         // Do not set Content-Type - browser will set it correctly with boundary
//       });
      
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`API request failed: ${errorText}`);
//       }
      
//       const data = await response.json();
//       setResult(data);
      
//     } catch (error) {
//       console.error('Error in test submission:', error);
//       setResult({ error: error.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-4">FormData Test for File Uploads</h1>
      
//       <button 
//         onClick={testFormDataSubmission}
//         disabled={loading}
//         className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md mb-4"
//       >
//         {loading ? 'Testing...' : 'Test FormData with File Upload'}
//       </button>
      
//       <div className="mt-4">
//         <h2 className="text-xl font-semibold mb-2">Results:</h2>
//         <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
//           {result ? JSON.stringify(result, null, 2) : 'No results yet'}
//         </pre>
//       </div>
//     </div>
//   );
// }
