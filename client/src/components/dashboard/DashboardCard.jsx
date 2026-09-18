import React from 'react';
import { motion } from 'framer-motion';

const DashboardCard = ({ title, description, icon: Icon, color = 'primary', onClick, className = '' }) => {
  const colorMap = {
    primary: {
      bg: 'bg-primary-50',
      iconBg: 'bg-primary-100',
      iconText: 'text-primary-600',
      border: 'border-primary-100'
    },
    accent: {
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconText: 'text-accent',
      border: 'border-orange-100'
    },
    emergency: {
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconText: 'text-emergency',
      border: 'border-red-100'
    }
  };

  const theme = colorMap[color] || colorMap.primary;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`
        cursor-pointer rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow
        bg-white border ${theme.border} flex flex-col items-start
        ${className}
      `}
    >
      <div className={`p-3 rounded-full mb-4 ${theme.iconBg}`}>
        <Icon className={`h-6 w-6 ${theme.iconText}`} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
    </motion.div>
  );
};

export default DashboardCard;
