import React from 'react';
import { formatRelativeTime } from '../../utils/formatters';

const PatientCard = ({ patient, selected, onClick }) => {
  if (!patient) return null;

  const isOnline = patient.status === 'online';

  return (
    <div 
      onClick={onClick}
      className={`
        relative p-4 rounded-xl cursor-pointer transition-all border-2
        ${selected 
          ? 'bg-primary-50 border-primary-500 shadow-md' 
          : 'bg-white border-transparent shadow-sm hover:shadow-md hover:border-gray-200'}
      `}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
            {patient.name?.charAt(0).toUpperCase() || 'P'}
          </div>
          <span className={`
            absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white
            ${isOnline ? 'bg-green-500' : 'bg-gray-400'}
          `}></span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-gray-900 truncate">{patient.name}</h3>
          <p className="text-sm text-gray-500">{patient.relationship || 'Patient'}</p>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 border-t border-gray-100 pt-2 flex justify-between items-center">
        <span>Last active:</span>
        <span className="font-medium text-gray-700">
          {patient.lastActive ? formatRelativeTime(patient.lastActive) : 'Unknown'}
        </span>
      </div>
    </div>
  );
};

export default PatientCard;
