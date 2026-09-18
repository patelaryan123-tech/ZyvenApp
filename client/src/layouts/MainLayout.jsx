import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import MobileNav from '../components/common/MobileNav';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-cream overflow-hidden font-sans text-gray-900">
      
      {/* Desktop Sidebar (hidden on mobile, acts as drawer when open) */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full relative">
        
        {/* Top Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-cream pb-20 md:pb-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
            <Outlet />
          </div>
        </main>

        {/* Bottom Mobile Navigation */}
        <MobileNav />
        
      </div>
    </div>
  );
};

export default MainLayout;
