"use client";

import React, { useState, useRef, KeyboardEvent } from "react";
import { Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatTextAreaProps {
  onSendMessage: (message: string) => void;
  onUploadFile?: (file: File) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ChatTextArea: React.FC<ChatTextAreaProps> = ({
  onSendMessage,
  onUploadFile,
  placeholder = "Type your message here...",
  disabled = false,
}) => {
  const [message, setMessage] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleSave = () => {
    // TODO: Implement file upload functionality
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadFile) {
      onUploadFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle auto-resize of textarea
  const handleTextareaResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  return (
    <div className="relative flex items-end border rounded-lg bg-white p-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="flex-shrink-0"
        onClick={handleSave}
        disabled={disabled}
        title="Save file"
      >
        <Save size={20} className="text-gray-500" />
      </Button>

      <div className="flex-grow mx-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onInput={handleTextareaResize}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="w-full resize-none border-0 bg-transparent p-2 focus:ring-0 focus:outline-none"
          style={{ maxHeight: "200px", overflowY: "auto" }}
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`flex-shrink-0 ${
          !message.trim() || disabled ? "opacity-50" : "opacity-100"
        }`}
        onClick={handleSendMessage}
        disabled={!message.trim() || disabled}
        title="Send message"
      >
        <Send size={20} className="text-blue-500" />
      </Button>
    </div>
  );
};

export default ChatTextArea;