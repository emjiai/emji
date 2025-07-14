'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RotateCcw, Check, X } from 'lucide-react';
import './FlashCard.css'; // Import the updated CSS

export interface FlashCardData {
  id: string;
  front: string; // Term, question, or prompt
  back: string;  // Definition, answer, or explanation
  explanation?: string; // Optional extra info
}

interface FlashCardQuestionProps {
  cards: FlashCardData[];
  onSessionComplete: (results: Record<string, boolean>) => void; // Pass back results: { cardId: isKnown }
  onBack?: () => void; // Optional: Go back to previous view
}

const FlashCardQuestion: React.FC<FlashCardQuestionProps> = ({
  cards = [],
  onSessionComplete,
  onBack
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [showResultsButton, setShowResultsButton] = useState(false);
  // Removed ref as container styling is now pure CSS
  // const cardRef = useRef<HTMLDivElement>(null);

  const totalCards = cards.length;

  // ... (keep useEffects and handlers as they were) ...
   // Reset state if cards change (e.g., new session)
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setResults({});
    setShowResultsButton(false);
  }, [cards]);

  // Check if all cards have been marked
  useEffect(() => {
    if (totalCards > 0 && Object.keys(results).length === totalCards) {
      setShowResultsButton(true);
    } else {
      setShowResultsButton(false);
    }
  }, [results, totalCards]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const navigate = useCallback((direction: 'next' | 'prev') => {
    setIsFlipped(false); // Unflip card on navigation
    setTimeout(() => { // Allow flip animation to reset before changing content
      setCurrentIndex(prev => {
        if (direction === 'next') {
          return (prev + 1) % totalCards;
        } else {
          return (prev - 1 + totalCards) % totalCards;
        }
      });
    }, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--flashcard-flip-duration') || '0.5') * 1000 / 2 ); // Use duration from CSS variable
  }, [totalCards]);

  const handleMarkResult = useCallback((isKnown: boolean) => {
    const cardId = cards[currentIndex]?.id;
    if (cardId) {
      setResults(prev => ({ ...prev, [cardId]: isKnown }));
    }
     // Always navigate next after marking
    if (currentIndex < totalCards - 1 || Object.keys(results).length < totalCards) {
       navigate('next');
    }
  }, [currentIndex, cards, navigate, results, totalCards]);


  const handleFinish = () => {
    onSessionComplete(results);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        // No need for cardRef check if it's removed
      if (totalCards === 0) return;

      if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault(); // Prevent scrolling
        handleFlip();
      } else if (event.key === 'ArrowRight') {
        navigate('next');
      } else if (event.key === 'ArrowLeft') {
        navigate('prev');
      } else if (event.key === 'Enter' && showResultsButton) {
         handleFinish(); // Allow finishing with Enter key when button is visible
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleFlip, navigate, totalCards, showResultsButton, handleFinish]);


  if (totalCards === 0) {
    // ... (no change needed for empty state) ...
     return (
        <div className="max-w-2xl mx-auto p-4 text-center">
             <p className="text-gray-600">No flashcards available for this session.</p>
             {onBack && (
                 <Button variant="outline" onClick={onBack} className="mt-4">
                     <ArrowLeft className="mr-2 h-4 w-4" /> Back
                 </Button>
             )}
         </div>
     );
   }

  const currentCard = cards[currentIndex];
  const isMarked = results.hasOwnProperty(currentCard.id);
  const wasMarkedKnown = results[currentCard.id];

  return (
    <div className="col-span-2 max-w-2xl mx-auto p-4 flex flex-col items-center font-sans">
      {/* Header/Progress */}
      {/* ... (no change needed for header) ... */}
       <div className="w-full flex justify-between items-center mb-4">
          {onBack && !showResultsButton && (
             <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-600 hover:text-gray-900">
                 <ArrowLeft className="mr-1 h-4 w-4" /> Back
             </Button>
          )}
         <div className="flex-grow text-center">
            <span className="text-sm font-medium text-gray-600">
                Card {currentIndex + 1} of {totalCards}
             </span>
             <p className="text-xs text-gray-500">({Object.keys(results).length} marked)</p>
         </div>
         {/* Placeholder for potential timer or actions */}
         <div className="w-16"> {/* Balance the back button */}
             {showResultsButton && (
                <Button size="sm" onClick={handleFinish} className="bg-green-600 hover:bg-green-700">
                    Finish
                </Button>
             )}
         </div>
      </div>

      {/* Flashcard Area - Using CSS class for sizing */}
      {/* Removed: w-full, max-w-lg, h-80, perspective, mb-6, ref={cardRef} */}
      {/* Added: flashcard-container */}
      <div className="flashcard-container">
        <Card
          // Added flashcard, preserve-3d classes. Removed w-full, h-full, relative as they are handled by .flashcard now
           className={`flashcard preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={handleFlip} // Flip on click
        >
          {/* Front */}
           {/* Removed absolute, w-full, h-full, backface-hidden */}
          <CardContent className="flashcard-face front">
            {/* Kept text size classes, you can move these to CSS if preferred */}
            <p className="text-xl md:text-3xl font-semibold">{currentCard?.front}</p>
          </CardContent>

          {/* Back */}
          {/* Removed absolute, w-full, h-full, backface-hidden, rotate-y-180 */}
          <CardContent className="flashcard-face back">
             {/* Kept text size classes */}
            <p className="text-lg md:text-2xl font-medium">{currentCard?.back}</p>
            {currentCard?.explanation && (
              // Kept text size classes. Added 'explanation' class if you want to target it in CSS
              <p className="explanation mt-4 text-base text-gray-600 italic">({currentCard.explanation})</p>
            )}
          </CardContent>
        </Card>
      </div>

       {/* Instructions */}
       {/* ... (no change needed for instructions) ... */}
       <p className="text-xs text-gray-500 mb-4">Click card or press Space to flip. Use Arrow keys to navigate.</p>

      {/* Known/Unknown Buttons & Navigation */}
      {/* ... (no change needed for buttons) ... */}
       <div className="w-full max-w-lg flex flex-col items-center gap-4">
         {isFlipped && (
           <div className="flex justify-center gap-4 mb-4 w-full">
                <Button
                    variant={isMarked && !wasMarkedKnown ? 'destructive' : 'outline'}
                    size="lg"
                    onClick={() => handleMarkResult(false)}
                    className={`flex-1 transition-colors ${isMarked && !wasMarkedKnown ? 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                 >
                    <X className="mr-2 h-5 w-5" /> Didn't Know
                 </Button>
                 <Button
                    variant={isMarked && wasMarkedKnown ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => handleMarkResult(true)}
                    className={`flex-1 transition-colors ${isMarked && wasMarkedKnown ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-green-500 text-green-700 hover:bg-green-50'}`}
                 >
                     <Check className="mr-2 h-5 w-5" /> Knew It
                 </Button>
             </div>
          )}
         <div className="flex justify-between w-full">
             <Button variant="outline" onClick={() => navigate('prev')} disabled={totalCards <= 1}>
                 <ArrowLeft className="mr-2 h-4 w-4" /> Previous
             </Button>
             <Button variant="outline" onClick={() => navigate('next')} disabled={totalCards <= 1}>
                 Next <ArrowRight className="ml-2 h-4 w-4" />
             </Button>
         </div>
       </div>
    </div>
  );
};

export default FlashCardQuestion;
// 'use client';

// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { ArrowLeft, ArrowRight, RotateCcw, Check, X } from 'lucide-react';
// import './FlashCard.css'; // CSS for the flip animation

// export interface FlashCardData {
//   id: string;
//   front: string; // Term, question, or prompt
//   back: string;  // Definition, answer, or explanation
//   explanation?: string; // Optional extra info
// }

// interface FlashCardQuestionProps {
//   cards: FlashCardData[];
//   onSessionComplete: (results: Record<string, boolean>) => void; // Pass back results: { cardId: isKnown }
//   onBack?: () => void; // Optional: Go back to previous view
// }

// const FlashCardQuestion: React.FC<FlashCardQuestionProps> = ({
//   cards = [], // Default to empty array
//   onSessionComplete,
//   onBack
// }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isFlipped, setIsFlipped] = useState(false);
//   const [results, setResults] = useState<Record<string, boolean>>({}); // { cardId: isKnown }
//   const [showResultsButton, setShowResultsButton] = useState(false);
//   const cardRef = useRef<HTMLDivElement>(null);

//   const totalCards = cards.length;

//   // Reset state if cards change (e.g., new session)
//   useEffect(() => {
//     setCurrentIndex(0);
//     setIsFlipped(false);
//     setResults({});
//     setShowResultsButton(false);
//   }, [cards]);

//   // Check if all cards have been marked
//   useEffect(() => {
//     if (totalCards > 0 && Object.keys(results).length === totalCards) {
//       setShowResultsButton(true);
//     } else {
//       setShowResultsButton(false);
//     }
//   }, [results, totalCards]);

//   const handleFlip = useCallback(() => {
//     setIsFlipped(prev => !prev);
//   }, []);

//   const navigate = useCallback((direction: 'next' | 'prev') => {
//     setIsFlipped(false); // Unflip card on navigation
//     setTimeout(() => { // Allow flip animation to reset before changing content
//       setCurrentIndex(prev => {
//         if (direction === 'next') {
//           return (prev + 1) % totalCards;
//         } else {
//           return (prev - 1 + totalCards) % totalCards;
//         }
//       });
//     }, 150); // Half the transition duration
//   }, [totalCards]);

//   const handleMarkResult = useCallback((isKnown: boolean) => {
//     const cardId = cards[currentIndex]?.id;
//     if (cardId) {
//       setResults(prev => ({ ...prev, [cardId]: isKnown }));
//     }
//      // Always navigate next after marking
//     if (currentIndex < totalCards - 1 || Object.keys(results).length < totalCards) {
//        navigate('next');
//     }
//   }, [currentIndex, cards, navigate, results, totalCards]);


//   const handleFinish = () => {
//     onSessionComplete(results);
//   };

//   // Keyboard navigation
//   useEffect(() => {
//     const handleKeyDown = (event: KeyboardEvent) => {
//       if (!cardRef.current || totalCards === 0) return;

//       if (event.code === 'Space' || event.key === ' ') {
//         event.preventDefault(); // Prevent scrolling
//         handleFlip();
//       } else if (event.key === 'ArrowRight') {
//         navigate('next');
//       } else if (event.key === 'ArrowLeft') {
//         navigate('prev');
//       } else if (event.key === 'Enter' && showResultsButton) {
//          handleFinish(); // Allow finishing with Enter key when button is visible
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [handleFlip, navigate, totalCards, showResultsButton, handleFinish]); // Added dependencies

//   if (totalCards === 0) {
//     return (
//         <div className="max-w-2xl mx-auto p-4 text-center">
//              <p className="text-gray-600">No flashcards available for this session.</p>
//              {onBack && (
//                  <Button variant="outline" onClick={onBack} className="mt-4">
//                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
//                  </Button>
//              )}
//          </div>
//      );
//    }

//   const currentCard = cards[currentIndex];
//   const isMarked = results.hasOwnProperty(currentCard.id);
//   const wasMarkedKnown = results[currentCard.id];

//   return (
//     <div className="max-w-2xl mx-auto p-4 flex flex-col items-center font-sans">
//       {/* Header/Progress */}
//       <div className="w-full flex justify-between items-center mb-4">
//           {onBack && !showResultsButton && (
//              <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-600 hover:text-gray-900">
//                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
//              </Button>
//           )}
//          <div className="flex-grow text-center">
//             <span className="text-sm font-medium text-gray-600">
//                 Card {currentIndex + 1} of {totalCards}
//              </span>
//              <p className="text-xs text-gray-500">({Object.keys(results).length} marked)</p>
//          </div>
//          {/* Placeholder for potential timer or actions */}
//          <div className="w-16"> {/* Balance the back button */}
//              {showResultsButton && (
//                 <Button size="sm" onClick={handleFinish} className="bg-green-600 hover:bg-green-700">
//                     Finish
//                 </Button>
//              )}
//          </div>
//       </div>


//       {/* Flashcard Area */}
//       <div className="w-full max-w-lg h-64 perspective mb-6" ref={cardRef}>
//         <Card
//           className={`flashcard w-full h-full relative transition-transform duration-500 ease-in-out preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
//           onClick={handleFlip} // Flip on click
//         >
//           {/* Front */}
//           <CardContent className="flashcard-face front absolute w-full h-full flex items-center justify-center p-6 text-center backface-hidden">
//             <p className="text-xl md:text-2xl font-semibold">{currentCard?.front}</p>
//           </CardContent>

//           {/* Back */}
//           <CardContent className="flashcard-face back absolute w-full h-full flex flex-col items-center justify-center p-6 text-center backface-hidden rotate-y-180">
//             <p className="text-lg md:text-xl font-medium">{currentCard?.back}</p>
//             {currentCard?.explanation && (
//               <p className="mt-3 text-sm text-gray-600 italic">({currentCard.explanation})</p>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//        {/* Instructions */}
//       <p className="text-xs text-gray-500 mb-4">Click card or press Space to flip. Use Arrow keys to navigate.</p>


//       {/* Known/Unknown Buttons & Navigation */}
//        <div className="w-full max-w-lg flex flex-col items-center gap-4">
//          {isFlipped && ( // Show marking buttons only when flipped
//            <div className="flex justify-center gap-4 mb-4 w-full">
//                 <Button
//                     variant={isMarked && !wasMarkedKnown ? 'destructive' : 'outline'}
//                     size="lg"
//                     onClick={() => handleMarkResult(false)}
//                     className={`flex-1 transition-colors ${isMarked && !wasMarkedKnown ? 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
//                  >
//                     <X className="mr-2 h-5 w-5" /> Didn't Know
//                  </Button>
//                  <Button
//                     variant={isMarked && wasMarkedKnown ? 'default' : 'outline'}
//                     size="lg"
//                     onClick={() => handleMarkResult(true)}
//                     className={`flex-1 transition-colors ${isMarked && wasMarkedKnown ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-green-500 text-green-700 hover:bg-green-50'}`}
//                  >
//                      <Check className="mr-2 h-5 w-5" /> Knew It
//                  </Button>
//              </div>
//           )}

//          {/* Navigation Buttons */}
//          <div className="flex justify-between w-full">
//              <Button variant="outline" onClick={() => navigate('prev')} disabled={totalCards <= 1}>
//                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
//              </Button>
//              <Button variant="outline" onClick={() => navigate('next')} disabled={totalCards <= 1}>
//                  Next <ArrowRight className="ml-2 h-4 w-4" />
//              </Button>
//          </div>
//        </div>
//     </div>
//   );
// };

// export default FlashCardQuestion;