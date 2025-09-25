import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  isVisible: boolean;
  text?: string;
}

export const PageLoader = ({ 
  isVisible, 
  text = "content" 
}: PageLoaderProps) => {
  const [show, setShow] = useState(isVisible);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const words = ["pages", "content", "data", "experiences"];

  useEffect(() => {
    if (isVisible) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isVisible, words.length]);

  if (!show) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-black transition-all duration-300",
      isVisible ? "opacity-100" : "opacity-0"
    )}>
      <div className="flex flex-col items-center">
        {/* Tri-Spinner */}
        <div className="page-spinner-container">
          <div className="tri-spinner"></div>
        </div>
        
        {/* Loading Text */}
        <div className="page-loader-text">
          <span className="text-white text-xl font-medium">loading </span>
          <div className="page-words">
            <span className="page-word text-white">{words[currentWordIndex]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};