"use client";
import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface SpeakerProps {
  audioUrl?: string;
  className?: string;
}

const Speaker = ({ audioUrl, className = "" }: SpeakerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element
    if (typeof window !== "undefined") {
      audioRef.current = new Audio(audioUrl);
      
      // Event listeners
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onpause = () => setIsPlaying(false);
      audioRef.current.onplay = () => setIsPlaying(true);
    }

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onpause = null;
        audioRef.current.onplay = null;
      }
    };
  }, [audioUrl]);

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Reset to beginning if it was previously played
      if (audioRef.current.currentTime > 0 && audioRef.current.currentTime === audioRef.current.duration) {
        audioRef.current.currentTime = 0;
      }
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
      });
    }
  };

  return (
    <button
      onClick={togglePlayback}
      disabled={!audioUrl}
      className={`p-2 rounded-full hover:bg-gray-200 ${!audioUrl ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      title={audioUrl ? (isPlaying ? "Pause audio" : "Play audio") : "No audio available"}
    >
      {isPlaying ? (
        <VolumeX className="h-5 w-5 text-blue-600" />
      ) : (
        <Volume2 className="h-5 w-5 text-gray-600" />
      )}
    </button>
  );
};

export default Speaker;