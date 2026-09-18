import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import api from '../services/api';
import SocketContext from './SocketContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useContext(SocketContext) || {};

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data);
      const unread = response.data.data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (socket) {
      socket.on('notification', (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      return () => {
        socket.off('notification');
      };
    }
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
