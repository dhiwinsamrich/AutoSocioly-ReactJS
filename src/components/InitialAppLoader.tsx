import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface InitialAppLoaderProps {
  onComplete: () => void;
}

export const InitialAppLoader = ({ onComplete }: InitialAppLoaderProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true); // start fade-out
      setTimeout(() => {
        setIsVisible(false);
        onComplete(); // call parent after fade-out finishes
      }, 600); // matches CSS transition duration
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary to-primary-foreground transition-opacity duration-700 ease-in-out",
        isFadingOut ? "opacity-0" : "opacity-100"
      )}
    >
      <div className="flex flex-col items-center">
        <div className="typing-indicator mb-4">
          <div className="typing-circle"></div>
          <div className="typing-circle"></div>
          <div className="typing-circle"></div>
          <div className="typing-shadow"></div>
          <div className="typing-shadow"></div>
          <div className="typing-shadow"></div>
        </div>
        <div className="text-white text-lg font-medium animate-pulse">
          Loading...
        </div>
      </div>
    </div>
  );
};
