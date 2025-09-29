import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PageLoader } from './PageLoader';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  const onAnimationEnd = () => {
    if (transitionStage === "fadeOut") {
      setDisplayLocation(location);
      setTransitionStage("fadeIn");
    }
  };

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out",
        transitionStage === "fadeOut" 
          ? "opacity-0" 
          : "opacity-100"
      )}
      onTransitionEnd={onAnimationEnd}
    >
      <div key={displayLocation.pathname}>
        {children}
      </div>
    </div>
  );
};