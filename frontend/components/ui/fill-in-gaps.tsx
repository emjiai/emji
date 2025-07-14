'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GapItem {
  id: string;
  answer: string;
  hint?: string;
}

interface FillInGapsProps {
  text: string;
  gaps: GapItem[];
  onSubmit?: (isCorrect: boolean, answers: Record<string, string>) => void;
  caseSensitive?: boolean;
  className?: string;
}

const FillInGaps: React.FC<FillInGapsProps> = ({
  text,
  gaps,
  onSubmit,
  caseSensitive = false,
  className = '',
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [allCorrect, setAllCorrect] = useState(false);

  // Parse the text and replace [gap:id] with input fields
  const renderText = () => {
    let parts = text;
    const elements: React.ReactNode[] = [];
    
    gaps.forEach((gap) => {
      const placeholder = `[gap:${gap.id}]`;
      const splitParts = parts.split(placeholder);
      
      if (splitParts.length > 1) {
        // Add the text before the gap
        elements.push(<span key={`text-before-${gap.id}`}>{splitParts[0]}</span>);
        
        // Add the input for the gap
        elements.push(
          <span 
            key={`gap-${gap.id}`}
            className={cn(
              "inline-block relative",
              submitted && "mx-1"
            )}
          >
            <Input
              className={cn(
                "w-32 inline-block px-2 py-1 h-8 border rounded-md",
                submitted && (
                  results[gap.id] 
                    ? "border-green-500 bg-green-50" 
                    : "border-red-500 bg-red-50"
                )
              )}
              placeholder={gap.hint || "..."}
              value={answers[gap.id] || ''}
              onChange={(e) => handleAnswerChange(gap.id, e.target.value)}
              disabled={submitted}
            />
            {submitted && (
              <span className="absolute -right-5 top-1.5">
                {results[gap.id] ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </span>
            )}
          </span>
        );
        
        // Update remaining text
        parts = splitParts.slice(1).join(placeholder);
      }
    });
    
    // Add any remaining text
    if (parts) {
      elements.push(<span key="text-end">{parts}</span>);
    }
    
    return elements;
  };

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = () => {
    const newResults: Record<string, boolean> = {};
    let correct = true;
    
    gaps.forEach((gap) => {
      const userAnswer = answers[gap.id] || '';
      const correctAnswer = gap.answer;
      
      const isCorrect = caseSensitive 
        ? userAnswer === correctAnswer
        : userAnswer.toLowerCase() === correctAnswer.toLowerCase();
      
      newResults[gap.id] = isCorrect;
      
      if (!isCorrect) {
        correct = false;
      }
    });
    
    setResults(newResults);
    setSubmitted(true);
    setAllCorrect(correct);
    
    if (onSubmit) {
      onSubmit(correct, answers);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setResults({});
    setAllCorrect(false);
  };

  return (
    <div className={cn("p-4 bg-white rounded-lg shadow-md", className)}>
      <h3 className="text-lg font-medium mb-4">Fill in the gaps</h3>
      
      <div className="mb-6 text-lg leading-relaxed">
        {renderText()}
      </div>
      
      <div className="flex justify-between">
        <Button
          onClick={handleReset}
          variant="outline"
          className="flex items-center"
          disabled={!submitted}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        
        <Button
          onClick={handleSubmit}
          className="flex items-center"
          disabled={submitted}
        >
          <Check className="h-4 w-4 mr-2" />
          Submit Answer
        </Button>
      </div>
      
      {submitted && (
        <div className={cn(
          "mt-4 p-3 rounded-lg text-sm",
          allCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        )}>
          {allCorrect ? (
            "Correct! All answers are right."
          ) : (
            <div>
              <p className="font-medium mb-2">Some answers are incorrect. Here are the correct answers:</p>
              <ul className="list-disc pl-4">
                {gaps.map((gap) => !results[gap.id] && (
                  <li key={gap.id} className="mb-1">
                    <span className="font-medium">{gap.hint || `Gap ${gap.id}`}:</span> {gap.answer}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FillInGaps;