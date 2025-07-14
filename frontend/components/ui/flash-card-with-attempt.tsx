'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, ChevronRight, Lightbulb, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface FlashCardWithAttemptProps {
  question: {
    id: string;
    text: string;
    term?: string;
    definition?: string;
    hint?: string;
    explanation?: string;
    options: { id: string; text: string; }[];
  };
  onSubmit: () => void;
  isLastQuestion: boolean;
  className?: string;
}

const FlashCardWithAttempt: React.FC<FlashCardWithAttemptProps> = ({ 
  question, 
  onSubmit, 
  isLastQuestion, 
  className = '' 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [userAttempt, setUserAttempt] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAttemptSubmit = () => {
    if (userAttempt.trim()) {
      setHasAttempted(true);
    }
  };

  const handleContinue = () => {
    onSubmit();
  };

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Flash Card</h3>
          <Button 
            onClick={toggleFlip} 
            variant="outline" 
            size="sm"
            className="flex items-center"
          >
            <ArrowLeftRight className="h-4 w-4 mr-1" />
            Flip Card
          </Button>
        </div>
        
        {/* Flash Card with Animation */}
        <div className="w-full h-80 perspective-1000 relative mb-6">
          <motion.div
            className="w-full h-full"
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 300, damping: 30 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front of card */}
            <div
              className={`absolute w-full h-full backface-hidden rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex flex-col justify-center ${
                isFlipped ? 'opacity-0' : 'opacity-100'
              }`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold text-blue-800 mb-4">
                  {question.term || question.text}
                </h3>
                <p className="text-gray-600 text-lg mb-6">
                  Can you define this term?
                </p>
                <div className="bg-white/70 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    💡 Think about it, then flip the card to see the answer
                  </p>
                </div>
              </div>
            </div>
            
            {/* Back of card */}
            <div
              className={`absolute w-full h-full backface-hidden rounded-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 p-6 flex flex-col justify-center ${
                isFlipped ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold text-green-800 mb-3">
                  {question.term || "Definition"}
                </h3>
                <div className="bg-white/80 rounded-lg p-4">
                  <p className="text-gray-800 text-lg leading-relaxed">
                    {question.definition || question.options[0]?.text}
                  </p>
                </div>
                {question.explanation && (
                  <div className="bg-blue-50/80 rounded-lg p-3 mt-4">
                    <p className="text-blue-700 text-sm">
                      <strong>Additional Info:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* User Attempt Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Definition (Optional):
            </label>
            <Textarea
              placeholder="Write your definition here before flipping the card..."
              value={userAttempt}
              onChange={(e) => setUserAttempt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {userAttempt.trim() && !hasAttempted && (
              <Button 
                onClick={handleAttemptSubmit}
                variant="outline"
                size="sm"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Record My Attempt
              </Button>
            )}

            {hasAttempted && (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                Attempt recorded!
              </div>
            )}

            {question.hint && (
              <Button 
                onClick={() => setShowHint(!showHint)}
                variant="ghost"
                size="sm"
                className="text-yellow-600"
              >
                <Lightbulb className="w-4 h-4 mr-1" />
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </Button>
            )}
          </div>

          {/* Hint Display */}
          {showHint && question.hint && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5 mr-2" />
                <div>
                  <h5 className="font-medium text-yellow-800">Hint:</h5>
                  <p className="text-yellow-700 text-sm">{question.hint}</p>
                </div>
              </div>
            </div>
          )}

          {/* User's Attempt Display */}
          {hasAttempted && userAttempt.trim() && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h5 className="font-medium text-gray-800 mb-2">Your Definition:</h5>
              <p className="text-gray-700">{userAttempt}</p>
            </div>
          )}

          {/* Continue Button */}
          <div className="pt-4">
            <Button 
              onClick={handleContinue}
              className="w-full"
              size="lg"
            >
              {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
              {!isLastQuestion && <ChevronRight className="ml-2 w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashCardWithAttempt;