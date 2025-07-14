'use client';

import React, { useState, useCallback, memo, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input'; // Import Input for fill-blanks

export interface Option {
  id: string;
  text: string;
}

// Interface for the incoming question data from the backend
export interface QuestionData {
  id: string;
  type: string; // 'multiple_choice', 'true_false', 'short_answer', 'flashcard', 'fill_blanks'
  text: string;
  options?: Option[]; // Only for MC/TF
  correct_answer?: string; // For MC, TF, Short Answer
  explanation?: string;
  front?: string; // For Flashcard
  back?: string; // For Flashcard (used as correct answer)
  text_parts?: string[]; // For Fill Blanks
  correct_answers?: string[]; // For Fill Blanks
}

// Props for the QuizQuestion component
export interface QuizQuestionProps extends QuestionData {
  onAnswerSelected: (questionId: string, answer: string | string[]) => void; // Answer can be string or array for fill-blanks
  selectedAnswer?: string | string[]; // Can be string or array
  isSubmitted?: boolean;
}

// Memoize the component
const QuizQuestion = memo(function QuizQuestion({
  id,
  type,
  text, // Main question text or prompt
  options = [],
  onAnswerSelected,
  selectedAnswer,
  isSubmitted = false,
  correct_answer, // Correct answer string for MC, TF, ShortAnswer
  explanation,
  front, // Flashcard front
  back, // Flashcard back (used as correct answer for comparison)
  text_parts = [], // Fill Blanks text parts
  correct_answers = [], // Fill Blanks correct answers array
}: QuizQuestionProps) {

  // State for text-based answers (Short Answer, Flashcard response, Fill Blanks)
  // For fill-blanks with multiple inputs, we might need an array or object state
  const [textInput, setTextInput] = useState<string>(
    // Initialize with previous answer if available and it's a string
    typeof selectedAnswer === 'string' ? selectedAnswer : ''
  );

  // State for multiple inputs in fill-in-the-blanks
  const numBlanks = correct_answers.length;
  const initialBlankAnswers = Array.isArray(selectedAnswer)
    ? selectedAnswer
    : Array(numBlanks).fill('');
  const [blankInputs, setBlankInputs] = useState<string[]>(initialBlankAnswers);


  // --- Event Handlers (Memoized) ---

  // For RadioGroup (MC, TF)
  const handleOptionSelect = useCallback((optionId: string) => {
    if (!isSubmitted) {
      onAnswerSelected(id, optionId);
    }
  }, [id, onAnswerSelected, isSubmitted]);

  // For single Textarea (Short Answer, Flashcard response)
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isSubmitted) {
      const value = e.target.value;
      setTextInput(value);
      onAnswerSelected(id, value); // Pass the string value
    }
  }, [id, onAnswerSelected, isSubmitted]);

   // For multiple Input fields (Fill Blanks)
   const handleBlankInputChange = useCallback((index: number, value: string) => {
    if (!isSubmitted) {
      const newBlankInputs = [...blankInputs];
      newBlankInputs[index] = value;
      setBlankInputs(newBlankInputs);
      onAnswerSelected(id, newBlankInputs); // Pass the array of strings
    }
  }, [id, onAnswerSelected, isSubmitted, blankInputs]);


  // --- Helper Functions ---

  // Determine correctness for display styles (handles different answer types)
  const isCorrect = useMemo(() => {
    if (!isSubmitted) return false;
    switch (type) {
      case 'multiple_choice':
      case 'true_false':
        return selectedAnswer === correct_answer;
      case 'short_answer':
        // Case-insensitive comparison for short answer
        return typeof selectedAnswer === 'string' &&
               typeof correct_answer === 'string' &&
               selectedAnswer.trim().toLowerCase() === correct_answer.trim().toLowerCase();
      case 'flashcard':
         // Compare user's text input (treated as the 'back') with the correct 'back'
         return typeof selectedAnswer === 'string' &&
                typeof back === 'string' &&
                selectedAnswer.trim().toLowerCase() === back.trim().toLowerCase();
      case 'fill_blanks':
         // Compare array of user inputs with correct answers array
         return Array.isArray(selectedAnswer) &&
                selectedAnswer.length === correct_answers.length &&
                selectedAnswer.every((ans, i) => typeof ans === 'string' && typeof correct_answers[i] === 'string' && ans.trim().toLowerCase() === correct_answers[i].trim().toLowerCase());
      default:
        return false;
    }
  }, [isSubmitted, selectedAnswer, correct_answer, type, back, correct_answers]);

  // Get styling for MC/TF options
  const getOptionResultClass = (optionId: string) => {
    if (!isSubmitted) return '';
    if (optionId === correct_answer) return 'bg-green-100 border-green-500'; // Correct option
    if (optionId === selectedAnswer && optionId !== correct_answer) return 'bg-red-100 border-red-500'; // Incorrectly selected
    return ''; // Default or not selected
  };

   // Get styling for text area based answers
  const getTextResultClass = () => {
    if (!isSubmitted) return '';
    return isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50';
  };

  // Determine the correct answer text to display for feedback
   const displayCorrectAnswer = useMemo(() => {
    switch (type) {
        case 'multiple_choice':
        case 'true_false':
            return options.find(opt => opt.id === correct_answer)?.text || correct_answer;
        case 'short_answer':
            return correct_answer;
        case 'flashcard':
            return back; // The 'back' of the flashcard is the answer
        case 'fill_blanks':
            return correct_answers.join(', '); // Join multiple answers
        default:
            return 'N/A';
    }
   }, [type, correct_answer, options, back, correct_answers]);

   // Determine the user's answer text to display for feedback
    const displayUserAnswer = useMemo(() => {
        switch (type) {
            case 'multiple_choice':
            case 'true_false':
                return options.find(opt => opt.id === selectedAnswer)?.text || selectedAnswer;
            case 'short_answer':
            case 'flashcard':
                return typeof selectedAnswer === 'string' ? selectedAnswer : 'No answer';
            case 'fill_blanks':
                return Array.isArray(selectedAnswer) ? selectedAnswer.join(', ') : 'No answer';
            default:
                return 'N/A';
        }
    }, [type, selectedAnswer, options]);


  // --- Render Logic ---

  const renderInput = () => {
    switch (type) {
      case 'multiple_choice':
      case 'true_false':
        return (
          <RadioGroup
            value={typeof selectedAnswer === 'string' ? selectedAnswer : undefined}
            onValueChange={handleOptionSelect}
            disabled={isSubmitted}
            className="space-y-3"
          >
            {options.map((option) => (
              <div
                key={option.id}
                className={`flex items-start space-x-3 p-3 border rounded-md transition-colors ${getOptionResultClass(option.id)}`}
              >
                <RadioGroupItem
                  value={option.id}
                  id={`${id}-${option.id}`}
                  disabled={isSubmitted}
                  className="mt-1" // Align radio button better
                />
                <Label
                  htmlFor={`${id}-${option.id}`}
                  className="flex-grow cursor-pointer text-sm md:text-base" // Responsive text size
                >
                  {option.text}
                </Label>
                {/* Feedback icons shown only after submission */}
                {isSubmitted && option.id === correct_answer && (
                  <span className="text-green-600 text-sm ml-auto">✓ Correct</span>
                )}
                {isSubmitted && option.id === selectedAnswer && option.id !== correct_answer && (
                  <span className="text-red-600 text-sm ml-auto">✗ Incorrect</span>
                )}
              </div>
            ))}
          </RadioGroup>
        );

      case 'short_answer':
        return (
          <Textarea
            placeholder="Enter your short answer here..."
            value={textInput}
            onChange={handleTextChange}
            disabled={isSubmitted}
            className={`min-h-[80px] ${isSubmitted ? getTextResultClass() : ''}`}
          />
        );

      case 'flashcard':
         // Present the 'front' as part of the question text, expect user to type 'back'
        return (
          <Textarea
            placeholder="Enter the definition/answer here..."
            value={textInput}
            onChange={handleTextChange}
            disabled={isSubmitted}
            className={`min-h-[100px] ${isSubmitted ? getTextResultClass() : ''}`}
          />
        );

     case 'fill_blanks':
        // Render text parts with Input fields in between
        return (
            <div className="flex flex-wrap items-center gap-2">
            {text_parts.map((part, index) => (
                <React.Fragment key={index}>
                <span className="text-sm md:text-base">{part}</span>
                {/* Add an input field after each part except the last one */}
                {index < numBlanks && (
                    <Input
                    type="text"
                    value={blankInputs[index]}
                    onChange={(e) => handleBlankInputChange(index, e.target.value)}
                    disabled={isSubmitted}
                    className={`w-24 md:w-32 h-8 text-sm md:text-base ${isSubmitted ? (blankInputs[index].trim().toLowerCase() === correct_answers[index]?.trim().toLowerCase() ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : ''}`}
                    />
                )}
                </React.Fragment>
            ))}
            </div>
        );

      default:
        return <p className="text-red-500">Unsupported question type: {type}</p>;
    }
  };

  return (
    <div className="mb-8 p-4 md:p-6 bg-white rounded-lg shadow-sm border">
      <div className="mb-4">
        {/* Display the main question text/prompt */}
        <h3 className="text-base md:text-lg font-medium text-gray-800">{text}</h3>
        {/* For flashcard, explicitly show the 'front' if needed, though 'text' should contain it */}
        {/* {type === 'flashcard' && front && <p className="mt-1 text-sm text-gray-600">Term: {front}</p>} */}
      </div>

      {/* Render the appropriate input based on type */}
      {renderInput()}

      {/* Display feedback and explanation after submission */}
      {isSubmitted && (
        <div className={`mt-4 p-3 rounded-md border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <h4 className={`text-sm font-semibold mb-1 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </h4>
          {!isCorrect && (
             <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">Your answer:</span> {displayUserAnswer || <span className="italic">No answer provided</span>} <br />
                <span className="font-medium">Correct answer:</span> {displayCorrectAnswer}
             </p>
          )}
          {explanation && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Explanation:</p>
              <p className="text-sm text-gray-700">{explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default QuizQuestion;
