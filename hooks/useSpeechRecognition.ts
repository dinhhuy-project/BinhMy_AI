// Fix: Add TypeScript type definitions for the Web Speech API
// These types are not included in the default DOM typings and are necessary for the speech recognition hook to compile without errors.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

declare var webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof webkitSpeechRecognition;
}

import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionOptions {
  onEnd?: (transcript: string) => void;
  onLiveTranscript?: (transcript: string) => void;
  onError?: (error: SpeechRecognitionErrorEvent) => void;
}

// Check for vendor prefixed API
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
const browserSupportsSpeechRecognition = !!SpeechRecognitionAPI;

export const useSpeechRecognition = ({ onEnd, onLiveTranscript, onError }: SpeechRecognitionOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Use a ref to hold callbacks to prevent re-creating recognition instance on every render
  const callbacksRef = useRef({ onEnd, onLiveTranscript, onError });
  callbacksRef.current = { onEnd, onLiveTranscript, onError };

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.warn("Speech recognition not supported by this browser.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true; // Keep listening even after a pause
    recognition.interimResults = true; // Get results as they are being processed
    recognition.lang = 'vi-VN';
    recognitionRef.current = recognition;

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      finalTranscript = ''; // Reset on each result event for continuous mode to build final string correctly

      for (let i = 0; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
        } else {
          interimTranscript += transcriptPart;
        }
      }
      callbacksRef.current.onLiveTranscript?.(finalTranscript + interimTranscript);
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      callbacksRef.current.onError?.(event);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      callbacksRef.current.onEnd?.(finalTranscript.trim());
      finalTranscript = ''; // Clear for the next session
    };
    
    // Cleanup: ensure recognition is stopped when component unmounts
    return () => {
      recognition.stop();
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch(e) {
        console.error("Error starting speech recognition:", e);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
       try {
        recognitionRef.current.stop();
      } catch(e) {
        console.error("Error stopping speech recognition:", e);
      }
    }
  }, [isListening]);

  return {
    isListening,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition,
  };
};
