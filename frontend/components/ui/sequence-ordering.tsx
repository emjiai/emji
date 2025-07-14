'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, GripVertical, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, Reorder } from 'framer-motion';

interface SequenceItem {
  id: string;
  content: string;
  image?: string;
}

interface SequenceOrderingProps {
  items: SequenceItem[];
  correctOrder: string[];
  onSubmit?: (isCorrect: boolean, submittedOrder: string[]) => void;
  className?: string;
}

const SequenceOrdering: React.FC<SequenceOrderingProps> = ({
  items,
  correctOrder,
  onSubmit,
  className = '',
}) => {
  const [orderedItems, setOrderedItems] = useState<SequenceItem[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Initialize the items in a randomized order
  useEffect(() => {
    // Create a copy and shuffle
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setOrderedItems(shuffled);
    setSubmitted(false);
    setIsCorrect(false);
  }, [items]);

  const handleSubmit = () => {
    const currentOrder = orderedItems.map(item => item.id);
    const correct = JSON.stringify(currentOrder) === JSON.stringify(correctOrder);
    
    setIsCorrect(correct);
    setSubmitted(true);
    
    if (onSubmit) {
      onSubmit(correct, currentOrder);
    }
  };

  const handleReset = () => {
    // Shuffle items again
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setOrderedItems(shuffled);
    setSubmitted(false);
    setIsCorrect(false);
  };

  return (
    <div className={cn("p-4 bg-white rounded-lg shadow-md", className)}>
      <h3 className="text-lg font-medium mb-4">Arrange in the correct order</h3>
      
      <div className="mb-6">
        <Reorder.Group 
          axis="y" 
          values={orderedItems} 
          onReorder={setOrderedItems}
          className={cn(
            "space-y-2",
            submitted && "pointer-events-none opacity-80"
          )}
        >
          {orderedItems.map((item) => (
            <Reorder.Item 
              key={item.id} 
              value={item}
              className={cn(
                "flex items-center p-3 border rounded-lg transition-colors",
                submitted && correctOrder.indexOf(item.id) === orderedItems.indexOf(item) 
                  ? "border-green-300 bg-green-50" 
                  : submitted 
                    ? "border-red-300 bg-red-50" 
                    : "border-gray-200 hover:bg-gray-50 cursor-move"
              )}
            >
              <GripVertical className="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" />
              
              <div className="flex-grow">
                {item.image && (
                  <div className="mr-3 flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.content}
                      className="h-10 w-10 object-cover rounded-md"
                    />
                  </div>
                )}
                <span>{item.content}</span>
              </div>
              
              {submitted && (
                <div className="ml-2 flex-shrink-0">
                  {correctOrder.indexOf(item.id) === orderedItems.indexOf(item) ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>
              )}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
      
      <div className="flex justify-between">
        <Button
          onClick={handleReset}
          variant="outline"
          className="flex items-center"
          disabled={submitted && isCorrect}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset Order
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
          isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        )}>
          {isCorrect 
            ? "Correct! You've arranged the items in the right order." 
            : "Incorrect. Try rearranging the items in the correct order."}
        </div>
      )}
    </div>
  );
};

export default SequenceOrdering;