import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface GeneratingLoaderProps {
  isVisible: boolean;
  text?: string;
}

export const GeneratingLoader = ({ 
  isVisible, 
  text = "GENERATING" 
}: GeneratingLoaderProps) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!show) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300",
      isVisible ? "opacity-100" : "opacity-0"
    )}>
      <div className="text-center">
        {/* Animated Loader */}
        <div className="loader-wrapper">
          <div className="loader"></div>
          <div className="loader-text">
            {text.split('').map((letter, index) => (
              <span key={index} className="loader-letter">
                {letter}
              </span>
            ))}
          </div>
        </div>
        
        {/* Loading message */}
        <p className="text-white/80 mt-4 text-lg">
          Creating amazing content for you...
        </p>
      </div>
    </div>
  );
};