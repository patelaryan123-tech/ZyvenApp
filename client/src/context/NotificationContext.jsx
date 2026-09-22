import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import api from '../services/api';
import SocketContext from './SocketContext';

const NotificationContext = createContext({ notifications: [], unreadCount: 0, markAsRead: () => {}, markAllAsRead: () => {}, fetchNotifications: () => {} });

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketCtx = useContext(SocketContext);
  const socket = socketCtx?.socket;

  const fetchNotifications = useCallback(async () => {
    // Don't fetch if no token at all - prevents 401 crash on startup
    if (!localStorage.getItem('zyven_token')) return;
    try {
      const response = await api.get('/notifications');
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      // Silently fail - user may not be logged in yet
      console.warn('Notifications fetch skipped:', error?.response?.status || error.message);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!socket) return;
    const handleNotification = (newNotification) => {
      if (!newNotification) return;
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };
    socket.on('notification', handleNotification);
    return () => socket.off('notification', handleNotification);
  }, [socket]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
