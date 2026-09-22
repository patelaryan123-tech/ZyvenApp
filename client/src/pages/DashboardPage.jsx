import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mic, FileText, Pill, MapPin, Building, AlertTriangle, 
  Activity, Bell, Calendar, Stethoscope, Heart, Sparkles, Eye, Volume2
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useSeniorMode } from '../context/SeniorModeContext';
import { medicationService } from '../services/medicationService';
import { notificationService } from '../services/notificationService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';


const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isSeniorMode, toggleSeniorMode } = useSeniorMode();
  const [isLoading, setIsLoading] = useState(true);
  const [medications, setMedications] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medsRes, notifsRes] = await Promise.all([
          medicationService.getTodaySchedule().catch(() => ({ data: [] })),
          notificationService.getNotifications().catch(() => ({ data: [] }))
        ]);
        
        setMedications(medsRes.data || []);
        setNotifications(notifsRes.data?.slice(0, 3) || []);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 w-full">
        <LoadingSkeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <LoadingSkeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const features = [
    { title: 'Voice Companion', icon: <Mic className="w-8 h-8" />, color: 'bg-[#3D5A45] text-white', path: '/voice', span: 'col-span-2 md:col-span-1' },
    { title: 'Vitals Tracker', icon: <Activity className="w-6 h-6 text-[#3D5A45]" />, color: 'bg-green-50 text-[#3D5A45] border border-green-200', path: '/vitals', span: 'col-span-1' },
    { title: 'AI Symptom Checker', icon: <Stethoscope className="w-6 h-6 text-[#E07A5F]" />, color: 'bg-orange-50 text-[#E07A5F] border border-orange-200', path: '/symptom-checker', span: 'col-span-1' },
    { title: 'Active Senior Aging', icon: <Sparkles className="w-6 h-6 text-purple-600" />, color: 'bg-purple-50 text-purple-700 border border-purple-200', path: '/active-aging', span: 'col-span-1' },
    { title: 'Medical Reports', icon: <FileText className="w-6 h-6" />, color: 'bg-white text-[#3D5A45] border border-[#3D5A45]/20', path: '/reports', span: 'col-span-1' },
    { title: 'Medications', icon: <Pill className="w-6 h-6" />, color: 'bg-white text-[#3D5A45] border border-[#3D5A45]/20', path: '/medications', span: 'col-span-1' },
    { title: 'Hospital Finder', icon: <MapPin className="w-6 h-6" />, color: 'bg-white text-[#3D5A45] border border-[#3D5A45]/20', path: '/hospitals', span: 'col-span-1' },
    { title: 'Gov Schemes', icon: <Building className="w-6 h-6" />, color: 'bg-white text-[#3D5A45] border border-[#3D5A45]/20', path: '/schemes', span: 'col-span-1' },
  ];


  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full relative pb-24 md:pb-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Good Morning, {user?.name?.split(' ')[0] || 'User'}</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Welcome back to your ZYVEN healthcare portal</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSeniorMode}
            className={`py-2 px-3.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer border ${
              isSeniorMode 
                ? 'bg-[#3D5A45] text-white border-[#3D5A45]' 
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
            title="Toggle Ultra Senior Accessibility Mode"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">{isSeniorMode ? 'Senior Mode Active' : 'Senior Mode'}</span>
          </button>

          <div className="w-10 h-10 bg-[#3D5A45]/10 rounded-full flex items-center justify-center text-[#3D5A45] font-black text-lg">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>


      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-green-600"><Activity className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500">Health Score</p>
            <p className="text-xl font-bold text-gray-900">92/100</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Pill className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500">Medications</p>
            <p className="text-xl font-bold text-gray-900">{medications.length} Today</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600"><FileText className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500">Reports</p>
            <p className="text-xl font-bold text-gray-900">3 New</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
          <div className="p-3 bg-orange-50 rounded-lg text-orange-600"><Bell className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500">Alerts</p>
            <p className="text-xl font-bold text-gray-900">{notifications.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((feature, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(feature.path)}
                className={`p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 shadow-sm ${feature.color} ${feature.span}`}
              >
                {feature.icon}
                <span className="font-semibold">{feature.title}</span>
              </motion.button>
            ))}
          </div>

          {/* Adherence Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Medication Adherence</h2>
              <select className="bg-gray-50 border-none text-sm rounded-lg text-gray-600 focus:ring-[#3D5A45]">
                <option>This Week</option>
                <option>Last Week</option>
              </select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={adherenceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3D5A45" 
                    strokeWidth={3}
                    dot={{ fill: '#3D5A45', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#E07A5F', stroke: 'white', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Schedule */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#3D5A45]" />
                Today's Schedule
              </h2>
              <button onClick={() => navigate('/medications')} className="text-sm text-[#E07A5F] font-medium hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {medications.length > 0 ? medications.map((med, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="w-2 h-10 rounded-full bg-[#3D5A45]"></div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{med.name}</h3>
                    <p className="text-sm text-gray-500">{med.dosage} • {med.time}</p>
                  </div>
                  {med.taken ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg">Taken</span>
                  ) : (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg">Pending</span>
                  )}
                </div>
              )) : (
                <div className="text-center py-6 text-gray-500">
                  <Pill className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p>No medications scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity / Notifications */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {notifications.length > 0 ? notifications.map((notif, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#E07A5F]"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating SOS Button (Mobile & Desktop) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/emergency')}
        className="fixed bottom-[80px] right-6 md:bottom-8 md:right-8 w-16 h-16 bg-[#D90429] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-700 transition-colors z-50"
      >
        <AlertTriangle className="w-8 h-8" />
      </motion.button>
    </div>
  );
};

export default DashboardPage;
