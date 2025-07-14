// src/components/.../VoiceCard.jsx (Ensure filename matches)

import React, { useEffect, useRef, useState } from 'react';

// Import Button and Lucide icons (Assuming these paths are correct)
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

/**
 * VoiceCard for real-time voice interaction.
 * Connects via WebRTC, handles audio streaming and transcription display.
 * Provides transcription result via onTranscriptionReceived prop.
 * Includes an optional checkbox to send document context upon connection.
 */
function VoiceCard({
  tutorId, // Optional: Pass if needed by your /session endpoint or other logic
  onTranscriptionReceived, // Callback function: (text: string) => void
  selectedDocumentTitle, // Prop for document title (required for context feature)
  selectedDocumentContent, // Prop for document content (required for context feature)
}) {
  const audioRef = useRef(null); // Use useRef<HTMLAudioElement>(null) in TSX
  const pcRef = useRef(null);    // Use useRef<RTCPeerConnection | null>(null) in TSX
  const dcRef = useRef(null);    // Use useRef<RTCDataChannel | null>(null) in TSX

  // UI state
  const [status, setStatus] = useState('Disconnected');
  const [statusType, setStatusType] = useState('info'); // 'info', 'success', 'warning', 'error'
  const [aiTranscription, setAiTranscription] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  // State for the internal checkbox
  const [includeDoc, setIncludeDoc] = useState(false);

  // --- Logging/Status Helpers --- (Keep as they are)
  function addMessage(txt, type = 'info') {
    console.log(`[VoiceCard-${type}] ${txt}`);
  }
  function updateStatus(msg, type = 'info') {
    setStatus(msg);
    setStatusType(type);
  }

  // --- WebRTC Connection Logic --- (Keep as it is)
  async function init() {
    if (isConnected || isConnecting) return;

    setIsConnecting(true);
    updateStatus('Connecting...', 'info');
    addMessage('Initializing connection...');

    try {
      // 1) Fetch Ephemeral Key
      addMessage('Requesting session token...');
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";
      const tokenResp = await fetch(`${API_BASE_URL}/api/v1/talk_session`); // CHECK THIS ENDPOINT

      if (!tokenResp.ok) {
         const errorBody = await tokenResp.text().catch(()=> "Could not read error body");
         console.error(`Token fetch failed: ${tokenResp.status} ${tokenResp.statusText}`, errorBody);
         throw new Error(`Token fetch failed: ${tokenResp.statusText} (${tokenResp.status})`);
      }
      const tokenData = await tokenResp.json();
      const EPHEMERAL_KEY = tokenData?.client_secret?.value;
      if (!EPHEMERAL_KEY) {
        console.error("Session token response missing client_secret.value:", tokenData);
        throw new Error('Session token (client_secret) not found in response.');
      }
      addMessage('Session token received.');

      // 2) Create RTCPeerConnection
      pcRef.current = new RTCPeerConnection();
      addMessage('PeerConnection created.');
      pcRef.current.ontrack = (event) => { // Use 'event' consistently
        addMessage(`Track received: kind=${event.track.kind}`);
        if (audioRef.current && event.streams && event.streams[0]) {
          audioRef.current.srcObject = event.streams[0];
          addMessage('Remote audio stream attached.');
        }
      };
      pcRef.current.onconnectionstatechange = () => {
        const state = pcRef.current?.connectionState;
        addMessage(`Connection state: ${state}`);
        if (state === 'failed' || state === 'disconnected' || state === 'closed') {
          updateStatus('Connection lost', 'warning');
          cleanup();
        }
      };

      // 3) Get Local Media (Microphone)
      addMessage('Requesting microphone access...');
      let localStream; // Use 'let' as it's reassigned
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStream.getTracks().forEach(track => {
          if (pcRef.current) {
            pcRef.current.addTrack(track, localStream);
            addMessage(`Local audio track added (id: ${track.id})`);
          }
        });
      } catch (micError) {
        console.error("Microphone access error:", micError);
        throw new Error("Microphone access denied. Check browser permissions.");
      }

      // 4) Create Data Channel
      // Ensure this is created *before* offer is created if using negotiationneeded
      dcRef.current = pcRef.current.createDataChannel('oai-events');
      addMessage(`Data channel created (label: ${dcRef.current.label})`);
      dcRef.current.onopen = onDataChannelOpen; // Will handle context sending
      dcRef.current.onmessage = handleDataChannelMessage;
      dcRef.current.onclose = () => addMessage('Data channel closed.');
      dcRef.current.onerror = (errorEvent) => { // Use specific event type
        console.error("Data channel error:", errorEvent);
        // Note: RTCErrorEvent doesn't have a simple 'error' property like basic Event
        addMessage(`Data channel error occurred`, 'error');
        updateStatus('Data channel error', 'error');
      };

      // 5) Create Offer and Set Local Description
      addMessage('Creating SDP offer...');
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      addMessage('Local description set.');

      // 6) Send Offer to Signaling Server
      const signalingUrl = 'https://api.openai.com/v1/realtime'; // CHECK THIS URL
      const model = 'gpt-4o-realtime-preview-2024-12-17'; // CHECK THIS MODEL
      addMessage(`Sending SDP offer to ${signalingUrl}...`);
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
      addMessage('SDP offer sent successfully.');

      // 7) Receive Answer and Set Remote Description
      const answerSdp = await sdpResponse.text();
      await pcRef.current.setRemoteDescription({ type: 'answer', sdp: answerSdp });
      addMessage('Remote description (answer) set.');
      // Data channel should open soon...

    } catch (err) {
      console.error('Initialization Error:', err);
      // Use instanceof Error for better type checking
      updateStatus(`Error: ${err instanceof Error ? err.message : 'Unknown initialization error'}`, 'error');
      cleanup();
    } finally {
      setIsConnecting(false);
    }
  }

  // --- DataChannel Open Handler (NOW includes context logic) ---
  function onDataChannelOpen() {
    addMessage('Data channel OPEN.');
    updateStatus('Connected - Speak now!', 'success');
    setIsConnected(true);
    setIsConnecting(false);

    // --- Send Document Context Logic ---
    // Checkbox must be ticked, content must exist, channel must be open
    if (includeDoc && selectedDocumentContent && dcRef.current && dcRef.current.readyState === 'open') {
      addMessage('Checkbox ticked. Sending document context...');

      try {
        // 1) session.update (Example: Set instructions)
        const sessionUpdateEvt = {
          type: 'session.update',
          session: {
            instructions: `You are discussing a document titled "${selectedDocumentTitle || 'Untitled'}".`,
            modalities: ['audio', 'text'],
          }
        };
        dcRef.current.send(JSON.stringify(sessionUpdateEvt));
        addMessage('Sent session.update.');

        // 2) conversation.item.create (Send document content)
        const docMsg = {
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [
              { type: 'input_text', text: `Document Title: ${selectedDocumentTitle || 'Untitled'}` },
              { type: 'input_text', text: `Document Content:\n---\n${selectedDocumentContent}\n---` } // Added separators
            ]
          }
        };
        dcRef.current.send(JSON.stringify(docMsg));
        addMessage('Sent conversation.item.create with document.');

        // 3) response.create (Prompt AI response)
        const respCreate = {
          type: 'response.create',
          response: {
            conversation: 'auto',
            modalities: ['text', 'audio']
          }
        };
        dcRef.current.send(JSON.stringify(respCreate));
        addMessage('Sent response.create.');

      } catch (sendError) {
          console.error("Error sending context messages via DataChannel:", sendError);
          addMessage(`Failed to send context: ${sendError instanceof Error ? sendError.message : 'Unknown send error'}`, 'error');
          updateStatus('Context send error', 'error');
      }

    } else {
      // Log why context wasn't sent (useful for debugging)
      if (!includeDoc) addMessage('Context checkbox not ticked. Skipping context.');
      else if (!selectedDocumentContent) addMessage('No document content provided. Skipping context.');
      else if (!dcRef.current || dcRef.current.readyState !== 'open') addMessage('Data channel not open when attempting context send. Skipping context.');
      else addMessage('Context sending conditions not met.'); // General fallback
    }
    // --- End Document Context Logic ---
  }

  // --- Stop/Cleanup Function --- (Keep as it is)
  function cleanup() {
    addMessage('Cleanup requested.');
    try {
      if (pcRef.current) {
        pcRef.current.getSenders().forEach(sender => {
          if (sender.track) { sender.track.stop(); addMessage(`Stopped local track: ${sender.track.id}`); }
        });
      }
      if (dcRef.current) { dcRef.current.close(); addMessage(`Data channel closed.`); dcRef.current = null; }
      if (pcRef.current) { pcRef.current.close(); addMessage('PeerConnection closed.'); pcRef.current = null; }
      if (audioRef.current) { audioRef.current.srcObject = null; addMessage('Audio element source cleared.');}
    } catch (err) {
      console.warn('Error during cleanup:', err);
    } finally {
      setIsConnected(false);
      setIsConnecting(false);
      setAiTranscription("");
      onTranscriptionReceived("");
      // Reset checkbox only if you want it cleared on disconnect
      // setIncludeDoc(false);
      updateStatus('Disconnected', 'info');
      addMessage('Cleanup finished.');
    }
  }

  // --- Incoming DataChannel Message Handler --- (Keep as it is)
  async function handleDataChannelMessage(event) { // Use 'event' consistently
    try {
      const msg = JSON.parse(event.data);
      // addMessage(`Received message type: ${msg.type}`);

      switch (msg.type) {
        case 'response.audio_transcript.interim': break;
        case 'response.audio_transcript.done':
          addMessage(`Final transcript: "${msg.transcript}"`);
          setAiTranscription(msg.transcript);
          onTranscriptionReceived(msg.transcript);
          break;
        case 'response.done': addMessage('AI response turn complete.'); break;
        case 'response.error':
          const errorMessage = msg.error || 'Unknown AI error';
          console.error('AI Error Event:', msg);
          addMessage(`AI error: ${errorMessage}`, 'error');
          updateStatus(`AI Error: ${errorMessage}`, 'error');
          break;
        default: addMessage(`Received unhandled message type: ${msg.type}`); break;
      }
    } catch (err) {
      console.error('Failed to parse or handle incoming message:', event.data, err);
      addMessage(`Error processing message: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  }

  // --- Effect for component unmount cleanup --- (Keep as it is)
  useEffect(() => {
    return () => { addMessage("VoiceCard unmounting: Triggering cleanup."); cleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Helper to render status icon --- (Keep as it is)
  const getStatusIcon = () => {
    switch (statusType) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
      case 'info': default: return <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />;
    }
  };

  // --- Render JSX ---
  const checkboxId = "include-doc-checkbox"; // Define ID for linking
  const isCheckboxDisabled = !selectedDocumentContent || isConnected || isConnecting;

  return (
    <div className="flex flex-col border border-border rounded-lg bg-card p-3 space-y-3 text-card-foreground"> {/* Use theme colors */}
      {/* Row 1: Controls & Status */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Left side: Start/Stop Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={init} disabled={isConnected || isConnecting} title="Start Recording" aria-label="Start Recording">
            {isConnecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button variant="outline" size="icon" onClick={cleanup} disabled={!isConnected && !isConnecting} title="Stop Recording" aria-label="Stop Recording"
            // Apply red color conditionally using Tailwind template literal
            className={` ${ isConnected ? "text-red-600 hover:text-red-700 hover:bg-destructive/10" : "" }`} >
            <Square className="h-5 w-5" />
          </Button>
        </div>
        {/* Right side: Status Indicator */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-grow justify-end text-right overflow-hidden">
          {getStatusIcon()}
          <span className="truncate" title={status}>{status}</span>
        </div>
      </div>

      {/* Row 2: Transcription Display */}
      <div className="flex-grow min-h-[60px] max-h-[120px] overflow-y-auto p-2 border border-input rounded-md bg-background text-sm text-foreground">
        {aiTranscription || <span className="text-muted-foreground italic">Transcription will appear here...</span>}
      </div>

      {/* Row 3: Include Document Checkbox (using standard JSX) */}
      <div className="flex items-center space-x-2 pt-1">
        <input
            type="checkbox"
            id={checkboxId} // Use defined ID
            checked={includeDoc}
            onChange={(e) => setIncludeDoc(e.target.checked)} // Update state
            disabled={isCheckboxDisabled} // Disable if no content or connected/connecting
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed" // Basic Tailwind styling for checkbox
         />
        <label
            htmlFor={checkboxId} // Link label to checkbox
             // Conditional styling for label based on disabled state
            className={`text-sm font-medium leading-none ${
                isCheckboxDisabled
                ? "cursor-not-allowed text-muted-foreground" // Style when disabled
                : "cursor-pointer text-foreground" // Style when enabled
            }`}
         >
          Include Document Context
          {/* Add extra text if disabled due to missing content */}
          {!selectedDocumentContent ? " (No document loaded)" : ""}
        </label>
      </div>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} autoPlay hidden />
    </div>
  );
}

export default VoiceCard;

