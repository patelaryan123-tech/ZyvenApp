import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdherenceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
        No data available for this week
      </div>
    );
  }

  const getColor = (percentage) => {
    if (percentage >= 80) return '#3D5A45'; // Primary green
    if (percentage >= 50) return '#E07A5F'; // Accent orange/coral
    return '#D90429'; // Emergency red
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-900 mb-1">{label}</p>
          <p className="text-sm text-gray-600">
            Adherence: <span className="font-bold" style={{ color: getColor(data.percentage) }}>{data.percentage}%</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.taken} / {data.total} taken
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(val) => `${val}%`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6' }} />
          <Bar dataKey="percentage" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.percentage)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdherenceChart;
