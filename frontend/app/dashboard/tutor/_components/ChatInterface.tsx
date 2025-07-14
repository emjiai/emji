import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mic, 
  MicOff, 
  Send, 
  Loader2, 
  Volume2, 
  VolumeX, 
  RefreshCw,
  Upload,
  Copy,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Import voice API helpers
import { transcribeAudio, playSpeech } from '@/utils/voice-utils';

// Import Format component for markdown rendering
import Format from '../../../components/Format';

// Define our own Message interface to fix the type error
interface Message {
  role: 'user' | 'system' | 'assistant';
  content: string;
  id?: string;
  createdAt?: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  tutorName?: string;
  tutorImage?: string;
  tutorId?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  tutorName = "Tutor",
  tutorImage,
  tutorId,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcribedText, setTranscribedText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Reset audio chunks
      audioChunksRef.current = [];
      
      // Create media recorder with constraints
      const options = { mimeType: 'audio/webm' };  // Use WebM format for better compatibility
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        try {
          // Create audio blob
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioBlob(audioBlob);
          
          // Transcribe the audio using the utility function with tutorId
          setIsTranscribing(true);
          const text = await transcribeAudio(audioBlob, tutorId || '');
          if (text) {
            setTranscribedText(text);
            setInputValue(text);
          }
        } catch (error: any) {
          console.error('Error processing audio:', error);
          toast.error(error?.message || "Failed to process audio");
        } finally {
          setIsTranscribing(false);
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error("Could not access microphone. Please check permissions.");
      setIsRecording(false);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  // The transcribeAudio function is now imported from utils
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
      setTranscribedText("");
    }
  };
  
  const toggleSpeaker = () => {
    setIsSpeakerEnabled(prev => !prev);
    // Alert the user about the speaker change
    toast.info(!isSpeakerEnabled ? "Speaker enabled" : "Speaker disabled");
  };
  
  const playAudio = async (text: string) => {
    if (!isSpeakerEnabled) return;
    
    try {
      // Use the playSpeech utility from voice-utils with tutorId
      await playSpeech(text, tutorId || '', {
        voice: 'alloy', // Default voice
        speed: 1.0     // Default speed
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error("Failed to play audio");
    }
  };
  
  // Function to copy message content to clipboard
  const copyMessageToClipboard = (message: Message, index: number) => {
    navigator.clipboard.writeText(message.content)
      .then(() => {
        // Set the copied message ID to show feedback
        setCopiedMessageId(message.id || `msg-${index}`);
        
        // Reset after 2 seconds
        setTimeout(() => {
          setCopiedMessageId(null);
        }, 2000);
        
        toast.success("Message copied to clipboard");
      })
      .catch(error => {
        console.error('Failed to copy message:', error);
        toast.error("Failed to copy message");
      });
  };
  
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="flex-shrink-0">
                {message.role === 'user' ? (
                  <Avatar>
                    <AvatarFallback>U</AvatarFallback>
                    <AvatarImage src="/default-icon.jpg" />
                  </Avatar>
                ) : (
                  <Avatar>
                    <AvatarFallback>{tutorName[0]}</AvatarFallback>
                    <AvatarImage src={tutorImage || "/avatars/tutor-avatar.png"} />
                  </Avatar>
                )}
              </div>
              
              <div className="relative group">
                <div 
                  className={`${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground mr-2' 
                      : 'bg-muted ml-2'
                  } rounded-lg p-3 pr-8`}
                >
                  <div className="text-sm">
                    {message.role === 'assistant' ? (
                      <Format content={message.content} />
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
                
                {/* Copy button for messages */}
                <button
                  onClick={() => copyMessageToClipboard(message, index)}
                  className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy message"
                  aria-label="Copy message to clipboard"
                >
                  {copiedMessageId === (message.id || `msg-${index}`) ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex max-w-[80%] flex-row">
              <div className="flex-shrink-0">
                <Avatar>
                  <AvatarFallback>{tutorName[0]}</AvatarFallback>
                  <AvatarImage src={tutorImage || "/avatars/tutor-avatar.png"} />
                </Avatar>
              </div>
              
              <div className="bg-muted rounded-lg p-3 ml-2">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4 border-t flex-shrink-0">
        <div className="flex items-end space-x-2">
          {/* Upload button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {}}
            disabled={isLoading}
            title="Upload file (coming soon)"
          >
            <Upload className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="resize-none min-h-[60px]"
              disabled={isLoading || isRecording || isTranscribing}
              onKeyDown={(e) => {
                // Submit on Enter without Shift key
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (inputValue.trim() && !isLoading && !isRecording && !isTranscribing) {
                    handleSubmit(e);
                  }
                }
              }}
            />
            {isTranscribing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Transcribing...</span>
                </div>
              </div>
            )}
          </div>


          <div className="flex space-x-2">
          <Button
              type="submit"
              disabled={!inputValue.trim() || isLoading || isRecording || isTranscribing}
              title="Send message"
            >
              <Send className="h-5 w-5" />
            </Button>
            {/* <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleSpeaker}
              title={isSpeakerEnabled ? "Mute speaker" : "Unmute speaker"}
            >
              {isSpeakerEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading || isTranscribing}
              className={isRecording ? "bg-red-100 text-red-600" : ""}
              title={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button> */}
            

          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
