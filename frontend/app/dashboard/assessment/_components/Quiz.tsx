'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
// Ensure QuizQuestion import path is correct and doesn't include front/back if removed from its props
import QuizQuestion, { QuestionData, Option } from './QuizQuestion';
import QuizAnswer from './QuizAnswer';
import { ArrowLeft, ArrowRight, Timer } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
// Import the new flashcard components
import FlashCardQuestion, { FlashCardData } from './FlashCardQuestion';
import FlashCardAnswer from './FlashCardAnswer';


// Interface for original question data structure (might still include front/back from source)
// Note: The QuestionData imported from QuizQuestion might have front/back removed.
// If QuizData needs to retain them for mapping to FlashCardData, define it explicitly here or adjust QuizQuestion's export.
interface OriginalQuestionData extends QuestionData {
    front?: string;
    back?: string;
    // Include other fields from QuestionData if necessary
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  timeLimit?: number;
  difficulty?: string;
  category?: string;
  // Use the original structure that might contain front/back
  questions: OriginalQuestionData[];
}

interface QuizResult {
  questionId: string;
  userAnswer: string | string[]; // Can be string or array
  isCorrect: boolean;
  question: string;
  correctAnswer: string | string[]; // Can be string or array
  explanation?: string;
  questionType?: string; // Pass type for potential display logic
  options?: Option[]; // Add options to display all choices in the results
}

interface QuizProps {
  quizData: QuizData;
  onComplete?: (results: { score: number; answers: Record<string, string | string[]> }) => void; // Answers can be string or array
  onBack?: () => void;
}

const Quiz: React.FC<QuizProps> = ({ quizData, onComplete, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // State to hold answers for non-flashcard questions
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]); // For non-flashcard results display
  const [timeRemaining, setTimeRemaining] = useState(quizData.timeLimit ? quizData.timeLimit * 60 : 0);
  const [isTimerActive, setIsTimerActive] = useState(!!quizData.timeLimit && !quizData.questions.every(q => q.type === 'flashcard')); // Timer active only if timeLimit exists AND it's not a flashcard session

  // --- State for Flashcards ---
  const [flashCardResults, setFlashCardResults] = useState<Record<string, boolean>>({}); // { cardId: isKnown }
  const [isFlashcardSession, setIsFlashcardSession] = useState(false); // Track if it's purely a flashcard quiz

  // --- Effects ---



  // Determine if this is a flashcard-only session when quizData changes
  useEffect(() => {
    if (quizData?.questions?.length > 0) {
      const allFlashcards = quizData.questions.every(q => q.type === 'flashcard');
      setIsFlashcardSession(allFlashcards);
      // Also update timer status based on session type
      setIsTimerActive(!!quizData.timeLimit && !allFlashcards);
    } else {
      setIsFlashcardSession(false);
      setIsTimerActive(false); // No questions, no timer
    }
  }, [quizData]); // Rerun when quizData changes


  // --- Callbacks ---

  // Answer Selection Handler (Only for non-flashcard questions)
  const handleAnswerSelected = useCallback((questionId: string, answer: string | string[]) => {
    if (!isFlashcardSession) { // Only update answers for regular quiz types
        setAnswers(prev => ({
        ...prev,
        [questionId]: answer
        }));
    }
  }, [isFlashcardSession]); // Dependency added


  // Navigation Handlers (Only for non-flashcard questions)
  const handleNext = useCallback(() => {
    if (!isFlashcardSession && currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex, quizData.questions.length, isFlashcardSession]); // Dependency added

  const handlePrevious = useCallback(() => {
    if (!isFlashcardSession && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex, isFlashcardSession]); // Dependency added


  // Score Calculation (Only for non-flashcard questions)
  const calculateScore = useCallback(() => {
    let correctCount = 0;
    const quizResults: QuizResult[] = [];

     // Filter out flashcard questions before calculating score for mixed quizzes if needed
     // Or simply ensure this is only called when !isFlashcardSession
    const relevantQuestions = quizData.questions.filter(q => q.type !== 'flashcard');

    relevantQuestions.forEach(question => {
       const userAnswer = answers[question.id];
       let isCorrect = false;
       let correctAnswerForDisplay: string | string[] = 'N/A';

       switch (question.type) {
         case 'multiple_choice':
         case 'true_false':
           isCorrect = userAnswer === question.correct_answer;
           correctAnswerForDisplay = question.options?.find(opt => opt.id === question.correct_answer)?.text || question.correct_answer || 'N/A';
           break;
         case 'short_answer':
            // Ensure correct_answer exists and is a string for comparison
            isCorrect = typeof userAnswer === 'string' &&
                        typeof question.correct_answer === 'string' &&
                        userAnswer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase();
            correctAnswerForDisplay = question.correct_answer || 'N/A';
            break;
         // Removed 'flashcard' case here - it's handled separately
         case 'fill_blanks':
           isCorrect = Array.isArray(userAnswer) &&
                       Array.isArray(question.correct_answers) &&
                       userAnswer.length === question.correct_answers.length &&
                       userAnswer.every((ans, i) => typeof ans === 'string' && typeof question.correct_answers?.[i] === 'string' && ans.trim().toLowerCase() === question.correct_answers[i].trim().toLowerCase());
           correctAnswerForDisplay = question.correct_answers || [];
           break;
         default:
           isCorrect = false;
       }

       if (isCorrect) {
         correctCount++;
       }

       quizResults.push({
         questionId: question.id,
         userAnswer: userAnswer ?? '', // Provide fallback for undefined
         isCorrect,
          // Use question.text or provide a fallback
         question: question.text || `Question ID: ${question.id}`,
         correctAnswer: correctAnswerForDisplay,
         explanation: question.explanation,
         questionType: question.type,
         options: question.options
       });
     });

    return {
      score: correctCount,
      results: quizResults,
       // Return total relevant questions for percentage calculation if needed
      totalQuestions: relevantQuestions.length
    };
  }, [answers, quizData.questions]);


  // Submit Handler (Handles both quiz types)
  const handleSubmit = useCallback(() => {
    setIsSubmitted(true);
    setIsTimerActive(false); // Stop timer on any submit

    if (isFlashcardSession) {
      // Flashcard session finished, results are in flashCardResults state
      console.log("Flashcard session finished, results:", flashCardResults);
      if (onComplete) {
        // Format flashcard results for onComplete if necessary
        const formattedAnswers = Object.entries(flashCardResults).reduce((acc, [id, known]) => {
          acc[id] = known ? 'known' : 'unknown'; // Example format
          return acc;
        }, {} as Record<string, string | string[]>); // Match onComplete type
        const score = Object.values(flashCardResults).filter(known => known).length;
        onComplete({ score: score, answers: formattedAnswers });
      }
    } else {
      // Regular quiz submission
      const { score: calculatedScore, results: quizResults } = calculateScore();
      setScore(calculatedScore);
      setResults(quizResults);
      if (onComplete) {
         // Pass the original answers map for regular quizzes
         onComplete({ score: calculatedScore, answers });
       }
     }
  }, [calculateScore, onComplete, answers, isFlashcardSession, flashCardResults]); // Added dependencies


  // Retake Handler (Resets state for both types)
  const handleRetakeQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setResults([]);
    setFlashCardResults({}); // Reset flashcard results
    // Re-determine session type and timer status based on quizData
    const allFlashcards = quizData.questions.every(q => q.type === 'flashcard');
    setIsFlashcardSession(allFlashcards);
    setTimeRemaining(quizData.timeLimit ? quizData.timeLimit * 60 : 0);
    setIsTimerActive(!!quizData.timeLimit && !allFlashcards);
  }, [quizData]); // Depends on quizData

    // Timer Effect (Only runs if isTimerActive is true)
    useEffect(() => {
      let timer: NodeJS.Timeout;
      // Only activate timer if it's enabled and not a flashcard session
      if (isTimerActive && timeRemaining > 0 && !isSubmitted) {
        timer = setTimeout(() => {
          setTimeRemaining(prev => prev - 1);
        }, 1000);
      } else if (isTimerActive && timeRemaining === 0 && !isSubmitted) {
        handleSubmit(); // Auto-submit when timer runs out (only for non-flashcard quizzes)
      }
      return () => clearTimeout(timer);
       // Ensure dependencies are correct
     }, [timeRemaining, isTimerActive, isSubmitted, handleSubmit]); // Added handleSubmit dependency
  

  // Format Time Helper
  const formatTime = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };


  // --- Render Logic ---

  // Render Results View
  if (isSubmitted) {
    // If it was a flashcard session, show the dedicated FlashCardAnswer
    if (isFlashcardSession) {
       // Map questions to FlashCardData format for potential review in FlashCardAnswer
       const flashcardQuestions = quizData.questions
           .filter(q => q.type === 'flashcard')
           .map(q => ({
                id: q.id,
                front: q.front || '', // Add fallbacks if needed
                back: q.back || '',
                explanation: q.explanation
            })) as FlashCardData[];

        return (
            <FlashCardAnswer
                 quizId={quizData.id}
                 quizTitle={quizData.title}
                 results={flashCardResults}
                 totalCards={flashcardQuestions.length}
                 onRetakeSession={handleRetakeQuiz} // Use the retake logic
                 onBack={onBack}
                 // Optionally pass cards for detailed review: cards={flashcardQuestions}
             />
         );
     } else {
       // Otherwise, show the standard QuizAnswer for regular quizzes
       const totalQuestionsForResult = quizData.questions.filter(q => q.type !== 'flashcard').length || quizData.questions.length; // Calculate total non-flashcard questions or total if mixed incorrectly
       return (
         <QuizAnswer
           quizId={quizData.id}
           quizTitle={quizData.title}
           score={score} // Calculated score for non-flashcards
            // Ensure totalQuestions reflects the number of scored questions
           totalQuestions={totalQuestionsForResult}
           results={results} // Pass detailed non-flashcard results
           onRetakeQuiz={handleRetakeQuiz}
           onContinue={onBack} // Use onBack for the continue action
         />
       );
     }
   }

  // Render Quiz View (Either Flashcards or Regular Quiz)

  // If it's a flashcard session, render FlashCardQuestion covering all cards
  if (isFlashcardSession) {
     // Prepare data in FlashCardData format, ensure front/back exist
      const flashcards: FlashCardData[] = quizData.questions
          .filter(q => q.type === 'flashcard' && q.front && q.back) // Ensure required fields
          .map(q => ({
              id: q.id,
              front: q.front!, // Use non-null assertion or fallback ''
              back: q.back!,
              explanation: q.explanation
           }));

     return (
         <FlashCardQuestion
             cards={flashcards}
             onSessionComplete={(results) => {
                 setFlashCardResults(results);
                 handleSubmit(); // Trigger submit logic after flashcards are done
             }}
             onBack={onBack} // Allow going back before completion
         />
     );
   }

  // --- Else: Render Regular Quiz Interface ---
  const currentQuestion = quizData.questions[currentQuestionIndex]; // Get current non-flashcard question

   // Check if *any* answer exists for the current non-flashcard question ID
   const hasAnsweredCurrent = currentQuestion?.id && answers[currentQuestion.id] !== undefined &&
       ( (typeof answers[currentQuestion.id] === 'string' && (answers[currentQuestion.id] as string).length > 0) ||
         (Array.isArray(answers[currentQuestion.id]) && (answers[currentQuestion.id] as string[]).every(a => a?.length > 0)) // Check if array elements have content
       );

   // Check if *all* non-flashcard questions have been answered
   const allQuestionsAnswered = !isFlashcardSession && quizData.questions
       .filter(q => q.type !== 'flashcard') // Only consider non-flashcard questions
       .every(q =>
           answers[q.id] !== undefined &&
           ( (typeof answers[q.id] === 'string' && (answers[q.id] as string).trim().length > 0) ||
             (Array.isArray(answers[q.id]) && (answers[q.id] as string[]).every(a => a?.trim().length > 0)) // Check trimmed length for arrays too
           )
       );

  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;

  // Ensure we don't try to render if the current question is somehow undefined or a flashcard in this block
  if (!currentQuestion || currentQuestion.type === 'flashcard') {
       // Handle edge case or loading state if necessary
       // Maybe navigate to the next valid question or show an error/loading indicator
       // For now, return null or a placeholder
       console.warn("Trying to render non-flashcard view, but currentQuestion is invalid.", currentQuestion);
       // Simple fallback: Try finding next non-flashcard question if possible
       const nextNonFlashcardIndex = quizData.questions.findIndex((q, index) => index > currentQuestionIndex && q.type !== 'flashcard');
       if (nextNonFlashcardIndex !== -1) {
           setCurrentQuestionIndex(nextNonFlashcardIndex);
       } else if (!isSubmitted) {
           // If no more valid questions and not submitted, maybe auto-submit?
           // Or show a message? For now, just render nothing.
       }
        return null; // Avoid rendering QuizQuestion with wrong data
   }


  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-2">
        <div className="text-center sm:text-left">
          <h2 className="text-xl md:text-2xl font-bold">{quizData.title}</h2>
          <p className="text-sm md:text-base text-gray-600">{quizData.description}</p>
        </div>
        {/* Timer only shown if active (non-flashcard and has time limit) */}
        {isTimerActive && (
          <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-md flex-shrink-0">
            <Timer className="mr-2 h-4 w-4 text-gray-600" />
            <span className={`font-medium text-sm ${timeRemaining < 60 ? 'text-red-600' : 'text-gray-800'}`}>
              {formatTime()}
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar (only for non-flashcard quizzes) */}
      {!isFlashcardSession && (
          <div className="mb-4 bg-white rounded-md p-3 md:p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs md:text-sm text-gray-600">
                {/* Adjust progress text if needed for mixed quizzes */}
                Question {currentQuestionIndex + 1} of {quizData.questions.length}
              </span>
            </div>
            <Progress value={((currentQuestionIndex + 1) / quizData.questions.length) * 100} className="h-2" />
          </div>
      )}

      {/* Current Question (Render using QuizQuestion for non-flashcards) */}
      {currentQuestion && !isFlashcardSession && (
        <QuizQuestion
          key={currentQuestion.id} // Key ensures component remounts if ID changes
          {...currentQuestion} // Pass all relevant props from the current question object
          onAnswerSelected={handleAnswerSelected}
          selectedAnswer={answers[currentQuestion.id]}
          isSubmitted={false} // Always false during quiz taking phase
        />
      )}

      {/* Navigation Buttons (only for non-flashcard quizzes) */}
      {!isFlashcardSession && (
         <div className="flex justify-between mt-6">
           <Button
             variant="outline"
             onClick={handlePrevious}
             disabled={currentQuestionIndex === 0}
             className="flex items-center"
           >
             <ArrowLeft className="mr-2 h-4 w-4" />
             Previous
           </Button>

           {isLastQuestion ? (
             <Button
               onClick={handleSubmit}
               disabled={!allQuestionsAnswered} // Submit enabled only when all non-flashcards answered
               className={`flex items-center ${!allQuestionsAnswered ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
             >
               Submit Quiz
             </Button>
           ) : (
             <Button
               onClick={handleNext}
               // disabled={!hasAnsweredCurrent} // Optional: Force answer before next
               className="flex items-center"
             >
               Next
               <ArrowRight className="ml-2 h-4 w-4" />
             </Button>
           )}
         </div>
      )}
    </div>
  );
};

export default Quiz;

// 'use client';

// import React, { useState, useEffect, useCallback } from 'react';
// import { Button } from '@/components/ui/button';
// import QuizQuestion, { QuestionData, Option } from './QuizQuestion'; // Import updated QuestionData
// import QuizAnswer from './QuizAnswer';
// import { ArrowLeft, ArrowRight, Timer } from 'lucide-react';
// import { Progress } from '@/components/ui/progress'; // Added this import
// import FlashCardQuestion, { FlashCardData } from './FlashCardQuestion';
// import FlashCardAnswer from './FlashCardAnswer';

// // Re-define interfaces locally or import if shared
// // interface Option { id: string; text: string; } // Already in QuizQuestion
// // interface Question extends QuestionData {} // Use imported QuestionData

// interface QuizData {
//   id: string;
//   title: string;
//   description: string;
//   timeLimit?: number;
//   difficulty?: string;
//   category?: string;
//   questions: QuestionData[]; // Use the detailed QuestionData interface
// }

// interface QuizResult {
//   questionId: string;
//   userAnswer: string | string[]; // Can be string or array
//   isCorrect: boolean;
//   question: string;
//   correctAnswer: string | string[]; // Can be string or array
//   explanation?: string;
//   questionType?: string; // Pass type for potential display logic
//   options?: Option[]; // Add options to display all choices in the results
// }

// interface QuizProps {
//   quizData: QuizData;
//   onComplete?: (results: { score: number; answers: Record<string, string | string[]> }) => void; // Answers can be string or array
//   onBack?: () => void;
// }

// const Quiz: React.FC<QuizProps> = ({ quizData, onComplete, onBack }) => {
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   // State to hold answers - value can be string (MC, TF, Short, Flashcard) or string[] (FillBlanks)
//   const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [score, setScore] = useState(0);
//   const [results, setResults] = useState<QuizResult[]>([]);
//   const [timeRemaining, setTimeRemaining] = useState(quizData.timeLimit ? quizData.timeLimit * 60 : 0);
//   const [isTimerActive, setIsTimerActive] = useState(!!quizData.timeLimit);
//   const [flashCardResults, setFlashCardResults] = useState<Record<string, boolean>>({});
// const [isFlashcardSession, setIsFlashcardSession] = useState(false);

//   // Timer Effect
//   useEffect(() => {
//     let timer: NodeJS.Timeout;
//     if (isTimerActive && timeRemaining > 0 && !isSubmitted) {
//       timer = setTimeout(() => {
//         setTimeRemaining(prev => prev - 1);
//       }, 1000);
//     } else if (isTimerActive && timeRemaining === 0 && !isSubmitted) {
//       handleSubmit(); // Auto-submit when timer runs out
//     }
//     // Added isSubmitted to dependency array for correctness
//     return () => clearTimeout(timer);
//   }, [timeRemaining, isTimerActive, isSubmitted]); // Rerun when these change

//   useEffect(() => {
//     if (quizData?.questions?.length > 0) {
//       const allFlashcards = quizData.questions.every(q => q.type === 'flashcard');
//       setIsFlashcardSession(allFlashcards);
//     } else {
//       setIsFlashcardSession(false);
//     }
//   }, [quizData]);

//   // Answer Selection Handler (Memoized)
//   const handleAnswerSelected = useCallback((questionId: string, answer: string | string[]) => {
//     setAnswers(prev => ({
//       ...prev,
//       [questionId]: answer
//     }));
//   }, []); // No dependencies needed as setAnswers is stable

//   // Navigation Handlers (Memoized)
//   const handleNext = useCallback(() => {
//     if (currentQuestionIndex < quizData.questions.length - 1) {
//       setCurrentQuestionIndex(prev => prev + 1);
//     }
//   }, [currentQuestionIndex, quizData.questions.length]);

//   const handlePrevious = useCallback(() => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(prev => prev - 1);
//     }
//   }, [currentQuestionIndex]);

//   // Score Calculation (Memoized based on answers and quizData)
//   const calculateScore = useCallback(() => {
//     let correctCount = 0;
//     const quizResults: QuizResult[] = [];

//     quizData.questions.forEach(question => {
//       const userAnswer = answers[question.id]; // Can be string, string[], or undefined
//       let isCorrect = false;
//       let correctAnswerForDisplay: string | string[] = 'N/A'; // Store the answer to show user

//       // Determine correctness based on question type
//       switch (question.type) {
//         case 'multiple_choice':
//         case 'true_false':
//           isCorrect = userAnswer === question.correct_answer;
//           correctAnswerForDisplay = question.options?.find(opt => opt.id === question.correct_answer)?.text || question.correct_answer || 'N/A';
//           break;
//         case 'short_answer':
//           isCorrect = typeof userAnswer === 'string' &&
//                       typeof question.correct_answer === 'string' &&
//                       userAnswer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase();
//           correctAnswerForDisplay = question.correct_answer || 'N/A';
//           break;
//         case 'flashcard':
//            // Compare user's text input (answer) with the correct 'back' text
//            isCorrect = typeof userAnswer === 'string' &&
//                        typeof question.back === 'string' &&
//                        userAnswer.trim().toLowerCase() === question.back.trim().toLowerCase();
//            correctAnswerForDisplay = question.back || 'N/A';
//            break;
//         case 'fill_blanks':
//            // Compare array of user inputs with correct answers array
//            isCorrect = Array.isArray(userAnswer) &&
//                        Array.isArray(question.correct_answers) &&
//                        userAnswer.length === question.correct_answers.length &&
//                        userAnswer.every((ans, i) => typeof ans === 'string' && typeof question.correct_answers?.[i] === 'string' && ans.trim().toLowerCase() === question.correct_answers[i].trim().toLowerCase());
//             correctAnswerForDisplay = question.correct_answers || [];
//            break;
//         default:
//           isCorrect = false;
//       }

//       if (isCorrect) {
//         correctCount++;
//       }

//       // Add result details for display
//       quizResults.push({
//         questionId: question.id,
//         userAnswer: userAnswer || '', // Ensure it's at least an empty string/array
//         isCorrect,
//         question: question.text,
//         correctAnswer: correctAnswerForDisplay, // Use the formatted correct answer
//         explanation: question.explanation,
//         questionType: question.type,
//         options: question.options
//       });
//     });

//     return {
//       score: correctCount,
//       results: quizResults
//     };
//   }, [answers, quizData.questions]); // Recalculate only if answers or questions change

//   // Submit Handler (Memoized)
//   // Added calculateScore to dependency array as it's used inside
//   const handleSubmit = useCallback(() => {
//     const { score: calculatedScore, results: quizResults } = calculateScore();
//     setScore(calculatedScore);
//     setResults(quizResults);
//     setIsSubmitted(true);
//     setIsTimerActive(false); // Stop timer on submit
//     if (onComplete) {
//       onComplete({ score: calculatedScore, answers });
//     }
//   }, [calculateScore, onComplete, answers]); // Depends on calculateScore result

//   // Retake Handler (Memoized)
//   const handleRetakeQuiz = useCallback(() => {
//     setCurrentQuestionIndex(0);
//     setAnswers({});
//     setIsSubmitted(false);
//     setScore(0);
//     setResults([]);
//     setTimeRemaining(quizData.timeLimit ? quizData.timeLimit * 60 : 0);
//     setIsTimerActive(!!quizData.timeLimit);
//   }, [quizData.timeLimit]); // Depends only on timeLimit

//   // Format Time Helper
//   const formatTime = () => {
//     const minutes = Math.floor(timeRemaining / 60);
//     const seconds = timeRemaining % 60;
//     return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
//   };

//   // Render Results View
//   if (isSubmitted) {
//     return (
//       <QuizAnswer
//         quizId={quizData.id}
//         quizTitle={quizData.title}
//         score={score}
//         totalQuestions={quizData.questions.length}
//         results={results} // Pass detailed results
//         onRetakeQuiz={handleRetakeQuiz}
//         onContinue={onBack}
//       />
//     );
//   }

//   // Render Quiz View
//   const currentQuestion = quizData.questions[currentQuestionIndex];
//   // Check if *any* answer exists for the current question ID
//   // Refined check for fill_blanks to ensure all blanks are attempted
//   const hasAnsweredCurrent = answers[currentQuestion?.id] !== undefined &&
//                              ( (typeof answers[currentQuestion?.id] === 'string' && (answers[currentQuestion?.id] as string).length > 0) ||
//                                (Array.isArray(answers[currentQuestion?.id]) && (answers[currentQuestion?.id] as string[]).every(a => a.length > 0)) ); // Check all blanks filled for fill_blanks

//   // Check if *all* questions have been answered (handles different answer types)
//   const allQuestionsAnswered = quizData.questions.every(q => answers[q.id] !== undefined &&
//                                                           ( (typeof answers[q.id] === 'string' && (answers[q.id] as string).length > 0) ||
//                                                             (Array.isArray(answers[q.id]) && (answers[q.id] as string[]).every(a => a.length > 0)) ) );
//   const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;

//   return (
//     <div className="max-w-3xl mx-auto p-4">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-2">
//         <div className="text-center sm:text-left">
//           <h2 className="text-xl md:text-2xl font-bold">{quizData.title}</h2>
//           <p className="text-sm md:text-base text-gray-600">{quizData.description}</p>
//         </div>
//         {quizData.timeLimit && (
//           <div className="flex items-center bg-gray-100 px-3 py-1.5 rounded-md flex-shrink-0">
//             <Timer className="mr-2 h-4 w-4 text-gray-600" />
//             <span className={`font-medium text-sm ${timeRemaining < 60 ? 'text-red-600' : 'text-gray-800'}`}>
//               {formatTime()}
//             </span>
//           </div>
//         )}
//       </div>

//       {/* Progress Bar */}
//       <div className="mb-4 bg-white rounded-md p-3 md:p-4 border border-gray-200">
//         <div className="flex justify-between items-center mb-2">
//           <span className="text-xs md:text-sm text-gray-600">
//             Question {currentQuestionIndex + 1} of {quizData.questions.length}
//           </span>
//           {/* Optional: Mini progress dots */}
//           {/* <div className="flex space-x-1">...</div> */}
//         </div>
//         {/* Progress component usage - now import should work */}
//         <Progress value={((currentQuestionIndex + 1) / quizData.questions.length) * 100} className="h-2" />
//       </div>

//       {/* Current Question */}
//       {currentQuestion && (
//         <QuizQuestion
//           key={currentQuestion.id} // Key ensures component remounts if question ID changes (useful for state reset if needed)
//           {...currentQuestion} // Spread all properties from QuestionData
//           onAnswerSelected={handleAnswerSelected}
//           selectedAnswer={answers[currentQuestion.id]}
//           isSubmitted={false} // Pass false during quiz taking phase
//           // Pass correct answer details only if needed during quiz (usually not)
//         />
//       )}

//       {/* Navigation Buttons */}
//       <div className="flex justify-between mt-6">
//         <Button
//           variant="outline"
//           onClick={handlePrevious}
//           disabled={currentQuestionIndex === 0}
//           className="flex items-center"
//         >
//           <ArrowLeft className="mr-2 h-4 w-4" />
//           Previous
//         </Button>

//         {isLastQuestion ? (
//           <Button
//             onClick={handleSubmit}
//             disabled={!allQuestionsAnswered} // Enable submit only when all questions are answered
//             className="flex items-center bg-green-600 hover:bg-green-700"
//           >
//             Submit Quiz
//           </Button>
//         ) : (
//           <Button
//             onClick={handleNext}
//             // disabled={!hasAnsweredCurrent} // Optional: force answering before next
//             className="flex items-center"
//           >
//             Next
//             <ArrowRight className="ml-2 h-4 w-4" />
//           </Button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Quiz;
