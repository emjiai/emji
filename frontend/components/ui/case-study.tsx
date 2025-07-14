'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaseQuestion {
  id: string;
  question: string;
  expectedAnswer: string;
  rubric: {
    excellent: string;
    good: string;
    needsImprovement: string;
  };
}

interface CaseStudyProps {
  title: string;
  scenario: string;
  image?: string;
  questions: CaseQuestion[];
  onSubmit?: (answers: Record<string, string>, feedback: Record<string, string>) => void;
  className?: string;
}

const CaseStudy: React.FC<CaseStudyProps> = ({
  title,
  scenario,
  image,
  questions,
  onSubmit,
  className = '',
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [expandedScenario, setExpandedScenario] = useState(true);

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = () => {
    const newFeedback: Record<string, string> = {};
    
    // Generate feedback based on answer length as a simple heuristic
    // In a real application, this would be replaced with actual AI-driven feedback
    questions.forEach((question) => {
      const answer = answers[question.id] || '';
      
      if (answer.length < 20) {
        newFeedback[question.id] = question.rubric.needsImprovement;
      } else if (answer.length < 100) {
        newFeedback[question.id] = question.rubric.good;
      } else {
        newFeedback[question.id] = question.rubric.excellent;
      }
    });
    
    setFeedback(newFeedback);
    setSubmitted(true);
    
    if (onSubmit) {
      onSubmit(answers, newFeedback);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setFeedback({});
    setSubmitted(false);
  };

  const toggleScenario = () => {
    setExpandedScenario(!expandedScenario);
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-md", className)}>
      {/* Case Study Header */}
      <div className="p-4 border-b">
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      
      {/* Collapsible Scenario Section */}
      <div className="border-b">
        <button 
          onClick={toggleScenario}
          className="w-full p-4 flex justify-between items-center text-left focus:outline-none"
        >
          <h4 className="text-lg font-medium">Case Scenario</h4>
          {expandedScenario ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
        
        {expandedScenario && (
          <div className="p-4 pt-0">
            {image && (
              <div className="mb-4">
                <img 
                  src={image} 
                  alt={title}
                  className="w-full max-h-64 object-cover rounded-md"
                />
              </div>
            )}
            <p className="text-gray-700 whitespace-pre-line">{scenario}</p>
          </div>
        )}
      </div>
      
      {/* Questions Section */}
      <div className="p-4">
        <h4 className="text-lg font-medium mb-4">Answer the following questions:</h4>
        
        <div className="space-y-8">
          {questions.map((question, index) => (
            <div key={question.id} className="border-b pb-6 last:border-0">
              <div className="mb-2">
                <span className="font-medium text-gray-700">Question {index + 1}:</span> {question.question}
              </div>
              
              <Textarea
                className="w-full min-h-[120px]"
                placeholder="Type your answer here..."
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                disabled={submitted}
              />
              
              {submitted && feedback[question.id] && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md text-sm">
                  <h5 className="font-medium text-blue-700 mb-1">Feedback:</h5>
                  <p className="text-blue-700">{feedback[question.id]}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-6">
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
            disabled={submitted || Object.keys(answers).length !== questions.length}
          >
            <Check className="h-4 w-4 mr-2" />
            Submit Answers
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CaseStudy;