import React, { createContext, useState, useContext, useEffect } from 'react';
import { notificationService } from '../services/notification.service';
import { Notification } from '../types/notification.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  loadNotifications: (page: number) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  totalNotifications: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalNotifications, setTotalNotifications] = useState(0);

  const refreshNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('ACCESS_TOKEN');
      if (!token) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      setLoading(true);
      const [listParams, count] = await Promise.all([
        notificationService.getMyNotifications({ page: 1, limit: 20 }),
        notificationService.getUnreadCount()
      ]);

      if (listParams && listParams.notifications) {
        setNotifications(listParams.notifications);
        setTotalNotifications(listParams.pagination?.total || 0);
      }
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async (page: number = 1) => {
    try {
      setLoading(true);
      const result = await notificationService.getMyNotifications({ page, limit: 20 });
      if (result && result.notifications) {
        if (page === 1) {
          setNotifications(result.notifications);
        } else {
          setNotifications(prev => [...prev, ...result.notifications]);
        }
        setTotalNotifications(result.pagination?.total || 0);
      }
      // Also update unread count
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load notifications'
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead([id]);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to mark notifications as read'
      });
    }
  };

  useEffect(() => {
    refreshNotifications();
  }, []);

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        loading, 
        refreshNotifications, 
        loadNotifications,
        markAsRead,
        markAllRead,
        totalNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
