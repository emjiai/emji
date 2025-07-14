import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * VoiceButton for real-time voice interaction.
 * Simplified interface connecting to real-time API using WebRTC.
 * Always includes document context upon connection.
 */
export default function VoiceButton({ 
  tutorId = '', // Optional: Pass if needed by your /session endpoint
  documentTitle = '', // Document title to include as context
  documentContent = '', // Document content to include as context
  selectedDocumentTitle  = '', // Alternative prop name for document title (for compatibility)
  selectedDocumentContent = '', // Alternative prop name for document content (for compatibility)
}) {
  // Use either direct props or the "selected" props for backward compatibility
  const docTitle = documentTitle || selectedDocumentTitle || 'Untitled';
  const docContent = documentContent || selectedDocumentContent || '';
  
  // Connection states
  const [status, setStatus] = useState('idle'); // 'idle', 'connecting', 'connected'
  
  // Refs for WebRTC
  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const audioRef = useRef(null);

  // Helper function for logging
  const logMessage = (message, type = 'info') => {
    console.log(`[VoiceButton-${type}] ${message}`);
  };

  // Add state for the checkbox
  const [includeDoc, setIncludeDoc] = useState(false);

  // Initialize WebRTC connection
  const connect = async () => {
    if (status !== 'idle') return;
    
    setStatus('connecting');
    logMessage('Initializing connection...');

    try {
      // 1) Fetch Ephemeral Key
      logMessage('Requesting session token...');
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";
      const tokenResp = await fetch(`${API_BASE_URL}/api/v1/talk_session`); // CHECK THIS ENDPOINT

      if (!tokenResp.ok) {
        const errorBody = await tokenResp.text().catch(() => "Could not read error body");
        console.error(`Token fetch failed: ${tokenResp.status} ${tokenResp.statusText}`, errorBody);
        throw new Error(`Token fetch failed: ${tokenResp.statusText} (${tokenResp.status})`);
      }
      
      const tokenData = await tokenResp.json();
      const EPHEMERAL_KEY = tokenData?.client_secret?.value;
      
      if (!EPHEMERAL_KEY) {
        console.error("Session token response missing client_secret.value:", tokenData);
        throw new Error('Session token (client_secret) not found in response.');
      }
      logMessage('Session token received.');

      // 2) Create RTCPeerConnection
      pcRef.current = new RTCPeerConnection();
      logMessage('PeerConnection created.');
      
      pcRef.current.ontrack = (event) => {
        logMessage(`Track received: kind=${event.track.kind}`);
        if (audioRef.current && event.streams && event.streams[0]) {
          audioRef.current.srcObject = event.streams[0];
          logMessage('Remote audio stream attached.');
        }
      };
      
      pcRef.current.onconnectionstatechange = () => {
        const state = pcRef.current?.connectionState;
        logMessage(`Connection state: ${state}`);
        
        if (state === 'failed' || state === 'disconnected' || state === 'closed') {
          logMessage('Connection lost or closed', 'warning');
          disconnect();
        }
      };
      
      // 3) Get Local Media (Microphone)
      logMessage('Requesting microphone access...');
      let localStream;
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStream.getTracks().forEach(track => {
          if (pcRef.current) {
            pcRef.current.addTrack(track, localStream);
            logMessage(`Local audio track added (id: ${track.id})`);
          }
        });
      } catch (micError) {
        console.error("Microphone access error:", micError);
        throw new Error("Microphone access denied. Check browser permissions.");
      }

      // 4) Create Data Channel
      dcRef.current = pcRef.current.createDataChannel('oai-events');
      logMessage(`Data channel created (label: ${dcRef.current.label})`);
      
      dcRef.current.onopen = sendDocumentContext; // Will send context on open
      dcRef.current.onmessage = handleDataChannelMessage;
      dcRef.current.onclose = () => logMessage('Data channel closed.');
      dcRef.current.onerror = (errorEvent) => {
        console.error("Data channel error:", errorEvent);
        logMessage(`Data channel error occurred`, 'error');
      };

      // 5) Create Offer and Set Local Description
      logMessage('Creating SDP offer...');
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      logMessage('Local description set.');

      // 6) Send Offer to Signaling Server
      const signalingUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-realtime-preview-2024-12-17';
      logMessage(`Sending SDP offer to ${signalingUrl}...`);
      
      const sdpResponse = await fetch(`${signalingUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          'Authorization': `Bearer ${EPHEMERAL_KEY}`,
          'Content-Type': 'application/sdp',
        },
      });
      
      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text().catch(() => 'Unable to read error response.');
        throw new Error(`SDP exchange failed: ${sdpResponse.statusText} - ${errorText}`);
      }
      logMessage('SDP offer sent successfully.');

      // 7) Receive Answer and Set Remote Description
      const answerSdp = await sdpResponse.text();
      await pcRef.current.setRemoteDescription({ type: 'answer', sdp: answerSdp });
      logMessage('Remote description (answer) set.');
      setStatus('connected');
      
    } catch (error) {
      console.error('Connection Error:', error);
      logMessage(`Error: ${error instanceof Error ? error.message : 'Unknown initialization error'}`, 'error');
      disconnect();
    }
  };

  // Send document context when data channel opens
  function sendDocumentContext() {
    if (!dcRef.current || dcRef.current.readyState !== 'open') return;
    
    try {
      // Only send document context if the checkbox is checked and there's content
      if (includeDoc && docContent) {
        logMessage('Sending document context...');
        
        // 1) conversation.create (Always required)
        const convCreate = {
          type: 'conversation.create',
          conversation: {
            model: 'anthropic/claude-3-opus-20240229'
          }
        };
        dcRef.current.send(JSON.stringify(convCreate));
        logMessage('Sent conversation.create.');
        
        // 2) conversation.item.create (Send document content)
        const docMsg = {
          type: 'conversation.item.create',
          item: {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Document Title: ${docTitle}\n\nDocument Content:\n${docContent}`
              }
            ]
          }
        };
        dcRef.current.send(JSON.stringify(docMsg));
        logMessage('Sent conversation.item.create with document.');

        // 3) response.create (Prompt AI response)
        const respCreate = {
          type: 'response.create',
          response: {
            conversation: 'auto',
            modalities: ['text', 'audio']
          }
        };
        dcRef.current.send(JSON.stringify(respCreate));
        logMessage('Sent response.create.');
      } else {
        logMessage('Skipping document context (disabled or no content).');
      }
    } catch (sendError) {
      console.error("Error sending context messages via DataChannel:", sendError);
      logMessage(`Failed to send context: ${sendError instanceof Error ? sendError.message : 'Unknown send error'}`, 'error');
    }
  }

  // Handle incoming data channel messages
  function handleDataChannelMessage(event) {
    try {
      const msg = JSON.parse(event.data);
      
      switch (msg.type) {
        case 'response.done':
          logMessage('AI response turn complete.');
          break;
        case 'response.error':
          const errorMessage = msg.error || 'Unknown AI error';
          console.error('AI Error Event:', msg);
          logMessage(`AI error: ${errorMessage}`, 'error');
          break;
      }
    } catch (err) {
      console.error('Failed to parse or handle incoming message:', event.data, err);
      logMessage(`Error processing message: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  }

  // Cleanup function to close connections
  const disconnect = () => {
    logMessage('Cleanup requested.');
    try {
      // Stop any active tracks
      if (pcRef.current) {
        pcRef.current.getSenders().forEach(sender => {
          if (sender.track) { 
            sender.track.stop(); 
            logMessage(`Stopped local track: ${sender.track.id}`);
          }
        });
      }
      
      // Close data channel if it exists
      if (dcRef.current) {
        dcRef.current.close();
        dcRef.current = null;
        logMessage('Data channel closed.');
      }
      
      // Close peer connection if it exists
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
        logMessage('PeerConnection closed.');
      }
      
      // Clear audio
      if (audioRef.current) {
        audioRef.current.srcObject = null;
        logMessage('Audio element source cleared.');
      }
      
      // Reset state
      setStatus('idle');
    } catch (error) {
      console.warn('Error during cleanup:', error);
    }
  };
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      logMessage("VoiceButton unmounting: Triggering cleanup.");
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle connection when button is clicked
  const handleButtonClick = () => {
    if (status === 'idle') {
      connect();
    } else {
      disconnect();
    }
  };
  
  // Get appropriate button style based on status
  const getButtonStyle = () => {
    switch (status) {
      case 'connecting':
        return 'bg-orange-400 hover:bg-orange-500 text-white animate-pulse';
      case 'connected':
        return 'bg-green-500 hover:bg-green-600 text-white';
      default:
        return 'bg-gray-200 hover:bg-gray-300 text-gray-700';
    }
  };

  // Define ID for the checkbox
  const checkboxId = "include-doc-checkbox";
  const isCheckboxDisabled = !docContent || status !== 'idle';

  return (
    <div className="flex items-center gap-2">
      {/* Include Document Checkbox */}
      <div className="flex items-center space-x-1 mr-1">
        <input
          type="checkbox"
          id={checkboxId}
          checked={includeDoc}
          onChange={(e) => setIncludeDoc(e.target.checked)}
          disabled={isCheckboxDisabled}
          className="h-3 w-3 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <label
          htmlFor={checkboxId}
          className={`text-xs font-medium leading-none ${
            isCheckboxDisabled
            ? "cursor-not-allowed text-muted-foreground opacity-50"
            : "cursor-pointer text-foreground"
          }`}
        >
          Include Context
        </label>
      </div>
      
      <Button
        type="button"
        onClick={handleButtonClick}
        className={`rounded-full p-3 ${getButtonStyle()}`}
        title={status === 'idle' ? 'Start voice chat' : status === 'connecting' ? 'Connecting...' : 'Stop voice chat'}
      >
        {status === 'connecting' ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : status === 'connected' ? (
          <Mic className="h-5 w-5" />
        ) : (
          <MicOff className="h-5 w-5" />
        )}
      </Button>
      
      {/* Hidden audio element for playback */}
      <audio ref={audioRef} autoPlay hidden />
    </div>
  );
}