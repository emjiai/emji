/**
 * Voice utilities for audio transcription and text-to-speech
 */

/**
 * Transcribes audio blob to text using the voice API
 * @param audioBlob Audio blob to transcribe
 * @param tutorId The ID of the tutor to use for transcription context
 * @param options Optional parameters (language, prompt)
 * @returns Transcribed text 
 */
export async function transcribeAudio(
  audioBlob: Blob,
  tutorId: string,
  options?: { language?: string; prompt?: string }
): Promise<string> {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    
    // Add optional parameters if provided
    if (options?.language) {
      formData.append('language', options.language);
    }
    
    if (options?.prompt) {
      formData.append('prompt', options.prompt);
    }
    
    // Send to transcription API with tutor context
    const response = await fetch(`/api/chat/${tutorId}`, {
      method: 'PUT',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to transcribe audio');
    }
    
    const data = await response.json();
    return data.text || '';
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    throw new Error(error?.message || 'Failed to transcribe audio');
  }
}

/**
 * Converts text to speech using the voice API
 * @param text Text to convert to speech
 * @param tutorId The ID of the tutor to use for voice context
 * @param options Optional parameters (voice, speed, format)
 * @returns Audio URL to play
 */
export async function playSpeech(
  text: string,
  tutorId: string,
  options?: { voice?: string; speed?: number; format?: string }
): Promise<void> {
  try {
    // Default options
    const voice = options?.voice || 'alloy';
    const speed = options?.speed || 1.0;
    const format = options?.format || 'mp3';
    
    // Send to TTS API with tutor context
    const response = await fetch(`/api/chat/${tutorId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice,
        speed,
        format,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to synthesize speech');
    }
    
    const data = await response.json();
    
    // Convert base64 to audio
    if (data.audio) {
      const byteCharacters = atob(data.audio);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: `audio/${format}` });
      const audioUrl = URL.createObjectURL(blob);
      
      // Create and play audio
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } else {
      throw new Error('No audio data received from server');
    }
  } catch (error: any) {
    console.error('Error playing audio:', error);
    throw new Error(error?.message || 'Failed to play audio');
  }
}

/**
 * Get available voices and languages for the voice API
 * @param tutorId The ID of the tutor to get voice options for
 * @returns Object with available voices and languages and tutor information
 */
export async function getVoiceOptions(tutorId: string): Promise<{
  availableVoices: string[];
  availableLanguages: Record<string, string>;
  defaultVoice: string;
  defaultLanguage: string;
  tutorInfo?: {
    id: string;
    name: string;
    description: string;
  };
}> {
  try {
    const response = await fetch(`/api/chat/${tutorId}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch voice options');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching voice options:', error);
    // Return defaults if API fails
    return {
      availableVoices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
      availableLanguages: { english: 'en' },
      defaultVoice: 'alloy',
      defaultLanguage: 'en'
    };
  }
}
