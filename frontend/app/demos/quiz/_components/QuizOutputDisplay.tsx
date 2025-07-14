'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, ChevronRight, RotateCcw, ArrowLeftRight, Lightbulb } from 'lucide-react';

// Import specialized question components
import QuizQuestion from '@/components/ui/quiz-question';
import FillInGaps from '@/components/ui/fill-in-gaps';
import SequenceOrdering from '@/components/ui/sequence-ordering';
import CaseStudy from '@/components/ui/case-study';
import Viva from '@/components/ui/viva';
import FlashCardWithAttempt from '@/components/ui/flash-card-with-attempt';
import Matching, { ActionResultPair } from '@/components/ui/matching';

// Enhanced Flash Card Question Component
interface FlashCardQuestionProps {
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
}

const FlashCardQuestion: React.FC<FlashCardQuestionProps> = ({ question, onSubmit, isLastQuestion }) => {
  const [userAttempt, setUserAttempt] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);

  const handleAttemptSubmit = () => {
    if (userAttempt.trim()) {
      setHasAttempted(true);
    }
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
  };

  const handleContinue = () => {
    onSubmit();
  };

  return (
    <div className="space-y-6">
      {/* Question/Term Display */}
      <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
        <h4 className="text-2xl font-bold text-blue-800 mb-2">
          {question.term || question.text}
        </h4>
        <p className="text-gray-600">Try to define this term before revealing the answer</p>
      </div>

      {/* User Attempt Section */}
      {!showAnswer && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Definition:</label>
            <Textarea
              placeholder="Write your definition here..."
              value={userAttempt}
              onChange={(e) => setUserAttempt(e.target.value)}
              className="min-h-[100px]"
              disabled={hasAttempted}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {!hasAttempted ? (
              <Button 
                onClick={handleAttemptSubmit}
                disabled={!userAttempt.trim()}
                variant="outline"
              >
                Submit My Attempt
              </Button>
            ) : (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                Attempt recorded! Now reveal the answer to compare.
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

            <Button 
              onClick={handleRevealAnswer}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeftRight className="w-4 h-4 mr-1" />
              Reveal Answer
            </Button>
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
        </div>
      )}

      {/* Answer Reveal Section */}
      {showAnswer && (
        <div className="space-y-4">
          {/* User's Attempt (if provided) */}
          {hasAttempted && userAttempt.trim() && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h5 className="font-medium text-gray-800 mb-2">Your Definition:</h5>
              <p className="text-gray-700">{userAttempt}</p>
            </div>
          )}

          {/* Correct Answer */}
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <h5 className="font-medium text-green-800 mb-2">Correct Definition:</h5>
            <p className="text-green-700">{question.definition || question.options[0]?.text}</p>
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 mr-2" />
                <div>
                  <h5 className="font-medium text-blue-800">Additional Information:</h5>
                  <p className="text-blue-700 text-sm">{question.explanation}</p>
                </div>
              </div>
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
      )}
    </div>
  );
};

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'flash-card' | 'matching' | 'step-ordering' | 'multiple-answer' | 'case-study' | 'fill-in-the-blanks' | 'viva';
  options: QuizOption[];
  correctOptionId: string | string[];
  explanation?: string;
  // Fill-in-the-blanks specific
  gaps?: { id: string; answer: string; hint?: string; }[];
  // Step-ordering specific
  items?: { id: string; content: string; image?: string; }[];
  correctOrder?: string[];
  // Matching specific
  matchingTitle?: string;
  matchingDescription?: string;
  matchingPairs?: any[];
  // Case study specific
  title?: string;
  scenario?: string;
  image?: string;
  caseQuestions?: any[];
  // Viva specific
  description?: string;
  vivaQuestions?: any[];
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  totalQuestions: number;
  timeLimit?: number;
  questions: QuizQuestion[];
}

interface QuizOutputDisplayProps {
  quizData: QuizData;
  onComplete: (results: { score: number; answers: Record<string, string> }) => void;
  onReset: () => void;
}

const QuizOutputDisplay: React.FC<QuizOutputDisplayProps> = ({
  quizData,
  onComplete,
  onReset,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(quizData.timeLimit || 0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;
  const progressPercentage = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (quizData.timeLimit && timeRemaining > 0 && !quizCompleted) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !quizCompleted && quizData.timeLimit) {
      finishQuiz();
    }
  }, [timeRemaining, quizCompleted, quizData.timeLimit]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Handle answer submission from child components
  const handleAnswerSubmit = (answer: string | string[] | Record<string, any>) => {
    let answerString: string;
    
    // Convert different answer types to string for storage
    if (Array.isArray(answer)) {
      answerString = answer.join(',');
    } else if (typeof answer === 'object') {
      answerString = JSON.stringify(answer);
    } else {
      answerString = answer.toString();
    }
    
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: answerString,
    };
    
    setAnswers(newAnswers);
    
    if (isLastQuestion) {
      finishQuiz(newAnswers);
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const finishQuiz = (finalAnswers = answers) => {
    // Calculate score
    let correctAnswers = 0;
    Object.entries(finalAnswers).forEach(([questionId, answer]) => {
      const question = quizData.questions.find(q => q.id === questionId);
      if (question) {
        const textQuestions = ['short-answer', 'fill-in-the-blanks', 'viva'];
        const multipleAnswerQuestions = ['multiple-answer'];
        
        if (textQuestions.includes(question.type)) {
          // For text questions, check if the answer matches the correct option text (case-insensitive)
          const correctAnswer = question.options[0]?.text.toLowerCase().trim();
          const userAnswer = answer.toLowerCase().trim();
          if (correctAnswer === userAnswer) {
            correctAnswers++;
          }
        } else if (multipleAnswerQuestions.includes(question.type)) {
          // For multiple answer questions, check if all correct options are selected
          const userAnswers = answer.split(',').sort();
          const correctAnswersMultiple = Array.isArray(question.correctOptionId) 
            ? question.correctOptionId.sort() 
            : question.correctOptionId.split(',').sort();
          if (JSON.stringify(userAnswers) === JSON.stringify(correctAnswersMultiple)) {
            correctAnswers++;
          }
        } else if (question.type === 'step-ordering') {
          // For step-ordering, compare the order
          const userOrder = answer.split(',');
          const correctOrder = question.correctOrder || [];
          if (JSON.stringify(userOrder) === JSON.stringify(correctOrder)) {
            correctAnswers++;
          }
        } else if (question.type === 'matching') {
          // For matching questions
          try {
            const matchResult = JSON.parse(answer);
            if (matchResult.isCorrect) {
              correctAnswers++;
            }
          } catch (e) {
            // If we can't parse the JSON, assume it's wrong
            console.error('Error parsing matching result:', e);
          }
        } else {
          // For single-choice questions (multiple choice, true/false, matching, etc.)
          if (question.correctOptionId === answer) {
            correctAnswers++;
          }
        }
      }
    });
    
    const finalScore = Math.round((correctAnswers / quizData.questions.length) * 100);
    setScore(finalScore);
    setQuizCompleted(true);
    
    onComplete({
      score: finalScore,
      answers: finalAnswers,
    });
  };

  // Render the appropriate question component based on type
  const renderQuestionComponent = () => {
    const commonProps = {
      onSubmit: handleAnswerSubmit,
      isLastQuestion,
    };

    switch (currentQuestion.type) {
      case 'multiple-choice':
      case 'true-false':
      case 'multiple-answer':
        // Only these types are supported by QuizQuestion component
        return (
          <QuizQuestion
            question={{
              ...currentQuestion,
              type: currentQuestion.type as 'multiple-choice' | 'true-false' | 'multiple-answer'
            }}
            questionNumber={currentQuestionIndex + 1}
            onSubmit={(answer) => handleAnswerSubmit(answer)}
          />
        );
      
        case 'matching':
          // Convert question's matchingPairs to ActionResultPair[] format
          if (currentQuestion.matchingPairs && Array.isArray(currentQuestion.matchingPairs)) {
            const pairs: ActionResultPair[] = currentQuestion.matchingPairs.map((pair: any) => ({
              id: pair.id || `pair-${Math.random().toString(36).substr(2, 9)}`,
              action: {
                id: pair.action?.id || `action-${Math.random().toString(36).substr(2, 9)}`,
                content: pair.action?.content || pair.actionContent || '', // ✅ FIXED
                type: 'action' as const,
                image: pair.action?.image || pair.actionImage
              },
              result: {
                id: pair.result?.id || `result-${Math.random().toString(36).substr(2, 9)}`,
                content: pair.result?.content || pair.resultContent || '', // ✅ FIXED
                type: 'result' as const,
                image: pair.result?.image || pair.resultImage
              }
            }));
            return (
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold mb-2">Question {currentQuestionIndex + 1}</h3>
                  <p className="mb-4">{currentQuestion.text}</p>
                  
                  <Matching
                    title={currentQuestion.matchingTitle || "Match the following items"}
                    description={currentQuestion.matchingDescription || "Drag items from the left column to match with items on the right."}
                    pairs={pairs}
                    // shuffleItems={true}
                    onSubmit={(isCorrect, matches) => {
                      // Convert matches to a string format that can be stored
                      const matchResult = {
                        isCorrect,
                        matches: matches.map(m => `${m.actionId}->${m.resultId}`).join(',')
                      };
                      handleAnswerSubmit(JSON.stringify(matchResult));
                    }}
                  />
                </div>
              </div>
            );
          } else {
            // Fallback if matchingPairs is not properly defined
            return (
              <div className="bg-red-50 p-4 rounded-lg text-red-700">
                Error: Matching pairs data is not properly formatted.
              </div>
            );
          }
            

      
      case 'short-answer':
        // Simple short answer without gaps
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Question {currentQuestionIndex + 1}</h3>
            <p className="mb-6 text-lg">{currentQuestion.text}</p>
            
            <div className="mb-6">
              <input
                type="text"
                placeholder="Type your answer here..."
                className="w-full p-4 border rounded-lg text-lg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    handleAnswerSubmit(target.value);
                  }
                }}
              />
            </div>
            
            <Button 
              onClick={(e) => {
                const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                handleAnswerSubmit(input?.value || '');
              }}
              className="w-full"
            >
              {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
              {!isLastQuestion && <ChevronRight className="ml-1 w-4 h-4" />}
            </Button>
          </div>
        );
      
      case 'fill-in-the-blanks':
        if (currentQuestion.gaps && currentQuestion.gaps.length > 0) {
          // Fill-in-the-blanks with gaps
          return (
            <FillInGaps
              text={currentQuestion.text}
              gaps={currentQuestion.gaps}
              onSubmit={(isCorrect, answers) => {
                // Convert gap answers to string format
                const answerString = Object.entries(answers).map(([gapId, answer]) => `${gapId}:${answer}`).join(',');
                handleAnswerSubmit(answerString);
              }}
            />
          );
        } else {
          // Fallback to simple text input
          return (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Question {currentQuestionIndex + 1}</h3>
              <p className="mb-6 text-lg">{currentQuestion.text}</p>
              
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Fill in the blank..."
                  className="w-full p-4 border rounded-lg text-lg"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      handleAnswerSubmit(target.value);
                    }
                  }}
                />
              </div>
              
              <Button 
                onClick={(e) => {
                  const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                  handleAnswerSubmit(input?.value || '');
                }}
                className="w-full"
              >
                {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                {!isLastQuestion && <ChevronRight className="ml-1 w-4 h-4" />}
              </Button>
            </div>
          );
        }
      
      case 'flash-card':
        // Enhanced flash card with user attempt and flip functionality
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Question {currentQuestionIndex + 1}</h3>
            
            <FlashCardWithAttempt
              question={currentQuestion}
              onSubmit={() => handleAnswerSubmit("completed")}
              isLastQuestion={isLastQuestion}
            />
          </div>
        );
      
      case 'step-ordering':
        return (
          <SequenceOrdering
            items={currentQuestion.items || []}
            correctOrder={currentQuestion.correctOrder || []}
            onSubmit={(isCorrect, submittedOrder) => {
              handleAnswerSubmit(submittedOrder.join(','));
            }}
          />
        );
      
      case 'case-study':
        return (
          <CaseStudy
            title={currentQuestion.title || currentQuestion.text}
            scenario={currentQuestion.scenario || ""}
            image={currentQuestion.image}
            questions={currentQuestion.caseQuestions || []}
            onSubmit={(answers, feedback) => {
              handleAnswerSubmit(answers);
            }}
          />
        );
      
      case 'viva':
        return (
          <Viva
            title={currentQuestion.title || "Voice Interview"}
            description={currentQuestion.description || currentQuestion.text}
            questions={currentQuestion.vivaQuestions || []}
            onSubmit={(recordings, notes) => {
              // For demo purposes, submit notes as the answer
              const notesString = Object.entries(notes).map(([id, note]) => `${id}:${note}`).join('|');
              handleAnswerSubmit(notesString);
            }}
          />
        );
      
      default:
        // Fallback for any unhandled question types
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Question {currentQuestionIndex + 1}</h3>
            <p className="mb-6 text-lg">{currentQuestion.text}</p>
            
            <div className="mb-6">
              {currentQuestion.options.map((option) => (
                <div
                  key={option.id}
                  className="p-4 border rounded-lg transition-all cursor-pointer mb-2 hover:bg-gray-50 border-gray-200"
                  onClick={() => handleAnswerSubmit(option.id)}
                >
                  <div className="flex items-center">
                    <span>{option.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  const renderResults = () => {
    const questionsWithAnswers = quizData.questions.map(question => {
      const userAnswer = answers[question.id] || '';
      const textQuestions = ['short-answer', 'fill-in-the-blanks', 'viva'];
      const multipleAnswerQuestions = ['multiple-answer'];
      
      let isCorrect = false;
      let userSelectedOption = null;
      let correctOption = null;

      if (textQuestions.includes(question.type)) {
        correctOption = question.options[0];
        const correctAnswer = correctOption?.text.toLowerCase().trim();
        const userAnswerLower = userAnswer.toLowerCase().trim();
        isCorrect = correctAnswer === userAnswerLower;
        userSelectedOption = { id: 'text', text: userAnswer || 'Not answered' };
      } else if (multipleAnswerQuestions.includes(question.type)) {
        const userAnswers = userAnswer.split(',').filter(a => a);
        const correctAnswers = Array.isArray(question.correctOptionId) 
          ? question.correctOptionId 
          : question.correctOptionId.split(',');
        isCorrect = JSON.stringify(userAnswers.sort()) === JSON.stringify(correctAnswers.sort());
        
        const selectedOptions = question.options.filter(opt => userAnswers.includes(opt.id));
        const correctOptions = question.options.filter(opt => correctAnswers.includes(opt.id));
        
        userSelectedOption = { 
          id: 'multiple', 
          text: selectedOptions.length > 0 ? selectedOptions.map(opt => opt.text).join(', ') : 'Not answered' 
        };
        correctOption = { 
          id: 'multiple', 
          text: correctOptions.map(opt => opt.text).join(', ') 
        };
      } else if (question.type === 'matching') {
        // For matching questions, parse the stored result
        try {
          const matchResult = JSON.parse(userAnswer);
          isCorrect = matchResult.isCorrect;
          userSelectedOption = { 
            id: 'matching', 
            text: matchResult.matches || 'No matches made' 
          };
          correctOption = { 
            id: 'matching', 
            text: question.matchingPairs?.map((pair: any) => 
              `${pair.action?.content || pair.action} → ${pair.result?.content || pair.result}`
            ).join('; ') || 'No correct pairs defined'
          };
        } catch (e) {
          isCorrect = false;
          userSelectedOption = { id: 'matching', text: 'Invalid response' };
          correctOption = { id: 'matching', text: 'Unable to determine correct answer' };
        }
      } else {
        userSelectedOption = question.options?.find(opt => opt.id === userAnswer);
        correctOption = question.options?.find(opt => opt.id === question.correctOptionId);
        isCorrect = userAnswer === question.correctOptionId;
      }
      
      return {
        question,
        userAnswer,
        userSelectedOption,
        correctOption,
        isCorrect,
        isTextQuestion: textQuestions.includes(question.type),
        isMultipleAnswer: multipleAnswerQuestions.includes(question.type),
      };
    });
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-2">Quiz Results</h3>
        <p className="mb-4">You scored {score}% ({questionsWithAnswers.filter(q => q.isCorrect).length} out of {quizData.questions.length} correct)</p>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span>Score</span>
            <span>{score}%</span>
          </div>
          <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${score >= 70 ? 'bg-green-500' : 'bg-red-500'}`} 
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mb-6 mt-8 border-t pt-4">
          <h4 className="text-lg font-semibold mb-4">Question Summary</h4>
          
          {questionsWithAnswers.map(({ question, userSelectedOption, correctOption, isCorrect }, index) => (
            <div key={question.id} className="mb-8 pb-6 border-b border-gray-200 last:border-0">
              <div className="flex items-start gap-2">
                <div className={`mt-1 rounded-full p-1 ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                  {isCorrect ? 
                    <CheckCircle className="w-4 h-4 text-green-500" /> : 
                    <XCircle className="w-4 h-4 text-red-500" />
                  }
                </div>
                <div className="flex-1">
                  <h5 className="font-medium">
                    Question {index + 1}: {question.text}
                    <span className="ml-2 text-xs text-gray-500 capitalize">
                      ({question.type.replace('-', ' ')})
                    </span>
                  </h5>
                  
                  <div className="mt-2 ml-1">
                    <p className="text-sm mb-1">
                      <span className="font-medium">Your answer:</span> {userSelectedOption ? userSelectedOption.text : 'Not answered'}
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-green-700 mb-1">
                        <span className="font-medium">Correct answer:</span> {correctOption?.text}
                      </p>
                    )}
                    {question.explanation && (
                      <div className="mt-2 p-3 bg-blue-50 rounded text-sm">
                        <div className="flex items-start">
                          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Explanation:</span>
                            <p className="mt-1">{question.explanation}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Button 
          onClick={onReset} 
          className="w-full flex items-center justify-center"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Try Another Quiz
        </Button>
      </div>
    );
  };

  const renderQuizHeader = () => (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-2">{quizData.title}</h2>
      <p className="text-gray-600 mb-2">{quizData.description}</p>
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
          {quizData.difficulty} Level
        </span>
        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800">
          {quizData.questions.length} Questions
        </span>
        {quizData.timeLimit && (
          <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
            {Math.floor(quizData.timeLimit / 60)} Minutes
          </span>
        )}
      </div>
      
      {quizData.timeLimit && !quizCompleted && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Time Remaining:</span>
            <span className="text-lg font-bold text-yellow-700">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      {renderQuizHeader()}
      
      {!quizCompleted && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{currentQuestionIndex + 1}/{quizData.questions.length}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}
      
      {!quizCompleted ? (
        <div>
          {/* Render the appropriate specialized component */}
          {renderQuestionComponent()}
        </div>
      ) : (
        renderResults()
      )}
    </div>
  );
};

export default QuizOutputDisplay;