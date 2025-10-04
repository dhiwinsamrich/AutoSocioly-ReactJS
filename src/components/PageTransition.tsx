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
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true);
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  const onAnimationEnd = () => {
    if (transitionStage === "fadeOut") {
      setDisplayLocation(location);
      setTransitionStage("fadeIn");
      setIsTransitioning(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Loading overlay during transitions */}
      <PageLoader isVisible={isTransitioning} text="page" />
      
      {/* Page content */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          transitionStage === "fadeOut" 
            ? "opacity-0 scale-95" 
            : "opacity-100 scale-100"
        )}
        onTransitionEnd={onAnimationEnd}
      >
        <div key={displayLocation.pathname}>
          {children}
        </div>
      </div>
    </div>
  );
};