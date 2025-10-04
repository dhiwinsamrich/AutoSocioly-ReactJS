import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
}

interface VoiceRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export const useVoiceRecognition = (options: VoiceRecognitionOptions = {}) => {
  const {
    continuous = false,
    interimResults = true,
    language = 'en-US',
    onResult,
    onError
  } = options;

  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    error: null
  });

  const recognitionRef = useRef<any | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setState(prev => ({
      ...prev,
      isSupported: !!SpeechRecognition
    }));
  }, []);

  const startListening = useCallback(() => {
    if (state.isListening) return;

    // Create a fresh recognition instance to ensure clean state
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = interimResults;
      recognitionRef.current.lang = language;

      recognitionRef.current.onstart = () => {
        setState(prev => ({
          ...prev,
          isListening: true,
          error: null
        }));
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setState(prev => ({
          ...prev,
          transcript: fullTranscript
        }));

        if (onResult && fullTranscript) {
          onResult(fullTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        // Don't treat manual abort as an error
        if (event.error === 'aborted') {
          setState(prev => ({
            ...prev,
            isListening: false,
            error: null
          }));
          return;
        }

        const errorMessage = getErrorMessage(event.error);
        setState(prev => ({
          ...prev,
          isListening: false,
          error: errorMessage
        }));

        if (onError) {
          onError(errorMessage);
        }
      };

      recognitionRef.current.onend = () => {
        setState(prev => ({
          ...prev,
          isListening: false
        }));
      };
    }

    setState(prev => ({
      ...prev,
      transcript: '',
      error: null
    }));

    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to start voice recognition'
      }));
    }
  }, [state.isListening, continuous, interimResults, language, onResult, onError]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !state.isListening) return;

    try {
      // Use abort() for immediate stopping instead of stop()
      recognitionRef.current.abort();
      // Force set listening to false immediately
      setState(prev => ({
        ...prev,
        isListening: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isListening: false,
        error: 'Failed to stop voice recognition'
      }));
    }
  }, [state.isListening]);

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  const clearTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: ''
    }));
  }, []);

  const abortListening = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.abort();
      setState(prev => ({
        ...prev,
        isListening: false,
        transcript: ''
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isListening: false,
        error: 'Failed to abort voice recognition'
      }));
    }
  }, []);

  // Auto-stop after 30 seconds of listening
  useEffect(() => {
    if (state.isListening) {
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, 30000);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [state.isListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
    abortListening
  };
};

// Helper function to get user-friendly error messages
const getErrorMessage = (error: string): string => {
  switch (error) {
    case 'no-speech':
      return 'No speech was detected. Please try again.';
    case 'audio-capture':
      return 'No microphone was found. Please check your microphone.';
    case 'not-allowed':
      return 'Microphone access was denied. Please allow microphone access.';
    case 'network':
      return 'Network error occurred. Please check your connection.';
    case 'aborted':
      return ''; // Don't show error for manual abort
    case 'language-not-supported':
      return 'Language not supported.';
    default:
      return `Voice recognition error: ${error}`;
  }
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
