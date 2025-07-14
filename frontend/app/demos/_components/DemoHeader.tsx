'use client';

// app/demos/_components/DemoHeader.tsx
import React, { FormEvent, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import ScreenRecorder from '@/components/screenrecorder/ScreenRecorder';
import ScreenCapture from '@/components/screenrecorder/ScreenCapture';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
const apiEndpoint = `${API_BASE_URL}/api/v1/users/waitlist`;

interface WaitlistResponse {
  success: boolean;
  message: string;
}

interface DemoHeaderProps {
  title?: string;
  description?: string;
}

const DemoHeader: React.FC<DemoHeaderProps> = ({ title, description }) => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post<WaitlistResponse>(apiEndpoint, {
        email
      });
      
      toast.success(response.data.message || "Success! You've been added to our waitlist.");
      setEmail("");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white border-b border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <Link href="/">
              <Image src="/logo3.png" alt="EmJi AI Logo" width={100} height={100} />
            </Link>
          </div>
          
          {title && (
            <div className="hidden md:flex flex-col items-center">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              {description && <p className="text-sm text-gray-500">{description}</p>}
            </div>
          )}
          
          <div className="flex items-center mr-4 space-x-2">
            <ScreenRecorder />
            <ScreenCapture />
          </div>
          
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <input
                type="email"
                id="header-email"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button 
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              ) : (
                "Join Wait List"
              )}
            </Button>
          </form>
        </div>
      </header>
      
      {/* Mobile title display */}
      {title && (
        <div className="md:hidden pt-20 px-4 text-center">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      )}
    </>
  );
};

export default DemoHeader;