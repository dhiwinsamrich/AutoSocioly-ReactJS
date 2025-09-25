import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard = ({ children, className, hover = false }: GlassCardProps) => {
  return (
    <div 
      className={cn(
        "glass-card rounded-xl shadow-lg border border-white/10",
        hover && "hover-lift cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
};