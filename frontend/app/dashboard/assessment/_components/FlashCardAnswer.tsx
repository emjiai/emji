'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, XCircle, RotateCcw, ArrowLeft } from 'lucide-react';
// Make sure to install recharts: npm install recharts
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FlashCardAnswerProps {
  quizId: string; // Identifier for the session
  quizTitle: string; // Title of the flashcard deck/session
  results: Record<string, boolean>; // Results from FlashCardQuestion { cardId: isKnown }
  totalCards: number; // Total number of cards in the session
  onRetakeSession: () => void; // Function for retaking
  onBack?: () => void; // Optional: Go back to previous view/dashboard
  // Optional: Pass the original cards array if you want to show review details
  // cards?: { id: string; front: string; back: string }[];
}

/**
 * FlashCardAnswer Component
 * Displays the results of a completed flashcard review session.
 */
const FlashCardAnswer: React.FC<FlashCardAnswerProps> = ({
  quizId,
  quizTitle,
  results,
  totalCards,
  onRetakeSession,
  onBack,
  // cards = [] // Uncomment if passing original cards
}) => {
  const [showDetails, setShowDetails] = useState(false); // For potential detailed review later

  const knownCount = useMemo(() => {
    return Object.values(results).filter(isKnown => isKnown).length;
  }, [results]);

  const unknownCount = totalCards - knownCount;
  const percentageKnown = totalCards > 0 ? Math.round((knownCount / totalCards) * 100) : 0;

  // Data for the simple bar chart
  const chartData = useMemo(() => [
    { name: 'Known', count: knownCount, fill: '#22c55e' }, // green-600
    { name: 'Unknown', count: unknownCount, fill: '#ef4444' }, // red-500
  ], [knownCount, unknownCount]);


  const getFeedbackMessage = (): string => {
    if (percentageKnown >= 90) return "Fantastic recall! You've got this down.";
    if (percentageKnown >= 75) return "Great job! Solid understanding.";
    if (percentageKnown >= 50) return "Good progress! Keep reviewing the tricky ones.";
    return "Keep practicing! Repetition is key.";
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-lg font-sans">
      <CardHeader className="text-center border-b pb-4">
        <CardTitle className="text-xl md:text-2xl font-bold text-gray-800">{quizTitle} - Review Results</CardTitle>
        <CardDescription className="text-sm md:text-base text-gray-600 mt-1">Summary of your flashcard session</CardDescription>
      </CardHeader>

      <CardContent className="p-4 md:p-6">
        {/* Score Summary Section */}
        <div className="bg-gray-50 rounded-lg p-4 md:p-6 mb-6 border">
          {/* Score Display */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-base md:text-lg font-medium text-gray-700">Cards Known</span>
            <span className="text-xl md:text-2xl font-bold text-green-600">{knownCount}/{totalCards}</span>
          </div>

          {/* Progress Bar */}
          <Progress value={percentageKnown} className="h-3 mb-2 [&>div]:bg-green-500" aria-label={`${percentageKnown}% known`} />

          {/* Percentage and Feedback */}
          <div className="flex justify-between text-xs md:text-sm mt-1">
            <span className="text-green-600 font-semibold">{percentageKnown}%</span>
            <span className="font-medium text-gray-600 text-right">{getFeedbackMessage()}</span>
          </div>

          {/* Known/Unknown Counts & Chart */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 items-center">
             {/* Count Boxes */}
             <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-lg flex items-center border border-green-200">
                    <CheckCircle className="text-green-500 mr-2 md:mr-3 flex-shrink-0" size={20} />
                    <div>
                    <p className="text-xs md:text-sm text-gray-600">Known</p>
                    <p className="text-lg md:text-xl font-bold text-green-700">{knownCount}</p>
                    </div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg flex items-center border border-red-200">
                    <XCircle className="text-red-500 mr-2 md:mr-3 flex-shrink-0" size={20} />
                    <div>
                    <p className="text-xs md:text-sm text-gray-600">Didn't Know</p>
                    <p className="text-lg md:text-xl font-bold text-red-700">{unknownCount}</p>
                    </div>
                </div>
             </div>

             {/* Simple Bar Chart */}
             <div className="h-40 md:h-48"> {/* Increased height */}
                 <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                     <XAxis type="number" hide />
                     <YAxis type="category" dataKey="name" hide />
                     <Tooltip
                        cursor={{ fill: 'rgba(200,200,200,0.1)' }}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px', padding: '5px' }}
                        formatter={(value) => [`${value} cards`, undefined]} // Show count in tooltip
                        />
                     <Bar dataKey="count" barSize={30} radius={[4, 4, 4, 4]}>
                        {chartData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.fill} />
                         ))}
                     </Bar>
                 </BarChart>
                 </ResponsiveContainer>
            </div>
           </div>
        </div>

        {/* Add detailed review section here if needed (using `cards` prop) */}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6">
          <Button
            variant="outline"
            className="flex-1 flex items-center justify-center text-gray-700 border-gray-300 hover:bg-gray-100"
            onClick={onRetakeSession}
          >
            <RotateCcw size={16} className="mr-2" />
            Review Again
          </Button>

          {onBack && (
            <Button
              className="flex-1 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={onBack}
            >
               <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FlashCardAnswer;