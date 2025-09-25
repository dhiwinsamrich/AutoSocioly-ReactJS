import { useState } from 'react';

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
  isVisible: boolean;
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  const showNotification = (
    type: 'success' | 'error' | 'info',
    title: string,
    description?: string,
    duration?: number
  ) => {
    const id = Date.now().toString();
    const newNotification: NotificationState = {
      id,
      type,
      title,
      description,
      isVisible: true
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    if (duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration || 5000);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id 
          ? { ...notif, isVisible: false }
          : notif
      )
    );

    // Remove from array after animation
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, 300);
  };

  return {
    notifications,
    showNotification,
    removeNotification
  };
};