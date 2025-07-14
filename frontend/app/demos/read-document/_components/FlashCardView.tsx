import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface FlashCard {
  id: string;
  front: string;
  back: string;
}

interface FlashCardViewProps {
  flashCards: FlashCard[];
}

const FlashCardView: React.FC<FlashCardViewProps> = ({ flashCards }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCardIndex((currentCardIndex + 1) % flashCards.length);
  };
  
  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentCardIndex((currentCardIndex - 1 + flashCards.length) % flashCards.length);
  };
  
  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  const currentCard = flashCards[currentCardIndex];
  
  return (
    <div className="h-full overflow-auto p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Flash Cards</h3>
        <div className="text-sm text-gray-500">
          Card {currentCardIndex + 1} of {flashCards.length}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <div
          className={`w-full max-w-md h-64 cursor-pointer relative transition-transform duration-500 transform-gpu ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={toggleFlip}
          style={{ 
            perspective: '1000px',
            transformStyle: 'preserve-3d'
          }}
        >
          <div
            className={`absolute inset-0 bg-white border rounded-lg p-6 flex items-center justify-center shadow-md backface-hidden ${
              isFlipped ? 'hidden' : ''
            }`}
          >
            <div className="prose max-w-none text-center">
              <p className="text-xl">{currentCard.front}</p>
            </div>
          </div>
          
          <div
            className={`absolute inset-0 bg-blue-50 border rounded-lg p-6 flex items-center justify-center shadow-md ${
              isFlipped ? '' : 'hidden'
            }`}
          >
            <div className="prose max-w-none text-center">
              <p className="text-xl">{currentCard.back}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center mt-8 space-x-4">
          <Button onClick={handlePrevious} variant="outline">Previous</Button>
          <Button onClick={toggleFlip} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleNext}>Next</Button>
        </div>
        
        <div className="text-sm text-gray-500 mt-4 text-center">
          Click on the card to flip
        </div>
      </div>
    </div>
  );
};

export default FlashCardView;
