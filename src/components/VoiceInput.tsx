import React, { useState, useEffect } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  showTranscript?: boolean;
  isEmbedded?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  onError,
  className,
  disabled = false,
  placeholder = "Click to start voice input",
  showTranscript = true,
  isEmbedded = false
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');

  const { isListening, isSupported, transcript, error, toggleListening, stopListening, clearTranscript } = useVoiceRecognition({
    continuous: true,
    interimResults: true,
    onResult: (result) => {
      setCurrentTranscript(result);
    },
    onError: (error) => {
      setIsActive(false);
      if (onError) {
        onError(error);
      }
    }
  });

  // Handle transcript changes (only for automatic stops, not manual stops)
  useEffect(() => {
    if (transcript && !isListening && isActive) {
      // Final transcript received from automatic stop
      onTranscript(transcript);
      setCurrentTranscript('');
      clearTranscript();
      setIsActive(false);
    }
  }, [transcript, isListening, isActive, onTranscript, clearTranscript]);

  // Handle errors
  useEffect(() => {
    if (error) {
      setIsActive(false);
    }
  }, [error]);

  const handleToggle = () => {
    if (disabled || !isSupported) return;
    
    if (isListening) {
      // Stop recording immediately with abort()
      stopListening();
      setIsActive(false);
      
      // Send the current transcript if there's any
      const finalTranscript = currentTranscript || transcript;
      if (finalTranscript) {
        onTranscript(finalTranscript);
        setCurrentTranscript('');
        clearTranscript();
      }
    } else {
      // Start recording
      clearTranscript();
      setCurrentTranscript('');
      toggleListening();
      setIsActive(true);
    }
  };

  if (!isSupported) {
    return (
      <div className={cn("flex items-center justify-center p-2", className)}>
        <span className="text-sm text-gray-500">Voice recognition not supported</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button
        type="button"
        variant={isListening ? "destructive" : "outline"}
        size="sm"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "voice-button voice-button-compact flex items-center justify-center w-10 h-10 p-0 transition-all duration-200",
          isListening && "voice-recording",
          isActive && "ring-2 ring-red-500 ring-offset-2"
        )}
        title={isListening ? "Stop recording" : "Start voice input"}
      >
        {isListening ? (
          <Square className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      {showTranscript && !isEmbedded && (currentTranscript || transcript) && (
        <div className="voice-transcript p-3 bg-gray-50 rounded-md border">
          <div className="text-sm text-gray-600 mb-1">Live transcript:</div>
          <div className="text-sm text-gray-800">
            {currentTranscript || transcript}
            {isListening && (
              <span className="inline-block w-2 h-4 bg-red-500 ml-1 animate-pulse" />
            )}
          </div>
        </div>
      )}

      {error && error.trim() !== '' && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

// Enhanced Textarea with voice input
interface VoiceTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onVoiceTranscript?: (transcript: string) => void;
  showVoiceButton?: boolean;
}

export const VoiceTextarea = React.forwardRef<HTMLTextAreaElement, VoiceTextareaProps>(
  ({ onVoiceTranscript, showVoiceButton = true, className, ...props }, ref) => {
    const [value, setValue] = useState(props.value as string || '');

    const handleVoiceTranscript = (transcript: string) => {
      const newValue = value + (value ? ' ' : '') + transcript;
      setValue(newValue);
      if (onVoiceTranscript) {
        onVoiceTranscript(newValue);
      }
      // Trigger onChange if provided
      if (props.onChange) {
        const event = {
          target: { value: newValue }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        props.onChange(event);
      }
    };

    return (
      <div className="relative">
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-12",
            className,
          )}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          {...props}
        />
        {showVoiceButton && (
          <div className="absolute right-2 top-2">
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              className="p-0"
              isEmbedded={true}
            />
          </div>
        )}
      </div>
    );
  }
);

VoiceTextarea.displayName = "VoiceTextarea";

// Enhanced Input with voice input
interface VoiceInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onVoiceTranscript?: (transcript: string) => void;
  showVoiceButton?: boolean;
}

export const VoiceInputField = React.forwardRef<HTMLInputElement, VoiceInputFieldProps>(
  ({ onVoiceTranscript, showVoiceButton = true, className, ...props }, ref) => {
    const [value, setValue] = useState(props.value as string || '');

    const handleVoiceTranscript = (transcript: string) => {
      const newValue = value + (value ? ' ' : '') + transcript;
      setValue(newValue);
      if (onVoiceTranscript) {
        onVoiceTranscript(newValue);
      }
      // Trigger onChange if provided
      if (props.onChange) {
        const event = {
          target: { value: newValue }
        } as React.ChangeEvent<HTMLInputElement>;
        props.onChange(event);
      }
    };

    return (
      <div className="relative">
        <input
          ref={ref}
          type={props.type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pr-12",
            className,
          )}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          {...props}
        />
        {showVoiceButton && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              className="p-0"
              isEmbedded={true}
            />
          </div>
        )}
      </div>
    );
  }
);

VoiceInputField.displayName = "VoiceInputField";
