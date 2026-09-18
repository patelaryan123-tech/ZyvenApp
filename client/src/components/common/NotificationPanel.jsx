import React, { useContext, useRef, useEffect } from 'react';
import { formatRelativeTime } from '../../utils/formatters';
import NotificationContext from '../../context/NotificationContext';
import { AlertCircle, Info, CheckCircle, Bell } from 'lucide-react';

const NotificationPanel = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useContext(NotificationContext);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getIcon = (type) => {
    switch(type) {
      case 'emergency': return <AlertCircle className="text-emergency h-5 w-5" />;
      case 'success': return <CheckCircle className="text-primary-600 h-5 w-5" />;
      case 'info': return <Info className="text-blue-500 h-5 w-5" />;
      default: return <Bell className="text-gray-500 h-5 w-5" />;
    }
  };

  return (
    <div 
      ref={panelRef}
      className="origin-top-right absolute right-0 mt-2 w-80 sm:w-96 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden z-50 flex flex-col max-h-[80vh]"
    >
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-xs text-primary-600 hover:text-primary-800 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No notifications yet
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif._id || notif.id} 
              onClick={() => !notif.read && markAsRead(notif._id || notif.id)}
              className={`p-4 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-primary-50/30' : ''}`}
            >
              <div className="flex-shrink-0 mt-1">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium text-gray-900 ${!notif.read ? 'font-semibold' : ''}`}>
                  {notif.title}
                </p>
                <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                  {notif.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatRelativeTime(notif.createdAt)}
                </p>
              </div>
              {!notif.read && (
                <div className="flex-shrink-0 flex items-center justify-center">
                  <div className="h-2 w-2 bg-primary-600 rounded-full"></div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
