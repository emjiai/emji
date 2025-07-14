'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, ChevronRight } from 'lucide-react';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestionData {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'multiple-answer';
  options: QuizOption[];
  correctOptionId: string | string[]; // Array for multiple-answer questions
  explanation?: string;
}

interface QuizQuestionProps {
  question: QuizQuestionData;
  questionNumber: number;
  onSubmit: (selectedOptionIds: string | string[]) => void;
  className?: string;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionNumber,
  onSubmit,
  className = '',
}) => {
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const isMultipleAnswer = question.type === 'multiple-answer';

  const handleOptionSelect = (optionId: string) => {
    if (isMultipleAnswer) {
      // For multiple-answer questions, toggle selection
      setSelectedOptionIds(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId) 
          : [...prev, optionId]
      );
    } else {
      // For single-answer questions
      setSelectedOptionIds([optionId]);
    }
  };

  const handleAnswerSubmit = () => {
    if (selectedOptionIds.length === 0) return;
    
    // For multiple-answer questions, submit the array; for others, submit the first (and only) item
    onSubmit(isMultipleAnswer ? selectedOptionIds : selectedOptionIds[0]);
  };

  const getOptionClassName = (optionId: string) => {
    return cn(
      "p-4 border rounded-lg transition-all cursor-pointer mb-2 hover:bg-gray-50",
      selectedOptionIds.includes(optionId) 
        ? "border-blue-500 bg-blue-50" 
        : "border-gray-200"
    );
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-md p-6", className)}>
      <h3 className="text-xl font-semibold mb-4">Question {questionNumber}</h3>
      <p className="mb-6">{question.text}</p>
      
      <div className="mb-6">
        {question.options.map((option) => (
          <div
            key={option.id}
            className={getOptionClassName(option.id)}
            onClick={() => handleOptionSelect(option.id)}
          >
            <div className="flex items-center">
              <div className={cn(
                "w-5 h-5 mr-3 flex-shrink-0 border rounded-md flex items-center justify-center",
                selectedOptionIds.includes(option.id) ? "bg-blue-500 border-blue-500" : "border-gray-300"
              )}>
                {selectedOptionIds.includes(option.id) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              <span>{option.text}</span>
            </div>
          </div>
        ))}
      </div>
      
      <Button 
        onClick={handleAnswerSubmit} 
        disabled={selectedOptionIds.length === 0}
        className="w-full flex items-center justify-center"
      >
        {isMultipleAnswer ? "Submit Answers" : "Submit Answer"}
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default QuizQuestion;