import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { ActivityItem } from '@/components/BackgroundActivityPopup';

interface ActivityContextType {
  activities: ActivityItem[];
  isPopupVisible: boolean;
  addActivity: (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => string;
  updateActivity: (id: string, updates: Partial<ActivityItem>) => void;
  addLiveMessage: (id: string, message: string) => void;
  clearCurrentMessage: (id: string) => void;
  removeActivity: (id: string) => void;
  clearCompletedActivities: () => void;
  togglePopup: () => void;
  showPopup: () => void;
  hidePopup: () => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};

interface ActivityProviderProps {
  children: ReactNode;
}

export const ActivityProvider = ({ children }: ActivityProviderProps) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isPopupVisible, setIsPopupVisible] = useState(true);
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  const addActivity = useCallback((activityData: Omit<ActivityItem, 'id' | 'timestamp'>): string => {
    const id = `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newActivity: ActivityItem = {
      ...activityData,
      id,
      timestamp: new Date(),
    };

    setActivities(prev => [newActivity, ...prev]);
    
    // Auto-remove completed activities after 10 seconds
    if (activityData.status === 'completed' || activityData.status === 'failed') {
      const timeout = setTimeout(() => {
        setActivities(prev => prev.filter(activity => activity.id !== id));
        timeoutsRef.current.delete(timeout);
      }, 10000);
      timeoutsRef.current.add(timeout);
    }

    return id;
  }, []);

  const updateActivity = useCallback((id: string, updates: Partial<ActivityItem>) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id 
          ? { ...activity, ...updates }
          : activity
      )
    );
  }, []);

  const addLiveMessage = useCallback((id: string, message: string) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id 
          ? { 
              ...activity, 
              liveMessages: [...(activity.liveMessages || []), message],
              currentMessage: message
            }
          : activity
      )
    );
  }, []);

  const clearCurrentMessage = useCallback((id: string) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id 
          ? { ...activity, currentMessage: undefined }
          : activity
      )
    );
  }, []);

  const removeActivity = useCallback((id: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
  }, []);

  const clearCompletedActivities = useCallback(() => {
    setActivities(prev => prev.filter(activity => 
      activity.status !== 'completed' && activity.status !== 'failed'
    ));
  }, []);

  const togglePopup = useCallback(() => {
    setIsPopupVisible(prev => !prev);
  }, []);

  const showPopup = useCallback(() => {
    setIsPopupVisible(true);
  }, []);

  const hidePopup = useCallback(() => {
    setIsPopupVisible(false);
  }, []);

  const value: ActivityContextType = {
    activities,
    isPopupVisible,
    addActivity,
    updateActivity,
    addLiveMessage,
    clearCurrentMessage,
    removeActivity,
    clearCompletedActivities,
    togglePopup,
    showPopup,
    hidePopup,
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};
