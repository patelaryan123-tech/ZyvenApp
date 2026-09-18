import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const QuickStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={index} 
            className="bg-cream rounded-xl p-4 border border-primary-100 flex flex-col shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 rounded-lg bg-white border border-gray-100">
                <Icon className={`h-5 w-5 text-${stat.color || 'primary'}-600`} />
              </div>
              {stat.trend && (
                <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full
                  ${stat.trend === 'up' ? 'text-green-700 bg-green-100' : 
                    stat.trend === 'down' ? 'text-red-700 bg-red-100' : 'text-gray-700 bg-gray-100'}
                `}>
                  {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : 
                   stat.trend === 'down' ? <ArrowDownRight className="h-3 w-3 mr-0.5" /> : 
                   <Minus className="h-3 w-3 mr-0.5" />}
                  {stat.trendValue}
                </div>
              )}
            </div>
            <div className="mt-2">
              <h4 className="text-2xl font-bold text-gray-900">{stat.value}</h4>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickStats;
