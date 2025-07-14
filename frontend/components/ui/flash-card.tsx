'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FlashCardProps {
  cards: {
    id: string;
    front: {
      title: string;
      content: string;
      image?: string;
    };
    back: {
      title: string;
      content: string;
      image?: string;
    };
  }[];
  className?: string;
}

const FlashCard: React.FC<FlashCardProps> = ({ cards, className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const currentCard = cards[currentIndex];

  if (!currentCard) {
    return <div className="p-8 text-center">No flash cards available</div>;
  }

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="p-4 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Flash Card {currentIndex + 1}/{cards.length}</h3>
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
        
        <div className="w-full aspect-[4/3] perspective-1000 relative">
          <motion.div
            className="w-full h-full"
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 300, damping: 30 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front of card */}
            <div
              className={`absolute w-full h-full backface-hidden rounded-lg border p-4 ${
                isFlipped ? 'opacity-0' : 'opacity-100'
              }`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <h3 className="text-xl font-semibold text-center mb-3">{currentCard.front.title}</h3>
              {currentCard.front.image && (
                <div className="mb-3 flex justify-center">
                  <img 
                    src={currentCard.front.image} 
                    alt={currentCard.front.title}
                    className="max-h-32 rounded-md"
                  />
                </div>
              )}
              <p className="text-gray-700 text-center">{currentCard.front.content}</p>
            </div>
            
            {/* Back of card */}
            <div
              className={`absolute w-full h-full backface-hidden rounded-lg border bg-blue-50 p-4 ${
                isFlipped ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <h3 className="text-xl font-semibold text-center mb-3">{currentCard.back.title}</h3>
              {currentCard.back.image && (
                <div className="mb-3 flex justify-center">
                  <img 
                    src={currentCard.back.image} 
                    alt={currentCard.back.title}
                    className="max-h-32 rounded-md"
                  />
                </div>
              )}
              <p className="text-gray-700 text-center">{currentCard.back.content}</p>
            </div>
          </motion.div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            variant="outline"
            size="sm"
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm text-gray-500">
            {currentIndex + 1} of {cards.length}
          </div>
          <Button
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            variant="outline"
            size="sm"
            className="flex items-center"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlashCard;