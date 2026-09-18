import React from 'react';
import { Pill, AlertCircle, FileText, Activity, Clock } from 'lucide-react';
import { formatRelativeTime, formatTime } from '../../utils/formatters';

const ActivityFeed = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No recent activity
      </div>
    );
  }

  const getConfig = (type, severity) => {
    switch (type) {
      case 'medication_taken':
        return { icon: Pill, color: 'text-green-600', bg: 'bg-green-100', dot: 'bg-green-500' };
      case 'medication_missed':
        return { icon: Pill, color: 'text-orange-600', bg: 'bg-orange-100', dot: 'bg-orange-500' };
      case 'emergency':
        return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', dot: 'bg-red-500' };
      case 'report_upload':
        return { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100', dot: 'bg-blue-500' };
      default:
        return { icon: Activity, color: 'text-gray-600', bg: 'bg-gray-100', dot: 'bg-gray-400' };
    }
  };

  return (
    <div className="relative pl-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
      {/* Vertical line connecting timeline */}
      <div className="absolute top-0 bottom-0 left-[27px] w-[2px] bg-gray-100 -z-10"></div>
      
      <div className="space-y-6 pb-2">
        {activities.map((activity, index) => {
          const { icon: Icon, color, bg, dot } = getConfig(activity.type, activity.severity);
          
          return (
            <div key={activity.id || index} className="flex gap-4 group">
              {/* Timeline icon */}
              <div className="relative z-10 flex-shrink-0">
                <div className={`h-10 w-10 rounded-full ${bg} flex items-center justify-center border-4 border-white shadow-sm`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
              </div>
              
              {/* Content card */}
              <div className="flex-1 bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors border border-gray-100">
                <p className="text-sm text-gray-800 font-medium">{activity.description}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatRelativeTime(activity.timestamp)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;
