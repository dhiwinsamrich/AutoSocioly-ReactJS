import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationToastProps {
  type?: 'success' | 'error' | 'info';
  title: string;
  description?: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const NotificationToast = ({
  type = 'success',
  title,
  description,
  isVisible,
  onClose,
  duration = 5000
}: NotificationToastProps) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6" />;
      case 'error':
        return <AlertCircle className="w-6 h-6" />;
      default:
        return <Info className="w-6 h-6" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          iconColor: 'text-gray-700',
          bgColor: 'bg-gray-800'
        };
      case 'error':
        return {
          iconColor: 'text-red-500',
          bgColor: 'bg-gray-800'
        };
      default:
        return {
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-800'
        };
    }
  };

  const colors = getColors();

  if (!isVisible && !show) return null;

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out transform",
      show ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-95"
    )}>
      <div className={cn(
        "flex items-center justify-between w-72 sm:w-80 h-14 rounded-lg px-4 backdrop-blur-xl border border-gray-700",
        colors.bgColor
      )}>
        <div className="flex gap-3 items-center">
          <div className={cn(
            "p-2 rounded-lg bg-white/5 backdrop-blur-xl",
            colors.iconColor
          )}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">{title}</p>
            {description && (
              <p className="text-gray-400 text-xs truncate">{description}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-md transition-colors duration-200 flex-shrink-0 ml-2"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};