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
  platforms?: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  liveMessages?: string[];
  currentMessage?: string;
  content?: string;
  content_preview?: string;
  post_urls?: Record<string, string>;
  posted_by?: string;
  error_message?: string;
  created_at?: string;
  workflow_id?: string;
  session_id?: string;
  activity_type?: string;
  // Simple live information
  step?: string;
}

interface BackgroundActivityPopupProps {
  isVisible: boolean;
  onToggle: () => void;
  activities: ActivityItem[];
  onRemoveActivity: (id: string) => void;
}

interface ComputedActivityState {
  allActivities: ActivityItem[];
  currentActivity: ActivityItem | undefined;
}

function getCurrentActivitiesState(
  activities: ActivityItem[],
  currentActivityIndex: number,
): ComputedActivityState {
  const activeActivities = activities.filter(
    (activity) => activity.status === 'in_progress' || activity.status === 'pending',
  );

  const recentActivities = activities
    .filter((activity) => {
      if (activity.status === 'completed' || activity.status === 'failed') {
        const now = new Date();
        const activityTime = activity.timestamp;
        const timeDiff = now.getTime() - activityTime.getTime();
        return timeDiff < 5000;
      }
      return false;
    })
    .slice(0, 1);

  const allActivities = activeActivities.length > 0 ? activeActivities : recentActivities;
  const currentActivity = allActivities[currentActivityIndex] ?? allActivities[0];

  return { allActivities, currentActivity };
}

export const BackgroundActivityPopup = ({
  isVisible,
  onToggle,
  activities,
  onRemoveActivity,
}: BackgroundActivityPopupProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasNewActivities, setHasNewActivities] = useState(false);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [showNoActivityText, setShowNoActivityText] = useState(false);

  // Check for new activities
  useEffect(() => {
    const inProgressActivities = activities.filter(activity => 
      activity.status === 'in_progress' || activity.status === 'pending'
    );
    console.log('BackgroundActivityPopup: Activities updated:', activities.length, 'In progress:', inProgressActivities.length);
    console.log('BackgroundActivityPopup: All activities:', activities.map(a => ({ id: a.id, status: a.status, title: a.title })));
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

  // Handle smooth animation for "no activity" text
  useEffect(() => {
    if (isExpanded) {
      // When expanding, show "no activity" text after popup expansion completes
      const timer = setTimeout(() => {
        setShowNoActivityText(true);
      }, 600); // Wait for popup expansion animation to complete (500ms + 100ms buffer)
      return () => clearTimeout(timer);
    } else {
      // When collapsing, hide "no activity" text immediately for smooth fade out
      setShowNoActivityText(false);
    }
  }, [isExpanded]);

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

  const { allActivities, currentActivity } = getCurrentActivitiesState(
    activities,
    currentActivityIndex,
  );

  const getStatusLabel = (status: ActivityItem['status']) => {
    if (status === 'in_progress') {
      return null;
    }

    if (status === 'completed') {
      return 'DONE';
    }

    if (status === 'failed') {
      return 'ERROR';
    }

    if (status === 'pending') {
      return 'PENDING';
    }

    return null;
  };

  const currentStatusLabel = currentActivity ? getStatusLabel(currentActivity.status) : null;
  const currentMessage = currentActivity?.currentMessage ?? currentActivity?.content_preview ?? '';
  const hasProgress = currentActivity?.progress !== undefined && currentActivity?.status === 'in_progress';
  const hasPlatforms = (currentActivity?.platforms?.length ?? 0) > 0;
  const hasPostUrls = currentActivity && currentActivity.post_urls && Object.keys(currentActivity.post_urls).length > 0;
  const trimmedErrorMessage = currentActivity?.error_message
    ? currentActivity.error_message.length > 30
      ? `${currentActivity.error_message.substring(0, 30)}...`
      : currentActivity.error_message
    : null;

  // Force re-render when current activity status changes
  useEffect(() => {
    if (currentActivity) {
      console.log('BackgroundActivityPopup: Current activity status changed:', currentActivity.id, currentActivity.status);
      console.log('BackgroundActivityPopup: Current activity details:', {
        id: currentActivity.id,
        status: currentActivity.status,
        title: currentActivity.title,
        step: currentActivity.step,
        progress: currentActivity.progress
      });
      
      // Auto-remove completed activities after 3 seconds
      if (currentActivity.status === 'completed' || currentActivity.status === 'failed') {
        const timeout = setTimeout(() => {
          console.log('BackgroundActivityPopup: Auto-removing completed activity:', currentActivity.id);
          onRemoveActivity(currentActivity.id);
        }, 3000);
        
        return () => clearTimeout(timeout);
      }
    }
  }, [currentActivity?.status, currentActivity?.progress, currentActivity?.step, currentActivity?.id, onRemoveActivity]);

  // Show popup if there are activities OR if explicitly visible
  if (allActivities.length === 0 && !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-4 sm:right-4">
      {/* Circular Popup */}
      <div className={cn(
        "relative transition-all duration-500 ease-in-out",
        isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
      )}>
        {/* Main Circular Container */}
        <div key={`popup-${currentActivity?.id}-${currentActivity?.status}`} className={cn(
          "relative bg-neutral-900 backdrop-blur-xl border border-white shadow-2xl transition-all duration-500 ease-in-out rounded-full",
          isExpanded ? "w-36 h-36 sm:w-40 sm:h-40" : "w-16 h-16 sm:w-18 sm:h-18"
        )}>
          {/* Collapsed State - Circular */}
          {!isExpanded && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="relative">
                {/* Activity Icon */}
                <div className="flex items-center justify-center">
                  {currentActivity ? getActivityIcon(currentActivity.type, currentActivity.status) : (
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  )}
                </div>
                
                  {/* Progress Ring */}
                  {currentActivity && currentActivity.progress !== undefined && currentActivity.status === 'in_progress' && (
                    <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 -rotate-90" viewBox="0 0 40 40">
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
            <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              {/* Current Activity Info */}
              {currentActivity ? (
                <div key={`${currentActivity.id}-${currentActivity.status}`} className="text-center space-y-2 animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
                  {/* Activity Icon */}
                  <div className="flex justify-center mb-2">
                    {currentActivity.status === 'in_progress' ? (
                      <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 animate-spin" />
                    ) : (
                      getActivityIcon(currentActivity.type, currentActivity.status)
                    )}
                  </div>
                  
                  {/* Status */}
                  <div className={cn("text-xs sm:text-sm font-bold", getStatusColor(currentActivity.status))}>
                    {currentStatusLabel ?? ' '}
                  </div>
                  
                  {/* Current Message or Content Preview */}
                  {currentMessage && (
                    <div className="text-yellow-400 text-xs animate-pulse text-center leading-tight">
                      {currentMessage}
                      {currentMessage.length > 40 && '...'}
                    </div>
                  )}
                  
                  {/* Platform Information */}
                  {hasPlatforms && (
                    <div className="text-blue-400 text-xs text-center">
                      {currentActivity?.platforms?.join(', ').toUpperCase()}
                    </div>
                  )}
                  
                  {/* Post URLs */}
                  {hasPostUrls && (
                    <div className="text-green-400 text-xs text-center">
                      ✓ Posted
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {trimmedErrorMessage && (
                    <div className="text-red-400 text-xs text-center">
                      {trimmedErrorMessage}
                    </div>
                  )}
                  
                  {/* Progress */}
                  {hasProgress && (
                    <div className="space-y-1">
                      <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden mx-auto">
                        <div
                          className="h-full bg-green-400 transition-all duration-300 ease-out"
                          style={{ width: `${Math.min(100, Math.max(0, currentActivity?.progress ?? 0))}%` }}
                        />
                      </div>
                      <div className="text-gray-400 text-xs">{Math.round(currentActivity?.progress ?? 0)}%</div>
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
                <div className={cn(
                  "text-center transition-all duration-300 ease-in-out",
                  showNoActivityText ? "opacity-100 scale-100" : "opacity-0 scale-95"
                )}>
                  <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 mx-auto mb-2" />
                  <div className="text-gray-500 text-xs sm:text-sm">No activities</div>
                </div>
              )}
            </div>
          )}

          {/* Interactive Controls */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "absolute -right-2.5 -top-2.5 w-4 h-4 sm:w-5 sm:h-5 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center text-white hover:bg-gray-700 active:bg-gray-600 transition-all duration-200 text-lg font-bold touch-manipulation shadow-md hover:shadow-lg transform scale-50 sm:scale-100",
              isExpanded ? "bg-blue-600" : ""
            )}
          >
            {isExpanded ? "−" : "+"}
          </button>
          
          {/* Activity Count Badge - Only show if multiple activities */}
          {allActivities.length > 1 && (
            <div className="absolute -top-0.5 -left-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {allActivities.length}
            </div>
          )}
          
          {/* Current Message Indicator */}
          {currentActivity?.currentMessage && (
            <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-yellow-500 rounded-full animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};
