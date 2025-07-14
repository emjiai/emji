'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  RefreshCw, 
  Check, 
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VivaQuestion {
  id: string;
  question: string;
  maxRecordingTime?: number; // in seconds
  guidelines?: string;
  sampleAnswer?: string;
}

interface VivaProps {
  title: string;
  description: string;
  questions: VivaQuestion[];
  onSubmit?: (recordings: Record<string, Blob>, notes: Record<string, string>) => void;
  className?: string;
}

const Viva: React.FC<VivaProps> = ({
  title,
  description,
  questions,
  onSubmit,
  className = '',
}) => {
  const [recordings, setRecordings] = useState<Record<string, Blob>>({});
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [isRecording, setIsRecording] = useState<Record<string, boolean>>({});
  const [recordingTime, setRecordingTime] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  
  const mediaRecorderRef = useRef<Record<string, MediaRecorder | null>>({});
  const audioChunksRef = useRef<Record<string, Blob[]>>({});
  const timerRef = useRef<Record<string, NodeJS.Timeout | null>>({});

  // Initialize expanded state for all questions
  useEffect(() => {
    const initialExpandedState: Record<string, boolean> = {};
    questions.forEach(q => {
      initialExpandedState[q.id] = true;
    });
    setExpandedQuestions(initialExpandedState);
  }, [questions]);

  const startRecording = async (questionId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current[questionId] = mediaRecorder;
      audioChunksRef.current[questionId] = [];
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current[questionId].push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current[questionId], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setRecordings(prev => ({ ...prev, [questionId]: audioBlob }));
        setAudioUrls(prev => ({ ...prev, [questionId]: audioUrl }));
        setIsRecording(prev => ({ ...prev, [questionId]: false }));
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(prev => ({ ...prev, [questionId]: true }));
      setRecordingTime(prev => ({ ...prev, [questionId]: 0 }));
      
      // Start timer
      timerRef.current[questionId] = setInterval(() => {
        setRecordingTime(prev => {
          const currentTime = prev[questionId] || 0;
          const question = questions.find(q => q.id === questionId);
          const maxTime = question?.maxRecordingTime || 120; // Default 2 minutes
          
          // Stop recording if we hit the max time
          if (currentTime >= maxTime - 1) {
            stopRecording(questionId);
          }
          
          return { ...prev, [questionId]: currentTime + 1 };
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your browser permissions.');
    }
  };

  const stopRecording = (questionId: string) => {
    const mediaRecorder = mediaRecorderRef.current[questionId];
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    
    // Clear timer
    if (timerRef.current[questionId]) {
      clearInterval(timerRef.current[questionId] as NodeJS.Timeout);
      timerRef.current[questionId] = null;
    }
  };

  const playAudio = (questionId: string) => {
    const audioUrl = audioUrls[questionId];
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const handleNoteChange = (questionId: string, value: string) => {
    setNotes(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(recordings, notes);
    }
    setSubmitted(true);
  };

  const handleReset = () => {
    // Clean up audio URLs
    Object.values(audioUrls).forEach(url => {
      URL.revokeObjectURL(url);
    });
    
    setRecordings({});
    setAudioUrls({});
    setIsRecording({});
    setRecordingTime({});
    setNotes({});
    setSubmitted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-md", className)}>
      {/* Viva Header */}
      <div className="p-4 border-b">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
      
      {/* Questions Section */}
      <div className="p-4">
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="border rounded-lg">
              <button 
                onClick={() => toggleQuestion(question.id)}
                className="w-full p-4 flex justify-between items-center text-left focus:outline-none bg-gray-50 rounded-t-lg"
              >
                <h4 className="text-lg font-medium">Question {index + 1}</h4>
                {expandedQuestions[question.id] ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {expandedQuestions[question.id] && (
                <div className="p-4">
                  <p className="mb-4">{question.question}</p>
                  
                  {question.guidelines && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-md">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                        <div>
                          <h5 className="font-medium text-blue-700">Guidelines:</h5>
                          <p className="text-blue-700 text-sm mt-1">{question.guidelines}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Recording Controls */}
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    {isRecording[question.id] ? (
                      <Button 
                        onClick={() => stopRecording(question.id)}
                        variant="destructive"
                        size="sm"
                        className="flex items-center"
                      >
                        <Square className="h-4 w-4 mr-2" />
                        Stop Recording
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => startRecording(question.id)}
                        variant={audioUrls[question.id] ? "outline" : "default"}
                        size="sm"
                        className="flex items-center"
                        disabled={submitted || Object.values(isRecording).some(value => value === true)}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        {audioUrls[question.id] ? "Record Again" : "Start Recording"}
                      </Button>
                    )}
                    
                    {audioUrls[question.id] && (
                      <Button 
                        onClick={() => playAudio(question.id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Play Recording
                      </Button>
                    )}
                    
                    {(isRecording[question.id] || recordingTime[question.id] > 0) && (
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        <span>
                          {formatTime(recordingTime[question.id] || 0)}
                          {question.maxRecordingTime && (
                            <span className="text-gray-500"> / {formatTime(question.maxRecordingTime)}</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Notes Textarea */}
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">Notes (optional):</label>
                    <Textarea
                      className="w-full"
                      placeholder="Add any notes or key points from your response..."
                      value={notes[question.id] || ''}
                      onChange={(e) => handleNoteChange(question.id, e.target.value)}
                      disabled={submitted}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-6">
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex items-center"
            disabled={!Object.keys(recordings).length && !Object.keys(notes).filter(key => notes[key]).length}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
          
          <Button
            onClick={handleSubmit}
            className="flex items-center"
            disabled={submitted || !Object.keys(recordings).length}
          >
            <Check className="h-4 w-4 mr-2" />
            Submit Responses
          </Button>
        </div>
        
        {submitted && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
            Your responses have been submitted successfully. An instructor will review your answers.
          </div>
        )}
      </div>
    </div>
  );
};

export default Viva;