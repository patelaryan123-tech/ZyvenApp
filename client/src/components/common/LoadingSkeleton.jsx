import React from 'react';

const LoadingSkeleton = ({ variant = 'text', className = '' }) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-48 w-full rounded-xl',
    button: 'h-10 w-32 rounded-lg'
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} />
  );
};

export default LoadingSkeleton;
