'use client';

import React, { useState } from 'react';
// Assuming these imports are correctly pointing to your UI components
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, CheckCircle, XCircle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

// Interface for individual question options
interface QuizOption {
  id: string; // e.g., 'a', 'b', 'opt1'
  text: string; // e.g., 'Paris', '75%', 'True'
}

// Interface for individual question result details
interface QuizResult {
  questionId: string; // Unique identifier for the question
  userAnswer: string | string[] | undefined; // User's selected answer ID(s) or text for fill-in, or undefined if skipped
  isCorrect: boolean; // Whether the user's answer was correct
  question: string; // The text of the question
  correctAnswer: string | string[]; // The correct answer ID(s) or text
  explanation?: string; // Optional explanation for the answer
  questionType?: string; // Optional: Type of question (e.g., 'multiple-choice', 'fill-blank')
  options?: QuizOption[]; // *** CRUCIAL: Array of options for this question (needed for text lookup) ***
}

// Interface for the props accepted by the QuizAnswer component
interface QuizAnswerProps {
  quizId: string; // Identifier for the quiz
  quizTitle: string; // Title of the quiz
  score: number; // Number of questions answered correctly
  totalQuestions: number; // Total number of questions in the quiz
  results: QuizResult[]; // Array containing detailed results for each question (must include options)
  onRetakeQuiz: () => void; // Function to call when the 'Retake Quiz' button is clicked
  onContinue?: () => void; // Optional function for a 'Continue' button
}

/**
 * QuizAnswer Component
 * Displays the results of a completed quiz, including score, percentage,
 * feedback, and detailed answer review.
 */
const QuizAnswer: React.FC<QuizAnswerProps> = ({
  quizId,
  quizTitle,
  score,
  totalQuestions,
  results, // This array *must* contain the 'options' field for each result item
  onRetakeQuiz,
  onContinue,
}) => {
  // State to control the visibility of the detailed results section
  const [showDetails, setShowDetails] = useState(false);

  // Calculate the score percentage, handling division by zero
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  // Count the number of correct answers
  const correctAnswers = results.filter(result => result.isCorrect).length;

  /**
   * Provides feedback text based on the calculated percentage score.
   * @returns {string} Feedback message.
   */
  const getFeedbackMessage = (): string => {
    if (percentage >= 90) return "Excellent work! You've mastered this material.";
    if (percentage >= 75) return "Great job! You have a strong understanding.";
    if (percentage >= 60) return "Good effort! Reviewing explanations might help.";
    if (percentage >= 40) return "Making progress! Focus on the explanations.";
    return "Keep practicing! Review the material and try again.";
  };

  /**
   * Formats an answer for display.
   * - For multiple-choice, it looks up the text corresponding to the answer ID using the `result.options`.
   * - For arrays (e.g., fill-blanks), it joins the elements.
   * - Provides fallbacks if data is missing.
   * @param {string | string[] | undefined} answer - The answer ID, array of answers, or undefined.
   * @param {QuizResult | undefined} result - The full result object, needed to access `options`.
   * @returns {string} The formatted answer text for display.
   */
  const formatAnswerForDisplay = (answer: string | string[] | undefined, result?: QuizResult): string => {
      // Handle array answers (e.g., fill-in-the-blank with multiple parts)
      if (Array.isArray(answer)) {
          return answer.join(', '); // Join parts with a comma
      }
      // Handle string answers (most common case, e.g., multiple-choice ID)
      if (typeof answer === 'string') {
          // Check if options are available in the result object
          if (result?.options) {
              // Find the option object matching the answer ID
              const option = result.options.find(opt => opt.id === answer);
              // If found, return the option's text; otherwise, fallback to the ID itself
              return option ? option.text : answer;
          } else {
              // If options are not available for this result, return the answer ID/string directly
              return answer;
          }
      }
      // Handle cases where the answer is undefined (e.g., question skipped)
       // Use 'as unknown as string' to satisfy TypeScript when returning JSX - consider a different approach if rendering complex elements here
      return <span className="italic text-gray-500">No answer</span> as unknown as string;
  };


  return (
    // Main container for the results page
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 max-w-3xl mx-auto font-sans"> {/* Added font-sans */}
      {/* Header Section */}
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">{quizTitle} - Results</h2>
        <p className="text-sm md:text-base text-gray-600 mt-1">Your performance summary</p>
      </div>

      {/* Score Summary Section */}
      <div className="bg-gray-50 rounded-lg p-4 md:p-6 mb-6">
        {/* Score Display */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-base md:text-lg font-medium text-gray-700">Your Score</span>
          <span className="text-xl md:text-2xl font-bold text-indigo-600">{score}/{totalQuestions}</span>
        </div>

        {/* Progress Bar */}
        <Progress value={percentage} className="h-3 mb-2 [&>div]:bg-indigo-500" /> {/* Added Tailwind class for progress bar color */}

        {/* Percentage and Feedback */}
        <div className="flex justify-between text-xs md:text-sm mt-1">
          <span className="text-indigo-600 font-semibold">{percentage}%</span>
          <span className="font-medium text-gray-600 text-right">{getFeedbackMessage()}</span>
        </div>

        {/* Correct/Incorrect Counts */}
        <div className="grid grid-cols-2 gap-2 md:gap-4 mt-6">
          {/* Correct Answers Box */}
          <div className="bg-green-50 p-3 md:p-4 rounded-lg flex items-center border border-green-200">
            <CheckCircle className="text-green-500 mr-2 md:mr-3 flex-shrink-0" size={20} />
            <div>
              <p className="text-xs md:text-sm text-gray-600">Correct</p>
              <p className="text-lg md:text-xl font-bold text-green-700">{correctAnswers}</p>
            </div>
          </div>

          {/* Incorrect Answers Box */}
          <div className="bg-red-50 p-3 md:p-4 rounded-lg flex items-center border border-red-200">
            <XCircle className="text-red-500 mr-2 md:mr-3 flex-shrink-0" size={20} />
            <div>
              <p className="text-xs md:text-sm text-gray-600">Incorrect</p>
              <p className="text-lg md:text-xl font-bold text-red-700">{totalQuestions - correctAnswers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Results Section (Collapsible) */}
      <div className="mb-6">
        {/* Toggle Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-between w-full p-3 md:p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
          aria-expanded={showDetails}
          aria-controls="detailed-results"
        >
          <span className="font-medium text-sm md:text-base text-gray-700">View Detailed Results</span>
          {showDetails ? <ChevronUp size={18} className="text-gray-600"/> : <ChevronDown size={18} className="text-gray-600"/>}
        </button>

        {/* Detailed Results Content */}
        {showDetails && (
          <div id="detailed-results" className="mt-4 border border-gray-200 rounded-lg divide-y divide-gray-200">
            {results.map((result, index) => (
              // Individual Question Result Item
              <div key={result.questionId || `result-${index}`} className="p-3 md:p-4 bg-white first:rounded-t-lg last:rounded-b-lg">
                <div className="flex items-start">
                  {/* Correct/Incorrect Icon */}
                  <div className={`flex-shrink-0 mr-3 mt-1 ${result.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                    {result.isCorrect ? <CheckCircle size={18} aria-label="Correct"/> : <XCircle size={18} aria-label="Incorrect"/>}
                  </div>
                  {/* Question and Answers */}
                  <div className="flex-grow">
                    <p className="font-medium text-sm md:text-base text-gray-800">
                      Q{index + 1}: {result.question}
                    </p>
                    {/* Answer Details */}
                    <div className="mt-2 text-xs md:text-sm space-y-1">
                      {/* User's Answer */}
                      <p>
                        <span className="text-gray-500 font-medium">Your answer: </span>
                        <span className={`font-semibold ${result.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                           {/* Call the helper function to display the text */}
                          {formatAnswerForDisplay(result.userAnswer, result)}
                        </span>
                      </p>
                      {/* Correct Answer (if user was wrong) */}
                      {!result.isCorrect && (
                        <p>
                          <span className="text-gray-500 font-medium">Correct answer: </span>
                           {/* Call the helper function to display the text */}
                          <span className="font-semibold text-green-700">{formatAnswerForDisplay(result.correctAnswer, result)}</span>
                        </p>
                      )}
                    </div>
                    {/* Explanation (if available) */}
                    {result.explanation && (
                      <div className="mt-3 p-2 md:p-3 bg-blue-50 text-blue-800 text-xs md:text-sm rounded-md border border-blue-200">
                        <span className="font-semibold">Explanation:</span> {result.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons Section */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6">
        {/* Retake Quiz Button */}
        <Button
          variant="outline" // Use outline style
          className="flex-1 flex items-center justify-center text-gray-700 border-gray-300 hover:bg-gray-100" // Added flex-1 for equal width on small screens
          onClick={onRetakeQuiz}
        >
          <RotateCcw size={16} className="mr-2" />
          Retake Quiz
        </Button>

        {/* Continue Button (Optional) */}
        {onContinue && (
          <Button
            className="flex-1 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white" // Added flex-1 and specific colors
            onClick={onContinue}
          >
            Continue
            <ArrowRight size={16} className="ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizAnswer;



