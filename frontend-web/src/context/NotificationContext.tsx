import React, { createContext, useContext, useState, useCallback } from 'react';

export type NotificationType = 'success' | 'info' | 'warning' | 'error' | 'ai_magic';
export type NotificationCategory = 'SYSTEM' | 'PROPERTY' | 'PAYROLL' | 'APPROVAL' | 'AI_ENGINE';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastNotification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  details?: string;
  duration?: number; // ms, default 4500
  createdAt: Date;
  action?: ToastAction;
}

export interface NotificationHistoryItem extends ToastNotification {
  read: boolean;
}

interface NotificationContextType {
  toasts: ToastNotification[];
  history: NotificationHistoryItem[];
  unreadCount: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  showNotification: (notification: Omit<ToastNotification, 'id' | 'createdAt'>) => string;
  removeToast: (id: string) => void;
  clearHistory: () => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  notifySuccess: (title: string, message: string, details?: string, category?: NotificationCategory) => string;
  notifyError: (title: string, message: string, details?: string, category?: NotificationCategory) => string;
  notifyInfo: (title: string, message: string, details?: string, category?: NotificationCategory) => string;
  notifyWarning: (title: string, message: string, details?: string, category?: NotificationCategory) => string;
  notifyAiMagic: (title: string, message: string, details?: string, category?: NotificationCategory) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showNotification = useCallback((
    notification: Omit<ToastNotification, 'id' | 'createdAt'>
  ): string => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastNotification = {
      ...notification,
      id,
      createdAt: new Date(),
      category: notification.category || 'SYSTEM',
      duration: notification.duration ?? 4500
    };

    setToasts(prev => [newToast, ...prev.slice(0, 4)]); // Keep max 5 active floating toasts
    setHistory(prev => [{ ...newToast, read: false }, ...prev]);

    return id;
  }, []);

  const notifySuccess = useCallback((title: string, message: string, details?: string, category: NotificationCategory = 'SYSTEM') => {
    return showNotification({ type: 'success', title, message, details, category });
  }, [showNotification]);

  const notifyError = useCallback((title: string, message: string, details?: string, category: NotificationCategory = 'SYSTEM') => {
    return showNotification({ type: 'error', title, message, details, category });
  }, [showNotification]);

  const notifyInfo = useCallback((title: string, message: string, details?: string, category: NotificationCategory = 'SYSTEM') => {
    return showNotification({ type: 'info', title, message, details, category });
  }, [showNotification]);

  const notifyWarning = useCallback((title: string, message: string, details?: string, category: NotificationCategory = 'SYSTEM') => {
    return showNotification({ type: 'warning', title, message, details, category });
  }, [showNotification]);

  const notifyAiMagic = useCallback((title: string, message: string, details?: string, category: NotificationCategory = 'AI_ENGINE') => {
    return showNotification({ type: 'ai_magic', title, message, details, category });
  }, [showNotification]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const markAllAsRead = useCallback(() => {
    setHistory(prev => prev.map(item => ({ ...item, read: true })));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setHistory(prev => prev.map(item => item.id === id ? { ...item, read: true } : item));
  }, []);

  const unreadCount = history.filter(item => !item.read).length;

  return (
    <NotificationContext.Provider value={{
      toasts,
      history,
      unreadCount,
      isDrawerOpen,
      setIsDrawerOpen,
      showNotification,
      removeToast,
      clearHistory,
      markAllAsRead,
      markAsRead,
      notifySuccess,
      notifyError,
      notifyInfo,
      notifyWarning,
      notifyAiMagic
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
