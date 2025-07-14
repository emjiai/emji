'use client';

import React, { useState, useEffect } from 'react';
// Corrected import: Use named import QRCodeSVG
import { QRCodeSVG } from 'qrcode.react'; // Install: npm install qrcode.react
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Play, Square, Link as LinkIcon, BarChart2 } from 'lucide-react';
import PollResultsChart from './PollResultsChart'; // Import the chart

// --- Interfaces (Define based on your backend structure) ---
interface PollOption {
  id: string;
  text: string;
}

interface PollQuestion {
  id: string;
  text: string;
  options: PollOption[];
  // Add other relevant fields like 'type' if needed (e.g., multiple_choice)
}

interface PollResults {
  [optionId: string]: number; // Example: { 'opt1': 15, 'opt2': 7 }
}

interface PollDashboardProps {
  pollId: string; // Unique ID for this poll session
  initialQuestion?: PollQuestion; // The first question to display
  // Functions to control the poll flow (provided by parent/backend connection)
  onStartPoll?: () => void; // Function to officially start
  onNextQuestion?: () => Promise<PollQuestion | null>; // Function to fetch/advance to the next question
  onEndPoll?: () => void; // Function to close the poll
  fetchLiveResults: (questionId: string) => Promise<PollResults>; // Function to get current results
}

const PollDashboard: React.FC<PollDashboardProps> = ({
  pollId,
  initialQuestion,
  onStartPoll,
  onNextQuestion,
  onEndPoll,
  fetchLiveResults,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<PollQuestion | null>(initialQuestion || null);
  const [results, setResults] = useState<PollResults>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPollActive, setIsPollActive] = useState(false); // Track if poll has started
  const [pollEnded, setPollEnded] = useState(false);

  const participantUrl = typeof window !== 'undefined' ? `${window.location.origin}/poll/${pollId}/join` : `/poll/${pollId}/join`; // Generate participant link

  // --- Fetch results periodically or via WebSocket ---
  useEffect(() => {
    if (!currentQuestion || pollEnded) return;

    // Option 1: Basic polling interval
    const intervalId = setInterval(async () => {
      try {
        const fetchedResults = await fetchLiveResults(currentQuestion.id);
        setResults(fetchedResults);
      } catch (error) {
        console.error("Error fetching live results:", error);
      }
    }, 3000); // Fetch every 3 seconds (adjust as needed)

    // Option 2: Add WebSocket logic here to listen for real-time updates

    return () => clearInterval(intervalId); // Cleanup interval
    // Cleanup WebSocket connection if using Option 2
  }, [currentQuestion, fetchLiveResults, pollEnded]);

  // --- Event Handlers ---
  const handleStart = () => {
     setIsPollActive(true);
     if (onStartPoll) onStartPoll();
     // If no initial question, maybe fetch the first one?
     if (!currentQuestion && onNextQuestion) handleNext();
  };

  const handleNext = async () => {
    if (!onNextQuestion) return;
    setIsLoading(true);
    setResults({}); // Reset results for the new question
    try {
      const nextQ = await onNextQuestion();
      setCurrentQuestion(nextQ);
      if (!nextQ) {
        // No more questions, consider ending the poll
        handleEnd();
      }
    } catch (error) {
      console.error("Error fetching next question:", error);
      // Handle error appropriately (e.g., show message)
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnd = () => {
    setIsPollActive(false);
    setPollEnded(true);
    if (onEndPoll) onEndPoll();
    // Optionally fetch final results one last time?
    if (currentQuestion) {
       fetchLiveResults(currentQuestion.id).then(setResults).catch(console.error);
    }
  };

  // --- Prepare data for the chart ---
  const chartData = currentQuestion?.options.map(option => ({
    name: option.text,
    votes: results[option.id] || 0,
  })) || [];

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg font-sans"> {/* Similar to QuizAnswer */}
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
           <div>
             <CardTitle className="text-xl md:text-2xl font-bold text-gray-800">Live Poll Dashboard</CardTitle>
             <CardDescription className="text-sm text-gray-500">Poll ID: {pollId}</CardDescription>
           </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
               {!isPollActive && !pollEnded && (
                 <Button onClick={handleStart} size="sm" className="bg-blue-600 hover:bg-blue-700">
                   <Play className="mr-2 h-4 w-4" /> Start Poll
                 </Button>
               )}
               {isPollActive && (
                 <Button onClick={handleNext} size="sm" disabled={isLoading} variant="outline">
                   {isLoading ? 'Loading...' : 'Next Question'} <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
               )}
                {isPollActive && (
                    <Button onClick={handleEnd} size="sm" variant="destructive">
                       <Square className="mr-2 h-4 w-4" /> End Poll
                    </Button>
                )}
                {pollEnded && <span className="text-red-600 font-medium p-2">Poll Ended</span>}
            </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Left Side: Question & Join Info */}
        <div className="md:col-span-1 space-y-6">
          <Card>
             <CardHeader>
                 <CardTitle className="text-lg">Join the Poll</CardTitle>
             </CardHeader>
             <CardContent className="flex flex-col items-center gap-4">
                 {/* Corrected usage: Use QRCodeSVG component */}
                 <QRCodeSVG value={participantUrl} size={128} level="M" includeMargin={true} />
                 <div className="text-center">
                    <p className="text-sm text-gray-600">Scan the QR code or go to:</p>
                    <a href={participantUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all text-sm font-medium">
                       <LinkIcon className="inline h-4 w-4 mr-1" /> {participantUrl}
                    </a>
                 </div>
             </CardContent>
          </Card>

           <Card>
               <CardHeader>
                   <CardTitle className="text-lg">Current Question</CardTitle>
               </CardHeader>
               <CardContent>
                   {currentQuestion && isPollActive ? (
                       <div className="space-y-2">
                           <p className="text-base md:text-lg font-semibold text-gray-800">{currentQuestion.text}</p>
                           <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                               {currentQuestion.options.map(opt => <li key={opt.id}>{opt.text}</li>)}
                           </ul>
                       </div>
                   ) : pollEnded ? (
                        <p className="text-gray-500 text-center py-4">The poll has ended.</p>
                   ) : (
                       <p className="text-gray-500 text-center py-4">Poll hasn't started yet or no question is active.</p>
                   )}
               </CardContent>
           </Card>
        </div>

        {/* Right Side: Live Results */}
        <div className="md:col-span-2">
           <Card className="h-full">
               <CardHeader>
                   <CardTitle className="text-lg flex items-center">
                      <BarChart2 className="mr-2 h-5 w-5 text-indigo-600"/> Live Results
                   </CardTitle>
                    {/* Updated description based on non-realtime backend */}
                   <CardDescription>Refresh the page or wait for polling to see updates.</CardDescription>
               </CardHeader>
               <CardContent>
                  {/* Render chart only when poll is active or ended */}
                  {isPollActive || pollEnded ? (
                     <PollResultsChart results={chartData} />
                  ) : (
                     <div className="flex items-center justify-center h-40 text-gray-500">
                         Results will appear here when the poll starts.
                     </div>
                  )}

               </CardContent>
           </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default PollDashboard;

// 'use client';

// import React, { useState, useEffect } from 'react';
// import QRCode from 'qrcode.react'; // Install: npm install qrcode.react
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { ArrowRight, Play, Square, Link as LinkIcon, BarChart2 } from 'lucide-react';
// import PollResultsChart from './PollResultsChart'; // Import the chart

// // --- Interfaces (Define based on your backend structure) ---
// interface PollOption {
//   id: string;
//   text: string;
// }

// interface PollQuestion {
//   id: string;
//   text: string;
//   options: PollOption[];
//   // Add other relevant fields like 'type' if needed (e.g., multiple_choice)
// }

// interface PollResults {
//   [optionId: string]: number; // Example: { 'opt1': 15, 'opt2': 7 }
// }

// interface PollDashboardProps {
//   pollId: string; // Unique ID for this poll session
//   initialQuestion?: PollQuestion; // The first question to display
//   // Functions to control the poll flow (provided by parent/backend connection)
//   onStartPoll?: () => void; // Function to officially start
//   onNextQuestion?: () => Promise<PollQuestion | null>; // Function to fetch/advance to the next question
//   onEndPoll?: () => void; // Function to close the poll
//   fetchLiveResults: (questionId: string) => Promise<PollResults>; // Function to get current results
// }

// const PollDashboard: React.FC<PollDashboardProps> = ({
//   pollId,
//   initialQuestion,
//   onStartPoll,
//   onNextQuestion,
//   onEndPoll,
//   fetchLiveResults,
// }) => {
//   const [currentQuestion, setCurrentQuestion] = useState<PollQuestion | null>(initialQuestion || null);
//   const [results, setResults] = useState<PollResults>({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [isPollActive, setIsPollActive] = useState(false); // Track if poll has started
//   const [pollEnded, setPollEnded] = useState(false);

//   const participantUrl = typeof window !== 'undefined' ? `${window.location.origin}/poll/${pollId}/join` : `/poll/${pollId}/join`; // Generate participant link

//   // --- Fetch results periodically or via WebSocket ---
//   useEffect(() => {
//     if (!currentQuestion || pollEnded) return;

//     // Option 1: Basic polling interval
//     const intervalId = setInterval(async () => {
//       try {
//         const fetchedResults = await fetchLiveResults(currentQuestion.id);
//         setResults(fetchedResults);
//       } catch (error) {
//         console.error("Error fetching live results:", error);
//       }
//     }, 3000); // Fetch every 3 seconds (adjust as needed)

//     // Option 2: Add WebSocket logic here to listen for real-time updates

//     return () => clearInterval(intervalId); // Cleanup interval
//     // Cleanup WebSocket connection if using Option 2
//   }, [currentQuestion, fetchLiveResults, pollEnded]);

//   // --- Event Handlers ---
//   const handleStart = () => {
//      setIsPollActive(true);
//      if (onStartPoll) onStartPoll();
//      // If no initial question, maybe fetch the first one?
//      if (!currentQuestion && onNextQuestion) handleNext();
//   };

//   const handleNext = async () => {
//     if (!onNextQuestion) return;
//     setIsLoading(true);
//     setResults({}); // Reset results for the new question
//     try {
//       const nextQ = await onNextQuestion();
//       setCurrentQuestion(nextQ);
//       if (!nextQ) {
//         // No more questions, consider ending the poll
//         handleEnd();
//       }
//     } catch (error) {
//       console.error("Error fetching next question:", error);
//       // Handle error appropriately (e.g., show message)
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleEnd = () => {
//     setIsPollActive(false);
//     setPollEnded(true);
//     if (onEndPoll) onEndPoll();
//     // Optionally fetch final results one last time?
//     if (currentQuestion) {
//        fetchLiveResults(currentQuestion.id).then(setResults).catch(console.error);
//     }
//   };

//   // --- Prepare data for the chart ---
//   const chartData = currentQuestion?.options.map(option => ({
//     name: option.text,
//     votes: results[option.id] || 0,
//   })) || [];

//   return (
//     <Card className="w-full max-w-4xl mx-auto shadow-lg font-sans"> {/* Similar to QuizAnswer */}
//       <CardHeader className="border-b pb-4">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
//            <div>
//              <CardTitle className="text-xl md:text-2xl font-bold text-gray-800">Live Poll Dashboard</CardTitle>
//              <CardDescription className="text-sm text-gray-500">Poll ID: {pollId}</CardDescription>
//            </div>
//             <div className="flex gap-2 mt-2 sm:mt-0">
//                {!isPollActive && !pollEnded && (
//                  <Button onClick={handleStart} size="sm" className="bg-blue-600 hover:bg-blue-700">
//                    <Play className="mr-2 h-4 w-4" /> Start Poll
//                  </Button>
//                )}
//                {isPollActive && (
//                  <Button onClick={handleNext} size="sm" disabled={isLoading} variant="outline">
//                    {isLoading ? 'Loading...' : 'Next Question'} <ArrowRight className="ml-2 h-4 w-4" />
//                  </Button>
//                )}
//                 {isPollActive && (
//                     <Button onClick={handleEnd} size="sm" variant="destructive">
//                        <Square className="mr-2 h-4 w-4" /> End Poll
//                     </Button>
//                 )}
//                 {pollEnded && <span className="text-red-600 font-medium p-2">Poll Ended</span>}
//             </div>
//         </div>
//       </CardHeader>

//       <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
//         {/* Left Side: Question & Join Info */}
//         <div className="md:col-span-1 space-y-6">
//           <Card>
//              <CardHeader>
//                  <CardTitle className="text-lg">Join the Poll</CardTitle>
//              </CardHeader>
//              <CardContent className="flex flex-col items-center gap-4">
//                  <QRCode value={participantUrl} size={128} level="M" />
//                  <div className="text-center">
//                     <p className="text-sm text-gray-600">Scan the QR code or go to:</p>
//                     <a href={participantUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all text-sm font-medium">
//                        <LinkIcon className="inline h-4 w-4 mr-1" /> {participantUrl}
//                     </a>
//                  </div>
//              </CardContent>
//           </Card>

//            <Card>
//                <CardHeader>
//                    <CardTitle className="text-lg">Current Question</CardTitle>
//                </CardHeader>
//                <CardContent>
//                    {currentQuestion && isPollActive ? (
//                        <div className="space-y-2">
//                            <p className="text-base md:text-lg font-semibold text-gray-800">{currentQuestion.text}</p>
//                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
//                                {currentQuestion.options.map(opt => <li key={opt.id}>{opt.text}</li>)}
//                            </ul>
//                        </div>
//                    ) : pollEnded ? (
//                         <p className="text-gray-500 text-center py-4">The poll has ended.</p>
//                    ) : (
//                        <p className="text-gray-500 text-center py-4">Poll hasn't started yet or no question is active.</p>
//                    )}
//                </CardContent>
//            </Card>
//         </div>

//         {/* Right Side: Live Results */}
//         <div className="md:col-span-2">
//            <Card className="h-full">
//                <CardHeader>
//                    <CardTitle className="text-lg flex items-center">
//                       <BarChart2 className="mr-2 h-5 w-5 text-indigo-600"/> Live Results
//                    </CardTitle>
//                    <CardDescription>Results update automatically.</CardDescription>
//                </CardHeader>
//                <CardContent>
//                   {/* Render chart only when poll is active or ended */}
//                   {isPollActive || pollEnded ? (
//                      <PollResultsChart results={chartData} />
//                   ) : (
//                      <div className="flex items-center justify-center h-40 text-gray-500">
//                          Results will appear here when the poll starts.
//                      </div>
//                   )}

//                </CardContent>
//            </Card>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default PollDashboard; 