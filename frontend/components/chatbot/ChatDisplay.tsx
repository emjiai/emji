"use client";

import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

// Import Components
import ChatInterface from "@/components/chatbot/ChatInterface";
import TalkInterface from "@/components/chatbot/TalkInterface";
import { Button } from "@/components/ui/button";



// Define Types
interface Tutor {
  id: string;
  name: string;
  description: string;
  instructions: string;
  src: string;
  categoryId: string;
  userName: string;
  createdAt: string;
  _count: {
    messages: number;
  };
}

interface Message {
  id?: string;
  content: string;
  role: 'user' | 'system' | 'assistant';
  createdAt?: string;
}

// Define Component
export default function ChatDisplay() {
  // const params = useParams();
  const params = { id: "7596ccf5-6f4e-4b30-868a-6888e80be0db" };
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<'text' | 'voice'>('text'); 

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(false); 


  // Fetch Tutor Data Effect
  useEffect(() => {
    const fetchTutor = async () => {
      try {
        setLoading(true);
        const id = params?.id;
        if (!id || typeof id !== 'string') {
          throw new Error("Invalid tutor ID");
        }

        const response = await fetch(`/api/tutor?id=${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tutor");
        }
        const data = await response.json();
        const foundTutor = Array.isArray(data) ? data.find(t => t.id === id) : data;

        if (!foundTutor) {
          throw new Error("Tutor not found");
        }
        setTutor(foundTutor);

        // Optionally fetch voice options if needed elsewhere later
        // await fetchVoiceOptions(foundTutor.id);

      } catch (error) {
        console.error("Error fetching tutor:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (params && params.id) {
      fetchTutor();
    }
  // }, [params]);
}, []);

  // Loading/Error/Not Found States
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading tutor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-2">Error: {error}</p>
        <p>Unable to load tutor information</p>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Tutor not found</p>
      </div>
    );
  }


  const sendMessage = async (content: string) => {
    if (!tutor || !content.trim()) return;

    try {
      const userMessage: Message = {
        role: 'user',
        content,
        id: `temp-${Date.now()}`, // Temporary ID for UI key
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      setChatLoading(true);

      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";
      console.log("Sending chat request to", `${API_BASE_URL}/api/v1/chat`);


      const apiMessages = [
        {
          role: "system",
          content: `You are ${tutor.name}, a friendly tutor (${tutor.description}). Instructions: ${tutor.instructions}`
        },
        {
          role: "user",
          content: content
        }
      ];

      const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messages: apiMessages, 
          model: "gpt-4o", 
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Could not retrieve error text");
        throw new Error(`Chat API error (${response.status}): ${errorText}`);
      }

      const responseData = await response.json();
      const responseText = responseData.message?.content || responseData.text || "";

      if (!responseText) {
        throw new Error('No valid response received from the tutor');
      }

      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: responseText,
        id: `ai-${Date.now()}`, // Example ID
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(`Failed to get response: ${error instanceof Error ? error.message : String(error)}`);
      // Optional: Remove optimistic user message on error
      // setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setChatLoading(false);
    }
  };

  // Render Component JSX
  return (
    // Ensure parent container allows flex child to take full height
    <div className="container mx-auto px-4 py-4 h-[calc(100vh-80px)] flex flex-col">
      <div className="bg-card rounded-lg shadow-md overflow-hidden flex flex-col flex-1"> {/* Use flex-1 and flex-col */}
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between flex-wrap flex-shrink-0"> {/* flex-shrink-0 */}
          <div className="flex items-center">
            <div className="relative h-8 w-8 rounded-full overflow-hidden mr-3 flex-shrink-0"> {/* flex-shrink-0 */}
              <Image
                src={tutor.src}
                alt={tutor.name}
                fill
                sizes="32px" // Provide sizes attribute
                className="object-cover"
              />
            </div>
            <h2 className="font-semibold text-card-foreground">{tutor.name}</h2>
          </div>

          {/* Mode Toggle Button */}
          <Button
            variant="outline" // Use outline variant for secondary action
            onClick={() => setChatMode(chatMode === 'text' ? 'voice' : 'text')}
            className="mt-2 sm:mt-0" // Adjust margin for smaller screens
          >
            {chatMode === 'text' ? 'Switch to Talk' : 'Switch to Chat'}
          </Button>
        </div>

        {/* Chat Area - Takes remaining space */}
        <div className="flex-grow overflow-hidden relative"> {/* Ensure this container handles overflow */}
            {/* Conditionally render Chat or Talk interface */}
            {chatMode === 'text' ? (
              <ChatInterface
                messages={messages}
                isLoading={chatLoading}
                onSendMessage={sendMessage}
                tutorName={tutor.name}
                tutorImage={tutor.src}
                tutorId={tutor.id}
              />
            ) : (
              // Pass the correct props to TalkInterface
              <TalkInterface
                messages={messages}          // Pass the chat messages
                isLoading={chatLoading}      // Pass the loading state for AI responses
                onSendMessage={sendMessage}  // Pass the function to handle sending messages
                tutorName={tutor.name}       // Pass the tutor's name
                tutorImage={tutor.src}       // Pass the tutor's image URL
                tutorId={tutor.id}           // Pass the tutor's ID
              />
            )}
        </div>
      </div>
    </div>
  );
}

