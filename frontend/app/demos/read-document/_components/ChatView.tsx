import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, StopCircle } from 'lucide-react';
import FullScreen from '@/components/ui/full-screen';
import ReactMarkdown from 'react-markdown';
import CodeFormat from '@/components/ui/code-format';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

interface ChatViewProps {
  conversation: Message[];
  message: string;
  isStreaming: boolean;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onStopStreaming: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({
  conversation,
  message,
  isStreaming,
  onMessageChange,
  onSendMessage,
  onStopStreaming
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef<boolean>(true);

  // Enhanced auto-scroll function
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    if (chatContainerRef.current && shouldAutoScrollRef.current) {
      const container = chatContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: behavior
      });
    }
  };

  // Check if user has scrolled up manually
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      const threshold = 100; // pixels from bottom
      const isNearBottom = 
        container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
      
      shouldAutoScrollRef.current = isNearBottom;
    }
  };

  // Scroll to bottom whenever messages change or during streaming
  useEffect(() => {
    // Initial scroll when messages change
    scrollToBottom('smooth');
    
    // Setup continuous scrolling during streaming
    let timerId: NodeJS.Timeout | null = null;
    
    if (isStreaming) {
      // Reset auto-scroll when streaming starts
      shouldAutoScrollRef.current = true;
      
      timerId = setInterval(() => {
        scrollToBottom('auto');
      }, 100); // Reduced frequency for better performance
    }
    
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [conversation, isStreaming]);

  // Scroll to bottom when a new message starts streaming
  useEffect(() => {
    if (isStreaming) {
      shouldAutoScrollRef.current = true;
      scrollToBottom('smooth');
    }
  }, [isStreaming]);

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <FullScreen buttonPosition="absolute right-2 top-2 z-10">
      <div className="flex flex-col h-full">
        <div 
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto border rounded-md bg-gray-50 p-4 mb-4 h-0 min-h-0"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
          {conversation.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 ${
                msg.role === 'assistant' ? 'mr-8 md:mr-12' : 'ml-8 md:ml-12'
              }`}
            >
              <div
                className={`p-3 rounded-lg ${
                  msg.role === 'assistant' 
                    ? 'bg-blue-50 border border-blue-100' 
                    : 'bg-green-50 border border-green-100 ml-auto'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert [&_p]:mb-6">
                    <ReactMarkdown
                      components={{
                        code(props) {
                          const { className, children, node, ...rest } = props;
                          const match = /language-(\w+)/.exec(className || '');
                          const language = match ? match[1] : '';
                          
                          // Check if it's inline code (we need to cast the props to access inline)
                          const codeProps = props as { inline?: boolean };
                          
                          if (codeProps.inline) {
                            return <code className="px-1 py-0.5 bg-gray-100 rounded text-sm font-mono dark:bg-gray-800" {...rest}>{children}</code>;
                          }
                          
                          // Check if it's a math block (could be denoted by language-math or another convention)
                          const isMath = language === 'math' || language === 'latex';
                          
                          return (
                            <CodeFormat language={language} isMath={isMath}>
                              {String(children).replace(/\n$/, '')}
                            </CodeFormat>
                          );
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                )}
                {msg.isStreaming && (
                  <div className="flex items-center mt-2">
                    <div className="animate-pulse flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                    <span className="text-xs text-blue-500 ml-2">AI is typing...</span>
                  </div>
                )}
              </div>
              <p className={`text-xs text-gray-500 mt-1 ${
                msg.role === 'assistant' ? '' : 'text-right'
              }`}>
                {msg.role === 'assistant' ? 'AI Assistant' : 'You'} • {formatTime(msg.timestamp)}
              </p>
            </div>
          ))}
        </div>

        <div className="flex space-x-2 sticky bottom-0 bg-white p-2 border-t">
          <Textarea
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about this document..."
            className="resize-none"
            rows={2}
            disabled={isStreaming}
          />
          <div className="flex items-stretch">
            {isStreaming ? (
              <Button 
                onClick={onStopStreaming}
                variant="outline"
                className="h-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <StopCircle className="h-5 w-5" />
              </Button>
            ) : (
              <Button 
                onClick={onSendMessage} 
                disabled={!message.trim() || isStreaming}
                className="h-full"
              >
                <Send className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </FullScreen>
  );
};

export default ChatView;

// import React, { useRef, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Textarea } from '@/components/ui/textarea';
// import { Send, StopCircle } from 'lucide-react';
// import FullScreen from '@/components/ui/full-screen';
// import ReactMarkdown from 'react-markdown';
// import CodeFormat from '@/components/ui/code-format';

// interface Message {
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: string;
//   isStreaming?: boolean;
// }

// interface ChatViewProps {
//   conversation: Message[];
//   message: string;
//   isStreaming: boolean;
//   onMessageChange: (value: string) => void;
//   onSendMessage: () => void;
//   onStopStreaming: () => void;
// }

// const ChatView: React.FC<ChatViewProps> = ({
//   conversation,
//   message,
//   isStreaming,
//   onMessageChange,
//   onSendMessage,
//   onStopStreaming
// }) => {
//   const chatContainerRef = useRef<HTMLDivElement>(null);

//   // Scroll to bottom whenever messages change or during streaming
//   useEffect(() => {
//     // Initial scroll when messages change
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTo({
//         top: chatContainerRef.current.scrollHeight,
//         behavior: 'smooth'
//       });
//     }
    
//     // Setup continuous scrolling during streaming
//     let timerId: NodeJS.Timeout | null = null;
    
//     if (isStreaming) {
//       timerId = setInterval(() => {
//         if (chatContainerRef.current) {
//           chatContainerRef.current.scrollTo({
//             top: chatContainerRef.current.scrollHeight,
//             behavior: 'auto' // Use 'auto' for more reliable scrolling during streaming
//           });
//         }
//       }, 50); // Higher frequency for more responsive scrolling
//     }
    
//     return () => {
//       if (timerId) clearInterval(timerId);
//     };
//   }, [conversation, isStreaming]);

//   const formatTime = (timestamp: string): string => {
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       onSendMessage();
//     }
//   };

//   return (
//     <FullScreen buttonPosition="absolute right-2 top-2 z-10">
//       <>
//         <div 
//           ref={chatContainerRef}
//           className="flex-1 overflow-y-auto border rounded-md bg-gray-50 p-4 mb-4"
//         >
//           {conversation.map((msg, index) => (
//             <div
//               key={index}
//               className={`mb-4 ${
//                 msg.role === 'assistant' ? 'mr-8 md:mr-12' : 'ml-8 md:ml-12'
//               }`}
//             >
//               <div
//                 className={`p-3 rounded-lg ${
//                   msg.role === 'assistant' 
//                     ? 'bg-blue-50 border border-blue-100' 
//                     : 'bg-green-50 border border-green-100 ml-auto'
//                 }`}
//               >
//                 {msg.role === 'assistant' ? (
//                   <div className="prose prose-sm max-w-none dark:prose-invert [&_p]:mb-6">
//                     <ReactMarkdown
//                       components={{
//                         code(props) {
//                           const { className, children, node, ...rest } = props;
//                           const match = /language-(\w+)/.exec(className || '');
//                           const language = match ? match[1] : '';
                          
//                           // Check if it's inline code (we need to cast the props to access inline)
//                           const codeProps = props as { inline?: boolean };
                          
//                           if (codeProps.inline) {
//                             return <code className="px-1 py-0.5 bg-gray-100 rounded text-sm font-mono dark:bg-gray-800" {...rest}>{children}</code>;
//                           }
                          
//                           // Check if it's a math block (could be denoted by language-math or another convention)
//                           const isMath = language === 'math' || language === 'latex';
                          
//                           return (
//                             <CodeFormat language={language} isMath={isMath}>
//                               {String(children).replace(/\n$/, '')}
//                             </CodeFormat>
//                           );
//                         }
//                       }}
//                     >
//                       {msg.content}
//                     </ReactMarkdown>
//                   </div>
//                 ) : (
//                   <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
//                 )}
//                 {msg.isStreaming && (
//                   <div className="flex items-center mt-2">
//                     <div className="animate-pulse flex space-x-1">
//                       <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
//                       <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
//                       <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
//                     </div>
//                     <span className="text-xs text-blue-500 ml-2">AI is typing...</span>
//                   </div>
//                 )}
//               </div>
//               <p className={`text-xs text-gray-500 mt-1 ${
//                 msg.role === 'assistant' ? '' : 'text-right'
//               }`}>
//                 {msg.role === 'assistant' ? 'AI Assistant' : 'You'} • {formatTime(msg.timestamp)}
//               </p>
//             </div>
//           ))}
//         </div>

//         <div className="flex space-x-2 sticky bottom-0 bg-white p-2 border-t">
//           <Textarea
//             value={message}
//             onChange={(e) => onMessageChange(e.target.value)}
//             onKeyPress={handleKeyPress}
//             placeholder="Ask a question about this document..."
//             className="resize-none"
//             rows={2}
//             disabled={isStreaming}
//           />
//           <div className="flex items-stretch">
//             {isStreaming ? (
//               <Button 
//                 onClick={onStopStreaming}
//                 variant="outline"
//                 className="h-full text-red-600 hover:text-red-700 hover:bg-red-50"
//               >
//                 <StopCircle className="h-5 w-5" />
//               </Button>
//             ) : (
//               <Button 
//                 onClick={onSendMessage} 
//                 disabled={!message.trim() || isStreaming}
//                 className="h-full"
//               >
//                 <Send className="h-5 w-5" />
//               </Button>
//             )}
//           </div>
//         </div>
//       </>
//     </FullScreen>
//   );
// };

// export default ChatView;