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
      setIsLoading(true);
    }
  }, [location, displayLocation]);

  const onAnimationEnd = () => {
    if (transitionStage === "fadeOut") {
      setDisplayLocation(location);
      setTransitionStage("fadeIn");
      
      // Simulate loading time for smoother experience
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  return (
    <>
      <PageLoader isVisible={isLoading} />
      <div
        className={cn(
          "transition-all duration-500 ease-in-out",
          transitionStage === "fadeOut" 
            ? "opacity-0 transform scale-95" 
            : "opacity-100 transform scale-100"
        )}
        onTransitionEnd={onAnimationEnd}
      >
        <div key={displayLocation.pathname}>
          {children}
        </div>
      </div>
    </>
  );
};