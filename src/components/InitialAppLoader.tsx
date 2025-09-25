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
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-black transition-all duration-300",
      isVisible ? "opacity-100" : "opacity-0"
    )}>
      <div className="flex flex-col items-center">
        {/* Animated Text */}
        <div className="text-loader-container">
          <div className="text-loader">
            <span className="letter" style={{ '--delay': '0s' } as React.CSSProperties}>L</span>
            <span className="letter" style={{ '--delay': '0.1s' } as React.CSSProperties}>a</span>
            <span className="letter" style={{ '--delay': '0.2s' } as React.CSSProperties}>u</span>
            <span className="letter" style={{ '--delay': '0.3s' } as React.CSSProperties}>n</span>
            <span className="letter" style={{ '--delay': '0.4s' } as React.CSSProperties}>c</span>
            <span className="letter" style={{ '--delay': '0.5s' } as React.CSSProperties}>h</span>
            <span className="letter" style={{ '--delay': '0.6s' } as React.CSSProperties}>i</span>
            <span className="letter" style={{ '--delay': '0.7s' } as React.CSSProperties}>n</span>
            <span className="letter" style={{ '--delay': '0.8s' } as React.CSSProperties}>g</span>
            <span className="dot dot-1" style={{ '--delay': '0.9s' } as React.CSSProperties}>.</span>
            <span className="dot dot-2" style={{ '--delay': '1.0s' } as React.CSSProperties}>.</span>
            <span className="dot dot-3" style={{ '--delay': '1.1s' } as React.CSSProperties}>.</span>
          </div>
        </div>
      </div>
    </div>
  );
};