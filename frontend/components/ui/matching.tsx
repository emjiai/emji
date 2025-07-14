'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Check, RefreshCw, GripVertical, CheckCircle, XCircle, Shuffle } from 'lucide-react';

// Utility function to combine class names
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export interface ActionResultItem {
  id: string;
  content: string;
  type: 'action' | 'result';
  image?: string;
}

export interface ActionResultPair {
  id: string;
  action: ActionResultItem;
  result: ActionResultItem;
}

interface MatchingProps {
  title?: string;
  description?: string;
  pairs: ActionResultPair[];
  onSubmit?: (isCorrect: boolean, matches: Array<{actionId: string, resultId: string}>) => void;
  shuffleItems?: boolean;
  className?: string;
}

interface DragCard extends ActionResultItem {
  originalIndex: number;
}

interface PairSlot {
  id: string;
  actionCard?: DragCard;
  resultCard?: DragCard;
  isComplete: boolean;
}

const Matching: React.FC<MatchingProps> = ({
  title = 'Card Pairing Exercise',
  description = 'Drag action and result cards to arrange them side by side in correct pairs.',
  pairs,
  onSubmit,
  shuffleItems = true,
  className = '',
}) => {
  const [availableCards, setAvailableCards] = useState<DragCard[]>([]);
  const [pairSlots, setPairSlots] = useState<PairSlot[]>([]);
  const [draggedCard, setDraggedCard] = useState<DragCard | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [allCorrect, setAllCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [hoveredSlotType, setHoveredSlotType] = useState<'action' | 'result' | null>(null);

  // Touch/mobile support
  const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });
  const dragPreviewRef = useRef<HTMLDivElement>(null);

  // Track if user has interacted to prevent reshuffling during use
  const hasUserInteracted = useRef(false);
  const isInitialized = useRef(false);

  // Initialize cards and pair slots
  useEffect(() => {
    // Only initialize once, unless pairs actually change in content
    if (isInitialized.current && !hasActuallyChanged()) return;
    
    // Don't re-shuffle if user has already started interacting
    if (hasUserInteracted.current) return;
    
    // Create all cards (actions and results)
    const allCards: DragCard[] = [];
    pairs.forEach((pair, index) => {
      allCards.push({ ...pair.action, originalIndex: index });
      allCards.push({ ...pair.result, originalIndex: index });
    });

    if (shuffleItems && !isInitialized.current) {
      setAvailableCards(shuffleArray([...allCards]));
    } else if (!isInitialized.current) {
      setAvailableCards(allCards);
    }

    // Initialize empty pair slots only if not initialized
    if (!isInitialized.current) {
      const slots: PairSlot[] = pairs.map((pair, index) => ({
        id: `slot-${index}`,
        isComplete: false,
      }));
      setPairSlots(slots);
    }
    
    isInitialized.current = true;
  }, [pairs]); // Keep pairs dependency but add guards

  // Helper function to check if pairs have actually changed
  const hasActuallyChanged = () => {
    // Simple check - if pairs length changed, it's a real change
    return pairSlots.length !== pairs.length;
  };

  // Shuffle array utility
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, card: DragCard) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(card));
    
    // Create a custom drag image
    if (e.currentTarget instanceof HTMLElement) {
      const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
      dragImage.style.transform = 'rotate(2deg)';
      dragImage.style.opacity = '0.8';
      e.dataTransfer.setDragImage(dragImage, 75, 25);
    }
  };

  const handleDragOver = (e: React.DragEvent, slotId: string, slotType: 'action' | 'result') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setHoveredSlot(slotId);
    setHoveredSlotType(slotType);
  };

  const handleDragLeave = () => {
    setHoveredSlot(null);
    setHoveredSlotType(null);
  };

  const handleDrop = (e: React.DragEvent, slotId: string, slotType: 'action' | 'result') => {
    e.preventDefault();
    setHoveredSlot(null);
    setHoveredSlotType(null);
    
    const cardData = e.dataTransfer.getData('text/plain');
    if (!cardData) return;
    
    try {
      const droppedCard: DragCard = JSON.parse(cardData);
      
      // Only allow dropping if card type matches slot type
      if (droppedCard.type === slotType) {
        placeCardInSlot(droppedCard, slotId, slotType);
      }
    } catch (error) {
      console.error('Error parsing dropped card:', error);
    }
  };

  // Touch handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent, card: DragCard) => {
    e.preventDefault();
    setDraggedCard(card);
    
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    setTouchOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggedCard || !dragPreviewRef.current) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    
    dragPreviewRef.current.style.left = `${touch.clientX - touchOffset.x}px`;
    dragPreviewRef.current.style.top = `${touch.clientY - touchOffset.y}px`;
    
    // Find element under touch
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const slotElement = elementBelow?.closest('[data-slot-id]');
    
    if (slotElement) {
      const slotId = slotElement.getAttribute('data-slot-id');
      const slotType = slotElement.getAttribute('data-slot-type') as 'action' | 'result';
      setHoveredSlot(slotId);
      setHoveredSlotType(slotType);
    } else {
      setHoveredSlot(null);
      setHoveredSlotType(null);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!draggedCard) return;
    
    e.preventDefault();
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const slotElement = elementBelow?.closest('[data-slot-id]');
    
    if (slotElement) {
      const slotId = slotElement.getAttribute('data-slot-id');
      const slotType = slotElement.getAttribute('data-slot-type') as 'action' | 'result';
      
      if (slotId && slotType && draggedCard.type === slotType) {
        placeCardInSlot(draggedCard, slotId, slotType);
      }
    }
    
    setDraggedCard(null);
    setHoveredSlot(null);
    setHoveredSlotType(null);
    
    if (dragPreviewRef.current) {
      dragPreviewRef.current.style.display = 'none';
    }
  };

  const placeCardInSlot = (card: DragCard, slotId: string, slotType: 'action' | 'result') => {
    // Mark that user has started interacting
    hasUserInteracted.current = true;
    
    setPairSlots(prevSlots => {
      const newSlots = prevSlots.map(slot => {
        if (slot.id === slotId) {
          // If slot already has a card of this type, return it to available cards
          const existingCard = slotType === 'action' ? slot.actionCard : slot.resultCard;
          if (existingCard) {
            setAvailableCards(prev => [...prev, existingCard]);
          }
          
          // Place the new card
          const updatedSlot = {
            ...slot,
            [slotType === 'action' ? 'actionCard' : 'resultCard']: card,
          };
          updatedSlot.isComplete = !!(updatedSlot.actionCard && updatedSlot.resultCard);
          
          return updatedSlot;
        }
        
        // Remove card from any other slots it might be in
        let updatedSlot = { ...slot };
        if (slot.actionCard?.id === card.id) {
          updatedSlot.actionCard = undefined;
          updatedSlot.isComplete = false;
        }
        if (slot.resultCard?.id === card.id) {
          updatedSlot.resultCard = undefined;
          updatedSlot.isComplete = false;
        }
        updatedSlot.isComplete = !!(updatedSlot.actionCard && updatedSlot.resultCard);
        
        return updatedSlot;
      });
      return newSlots;
    });

    // Remove card from available cards
    setAvailableCards(prev => prev.filter(availableCard => availableCard.id !== card.id));
    setDraggedCard(null);
  };

  const removeCardFromSlot = (slotId: string, cardType: 'action' | 'result') => {
    setPairSlots(prevSlots => {
      const newSlots = [...prevSlots];
      const slot = newSlots.find(s => s.id === slotId);
      
      if (slot) {
        const cardToRemove = cardType === 'action' ? slot.actionCard : slot.resultCard;
        if (cardToRemove) {
          // Return card to available cards
          setAvailableCards(prev => [...prev, cardToRemove]);
          
          // Clear the slot
          if (cardType === 'action') {
            slot.actionCard = undefined;
          } else {
            slot.resultCard = undefined;
          }
          slot.isComplete = !!(slot.actionCard && slot.resultCard);
        }
      }
      
      return newSlots;
    });
  };

  const handleSubmit = () => {
    const submittedMatches: Array<{actionId: string, resultId: string}> = [];
    const newResults: Record<string, boolean> = {};
    let correctCount = 0;
    
    pairSlots.forEach((slot, index) => {
      if (slot.isComplete && slot.actionCard && slot.resultCard) {
        const actionId = slot.actionCard.id;
        const resultId = slot.resultCard.id;
        
        submittedMatches.push({ actionId, resultId });
        
        // Check if this pair is correct
        const correctPair = pairs.find(pair => 
          pair.action.id === actionId && pair.result.id === resultId
        );
        
        const isCorrect = !!correctPair;
        newResults[slot.id] = isCorrect;
        
        if (isCorrect) correctCount++;
      } else {
        newResults[slot.id] = false;
      }
    });
    
    const newScore = Math.round((correctCount / pairs.length) * 100);
    
    setResults(newResults);
    setSubmitted(true);
    setAllCorrect(correctCount === pairs.length);
    setScore(newScore);
    
    if (onSubmit) {
      onSubmit(correctCount === pairs.length, submittedMatches);
    }
  };

  const handleReset = () => {
    // Reset interaction flag to allow reshuffling on reset
    hasUserInteracted.current = false;
    isInitialized.current = false;
    
    // Return all cards to available pool
    const allCards: DragCard[] = [];
    pairs.forEach((pair, index) => {
      allCards.push({ ...pair.action, originalIndex: index });
      allCards.push({ ...pair.result, originalIndex: index });
    });
    
    if (shuffleItems) {
      setAvailableCards(shuffleArray([...allCards]));
    } else {
      setAvailableCards(allCards);
    }
    
    // Clear all slots
    setPairSlots(slots => slots.map(slot => ({
      ...slot,
      actionCard: undefined,
      resultCard: undefined,
      isComplete: false,
    })));
    
    setSubmitted(false);
    setResults({});
    setAllCorrect(false);
    setScore(0);
    setDraggedCard(null);
    setHoveredSlot(null);
    setHoveredSlotType(null);
  };

  const isAllPaired = () => {
    return pairSlots.every(slot => slot.isComplete);
  };

  const getCardsByType = (type: 'action' | 'result') => {
    return availableCards.filter(card => card.type === type);
  };

  return (
    <div className={cn("p-6 bg-white rounded-lg shadow-md", className)}>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      
      {/* Available Cards Pool */}
      <div className="mb-8">
        <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          <Shuffle className="w-5 h-5 mr-2 text-purple-600" />
          Available Cards ({availableCards.length})
        </h4>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Action Cards */}
          <div>
            <h5 className="text-sm font-medium text-blue-700 mb-3">Action Cards</h5>
            <div className="grid grid-cols-1 gap-2 min-h-[120px] p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
              {getCardsByType('action').map(card => (
                <div
                  key={card.id}
                  draggable={!submitted}
                  onDragStart={(e) => handleDragStart(e, card)}
                  onTouchStart={(e) => handleTouchStart(e, card)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={cn(
                    "p-3 bg-blue-100 border-2 border-blue-300 rounded-lg shadow-sm transition-all duration-200 cursor-move select-none",
                    !submitted && "hover:shadow-md hover:scale-105 active:scale-95",
                    draggedCard?.id === card.id && "opacity-50",
                    submitted && "cursor-not-allowed opacity-60"
                  )}
                >
                  <div className="flex items-center">
                    <GripVertical className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-blue-800">{card.content}</span>
                  </div>
                </div>
              ))}
              {getCardsByType('action').length === 0 && (
                <div className="text-center text-blue-400 italic py-8 text-sm">
                  All action cards have been placed
                </div>
              )}
            </div>
          </div>
          
          {/* Result Cards */}
          <div>
            <h5 className="text-sm font-medium text-green-700 mb-3">Result Cards</h5>
            <div className="grid grid-cols-1 gap-2 min-h-[120px] p-3 bg-green-50 rounded-lg border-2 border-green-200">
              {getCardsByType('result').map(card => (
                <div
                  key={card.id}
                  draggable={!submitted}
                  onDragStart={(e) => handleDragStart(e, card)}
                  onTouchStart={(e) => handleTouchStart(e, card)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={cn(
                    "p-3 bg-green-100 border-2 border-green-300 rounded-lg shadow-sm transition-all duration-200 cursor-move select-none",
                    !submitted && "hover:shadow-md hover:scale-105 active:scale-95",
                    draggedCard?.id === card.id && "opacity-50",
                    submitted && "cursor-not-allowed opacity-60"
                  )}
                >
                  <div className="flex items-center">
                    <GripVertical className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-800">{card.content}</span>
                  </div>
                </div>
              ))}
              {getCardsByType('result').length === 0 && (
                <div className="text-center text-green-400 italic py-8 text-sm">
                  All result cards have been placed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Pairing Area */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-800 mb-4">
          Arrange Action-Result Pairs
        </h4>
        
        <div className="space-y-3">
          {pairSlots.map((slot, index) => (
            <div
              key={slot.id}
              className={cn(
                "grid grid-cols-[1fr,auto,1fr] gap-4 p-4 rounded-lg border-2 transition-all duration-200",
                submitted
                  ? results[slot.id]
                    ? "border-green-400 bg-green-50"
                    : "border-red-400 bg-red-50"
                  : slot.isComplete
                  ? "border-gray-400 bg-gray-50"
                  : "border-gray-200 bg-white"
              )}
            >
              {/* Action Slot */}
              <div
                data-slot-id={slot.id}
                data-slot-type="action"
                className={cn(
                  "min-h-[60px] p-3 border-2 border-dashed rounded-lg transition-all duration-200",
                  hoveredSlot === slot.id && hoveredSlotType === 'action' && !submitted
                    ? "border-blue-400 bg-blue-50"
                    : "border-blue-200 bg-blue-25",
                  !submitted && "hover:border-blue-300"
                )}
                onDragOver={(e) => handleDragOver(e, slot.id, 'action')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, slot.id, 'action')}
              >
                {slot.actionCard ? (
                  <div className="p-2 bg-blue-100 border-2 border-blue-300 rounded shadow-sm flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800">{slot.actionCard.content}</span>
                    {submitted && (
                      <div className="ml-2">
                        {results[slot.id] ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    )}
                    {!submitted && (
                      <Button
                        onClick={() => removeCardFromSlot(slot.id, 'action')}
                        size="sm"
                        variant="ghost"
                        className="text-blue-500 hover:text-red-500 p-1 h-auto"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-blue-400 italic py-3 text-center">
                    Drop Action Card Here
                  </div>
                )}
              </div>
              
              {/* Arrow */}
              <div className="flex items-center justify-center">
                <div className="w-8 h-0.5 bg-gray-400"></div>
                <div className="w-0 h-0 border-l-[8px] border-l-gray-400 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
              </div>
              
              {/* Result Slot */}
              <div
                data-slot-id={slot.id}
                data-slot-type="result"
                className={cn(
                  "min-h-[60px] p-3 border-2 border-dashed rounded-lg transition-all duration-200",
                  hoveredSlot === slot.id && hoveredSlotType === 'result' && !submitted
                    ? "border-green-400 bg-green-50"
                    : "border-green-200 bg-green-25",
                  !submitted && "hover:border-green-300"
                )}
                onDragOver={(e) => handleDragOver(e, slot.id, 'result')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, slot.id, 'result')}
              >
                {slot.resultCard ? (
                  <div className="p-2 bg-green-100 border-2 border-green-300 rounded shadow-sm flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">{slot.resultCard.content}</span>
                    {submitted && (
                      <div className="ml-2">
                        {results[slot.id] ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    )}
                    {!submitted && (
                      <Button
                        onClick={() => removeCardFromSlot(slot.id, 'result')}
                        size="sm"
                        variant="ghost"
                        className="text-green-500 hover:text-red-500 p-1 h-auto"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-green-400 italic py-3 text-center">
                    Drop Result Card Here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between">
        <Button
          onClick={handleReset}
          variant="outline"
          className="flex items-center"
          disabled={!submitted && availableCards.length === pairs.length * 2}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        
        <Button
          onClick={handleSubmit}
          className="flex items-center"
          disabled={submitted || !isAllPaired()}
        >
          <Check className="h-4 w-4 mr-2" />
          Submit Pairs
        </Button>
      </div>
      
      {/* Results */}
      {submitted && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-medium mb-2">Results</h4>
          <div className="flex items-center mb-4">
            <div className="text-xl font-bold mr-3">{score}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={cn(
                  "h-2.5 rounded-full transition-all duration-500",
                  score >= 80 ? "bg-green-500" : 
                  score >= 60 ? "bg-yellow-500" : "bg-red-500"
                )}
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>
          
          <div className={cn(
            "p-3 rounded-lg text-sm",
            allCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          )}>
            {allCorrect ? (
              "Perfect! All action-result pairs are correct."
            ) : (
              <div>
                <p>Review the feedback above to see which pairs were correct.</p>
                <p className="mt-1">You got {Object.values(results).filter(Boolean).length} out of {pairs.length} pairs correct.</p>
              </div>
            )}
          </div>
          
          {/* Show correct answers for incorrect pairs */}
          {!allCorrect && (
            <div className="mt-4 space-y-2">
              <h5 className="font-medium text-gray-700">Correct Pairs:</h5>
              {pairs.map((pair, index) => (
                !results[`slot-${index}`] && (
                  <div key={pair.id} className="p-2 bg-white rounded border text-sm">
                    <span className="text-blue-700 font-medium">{pair.action.content}</span>
                    <span className="mx-2 text-gray-500">→</span>
                    <span className="text-green-700 font-medium">{pair.result.content}</span>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Touch drag preview */}
      {draggedCard && (
        <div
          ref={dragPreviewRef}
          className={cn(
            "fixed z-50 pointer-events-none p-3 border-2 rounded shadow-lg transform rotate-2",
            draggedCard.type === 'action' 
              ? "bg-blue-100 border-blue-400" 
              : "bg-green-100 border-green-400"
          )}
          style={{ 
            display: 'block',
            left: '50%',
            top: '50%',
          }}
        >
          <div className="flex items-center">
            <span className="text-sm font-medium">{draggedCard.content}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matching;

// 'use client';

// import React, { useState, useEffect, useRef } from 'react';
// import { Button } from '@/components/ui/button';
// import { Check, RefreshCw, GripVertical, CheckCircle, XCircle, Shuffle } from 'lucide-react';

// // Utility function to combine class names
// const cn = (...classes: (string | undefined | null | false)[]) => {
//   return classes.filter(Boolean).join(' ');
// };

// export interface ActionResultItem {
//   id: string;
//   content: string;
//   type: 'action' | 'result';
//   image?: string;
// }

// export interface ActionResultPair {
//   id: string;
//   action: ActionResultItem;
//   result: ActionResultItem;
// }

// interface MatchingProps {
//   title?: string;
//   description?: string;
//   pairs: ActionResultPair[];
//   onSubmit?: (isCorrect: boolean, matches: Array<{actionId: string, resultId: string}>) => void;
//   className?: string;
// }

// interface DragCard extends ActionResultItem {
//   originalIndex: number;
// }

// interface PairSlot {
//   id: string;
//   actionCard?: DragCard;
//   resultCard?: DragCard;
//   isComplete: boolean;
// }

// const Matching: React.FC<MatchingProps> = ({
//   title = 'Card Pairing Exercise',
//   description = 'Drag action and result cards to arrange them side by side in correct pairs.',
//   pairs,
//   onSubmit,
//   className = '',
// }) => {
//   const [availableCards, setAvailableCards] = useState<DragCard[]>([]);
//   const [pairSlots, setPairSlots] = useState<PairSlot[]>([]);
//   const [draggedCard, setDraggedCard] = useState<DragCard | null>(null);
//   const [submitted, setSubmitted] = useState(false);
//   const [results, setResults] = useState<Record<string, boolean>>({});
//   const [allCorrect, setAllCorrect] = useState(false);
//   const [score, setScore] = useState(0);
//   const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
//   const [hoveredSlotType, setHoveredSlotType] = useState<'action' | 'result' | null>(null);

//   // Touch/mobile support
//   const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });
//   const dragPreviewRef = useRef<HTMLDivElement>(null);

//   // Initialize cards and pair slots
//   useEffect(() => {
//     // Create all cards (actions and results)
//     const allCards: DragCard[] = [];
//     pairs.forEach((pair, index) => {
//       allCards.push({ ...pair.action, originalIndex: index });
//       allCards.push({ ...pair.result, originalIndex: index });
//     });

//     setAvailableCards([...allCards]);

//     // Initialize empty pair slots
//     const slots: PairSlot[] = pairs.map((pair, index) => ({
//       id: `slot-${index}`,
//       isComplete: false,
//     }));
//     setPairSlots(slots);
//   }, [pairs]);

//   // Drag handlers
//   const handleDragStart = (e: React.DragEvent, card: DragCard) => {
//     setDraggedCard(card);
//     e.dataTransfer.effectAllowed = 'move';
//     e.dataTransfer.setData('text/plain', JSON.stringify(card));
    
//     // Create a custom drag image
//     if (e.currentTarget instanceof HTMLElement) {
//       const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
//       dragImage.style.transform = 'rotate(2deg)';
//       dragImage.style.opacity = '0.8';
//       e.dataTransfer.setDragImage(dragImage, 75, 25);
//     }
//   };

//   const handleDragOver = (e: React.DragEvent, slotId: string, slotType: 'action' | 'result') => {
//     e.preventDefault();
//     e.dataTransfer.dropEffect = 'move';
//     setHoveredSlot(slotId);
//     setHoveredSlotType(slotType);
//   };

//   const handleDragLeave = () => {
//     setHoveredSlot(null);
//     setHoveredSlotType(null);
//   };

//   const handleDrop = (e: React.DragEvent, slotId: string, slotType: 'action' | 'result') => {
//     e.preventDefault();
//     setHoveredSlot(null);
//     setHoveredSlotType(null);
    
//     const cardData = e.dataTransfer.getData('text/plain');
//     if (!cardData) return;
    
//     try {
//       const droppedCard: DragCard = JSON.parse(cardData);
      
//       // Only allow dropping if card type matches slot type
//       if (droppedCard.type === slotType) {
//         placeCardInSlot(droppedCard, slotId, slotType);
//       }
//     } catch (error) {
//       console.error('Error parsing dropped card:', error);
//     }
//   };

//   // Touch handlers for mobile support
//   const handleTouchStart = (e: React.TouchEvent, card: DragCard) => {
//     e.preventDefault();
//     setDraggedCard(card);
    
//     const touch = e.touches[0];
//     const rect = e.currentTarget.getBoundingClientRect();
//     setTouchOffset({
//       x: touch.clientX - rect.left,
//       y: touch.clientY - rect.top,
//     });
//   };

//   const handleTouchMove = (e: React.TouchEvent) => {
//     if (!draggedCard || !dragPreviewRef.current) return;
    
//     e.preventDefault();
//     const touch = e.touches[0];
    
//     dragPreviewRef.current.style.left = `${touch.clientX - touchOffset.x}px`;
//     dragPreviewRef.current.style.top = `${touch.clientY - touchOffset.y}px`;
    
//     // Find element under touch
//     const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
//     const slotElement = elementBelow?.closest('[data-slot-id]');
    
//     if (slotElement) {
//       const slotId = slotElement.getAttribute('data-slot-id');
//       const slotType = slotElement.getAttribute('data-slot-type') as 'action' | 'result';
//       setHoveredSlot(slotId);
//       setHoveredSlotType(slotType);
//     } else {
//       setHoveredSlot(null);
//       setHoveredSlotType(null);
//     }
//   };

//   const handleTouchEnd = (e: React.TouchEvent) => {
//     if (!draggedCard) return;
    
//     e.preventDefault();
//     const touch = e.changedTouches[0];
//     const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
//     const slotElement = elementBelow?.closest('[data-slot-id]');
    
//     if (slotElement) {
//       const slotId = slotElement.getAttribute('data-slot-id');
//       const slotType = slotElement.getAttribute('data-slot-type') as 'action' | 'result';
      
//       if (slotId && slotType && draggedCard.type === slotType) {
//         placeCardInSlot(draggedCard, slotId, slotType);
//       }
//     }
    
//     setDraggedCard(null);
//     setHoveredSlot(null);
//     setHoveredSlotType(null);
    
//     if (dragPreviewRef.current) {
//       dragPreviewRef.current.style.display = 'none';
//     }
//   };

//   const placeCardInSlot = (card: DragCard, slotId: string, slotType: 'action' | 'result') => {
//     setPairSlots(prevSlots => {
//       const newSlots = prevSlots.map(slot => {
//         if (slot.id === slotId) {
//           // If slot already has a card of this type, return it to available cards
//           const existingCard = slotType === 'action' ? slot.actionCard : slot.resultCard;
//           if (existingCard) {
//             setAvailableCards(prev => [...prev, existingCard]);
//           }
          
//           // Place the new card
//           const updatedSlot = {
//             ...slot,
//             [slotType === 'action' ? 'actionCard' : 'resultCard']: card,
//           };
//           updatedSlot.isComplete = !!(updatedSlot.actionCard && updatedSlot.resultCard);
          
//           return updatedSlot;
//         }
        
//         // Remove card from any other slots it might be in
//         let updatedSlot = { ...slot };
//         if (slot.actionCard?.id === card.id) {
//           updatedSlot.actionCard = undefined;
//           updatedSlot.isComplete = false;
//         }
//         if (slot.resultCard?.id === card.id) {
//           updatedSlot.resultCard = undefined;
//           updatedSlot.isComplete = false;
//         }
//         updatedSlot.isComplete = !!(updatedSlot.actionCard && updatedSlot.resultCard);
        
//         return updatedSlot;
//       });
//       return newSlots;
//     });

//     // Remove card from available cards
//     setAvailableCards(prev => prev.filter(availableCard => availableCard.id !== card.id));
//     setDraggedCard(null);
//   };

//   const removeCardFromSlot = (slotId: string, cardType: 'action' | 'result') => {
//     setPairSlots(prevSlots => {
//       const newSlots = [...prevSlots];
//       const slot = newSlots.find(s => s.id === slotId);
      
//       if (slot) {
//         const cardToRemove = cardType === 'action' ? slot.actionCard : slot.resultCard;
//         if (cardToRemove) {
//           // Return card to available cards
//           setAvailableCards(prev => [...prev, cardToRemove]);
          
//           // Clear the slot
//           if (cardType === 'action') {
//             slot.actionCard = undefined;
//           } else {
//             slot.resultCard = undefined;
//           }
//           slot.isComplete = !!(slot.actionCard && slot.resultCard);
//         }
//       }
      
//       return newSlots;
//     });
//   };

//   const handleSubmit = () => {
//     const submittedMatches: Array<{actionId: string, resultId: string}> = [];
//     const newResults: Record<string, boolean> = {};
//     let correctCount = 0;
    
//     pairSlots.forEach((slot, index) => {
//       if (slot.isComplete && slot.actionCard && slot.resultCard) {
//         const actionId = slot.actionCard.id;
//         const resultId = slot.resultCard.id;
        
//         submittedMatches.push({ actionId, resultId });
        
//         // Check if this pair is correct
//         const correctPair = pairs.find(pair => 
//           pair.action.id === actionId && pair.result.id === resultId
//         );
        
//         const isCorrect = !!correctPair;
//         newResults[slot.id] = isCorrect;
        
//         if (isCorrect) correctCount++;
//       } else {
//         newResults[slot.id] = false;
//       }
//     });
    
//     const newScore = Math.round((correctCount / pairs.length) * 100);
    
//     setResults(newResults);
//     setSubmitted(true);
//     setAllCorrect(correctCount === pairs.length);
//     setScore(newScore);
    
//     if (onSubmit) {
//       onSubmit(correctCount === pairs.length, submittedMatches);
//     }
//   };

//   const handleReset = () => {
//     // Return all cards to available pool
//     const allCards: DragCard[] = [];
//     pairs.forEach((pair, index) => {
//       allCards.push({ ...pair.action, originalIndex: index });
//       allCards.push({ ...pair.result, originalIndex: index });
//     });
    
//     setAvailableCards(allCards);
    
//     // Clear all slots
//     setPairSlots(slots => slots.map(slot => ({
//       ...slot,
//       actionCard: undefined,
//       resultCard: undefined,
//       isComplete: false,
//     })));
    
//     setSubmitted(false);
//     setResults({});
//     setAllCorrect(false);
//     setScore(0);
//     setDraggedCard(null);
//     setHoveredSlot(null);
//     setHoveredSlotType(null);
//   };

//   const isAllPaired = () => {
//     return pairSlots.every(slot => slot.isComplete);
//   };

//   const getCardsByType = (type: 'action' | 'result') => {
//     return availableCards.filter(card => card.type === type);
//   };

//   return (
//     <div className={cn("p-6 bg-white rounded-lg shadow-md", className)}>
//       <h3 className="text-xl font-semibold mb-2">{title}</h3>
//       <p className="text-gray-600 mb-6">{description}</p>
      
//       {/* Available Cards Pool */}
//       <div className="mb-8">
//         <h4 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
//           Available Cards ({availableCards.length})
//         </h4>
        
//         <div className="grid grid-cols-2 gap-6">
//           {/* Action Cards */}
//           <div>
//             <h5 className="text-sm font-medium text-blue-700 mb-3">Action Cards</h5>
//             <div className="grid grid-cols-1 gap-2 min-h-[120px] p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
//               {getCardsByType('action').map(card => (
//                 <div
//                   key={card.id}
//                   draggable={!submitted}
//                   onDragStart={(e) => handleDragStart(e, card)}
//                   onTouchStart={(e) => handleTouchStart(e, card)}
//                   onTouchMove={handleTouchMove}
//                   onTouchEnd={handleTouchEnd}
//                   className={cn(
//                     "p-3 bg-blue-100 border-2 border-blue-300 rounded-lg shadow-sm transition-all duration-200 cursor-move select-none",
//                     !submitted && "hover:shadow-md hover:scale-105 active:scale-95",
//                     draggedCard?.id === card.id && "opacity-50",
//                     submitted && "cursor-not-allowed opacity-60"
//                   )}
//                 >
//                   <div className="flex items-center">
//                     <GripVertical className="w-4 h-4 text-blue-500 mr-2" />
//                     <span className="text-sm font-medium text-blue-800">{card.content}</span>
//                   </div>
//                 </div>
//               ))}
//               {getCardsByType('action').length === 0 && (
//                 <div className="text-center text-blue-400 italic py-8 text-sm">
//                   All action cards have been placed
//                 </div>
//               )}
//             </div>
//           </div>
          
//           {/* Result Cards */}
//           <div>
//             <h5 className="text-sm font-medium text-green-700 mb-3">Result Cards</h5>
//             <div className="grid grid-cols-1 gap-2 min-h-[120px] p-3 bg-green-50 rounded-lg border-2 border-green-200">
//               {getCardsByType('result').map(card => (
//                 <div
//                   key={card.id}
//                   draggable={!submitted}
//                   onDragStart={(e) => handleDragStart(e, card)}
//                   onTouchStart={(e) => handleTouchStart(e, card)}
//                   onTouchMove={handleTouchMove}
//                   onTouchEnd={handleTouchEnd}
//                   className={cn(
//                     "p-3 bg-green-100 border-2 border-green-300 rounded-lg shadow-sm transition-all duration-200 cursor-move select-none",
//                     !submitted && "hover:shadow-md hover:scale-105 active:scale-95",
//                     draggedCard?.id === card.id && "opacity-50",
//                     submitted && "cursor-not-allowed opacity-60"
//                   )}
//                 >
//                   <div className="flex items-center">
//                     <GripVertical className="w-4 h-4 text-green-500 mr-2" />
//                     <span className="text-sm font-medium text-green-800">{card.content}</span>
//                   </div>
//                 </div>
//               ))}
//               {getCardsByType('result').length === 0 && (
//                 <div className="text-center text-green-400 italic py-8 text-sm">
//                   All result cards have been placed
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* Pairing Area */}
//       <div className="mb-6">
//         <h4 className="text-lg font-medium text-gray-800 mb-4">
//           Arrange Action-Result Pairs
//         </h4>
        
//         <div className="space-y-3">
//           {pairSlots.map((slot, index) => (
//             <div
//               key={slot.id}
//               className={cn(
//                 "grid grid-cols-[1fr,auto,1fr] gap-4 p-4 rounded-lg border-2 transition-all duration-200",
//                 submitted
//                   ? results[slot.id]
//                     ? "border-green-400 bg-green-50"
//                     : "border-red-400 bg-red-50"
//                   : slot.isComplete
//                   ? "border-gray-400 bg-gray-50"
//                   : "border-gray-200 bg-white"
//               )}
//             >
//               {/* Action Slot */}
//               <div
//                 data-slot-id={slot.id}
//                 data-slot-type="action"
//                 className={cn(
//                   "min-h-[60px] p-3 border-2 border-dashed rounded-lg transition-all duration-200",
//                   hoveredSlot === slot.id && hoveredSlotType === 'action' && !submitted
//                     ? "border-blue-400 bg-blue-50"
//                     : "border-blue-200 bg-blue-25",
//                   !submitted && "hover:border-blue-300"
//                 )}
//                 onDragOver={(e) => handleDragOver(e, slot.id, 'action')}
//                 onDragLeave={handleDragLeave}
//                 onDrop={(e) => handleDrop(e, slot.id, 'action')}
//               >
//                 {slot.actionCard ? (
//                   <div className="p-2 bg-blue-100 border-2 border-blue-300 rounded shadow-sm flex items-center justify-between">
//                     <span className="text-sm font-medium text-blue-800">{slot.actionCard.content}</span>
//                     {submitted && (
//                       <div className="ml-2">
//                         {results[slot.id] ? (
//                           <CheckCircle className="w-4 h-4 text-green-500" />
//                         ) : (
//                           <XCircle className="w-4 h-4 text-red-500" />
//                         )}
//                       </div>
//                     )}
//                     {!submitted && (
//                       <Button
//                         onClick={() => removeCardFromSlot(slot.id, 'action')}
//                         size="sm"
//                         variant="ghost"
//                         className="text-blue-500 hover:text-red-500 p-1 h-auto"
//                       >
//                         ×
//                       </Button>
//                     )}
//                   </div>
//                 ) : (
//                   <div className="text-sm text-blue-400 italic py-3 text-center">
//                     Drop Action Card Here
//                   </div>
//                 )}
//               </div>
              
//               {/* Arrow */}
//               <div className="flex items-center justify-center">
//                 <div className="w-8 h-0.5 bg-gray-400"></div>
//                 <div className="w-0 h-0 border-l-[8px] border-l-gray-400 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
//               </div>
              
//               {/* Result Slot */}
//               <div
//                 data-slot-id={slot.id}
//                 data-slot-type="result"
//                 className={cn(
//                   "min-h-[60px] p-3 border-2 border-dashed rounded-lg transition-all duration-200",
//                   hoveredSlot === slot.id && hoveredSlotType === 'result' && !submitted
//                     ? "border-green-400 bg-green-50"
//                     : "border-green-200 bg-green-25",
//                   !submitted && "hover:border-green-300"
//                 )}
//                 onDragOver={(e) => handleDragOver(e, slot.id, 'result')}
//                 onDragLeave={handleDragLeave}
//                 onDrop={(e) => handleDrop(e, slot.id, 'result')}
//               >
//                 {slot.resultCard ? (
//                   <div className="p-2 bg-green-100 border-2 border-green-300 rounded shadow-sm flex items-center justify-between">
//                     <span className="text-sm font-medium text-green-800">{slot.resultCard.content}</span>
//                     {submitted && (
//                       <div className="ml-2">
//                         {results[slot.id] ? (
//                           <CheckCircle className="w-4 h-4 text-green-500" />
//                         ) : (
//                           <XCircle className="w-4 h-4 text-red-500" />
//                         )}
//                       </div>
//                     )}
//                     {!submitted && (
//                       <Button
//                         onClick={() => removeCardFromSlot(slot.id, 'result')}
//                         size="sm"
//                         variant="ghost"
//                         className="text-green-500 hover:text-red-500 p-1 h-auto"
//                       >
//                         ×
//                       </Button>
//                     )}
//                   </div>
//                 ) : (
//                   <div className="text-sm text-green-400 italic py-3 text-center">
//                     Drop Result Card Here
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
      
//       {/* Action buttons */}
//       <div className="flex justify-between">
//         <Button
//           onClick={handleReset}
//           variant="outline"
//           className="flex items-center"
//           disabled={!submitted && availableCards.length === pairs.length * 2}
//         >
//           <RefreshCw className="h-4 w-4 mr-2" />
//           Reset
//         </Button>
        
//         <Button
//           onClick={handleSubmit}
//           className="flex items-center"
//           disabled={submitted || !isAllPaired()}
//         >
//           <Check className="h-4 w-4 mr-2" />
//           Submit Pairs
//         </Button>
//       </div>
      
//       {/* Results */}
//       {submitted && (
//         <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//           <h4 className="text-lg font-medium mb-2">Results</h4>
//           <div className="flex items-center mb-4">
//             <div className="text-xl font-bold mr-3">{score}%</div>
//             <div className="w-full bg-gray-200 rounded-full h-2.5">
//               <div 
//                 className={cn(
//                   "h-2.5 rounded-full transition-all duration-500",
//                   score >= 80 ? "bg-green-500" : 
//                   score >= 60 ? "bg-yellow-500" : "bg-red-500"
//                 )}
//                 style={{ width: `${score}%` }}
//               ></div>
//             </div>
//           </div>
          
//           <div className={cn(
//             "p-3 rounded-lg text-sm",
//             allCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
//           )}>
//             {allCorrect ? (
//               "Perfect! All action-result pairs are correct."
//             ) : (
//               <div>
//                 <p>Review the feedback above to see which pairs were correct.</p>
//                 <p className="mt-1">You got {Object.values(results).filter(Boolean).length} out of {pairs.length} pairs correct.</p>
//               </div>
//             )}
//           </div>
          
//           {/* Show correct answers for incorrect pairs */}
//           {!allCorrect && (
//             <div className="mt-4 space-y-2">
//               <h5 className="font-medium text-gray-700">Correct Pairs:</h5>
//               {pairs.map((pair, index) => (
//                 !results[`slot-${index}`] && (
//                   <div key={pair.id} className="p-2 bg-white rounded border text-sm">
//                     <span className="text-blue-700 font-medium">{pair.action.content}</span>
//                     <span className="mx-2 text-gray-500">→</span>
//                     <span className="text-green-700 font-medium">{pair.result.content}</span>
//                   </div>
//                 )
//               ))}
//             </div>
//           )}
//         </div>
//       )}
      
//       {/* Touch drag preview */}
//       {draggedCard && (
//         <div
//           ref={dragPreviewRef}
//           className={cn(
//             "fixed z-50 pointer-events-none p-3 border-2 rounded shadow-lg transform rotate-2",
//             draggedCard.type === 'action' 
//               ? "bg-blue-100 border-blue-400" 
//               : "bg-green-100 border-green-400"
//           )}
//           style={{ 
//             display: 'block',
//             left: '50%',
//             top: '50%',
//           }}
//         >
//           <div className="flex items-center">
//             <span className="text-sm font-medium">{draggedCard.content}</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Matching;