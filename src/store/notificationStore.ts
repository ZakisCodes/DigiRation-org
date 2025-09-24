'use client';

import { create } from 'zustand';
import { Notification } from '@/types';

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto remove after duration
    const duration = notification.duration || 5000;
    setTimeout(() => {
      get().removeNotification(id);
    }, duration);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
}));

// Helper functions for common notification types
export const useNotifications = () => {
  const { addNotification } = useNotificationStore();

  return {
    showSuccess: (title: string, message: string, action?: Notification['action']) => {
      addNotification({
        type: 'success',
        title,
        message,
        action,
      });
    },

    showError: (title: string, message: string, action?: Notification['action']) => {
      addNotification({
        type: 'error',
        title,
        message,
        duration: 7000, // Longer duration for errors
        action,
      });
    },

    showWarning: (title: string, message: string, action?: Notification['action']) => {
      addNotification({
        type: 'warning',
        title,
        message,
        action,
      });
    },

    showInfo: (title: string, message: string, action?: Notification['action']) => {
      addNotification({
        type: 'info',
        title,
        message,
        action,
      });
    },
  };
};