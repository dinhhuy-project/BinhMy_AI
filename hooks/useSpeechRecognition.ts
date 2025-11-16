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
const SpeechRecognitionAPI = (typeof window !== 'undefined') 
  ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  : null;
const browserSupportsSpeechRecognition = !!SpeechRecognitionAPI;

interface AccumulatedTranscript {
  final: string;
  interim: string;
}

export const useSpeechRecognition = ({ onEnd, onLiveTranscript, onError }: SpeechRecognitionOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef<AccumulatedTranscript>({ final: '', interim: '' });
  const lastSilenceTimeRef = useRef<number>(0);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use a ref to hold callbacks to prevent re-creating recognition instance on every render
  const callbacksRef = useRef({ onEnd, onLiveTranscript, onError });
  callbacksRef.current = { onEnd, onLiveTranscript, onError };

  const CONFIDENCE_THRESHOLD = 0.5; // Minimum confidence to accept result
  const SILENCE_TIMEOUT = 2000; // 2 seconds of silence to consider speech ended

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

    const clearSilenceTimeout = () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    };

    recognition.onstart = () => {
      setIsListening(true);
      transcriptRef.current = { final: '', interim: '' };
      lastSilenceTimeRef.current = Date.now();
      clearSilenceTimeout();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let hasNewFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        
        if (event.results[i].isFinal) {
          // Only add if confidence is above threshold
          if (confidence >= CONFIDENCE_THRESHOLD) {
            // Add space before new sentence if the final transcript is not empty
            if (transcriptRef.current.final && !transcriptRef.current.final.endsWith(' ')) {
              transcriptRef.current.final += ' ';
            }
            transcriptRef.current.final += transcript;
            hasNewFinal = true;
          }
        } else {
          interimTranscript += transcript;
        }
      }

      // Update interim results
      transcriptRef.current.interim = interimTranscript;

      // Call live transcript callback
      const liveTranscript = (transcriptRef.current.final + transcriptRef.current.interim).trim();
      callbacksRef.current.onLiveTranscript?.(liveTranscript);

      // Reset silence timeout when new results come in
      lastSilenceTimeRef.current = Date.now();
      clearSilenceTimeout();

      // Set timeout to end recording after silence
      silenceTimeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }, SILENCE_TIMEOUT);
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error, event.message);
      callbacksRef.current.onError?.(event);
      
      // Automatically restart recognition on certain errors
      if (['network', 'audio-capture'].includes(event.error)) {
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      clearSilenceTimeout();
      setIsListening(false);
      
      const finalResult = transcriptRef.current.final.trim();
      if (finalResult) {
        callbacksRef.current.onEnd?.(finalResult);
      }
      
      // Clear for the next session
      transcriptRef.current = { final: '', interim: '' };
    };
    
    // Cleanup: ensure recognition is stopped when component unmounts
    return () => {
      clearSilenceTimeout();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping recognition on cleanup:', e);
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        transcriptRef.current = { final: '', interim: '' };
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
