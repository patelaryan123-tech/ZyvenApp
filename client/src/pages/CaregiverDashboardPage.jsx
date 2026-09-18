import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Activity, Bell, ShieldAlert, Heart, Calendar, Clock, ChevronRight
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis
} from 'recharts';
import useAuth from '../hooks/useAuth';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export default function CaregiverDashboardPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');

  useEffect(() => {
    // Mock fetching linked patients
    setTimeout(() => {
      const mockPatients = [
        { _id: 'p1', name: 'Ramesh Patel', relation: 'Father', age: 72, status: 'Good', adherence: 85 },
        { _id: 'p2', name: 'Sushila Patel', relation: 'Mother', age: 68, status: 'Warning', adherence: 60 }
      ];
      setPatients(mockPatients);
      setSelectedPatient(mockPatients[0]);
      setLoading(false);
    }, 1000);
  }, []);

  if (!user || (user.role !== 'Caregiver' && user.role !== 'FamilyMember')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md">
          <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-500 mt-2 text-sm">Only registered caregivers and family members can access this dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <LoadingSkeleton className="h-28 w-full rounded-2xl" />
        <LoadingSkeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  // Chart Data Setup
  const pieData = [
    { name: 'Taken', value: selectedPatient?.adherence || 0, color: '#3D5A45' },
    { name: 'Missed', value: 100 - (selectedPatient?.adherence || 0), color: '#E07A5F' }
  ];

  const weeklyData = [
    { day: 'Mon', val: 100 }, { day: 'Tue', val: 50 }, { day: 'Wed', val: 100 },
    { day: 'Thu', val: 75 }, { day: 'Fri', val: 100 }, { day: 'Sat', val: 100 }, { day: 'Sun', val: 80 }
  ];

  const renderMobileTabs = () => (
    <div className="md:hidden flex bg-white border-b border-gray-200">
      {['Dashboard', 'My Family', 'Alerts'].map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-[#3D5A45] text-[#3D5A45]' : 'border-transparent text-gray-500'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  return (
    <MainLayout>
      <div className="bg-[#FDFBF7] min-h-screen">
        
        {/* Header */}
        <div className="bg-[#3D5A45] pt-8 pb-16 px-4 sm:px-6 lg:px-8 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center">
              <Users className="mr-3" /> Caregiver Command Center
            </h1>
            <p className="mt-2 text-green-100 opacity-90">Monitor your loved ones and stay informed in real-time.</p>
          </div>
        </div>

        {renderMobileTabs()}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-12">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Sidebar: Patients List */}
            <div className={`lg:w-1/3 xl:w-1/4 ${activeTab !== 'My Family' && 'hidden md:block'}`}>
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 space-y-4">
                <h3 className="font-bold text-gray-800 px-2 pb-2 border-b">Linked Members</h3>
                {patients.map(p => (
                  <div 
                    key={p._id}
                    onClick={() => { setSelectedPatient(p); setActiveTab('Dashboard'); }}
                    className={`p-4 rounded-lg cursor-pointer transition-all border ${selectedPatient?._id === p._id ? 'bg-green-50 border-[#3D5A45] shadow-sm' : 'bg-white border-gray-100 hover:border-green-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-[#3D5A45] text-white rounded-full flex items-center justify-center font-bold">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{p.name}</h4>
                          <p className="text-xs text-gray-500">{p.relation} • {p.age} yrs</p>
                        </div>
                      </div>
                      <div className={`h-3 w-3 rounded-full ${p.status === 'Good' ? 'bg-green-500' : p.status === 'Warning' ? 'bg-orange-500' : 'bg-red-500'}`} />
                    </div>
                  </div>
                ))}
                
                <button className="w-full mt-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:border-[#3D5A45] hover:text-[#3D5A45] transition-colors">
                  + Link Patient
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className={`lg:w-2/3 xl:w-3/4 space-y-6 ${activeTab !== 'Dashboard' && 'hidden md:block'}`}>
              {selectedPatient ? (
                <>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedPatient.name}'s Status</h2>
                      <p className="text-gray-500">Overview of recent activity and health metrics.</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-[#E07A5F] text-white rounded-lg text-sm font-medium hover:bg-[#c96a50]">Call</button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">View Reports</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Adherence Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center"><Activity size={18} className="mr-2 text-[#3D5A45]"/> Medication Adherence</h3>
                      <div className="flex items-center justify-between">
                        <div className="h-32 w-32 relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={pieData} innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value" stroke="none">
                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                              </Pie>
                              <RechartsTooltip />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-xl font-bold text-[#3D5A45]">{selectedPatient.adherence}%</span>
                          </div>
                        </div>
                        <div className="flex-1 ml-6 space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center"><div className="w-3 h-3 bg-[#3D5A45] rounded-full mr-2"/>Taken</span>
                            <span className="font-bold">{selectedPatient.adherence}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center"><div className="w-3 h-3 bg-[#E07A5F] rounded-full mr-2"/>Missed</span>
                            <span className="font-bold">{100 - selectedPatient.adherence}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Weekly Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-800 mb-4">Weekly Trend</h3>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={weeklyData}>
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                            <YAxis hide={true} />
                            <Bar dataKey="val" fill="#3D5A45" radius={[4,4,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Activity Feed */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center"><Clock size={18} className="mr-2"/> Recent Activity Log</h3>
                    
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                      
                      {/* Item 1 */}
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-green-100 text-green-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          <Heart size={18} />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-bold text-gray-900">Medication Taken</div>
                            <time className="text-xs text-gray-500">10:00 AM</time>
                          </div>
                          <div className="text-sm text-gray-600">Amlodipine 5mg</div>
                        </div>
                      </div>

                      {/* Item 2 */}
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-red-100 text-red-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          <AlertTriangle size={18} />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-red-100 bg-red-50 shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-bold text-red-800">Missed Dosage</div>
                            <time className="text-xs text-red-600">Yesterday, 8:00 PM</time>
                          </div>
                          <div className="text-sm text-red-700">Metformin 500mg</div>
                        </div>
                      </div>

                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white p-10 rounded-xl shadow-sm text-center">Select a patient to view details</div>
              )}
            </div>
            
            {/* Alerts Tab Mobile View Content */}
            <div className={`lg:hidden w-full space-y-4 ${activeTab !== 'Alerts' && 'hidden'}`}>
              <div className="bg-white p-4 rounded-xl border-l-4 border-red-500 shadow-sm">
                <h4 className="font-bold text-gray-900">Missed Medication</h4>
                <p className="text-sm text-gray-600 mt-1">Sushila Patel missed Metformin dosage at 8:00 PM.</p>
                <span className="text-xs text-gray-400 mt-2 block">12 hours ago</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}
