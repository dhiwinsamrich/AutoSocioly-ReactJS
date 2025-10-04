import { useState, useEffect } from 'react';
import { Activity, Loader2, CheckCircle, AlertCircle, Clock, Image, FileText, Send, Brain, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActivityItem {
  id: string;
  type: 'analyzing' | 'generating' | 'posting' | 'uploading' | 'processing' | 'scheduling' | 'success' | 'error';
  title: string;
  description?: string;
  progress?: number;
  timestamp: Date;
  platform?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  liveMessages?: string[];
  currentMessage?: string;
}

interface BackgroundActivityPopupProps {
  isVisible: boolean;
  onToggle: () => void;
  activities: ActivityItem[];
  onRemoveActivity: (id: string) => void;
}

export const BackgroundActivityPopup = ({ 
  isVisible, 
  onToggle, 
  activities, 
  onRemoveActivity 
}: BackgroundActivityPopupProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasNewActivities, setHasNewActivities] = useState(false);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  // Check for new activities
  useEffect(() => {
    const inProgressActivities = activities.filter(activity => 
      activity.status === 'in_progress' || activity.status === 'pending'
    );
    setHasNewActivities(inProgressActivities.length > 0);
  }, [activities]);

  // Auto-cycle through activities when expanded
  useEffect(() => {
    if (isExpanded && activities.length > 0) {
      const interval = setInterval(() => {
        setCurrentActivityIndex(prev => (prev + 1) % activities.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isExpanded, activities.length]);

  const getActivityIcon = (type: ActivityItem['type'], status: ActivityItem['status']) => {
    if (status === 'completed') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    if (status === 'failed') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }

    switch (type) {
      case 'analyzing':
        return <Brain className="w-4 h-4 text-blue-500" />;
      case 'generating':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'posting':
        return <Send className="w-4 h-4 text-orange-500" />;
      case 'uploading':
        return <Image className="w-4 h-4 text-cyan-500" />;
      case 'processing':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'scheduling':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'in_progress':
        return 'text-blue-400';
      case 'pending':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (seconds < 60) {
      return `${seconds}s ago`;
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Only show active activities (in progress or pending)
  const activeActivities = activities.filter(activity => 
    activity.status === 'in_progress' || activity.status === 'pending'
  );
  
  // Only show recent completed/failed activities if no active ones
  const recentActivities = activities
    .filter(activity => activity.status === 'completed' || activity.status === 'failed')
    .slice(0, 1);

  // Prioritize active activities, fallback to recent if no active ones
  const allActivities = activeActivities.length > 0 ? activeActivities : recentActivities;
  const currentActivity = allActivities[currentActivityIndex] || allActivities[0];

  if (!isVisible && allActivities.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Circular Popup */}
      <div className={cn(
        "relative transition-all duration-500 ease-in-out",
        isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
      )}>
        {/* Main Circular Container */}
        <div className={cn(
          "relative bg-neutral-900 backdrop-blur-xl border border-white shadow-2xl transition-all duration-500 ease-in-out rounded-full",
          isExpanded ? "w-40 h-40" : "w-16 h-16"
        )}>
          {/* Collapsed State - Circular */}
          {!isExpanded && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="relative">
                {/* Activity Icon */}
                <div className="flex items-center justify-center">
                  {currentActivity ? getActivityIcon(currentActivity.type, currentActivity.status) : (
                    <Activity className="w-6 h-6 text-white" />
                  )}
                </div>
                
                  {/* Progress Ring */}
                  {currentActivity && currentActivity.progress !== undefined && currentActivity.status === 'in_progress' && (
                    <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-gray-700"
                      />
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 16}`}
                        strokeDashoffset={`${2 * Math.PI * 16 * (1 - (currentActivity.progress || 0) / 100)}`}
                        className="text-blue-500 transition-all duration-300 ease-out"
                      />
                    </svg>
                  )}
                
                {/* Pulse Animation for Active Activities */}
                {hasNewActivities && (
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                )}
              </div>
            </div>
          )}

          {/* Expanded State - Circular with Live Info */}
          {isExpanded && (
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              {/* Current Activity Info */}
              {currentActivity ? (
                <div className="text-center space-y-2">
                  {/* Activity Icon */}
                  <div className="flex justify-center mb-2">
                    {currentActivity.status === 'in_progress' ? (
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    ) : (
                      getActivityIcon(currentActivity.type, currentActivity.status)
                    )}
                  </div>
                  
                  {/* Status */}
                  <div className={cn("text-sm font-bold", getStatusColor(currentActivity.status))}>
                    {currentActivity.status === 'in_progress' ? 'RUNNING' : 
                     currentActivity.status === 'completed' ? 'DONE' : 
                     currentActivity.status === 'failed' ? 'ERROR' : 'PENDING'}
                  </div>
                  
                  {/* Current Message */}
                  {currentActivity.currentMessage && (
                    <div className="text-yellow-400 text-xs animate-pulse text-center leading-tight">
                      {currentActivity.currentMessage.length > 40 
                        ? currentActivity.currentMessage.substring(0, 40) + '...'
                        : currentActivity.currentMessage
                      }
                    </div>
                  )}
                  
                  {/* Progress */}
                  {currentActivity.progress !== undefined && currentActivity.status === 'in_progress' && (
                    <div className="space-y-1">
                      <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden mx-auto">
                        <div
                          className="h-full bg-green-400 transition-all duration-300 ease-out"
                          style={{ width: `${Math.min(100, Math.max(0, currentActivity.progress))}%` }}
                        />
                      </div>
                      <div className="text-gray-400 text-xs">{Math.round(currentActivity.progress || 0)}%</div>
                    </div>
                  )}
                  
                  {/* Activity Count */}
                  {allActivities.length > 1 && (
                    <div className="text-gray-500 text-xs">
                      {currentActivityIndex + 1}/{allActivities.length}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <Activity className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <div className="text-gray-500 text-sm">No activities</div>
                </div>
              )}
            </div>
          )}

          {/* Interactive Controls */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "absolute -right-1 -top-1 w-6 h-6 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-all duration-200 text-sm font-bold",
              isExpanded ? "bg-blue-600" : ""
            )}
          >
            {isExpanded ? "−" : "+"}
          </button>
          
          {/* Activity Count Badge - Only show if multiple activities */}
          {allActivities.length > 1 && (
            <div className="absolute -top-1 -left-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {allActivities.length}
            </div>
          )}
          
          {/* Current Message Indicator */}
          {currentActivity && currentActivity.currentMessage && (
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};
