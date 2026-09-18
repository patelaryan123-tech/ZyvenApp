import React from 'react';
import { Pill, Check, X, Edit2 } from 'lucide-react';
import { formatTime } from '../../utils/formatters';

const MedicationCard = ({ medication, onTake, onMiss, onEdit }) => {
  const getStatusConfig = () => {
    switch (medication.status) {
      case 'taken':
        return { badge: 'bg-green-100 text-green-700', text: 'Taken' };
      case 'missed':
        return { badge: 'bg-red-100 text-red-700', text: 'Missed' };
      default:
        return { badge: 'bg-gray-100 text-gray-600', text: 'Pending' };
    }
  };

  const statusConfig = getStatusConfig();
  const isActionable = medication.status !== 'taken' && medication.status !== 'missed';

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-3">
      <div className="flex items-center gap-4 flex-1">
        <div className="bg-primary-50 p-3 rounded-full flex-shrink-0">
          <Pill className="h-6 w-6 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-base font-bold text-gray-900 truncate">{medication.name}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig.badge}`}>
              {statusConfig.text}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500 gap-3">
            <span>{medication.dosage}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="font-medium text-gray-700">{formatTime(medication.time)}</span>
          </div>
        </div>
        {onEdit && (
          <button 
            onClick={() => onEdit(medication)}
            className="p-2 text-gray-400 hover:text-primary-600 rounded-full hover:bg-gray-50 focus:outline-none"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 w-full sm:w-auto">
        <button
          onClick={() => onTake(medication)}
          disabled={!isActionable}
          className={`
            flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${isActionable 
              ? 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
          `}
        >
          <Check className="h-4 w-4" />
          Take
        </button>
        <button
          onClick={() => onMiss(medication)}
          disabled={!isActionable}
          className={`
            flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border transition-colors
            ${isActionable 
              ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500' 
              : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'}
          `}
        >
          <X className="h-4 w-4" />
          Missed
        </button>
      </div>
    </div>
  );
};

export default MedicationCard;
