import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Mic, Pill, PhoneCall, MoreHorizontal } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import LanguageContext from '../../context/LanguageContext';

const MobileNav = () => {
  const { user } = useAuth();
  const { t } = useContext(LanguageContext);
  const location = useLocation();

  if (!user) return null;

  const getMobileItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Home', icon: Home },
      { path: '/voice', label: 'Voice', icon: Mic },
      { path: '/medications', label: 'Meds', icon: Pill },
      { path: '/emergency', label: 'SOS', icon: PhoneCall, isEmergency: true },
      { path: '/reports', label: 'More', icon: MoreHorizontal } // Redirects to reports/menu area
    ];
    return baseItems;
  };

  const items = getMobileItems();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                item.isEmergency 
                  ? 'text-emergency hover:text-emergency-dark' 
                  : isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className={`
                p-1 rounded-full 
                ${item.isEmergency ? 'bg-emergency-light/20' : ''}
                ${isActive && !item.isEmergency ? 'bg-primary-50' : ''}
              `}>
                <Icon className={`h-6 w-6 ${item.isEmergency ? 'text-emergency' : ''}`} />
              </div>
              <span className="text-[10px] font-medium">
                {t(item.label.toLowerCase())}
              </span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;
