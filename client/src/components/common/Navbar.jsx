import React, { useContext, useState } from 'react';
import { Bell, Globe, LogOut, Menu } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import LanguageContext from '../../context/LanguageContext';
import NotificationContext from '../../context/NotificationContext';
import { LANGUAGES } from '../../utils/constants';
import NotificationPanel from './NotificationPanel';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useContext(LanguageContext);
  const { unreadCount } = useContext(NotificationContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center md:hidden">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="ml-2 text-xl font-bold text-primary-600">ZYVEN</span>
          </div>

          <div className="hidden md:flex flex-1 items-center justify-end px-2 sm:px-6">
            <div className="flex items-center space-x-6">
              
              {/* Language Selector */}
              <div className="relative">
                <button 
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center text-gray-500 hover:text-primary-600 focus:outline-none"
                >
                  <Globe className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium uppercase">{language}</span>
                </button>
                {showLangMenu && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 focus:outline-none">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }}
                        className={`block w-full text-left px-4 py-2 text-sm ${language === lang.code ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        {lang.nativeName} ({lang.name})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-1 rounded-full text-gray-400 hover:text-primary-600 focus:outline-none"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-emergency text-white text-xs flex items-center justify-center transform translate-x-1 -translate-y-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <NotificationPanel onClose={() => setShowNotifications(false)} />
                )}
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-3 border-l pl-6">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-medium text-gray-900">{user?.name || 'User'}</span>
                  <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <button 
                  onClick={() => logout()}
                  className="p-1 rounded-full text-gray-400 hover:text-emergency focus:outline-none"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
