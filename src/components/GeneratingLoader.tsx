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
      "fixed bottom-4 right-4 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-lg p-3 shadow-lg transition-all duration-300",
      isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
    )}>
      <div className="flex items-center space-x-3">
        {/* Animated Loader */}
        <div className="loader-wrapper-small">
          <div className="loader-small"></div>
        </div>
        
        {/* Loading text */}
        <div className="text-white text-sm font-medium">
          {text}
        </div>
      </div>
    </div>
  );
};