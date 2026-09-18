import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Top Header Logo */}
      <div className="text-center mb-6">
        <Link to="/welcome" className="inline-flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#3D5A45] flex items-center justify-center text-white shadow-sm">
            <HeartPulse className="w-6 h-6 text-[#E07A5F]" />
          </div>
          <span className="text-3xl font-extrabold text-[#3D5A45] tracking-wide">
            ZYVEN
          </span>
        </Link>
        <p className="mt-1 text-sm text-gray-500 font-medium">
          Your Health, Our Priority
        </p>
      </div>

      {/* Main Outlet Container */}
      <div className="w-full flex justify-center">
        <Outlet />
      </div>

      {/* Footer info */}
      <div className="mt-8 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} ZYVEN Healthcare System. All rights reserved.
      </div>
    </div>
  );
};

export default AuthLayout;