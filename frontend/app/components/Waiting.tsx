import React, { FormEvent, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
const apiEndpoint = `${API_BASE_URL}/api/v1/users/waitlist`;

interface WaitlistResponse {
  success: boolean;
  message: string;
}

function WaitingList() {
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post<WaitlistResponse>(apiEndpoint, {
        email
      });
      
      console.log(response.data);
      toast.success(response.data.message || "Success! You've been added to our waitlist.");
      setEmail("");
    } catch (error) {
      console.error(error);
      setStatus("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Toaster position="top-center" />
      <div className="mt-5 max-w-2xl text-center mx-auto px-4">
        <h1 className="block font-bold text-gray-800 text-3xl md:text-4xl lg:text-3xl dark:text-neutral-200">
          Join Waitlist For
          <span className="bg-clip-text bg-gradient-to-tl from-[#423042] to-[#865db2] text-transparent">
            {" "}
            Early Access
          </span>
        </h1>
      </div>

      <div className="mt-5 max-w-3xl text-center mx-auto px-4">
      </div>
      <form onSubmit={handleSubmit} className="py-8 px-4 md:px-32">
        <div className="flex flex-col sm:flex-row items-center justify-between border border-gray-200 rounded-lg dark:border-neutral-700 max-w-md mx-auto">
         
            <label htmlFor="hero-input" className="sr-only">
              Join
            </label>
            <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-3">
              <svg
                className="shrink-0 size-4 text-gray-400 dark:text-neutral-600"
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
              id="hero-input"
              name="hero-input"
              className="outline-none py-3 ps-9 block w-full border-transparent rounded-lg text-xs sm:text-sm focus:border-transparent focus:ring-transparent disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:text-neutral-400 dark:placeholder-neutral-500"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
         
         <div className="w-full flex justify-end sm:ml-auto">
            <button
              type="submit"
              className="w-full sm:w-auto whitespace-nowrap py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-md border border-transparent bg-gray-800 text-white hover:bg-gray-900 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:bg-white dark:text-neutral-800 dark:hover:bg-neutral-200 cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="[http://www.w3.org/2000/svg]"
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
                <>
                  Join
                  <svg
                    className="shrink-0 size-3.5 ml-2"
                    xmlns="[http://www.w3.org/2000/svg]"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

export default WaitingList;