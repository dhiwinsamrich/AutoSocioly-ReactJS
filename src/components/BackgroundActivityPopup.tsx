import { useState, useEffect } from 'react';
import { Activity, Loader2, CheckCircle, AlertCircle, Clock, Image, FileText, Send, Brain, Sparkles, Wifi, WifiOff, Server, Database, Zap, Timer, Cpu, HardDrive, Network, RefreshCw, TrendingUp, BarChart3 } from 'lucide-react';
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
  // Enhanced live information
  step?: string;
  currentStep?: number;
  totalSteps?: number;
  apiCalls?: number;
  dataProcessed?: string;
  responseTime?: number;
  memoryUsage?: string;
  networkStatus?: 'connected' | 'disconnected' | 'slow';
  backendStatus?: 'healthy' | 'warning' | 'error';
  lastUpdate?: Date;
  processingTime?: number;
  queuePosition?: number;
  retryCount?: number;
  successRate?: number;
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


  // Show active activities (in progress or pending)
  const activeActivities = activities.filter(activity => 
    activity.status === 'in_progress' || activity.status === 'pending'
  );
  
  // Show recently completed/failed activities (within last 10 seconds) or if no active ones
  const recentActivities = activities
    .filter(activity => {
      if (activity.status === 'completed' || activity.status === 'failed') {
        const now = new Date();
        const activityTime = activity.timestamp;
        const timeDiff = now.getTime() - activityTime.getTime();
        // Show completed activities for 10 seconds after completion
        return timeDiff < 10000;
      }
      return false;
    })
    .slice(0, 1);

  // Prioritize active activities, fallback to recent if no active ones
  const allActivities = activeActivities.length > 0 ? activeActivities : recentActivities;
  const currentActivity = allActivities[currentActivityIndex] || allActivities[0];

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
    }
  }, [currentActivity?.status, currentActivity?.progress, currentActivity?.step]);

  // Show popup if there are activities OR if explicitly visible
  if (allActivities.length === 0 && !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Circular Popup */}
      <div className={cn(
        "relative transition-all duration-500 ease-in-out",
        isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
      )}>
        {/* Main Circular Container */}
        <div key={`popup-${currentActivity?.id}-${currentActivity?.status}`} className={cn(
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
            <div className="w-full h-full flex flex-col items-center justify-center p-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              {/* Current Activity Info */}
              {currentActivity ? (
                <div key={`${currentActivity.id}-${currentActivity.status}`} className="text-center space-y-2 animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
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
                    {currentActivity.status === 'in_progress' ? ' ' : 
                     currentActivity.status === 'completed' ? 'DONE' : 
                     currentActivity.status === 'failed' ? 'ERROR' : 'PENDING'}
                  </div>
                  
                  {/* Current Message or Content Preview */}
                  {(currentActivity.currentMessage || currentActivity.content_preview) && (
                    <div className="text-yellow-400 text-xs animate-pulse text-center leading-tight">
                      {currentActivity.currentMessage || currentActivity.content_preview || ''}
                      {(currentActivity.currentMessage || currentActivity.content_preview || '').length > 40 && '...'}
                    </div>
                  )}
                  
                  {/* Step Information */}
                  {currentActivity.step && (
                    <div className="text-cyan-400 text-xs text-center font-medium">
                      {currentActivity.step}
                    </div>
                  )}
                  
                  {/* Step Progress */}
                  {currentActivity.currentStep && currentActivity.totalSteps && (
                    <div className="text-gray-400 text-xs text-center">
                      Step {currentActivity.currentStep}/{currentActivity.totalSteps}
                    </div>
                  )}
                  
                  {/* Platform Information */}
                  {currentActivity.platforms && currentActivity.platforms.length > 0 && (
                    <div className="text-blue-400 text-xs text-center">
                      {currentActivity.platforms.join(', ').toUpperCase()}
                    </div>
                  )}
                  
                  {/* Live Statistics Row */}
                  <div className="flex justify-center space-x-3 text-xs">
                    {/* API Calls */}
                    {currentActivity.apiCalls !== undefined && (
                      <div className="flex items-center space-x-1 text-purple-400">
                        <Zap className="w-3 h-3" />
                        <span>{currentActivity.apiCalls}</span>
                      </div>
                    )}
                    
                    {/* Response Time */}
                    {currentActivity.responseTime && (
                      <div className="flex items-center space-x-1 text-green-400">
                        <Timer className="w-3 h-3" />
                        <span>{currentActivity.responseTime}ms</span>
                      </div>
                    )}
                    
                    {/* Memory Usage */}
                    {currentActivity.memoryUsage && (
                      <div className="flex items-center space-x-1 text-orange-400">
                        <Cpu className="w-3 h-3" />
                        <span>{currentActivity.memoryUsage}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Network & Backend Status */}
                  <div className="flex justify-center space-x-2 text-xs">
                    {/* Network Status */}
                    {currentActivity.networkStatus && (
                      <div className={cn(
                        "flex items-center space-x-1",
                        currentActivity.networkStatus === 'connected' ? 'text-green-400' :
                        currentActivity.networkStatus === 'slow' ? 'text-yellow-400' : 'text-red-400'
                      )}>
                        {currentActivity.networkStatus === 'connected' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        <span className="capitalize">{currentActivity.networkStatus}</span>
                      </div>
                    )}
                    
                    {/* Backend Status */}
                    {currentActivity.backendStatus && (
                      <div className={cn(
                        "flex items-center space-x-1",
                        currentActivity.backendStatus === 'healthy' ? 'text-green-400' :
                        currentActivity.backendStatus === 'warning' ? 'text-yellow-400' : 'text-red-400'
                      )}>
                        <Server className="w-3 h-3" />
                        <span className="capitalize">{currentActivity.backendStatus}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Processing Information */}
                  {(currentActivity.processingTime || currentActivity.queuePosition) && (
                    <div className="flex justify-center space-x-3 text-xs text-gray-400">
                      {currentActivity.processingTime && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{Math.round(currentActivity.processingTime)}s</span>
                        </div>
                      )}
                      {currentActivity.queuePosition && (
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="w-3 h-3" />
                          <span>#{currentActivity.queuePosition}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Success Rate & Retry Info */}
                  {(currentActivity.successRate !== undefined || currentActivity.retryCount !== undefined) && (
                    <div className="flex justify-center space-x-3 text-xs">
                      {currentActivity.successRate !== undefined && (
                        <div className="flex items-center space-x-1 text-green-400">
                          <TrendingUp className="w-3 h-3" />
                          <span>{Math.round(currentActivity.successRate)}%</span>
                        </div>
                      )}
                      {currentActivity.retryCount !== undefined && currentActivity.retryCount > 0 && (
                        <div className="flex items-center space-x-1 text-yellow-400">
                          <RefreshCw className="w-3 h-3" />
                          <span>Retry {currentActivity.retryCount}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Post URLs */}
                  {currentActivity.post_urls && Object.keys(currentActivity.post_urls).length > 0 && (
                    <div className="text-green-400 text-xs text-center">
                      ✓ Posted
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {currentActivity.error_message && (
                    <div className="text-red-400 text-xs text-center">
                      {currentActivity.error_message.length > 30 
                        ? currentActivity.error_message.substring(0, 30) + '...'
                        : currentActivity.error_message
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
                <div className={cn(
                  "text-center transition-all duration-300 ease-in-out",
                  showNoActivityText ? "opacity-100 scale-100" : "opacity-0 scale-95"
                )}>
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
