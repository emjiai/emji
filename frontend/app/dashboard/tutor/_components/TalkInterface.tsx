import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Send,
  Loader2,
  Copy,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Import the modified VoiceCard component
import VoiceCard from './VoiceCard'; // Adjust the path as necessary

// Import Format component for markdown rendering
import Format from '../../../components/Format'; // Adjust the path as necessary

// Define Message interface
interface Message {
  role: 'user' | 'system' | 'assistant';
  content: string;
  id?: string;
  createdAt?: string;
}

// --- REMOVED DOCUMENT PROPS FROM INTERFACE ---
interface TalkInterfaceProps {
  messages: Message[];
  isLoading: boolean; // Loading state for the AI response
  onSendMessage: (message: string) => void;
  tutorName?: string;
  tutorImage?: string;
  tutorId?: string;
  // selectedDocumentTitle?: string; // Removed prop
  // selectedDocumentContent?: string; // Removed prop
}

const TalkInterface: React.FC<TalkInterfaceProps> = ({
  messages,
  isLoading, // This is for the backend thinking state
  onSendMessage,
  tutorName = "Tutor",
  tutorImage,
  tutorId,
  // --- REMOVED DOCUMENT PROPS FROM DESTRUCTURING ---
  // selectedDocumentTitle,
  // selectedDocumentContent,
}) => {
  const [currentTranscription, setCurrentTranscription] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- DEFINE DOCUMENT CONTENT AS CONSTANTS (Temporary Placeholders) ---
  const selectedDocumentTitle: string = "Temporary Document Title";
  const selectedDocumentContent: string = "This is some temporary placeholder content for the document. Replace this with actual data later.";
  // You could also set these to null or undefined if you want to test the "No document loaded" state:
  // const selectedDocumentTitle: string | undefined = undefined;
  // const selectedDocumentContent: string | undefined = undefined;
  // --- END OF CONSTANT DEFINITIONS ---


  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle sending the transcription
  const handleSendTranscription = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (currentTranscription.trim() && !isLoading) {
      onSendMessage(currentTranscription);
      setCurrentTranscription(""); // Clear transcription after sending
    }
  };

  // Function to copy message content to clipboard
  const copyMessageToClipboard = (message: Message, index: number) => {
    navigator.clipboard.writeText(message.content)
      .then(() => {
        setCopiedMessageId(message.id || `msg-${index}`);
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
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message, index) => (
          <div
            key={message.id || `msg-${index}`}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start`}>
              <div className="flex-shrink-0">
                {message.role === 'user' ? (
                  <Avatar>
                    <AvatarFallback>U</AvatarFallback>
                    <AvatarImage src="/default-user-icon.png" />
                  </Avatar>
                ) : (
                  <Avatar>
                    <AvatarFallback>{tutorName ? tutorName[0] : 'T'}</AvatarFallback>
                    <AvatarImage src={tutorImage || "/avatars/tutor-avatar.png"} />
                  </Avatar>
                )}
              </div>
              <div className={`relative group mx-2`}>
                <div
                  className={`${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  } rounded-lg p-3 pr-8 shadow-sm`}
                >
                  <div className="text-sm break-words">
                    {message.role === 'assistant' ? (
                      <Format content={message.content} />
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
                <button
                  onClick={() => copyMessageToClipboard(message, index)}
                  className="absolute top-1 right-1 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-background/80"
                  title="Copy message"
                  aria-label="Copy message to clipboard"
                >
                  {copiedMessageId === (message.id || `msg-${index}`) ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator for AI response */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex max-w-[80%] flex-row items-start">
              <div className="flex-shrink-0">
                <Avatar>
                  <AvatarFallback>{tutorName ? tutorName[0] : 'T'}</AvatarFallback>
                  <AvatarImage src={tutorImage || "/avatars/tutor-avatar.png"} />
                </Avatar>
              </div>
              <div className="bg-muted rounded-lg p-3 ml-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area with VoiceCard */}
      <div className="p-4 border-t flex-shrink-0 bg-background">
        {/* VoiceCard Integration - Passing internal constants */}
        <VoiceCard
          tutorId={tutorId}
          onTranscriptionReceived={setCurrentTranscription}
          // --- PASS INTERNAL CONSTANTS DOWN ---
          selectedDocumentTitle={selectedDocumentTitle} // Now uses the const defined above
          selectedDocumentContent={selectedDocumentContent} // Now uses the const defined above
        />
        {/* Send button */}
        <div className="mt-2 flex justify-end">
          <Button
            type="button"
            onClick={() => handleSendTranscription()}
            disabled={!currentTranscription.trim() || isLoading}
            title="Send transcription"
            className="flex items-center space-x-1"
          >
            <Send className="h-5 w-5" />
            <span>Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TalkInterface;

// import React, { useState, useRef, useEffect } from 'react';
// import { Button } from "@/components/ui/button";
// import {
//   Send,
//   Loader2,
//   Copy,
//   Check
// } from "lucide-react";
// import { toast } from "sonner";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// // Import the modified VoiceCard component
// import VoiceCard from './VoiceCard'; // Adjust the path as necessary

// // Import Format component for markdown rendering
// import Format from '../../../components/Format'; // Adjust the path as necessary

// // Define our own Message interface (assuming it's defined elsewhere or keep it here)
// interface Message {
//   role: 'user' | 'system' | 'assistant';
//   content: string;
//   id?: string;
//   createdAt?: string;
// }

// interface TalkInterfaceProps {
//   messages: Message[];
//   isLoading: boolean; // Loading state for the AI response
//   onSendMessage: (message: string) => void;
//   tutorName?: string;
//   tutorImage?: string;
//   tutorId?: string;
// }

// const TalkInterface: React.FC<TalkInterfaceProps> = ({
//   messages,
//   isLoading, // This is for the backend thinking state
//   onSendMessage,
//   tutorName = "Tutor",
//   tutorImage,
//   tutorId,
// }) => {
//   const [currentTranscription, setCurrentTranscription] = useState("");
//   const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // Scroll to bottom of messages
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   // Handle sending the transcription
//   const handleSendTranscription = (e?: React.FormEvent) => {
//     e?.preventDefault(); // Prevent default form submission if triggered by form
//     if (currentTranscription.trim() && !isLoading) {
//       onSendMessage(currentTranscription);
//       setCurrentTranscription(""); // Clear transcription after sending
//     }
//   };

//   // Function to copy message content to clipboard
//   const copyMessageToClipboard = (message: Message, index: number) => {
//     navigator.clipboard.writeText(message.content)
//       .then(() => {
//         setCopiedMessageId(message.id || `msg-${index}`);
//         setTimeout(() => {
//           setCopiedMessageId(null);
//         }, 2000);
//         toast.success("Message copied to clipboard");
//       })
//       .catch(error => {
//         console.error('Failed to copy message:', error);
//         toast.error("Failed to copy message");
//       });
//   };

//   return (
//     <div className="flex flex-col h-full overflow-hidden bg-background"> {/* Added bg-background */}
//       {/* Messages container */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
//         {messages.map((message, index) => (
//           <div
//             key={message.id || `msg-${index}`} // Use message.id if available
//             className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
//           >
//             <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start`}> {/* Added items-start */}
//               <div className="flex-shrink-0">
//                 {message.role === 'user' ? (
//                   <Avatar>
//                     <AvatarFallback>U</AvatarFallback>
//                     {/* Assuming a generic user icon */}
//                     <AvatarImage src="/default-user-icon.png" /> 
//                   </Avatar>
//                 ) : (
//                   <Avatar>
//                     <AvatarFallback>{tutorName ? tutorName[0] : 'T'}</AvatarFallback>
//                     <AvatarImage src={tutorImage || "/avatars/tutor-avatar.png"} />
//                   </Avatar>
//                 )}
//               </div>

//               <div className={`relative group mx-2`}> {/* Use mx-2 for spacing */}
//                 <div
//                   className={`${
//                     message.role === 'user'
//                       ? 'bg-primary text-primary-foreground'
//                       : 'bg-muted'
//                   } rounded-lg p-3 pr-8 shadow-sm`} // Added shadow-sm
//                 >
//                   <div className="text-sm break-words"> {/* Added break-words */}
//                     {message.role === 'assistant' ? (
//                       <Format content={message.content} />
//                     ) : (
//                       message.content
//                     )}
//                   </div>
//                 </div>

//                 {/* Copy button for messages */}
//                 <button
//                   onClick={() => copyMessageToClipboard(message, index)}
//                   className="absolute top-1 right-1 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-background/80" // Adjusted position and background
//                   title="Copy message"
//                   aria-label="Copy message to clipboard"
//                 >
//                   {copiedMessageId === (message.id || `msg-${index}`) ? (
//                     <Check className="h-4 w-4 text-green-500" />
//                   ) : (
//                     <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" /> // Adjusted colors
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}

//         {/* Loading indicator for AI response */}
//         {isLoading && (
//           <div className="flex justify-start">
//             <div className="flex max-w-[80%] flex-row items-start">
//               <div className="flex-shrink-0">
//                 <Avatar>
//                   <AvatarFallback>{tutorName ? tutorName[0] : 'T'}</AvatarFallback>
//                   <AvatarImage src={tutorImage || "/avatars/tutor-avatar.png"} />
//                 </Avatar>
//               </div>
//               <div className="bg-muted rounded-lg p-3 ml-2 shadow-sm">
//                 <div className="flex items-center space-x-2">
//                   <Loader2 className="h-4 w-4 animate-spin text-primary" />
//                   <span className="text-sm text-muted-foreground">Thinking...</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input area with VoiceCard */}
//       <div className="p-4 border-t flex-shrink-0 bg-background"> {/* Added bg-background */}
//          {/* VoiceCard Integration */}
//          <VoiceCard
//            tutorId={tutorId}
//            onTranscriptionReceived={setCurrentTranscription}
//            // Pass any other necessary props to VoiceCard if needed
//            // Note: VoiceCard now handles its own loading state for connection/transcription
//          />
//         {/* Send button - active only when there's transcription and not loading AI response */}
//         <div className="mt-2 flex justify-end">
//           <Button
//             type="button" // Change to button if not submitting a form directly
//             onClick={() => handleSendTranscription()}
//             disabled={!currentTranscription.trim() || isLoading}
//             title="Send transcription"
//             className="flex items-center space-x-1" // Added spacing for icon
//           >
//             <Send className="h-5 w-5" />
//              <span>Send</span>
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TalkInterface;