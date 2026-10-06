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
    <div className="flex h-screen bg-[#FDFBF7] overflow-hidden font-sans text-gray-900 w-full">
      
      {/* Desktop Sidebar (hidden on mobile, acts as drawer when open) */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full relative min-w-0">
        
        {/* Top Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#FDFBF7] pb-20 md:pb-0">
          <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 lg:py-8 min-h-full">
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
