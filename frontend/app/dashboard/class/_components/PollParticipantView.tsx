'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react'; // For loading indicator

// --- Interfaces ---
interface PollOption {
  id: string;
  text: string;
}

interface PollQuestion {
  id: string;
  text: string;
  options: PollOption[];
}

interface PollParticipantViewProps {
  pollId: string;
  // Functions to interact with backend
  fetchCurrentQuestion: (pollId: string) => Promise<PollQuestion | null>;
  submitVote: (pollId: string, questionId: string, optionId: string) => Promise<void>;
}

const PollParticipantView: React.FC<PollParticipantViewProps> = ({
  pollId,
  fetchCurrentQuestion,
  submitVote,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<PollQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false); // Track if voted on the current question
  const [error, setError] = useState<string | null>(null);
  const [pollEndedOrInactive, setPollEndedOrInactive] = useState(false);

  // --- Fetch current question periodically or via WebSocket ---
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const loadQuestion = async () => {
       // Don't refetch if already voted on this question instance
       if (hasVoted && !isLoading) return;

      setIsLoading(true); // Show loading when fetching
      setError(null);
      setPollEndedOrInactive(false);
      try {
        const question = await fetchCurrentQuestion(pollId);
         // Check if the question changed or if we haven't voted yet
         if (question?.id !== currentQuestion?.id) {
             setCurrentQuestion(question);
             setSelectedOption(undefined); // Reset selection for new question
             setHasVoted(false); // Allow voting on new question
             setPollEndedOrInactive(!question); // Set inactive if null question received
         } else if (!question) {
             // Explicitly handle null question response
             setCurrentQuestion(null);
             setPollEndedOrInactive(true);
         }
         // If question is same and we already voted, do nothing - waiting state

      } catch (err) {
        console.error("Error fetching question:", err);
        setError("Could not load the poll question. Please try again later.");
        setCurrentQuestion(null); // Clear question on error
      } finally {
        // Delay setting loading to false slightly to avoid flash
        setTimeout(() => setIsLoading(false), 300);
      }
    };

    loadQuestion(); // Initial load

    // Option 1: Simple polling
    intervalId = setInterval(loadQuestion, 5000); // Check for new question every 5 seconds

    // Option 2: Implement WebSocket listener here

    return () => { // Cleanup
      if (intervalId) clearInterval(intervalId);
      // Disconnect WebSocket if using Option 2
    };
     // Re-run effect if pollId changes (though unlikely in this view)
     // hasVoted ensures we don't constantly poll after voting until the question changes
  }, [pollId, fetchCurrentQuestion, currentQuestion?.id, hasVoted]);

  // --- Event Handler ---
  const handleVoteSubmit = async () => {
    if (!currentQuestion || !selectedOption || isSubmitting || hasVoted) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await submitVote(pollId, currentQuestion.id, selectedOption);
      setHasVoted(true); // Mark as voted for this question
    } catch (err) {
      console.error("Error submitting vote:", err);
      setError("Could not submit your vote. Please try again.");
      // Optionally allow retry?
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Logic ---
  const renderContent = () => {
    if (isLoading && !currentQuestion) { // Initial loading state
      return (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          Loading poll...
        </div>
      );
    }

    if (error) {
      return <p className="text-red-600 text-center py-10">{error}</p>;
    }

    if (hasVoted) {
        return (
            <div className="text-center py-10 space-y-2">
                 <p className="font-semibold text-green-600">Vote submitted!</p>
                 <p className="text-gray-500 text-sm">Waiting for the next question...</p>
                 {isLoading && <Loader2 className="h-4 w-4 animate-spin mx-auto mt-1 text-gray-400" />}
            </div>
        );
    }


    if (pollEndedOrInactive || !currentQuestion) {
       return <p className="text-gray-500 text-center py-10">The poll is not currently active or has ended.</p>;
    }

    // Display the question and options
    return (
      <>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-center">{currentQuestion.text}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
           <RadioGroup
             value={selectedOption}
             onValueChange={setSelectedOption}
             className="space-y-3"
             disabled={isSubmitting || hasVoted}
           >
             {currentQuestion.options.map((option) => (
               <Label
                 key={option.id}
                 htmlFor={`${currentQuestion.id}-${option.id}`}
                 className={`flex items-center space-x-3 p-3 border rounded-md transition-colors cursor-pointer hover:bg-gray-50 ${selectedOption === option.id ? 'bg-blue-50 border-blue-500' : 'border-gray-200'}`}
               >
                 <RadioGroupItem value={option.id} id={`${currentQuestion.id}-${option.id}`} />
                 <span className="flex-grow text-sm md:text-base">{option.text}</span>
               </Label>
             ))}
           </RadioGroup>

           <Button
             onClick={handleVoteSubmit}
             disabled={!selectedOption || isSubmitting || hasVoted}
             className="w-full"
             size="lg"
           >
             {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
             Submit Vote
           </Button>
        </CardContent>
      </>
    );
  };


  return (
     <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
       <Card className="w-full max-w-md shadow-md"> {/* Mobile responsive width */}
           {renderContent()}
       </Card>
     </div>
   );
};

export default PollParticipantView;