import React, { useState, useEffect } from "react";
import PreviewModal from "./VideoPreview";
import { FaVideo, FaPause, FaPlay, FaStop } from "react-icons/fa";
import classNames from "classnames";

const ScreenRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Button styling
  const buttonClass = classNames({
    "inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium": true,
    "bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-500": isRecording,
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300": !isRecording,
    "hover:bg-slate-200 dark:hover:bg-slate-700": !isRecording,
  });

  // On mount, check if a recording is in progress or if a video URL exists on the global window
  useEffect(() => {
    if (
      window.__globalMediaRecorder &&
      window.__globalMediaRecorder.state !== "inactive"
    ) {
      setIsRecording(true);
      setIsPaused(window.__globalMediaRecorder.state === "paused");
    }
    if (window.__globalVideoURL) {
      setVideoURL(window.__globalVideoURL);
      setShowModal(true);
    }
  }, []);

  // Also update the window global when videoURL changes
  useEffect(() => {
    if (videoURL) {
      window.__globalVideoURL = videoURL;
      setShowModal(true);
    }
  }, [videoURL]);

  // Function to reset all states and clear resources
  const resetStates = () => {
    setShowModal(false);
    setVideoURL(null);
    setIsGenerating(false);
    setProgress(0);
    setIsRecording(false);
    setIsPaused(false);
    // Clear global variables
    window.__globalVideoURL = null;
    window.__globalRecordedChunks = [];
    window.__globalMediaRecorder = null;
    // Revoke object URL to prevent memory leaks
    if (videoURL) {
      URL.revokeObjectURL(videoURL);
    }
  };

  // Function to start recording
  const startRecording = async () => {
    try {
      // Reset states
      setVideoURL(null);
      setShowModal(false);
      setIsGenerating(false);
      setProgress(0);
      window.__globalRecordedChunks = [];

      // Capture screen video and audio
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: true,
      });

      // Capture microphone audio
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // Create and setup combined stream
      const combinedStream = new MediaStream();
      screenStream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));

      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();

      if (screenStream.getAudioTracks().length > 0) {
        const screenAudioSource = audioContext.createMediaStreamSource(screenStream);
        screenAudioSource.connect(destination);
      }

      if (audioStream.getAudioTracks().length > 0) {
        const micAudioSource = audioContext.createMediaStreamSource(audioStream);
        micAudioSource.connect(destination);
      }

      destination.stream.getAudioTracks().forEach((track) => {
        combinedStream.addTrack(track);
      });

      // Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(combinedStream);
      window.__globalMediaRecorder = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          window.__globalRecordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Start progress bar
        setIsGenerating(true);
        setProgress(0);

        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              // Create video blob and show preview
              const blob = new Blob(window.__globalRecordedChunks, { type: "video/webm" });
              const url = URL.createObjectURL(blob);
              setVideoURL(url);
              setIsGenerating(false);
              setShowModal(true);
              return 100;
            }
            return prev + 10;
          });
        }, 200);
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);

      // Handle screen share stop
      screenStream.getTracks()[0].onended = () => {
        stopRecording();
      };

    } catch (error) {
      console.error("Error accessing screen or microphone:", error);
      alert("Please allow permissions for both screen and microphone.");
      setIsRecording(false);
      setIsGenerating(false);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (window.__globalMediaRecorder && window.__globalMediaRecorder.state !== "inactive") {
      window.__globalMediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);

      // Stop all tracks
      const tracks = window.__globalMediaRecorder.stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  // Pause recording
  const pauseRecording = () => {
    if (window.__globalMediaRecorder?.state === "recording") {
      window.__globalMediaRecorder.pause();
      setIsPaused(true);
    }
  };

  // Resume recording
  const resumeRecording = () => {
    if (window.__globalMediaRecorder?.state === "paused") {
      window.__globalMediaRecorder.resume();
      setIsPaused(false);
    }
  };

  return (
    <>
      {isGenerating ? (
        // Progress bar display
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-medium">Generating Video: {progress}%</span>
          <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : !isRecording ? (
        // Record button
        <button className={buttonClass} onClick={startRecording}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <circle cx="8" cy="8" r="8" />
          </svg>
          <span>Record Screen</span>
        </button>
      ) : (
        // Recording controls
        <div className="flex items-center space-x-4">
          <div title="Recording">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="8" fill="green" />
            </svg>
          </div>
          {!isPaused ? (
            <button
              onClick={pauseRecording}
              title="Pause Recording"
              className="focus:outline-none"
            >
              <FaPause size={16} style={{ color: "yellow" }} />
            </button>
          ) : (
            <button
              onClick={resumeRecording}
              title="Resume Recording"
              className="focus:outline-none"
            >
              <svg width="16" height="16" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="8" fill="blue" />
              </svg>
            </button>
          )}
          <button
            onClick={stopRecording}
            title="Stop Recording"
            className="focus:outline-none"
          >
            <svg width="16" height="16" viewBox="0 0 100 100">
              <polygon
                points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
                fill="red"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Updated Video Preview Modal */}
      <PreviewModal 
        show={showModal} 
        onClose={resetStates}
      >
        <div className="w-full max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">Recorded Video</h2>
          {videoURL && (
            <div className="space-y-4">
              <video 
                src={videoURL} 
                controls 
                className="w-full rounded-lg shadow-lg"
                style={{ maxHeight: '70vh' }}
              />
              <div className="flex justify-between items-center mt-4">
                <a
                  href={videoURL}
                  download="screen-recording.webm"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Download Recording
                </a>
                <button
                  onClick={resetStates}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </PreviewModal>
    </>
  );
};

export default ScreenRecorder;


