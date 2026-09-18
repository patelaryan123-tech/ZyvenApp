import React, { useState } from 'react';
import { Sun, CloudSun, Moon, ChevronDown, ChevronUp } from 'lucide-react';
import MedicationCard from './MedicationCard';

const TimeSlotGroup = ({ slot, medications, onTake, onMiss, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!medications || medications.length === 0) return null;

  const getSlotConfig = () => {
    switch (slot.toLowerCase()) {
      case 'morning':
        return { icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50' };
      case 'midday':
        return { icon: CloudSun, color: 'text-orange-500', bg: 'bg-orange-50' };
      case 'evening':
        return { icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50' };
      default:
        return { icon: Sun, color: 'text-primary-500', bg: 'bg-primary-50' };
    }
  };

  const { icon: Icon, color, bg } = getSlotConfig();

  return (
    <div className="mb-6">
      <div 
        className="flex items-center justify-between mb-3 cursor-pointer sm:cursor-default"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${bg}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{slot}</h3>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ml-2">
            {medications.length}
          </span>
        </div>
        <div className="sm:hidden text-gray-400">
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {medications.map((med) => (
            <MedicationCard 
              key={med._id || med.id} 
              medication={med} 
              onTake={onTake} 
              onMiss={onMiss}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeSlotGroup;
