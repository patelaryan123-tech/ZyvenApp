import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../utils/constants';
import useAuth from '../../hooks/useAuth';
import LanguageContext from '../../context/LanguageContext';
import { HeartPulse, LogOut, UserCheck } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { t } = useContext(LanguageContext);
  const location = useLocation();

  const allowedNavItems = NAV_ITEMS.filter(item => 
    !item.roles || item.roles.includes(user?.role) || item.roles.includes('Senior')
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar component */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#2C3E30] text-white flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 shadow-xl border-r border-[#3D5A45]/30
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div>
          <div className="flex items-center space-x-3 h-20 px-6 border-b border-white/10 bg-[#243427]">
            <div className="w-10 h-10 rounded-2xl bg-[#3D5A45] flex items-center justify-center text-white shadow-xs border border-white/10">
              <HeartPulse className="w-5 h-5 text-[#E07A5F]" />
            </div>
            <div>
              <span className="text-xl font-black tracking-wider text-white">ZYVEN</span>
              <p className="text-[10px] text-gray-300 font-semibold tracking-widest uppercase">Healthcare</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 py-6 space-y-1.5 overflow-y-auto max-h-[calc(100vh-170px)]">
            {allowedNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => { if (isOpen) toggleSidebar(); }}
                  className={`
                    group flex items-center px-3.5 py-3 text-sm font-semibold rounded-2xl transition-all
                    ${isActive 
                      ? 'bg-[#3D5A45] text-white shadow-sm ring-1 ring-white/10' 
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon className={`
                    mr-3 h-5 w-5 flex-shrink-0 transition-colors
                    ${isActive ? 'text-[#E07A5F]' : 'text-gray-400 group-hover:text-white'}
                  `} />
                  <span className="capitalize">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Mini Profile & Logout Footer */}
        <div className="p-4 border-t border-white/10 bg-[#243427]/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-[#3D5A45] flex items-center justify-center text-white flex-shrink-0 font-bold text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'User'}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E07A5F]/20 text-[#E07A5F] font-bold uppercase tracking-wider">
                  {user?.role || 'Senior'}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
