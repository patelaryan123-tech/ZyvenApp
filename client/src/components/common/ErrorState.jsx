import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({ message = "Something went wrong", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[200px]">
      <div className="w-16 h-16 bg-emergency-light/20 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-emergency" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Oops! Error occurred</h3>
      <p className="text-gray-500 mb-6 max-w-sm">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
