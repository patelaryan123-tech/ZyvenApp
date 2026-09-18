import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px]">
      <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6">
        {Icon && <Icon className="h-10 w-10 text-primary-400" />}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-8 max-w-md">{description}</p>
      
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
