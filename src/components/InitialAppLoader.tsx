import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface InitialAppLoaderProps {
  onComplete: () => void;
}

export const InitialAppLoader = ({ onComplete }: InitialAppLoaderProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary to-primary-foreground transition-all duration-500",
      isVisible ? "opacity-100" : "opacity-0"
    )}>
      <div className="flex flex-col items-center">
        <div className="typing-indicator mb-4">
          <div className="typing-circle"></div>
          <div className="typing-circle"></div>
          <div className="typing-circle"></div>
          <div className="typing-shadow"></div>
          <div className="typing-shadow"></div>
          <div className="typing-shadow"></div>
        </div>
        <div className="text-white text-lg font-medium animate-pulse">Loading...</div>
      </div>
    </div>
  );
};