import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Activity, Bell, ShieldAlert, Heart, Calendar, Clock,
  AlertTriangle, CheckCircle, XCircle, Phone, FileText,
  PlusCircle, TrendingUp, Pill, Zap, ChevronRight, User, MessageSquare
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis
} from 'recharts';
import useAuth from '../hooks/useAuth';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

// ─── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_PATIENTS = [
  {
    _id: 'p1',
    name: 'Ramesh Patel',
    relation: 'Father',
    age: 72,
    status: 'Good',
    adherence: 85,
    phone: '+91 98765 43210',
    lastVitals: { bp: '128/82', sugar: '110 mg/dL', recorded: '2 hours ago' },
    medications: { taken: 3, missed: 0, total: 3 },
    sosEvents: 0,
    weeklyData: [
      { day: 'Mon', val: 100 }, { day: 'Tue', val: 100 }, { day: 'Wed', val: 67 },
      { day: 'Thu', val: 100 }, { day: 'Fri', val: 100 }, { day: 'Sat', val: 100 }, { day: 'Sun', val: 80 }
    ],
    activityLog: [
      { type: 'taken', icon: 'check', label: 'Medication Taken', desc: 'Amlodipine 5mg', time: '10:00 AM', color: 'green' },
      { type: 'taken', icon: 'check', label: 'Medication Taken', desc: 'Metformin 500mg', time: '8:00 AM', color: 'green' },
      { type: 'vitals', icon: 'activity', label: 'Vitals Recorded', desc: 'BP: 128/82, Sugar: 110', time: 'Yesterday', color: 'blue' },
    ],
    careNotes: [
      { author: 'You', note: 'Ate full lunch, feels energetic today.', time: '2 hours ago' },
      { author: 'You', note: 'Took morning walk for 20 minutes.', time: 'Yesterday' },
    ],
  },
  {
    _id: 'p2',
    name: 'Sushila Patel',
    relation: 'Mother',
    age: 68,
    status: 'Warning',
    adherence: 60,
    phone: '+91 87654 32109',
    lastVitals: { bp: '145/90', sugar: '145 mg/dL', recorded: '6 hours ago' },
    medications: { taken: 1, missed: 2, total: 3 },
    sosEvents: 1,
    weeklyData: [
      { day: 'Mon', val: 100 }, { day: 'Tue', val: 50 }, { day: 'Wed', val: 100 },
      { day: 'Thu', val: 50 }, { day: 'Fri', val: 100 }, { day: 'Sat', val: 50 }, { day: 'Sun', val: 60 }
    ],
    activityLog: [
      { type: 'missed', icon: 'x', label: 'Missed Medication', desc: 'Metformin 500mg', time: '8:00 PM Yesterday', color: 'red' },
      { type: 'sos', icon: 'alert', label: 'SOS Triggered', desc: 'Emergency alert sent', time: '2 days ago', color: 'red' },
      { type: 'taken', icon: 'check', label: 'Medication Taken', desc: 'Amlodipine 5mg', time: '10:00 AM', color: 'green' },
    ],
    careNotes: [
      { author: 'You', note: 'Remind to take evening medications.', time: '1 hour ago' },
    ],
  },
];

const STATUS_CONFIG = {
  Good: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-200' },
  Warning: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', border: 'border-orange-200' },
  Critical: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
};

// ─── Sub-Components ──────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4"
  >
    <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </motion.div>
);

const ActivityIcon = ({ type }) => {
  const icons = {
    check: <CheckCircle size={16} />,
    x: <XCircle size={16} />,
    alert: <AlertTriangle size={16} />,
    activity: <Activity size={16} />,
  };
  const colors = { check: 'bg-green-100 text-green-600', x: 'bg-red-100 text-red-600', alert: 'bg-red-100 text-red-600', activity: 'bg-blue-100 text-blue-600' };
  return (
    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${colors[type] || 'bg-gray-100 text-gray-600'}`}>
      {icons[type] || <Activity size={16} />}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CaregiverDashboardPage() {
  const { user } = useAuth();
  const [patients] = useState(MOCK_PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState(MOCK_PATIENTS[0]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState(MOCK_PATIENTS[0].careNotes);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedPatient) setNotes(selectedPatient.careNotes);
  }, [selectedPatient]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalAlerts = patients.reduce((acc, p) => acc + p.medications.missed + p.sosEvents, 0);
  const avgAdherence = Math.round(patients.reduce((acc, p) => acc + p.adherence, 0) / patients.length);
  const medsDueToday = patients.reduce((acc, p) => acc + (p.medications.total - p.medications.taken), 0);

  const pieData = [
    { name: 'Taken', value: selectedPatient?.adherence || 0, color: '#3D5A45' },
    { name: 'Missed', value: 100 - (selectedPatient?.adherence || 0), color: '#E07A5F' },
  ];

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    const newNote = { author: 'You', note: noteText.trim(), time: 'Just now' };
    setNotes(prev => [newNote, ...prev]);
    setNoteText('');
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <LoadingSkeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <LoadingSkeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <LoadingSkeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-[#FDFBF7] min-h-screen">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#3D5A45] to-[#4a7057] px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <Users size={28} /> Caregiver Command Center
              </h1>
              <p className="mt-1 text-green-100 text-sm">
                Welcome back, {user?.name?.split(' ')[0] || 'Caregiver'} — monitoring {patients.length} patient{patients.length !== 1 ? 's' : ''}
              </p>
            </div>
            {totalAlerts > 0 && (
              <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 animate-pulse">
                <Bell size={14} /> {totalAlerts} Alert{totalAlerts !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 pb-12 relative z-10">

        {/* ── Stats Bar ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Users} label="Linked Patients" value={patients.length} sub="Under your care" color="bg-[#3D5A45]" />
          <StatCard icon={Pill} label="Medications Due" value={medsDueToday} sub="Across all patients" color="bg-[#E07A5F]" />
          <StatCard icon={Bell} label="Active Alerts" value={totalAlerts} sub={totalAlerts > 0 ? 'Needs attention' : 'All clear'} color={totalAlerts > 0 ? 'bg-red-500' : 'bg-green-500'} />
          <StatCard icon={TrendingUp} label="Avg Adherence" value={`${avgAdherence}%`} sub="All patients avg" color="bg-blue-500" />
        </div>

        {/* ── Main Grid ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Patient List Sidebar ──────────────────────────────────────── */}
          <div className="lg:w-72 xl:w-80 flex-shrink-0 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <Users size={16} className="text-[#3D5A45]" /> Linked Patients
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {patients.map(p => {
                  const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.Good;
                  const isSelected = selectedPatient?._id === p._id;
                  return (
                    <motion.button
                      key={p._id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPatient(p)}
                      className={`w-full text-left p-4 transition-all ${isSelected ? 'bg-[#EEF3EF]' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-[#3D5A45] text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {p.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-gray-900 text-sm truncate">{p.name}</p>
                            <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ml-2 ${cfg.dot}`} />
                          </div>
                          <p className="text-xs text-gray-500">{p.relation} · {p.age} yrs</p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div className="bg-[#3D5A45] h-1.5 rounded-full" style={{ width: `${p.adherence}%` }} />
                            </div>
                            <span className="text-xs font-bold text-gray-600">{p.adherence}%</span>
                          </div>
                        </div>
                      </div>
                      {p.medications.missed > 0 && (
                        <div className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
                          <AlertTriangle size={12} /> {p.medications.missed} missed dose{p.medications.missed !== 1 ? 's' : ''}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
              <div className="p-4 border-t border-gray-100">
                <button className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-sm font-medium hover:border-[#3D5A45] hover:text-[#3D5A45] transition-colors flex items-center justify-center gap-2">
                  <PlusCircle size={16} /> Link New Patient
                </button>
              </div>
            </div>
          </div>

          {/* ── Patient Detail Panel ──────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {selectedPatient && (
              <motion.div
                key={selectedPatient._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 space-y-5"
              >
                {/* Patient Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 bg-gradient-to-br from-[#3D5A45] to-[#4a7057] text-white rounded-2xl flex items-center justify-center font-bold text-xl">
                        {selectedPatient.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedPatient.name}</h2>
                        <p className="text-sm text-gray-500">{selectedPatient.relation} · {selectedPatient.age} years old</p>
                        <span className={`inline-flex items-center gap-1 mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${STATUS_CONFIG[selectedPatient.status]?.bg} ${STATUS_CONFIG[selectedPatient.status]?.text}`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[selectedPatient.status]?.dot}`} />
                          {selectedPatient.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={`tel:${selectedPatient.phone}`} className="flex items-center gap-2 px-4 py-2 bg-[#3D5A45] text-white rounded-xl text-sm font-semibold hover:bg-[#324a3a] transition-colors">
                        <Phone size={15} /> Call
                      </a>
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                        <FileText size={15} /> Reports
                      </button>
                    </div>
                  </div>
                </div>

                {/* Health Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Pill size={16} className="text-green-600" />
                      </div>
                      <p className="text-sm font-semibold text-gray-600">Today's Meds</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{selectedPatient.medications.taken}/{selectedPatient.medications.total}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedPatient.medications.missed > 0
                        ? <span className="text-red-500 font-medium">{selectedPatient.medications.missed} missed</span>
                        : <span className="text-green-500 font-medium">All taken ✓</span>}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Activity size={16} className="text-blue-600" />
                      </div>
                      <p className="text-sm font-semibold text-gray-600">Last Vitals</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">BP: {selectedPatient.lastVitals.bp}</p>
                    <p className="text-sm font-bold text-gray-900">Sugar: {selectedPatient.lastVitals.sugar}</p>
                    <p className="text-xs text-gray-400 mt-1">{selectedPatient.lastVitals.recorded}</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${selectedPatient.sosEvents > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                        <Zap size={16} className={selectedPatient.sosEvents > 0 ? 'text-red-600' : 'text-gray-400'} />
                      </div>
                      <p className="text-sm font-semibold text-gray-600">SOS Events</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{selectedPatient.sosEvents}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedPatient.sosEvents > 0
                        ? <span className="text-red-500 font-medium">Recent event — check</span>
                        : <span className="text-green-500 font-medium">No recent events</span>}
                    </p>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Adherence Donut */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <TrendingUp size={16} className="text-[#3D5A45]" /> Medication Adherence
                    </h3>
                    <div className="flex items-center gap-6">
                      <div className="h-32 w-32 relative flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={pieData} innerRadius={38} outerRadius={56} paddingAngle={3} dataKey="value" stroke="none">
                              {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold text-[#3D5A45]">{selectedPatient.adherence}%</span>
                        </div>
                      </div>
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2"><div className="w-3 h-3 bg-[#3D5A45] rounded-full" />Taken</span>
                          <span className="font-bold text-green-700">{selectedPatient.adherence}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2"><div className="w-3 h-3 bg-[#E07A5F] rounded-full" />Missed</span>
                          <span className="font-bold text-red-600">{100 - selectedPatient.adherence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Bar Chart */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Calendar size={16} className="text-[#3D5A45]" /> Weekly Trend
                    </h3>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={selectedPatient.weeklyData} barSize={22}>
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                          <YAxis hide />
                          <RechartsTooltip cursor={{ fill: '#f3f4f6' }} />
                          <Bar dataKey="val" fill="#3D5A45" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Activity Timeline + Care Notes Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Activity Log */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Clock size={16} className="text-[#3D5A45]" /> Activity Log
                    </h3>
                    <div className="space-y-3">
                      {selectedPatient.activityLog.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <ActivityIcon type={item.icon} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                            <p className="text-xs text-gray-500 truncate">{item.desc}</p>
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Care Notes */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <MessageSquare size={16} className="text-[#3D5A45]" /> Care Notes
                    </h3>
                    <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        placeholder="Add a care note..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3D5A45] focus:border-transparent"
                      />
                      <button type="submit" className="px-3 py-2 bg-[#3D5A45] text-white rounded-xl text-sm font-semibold hover:bg-[#324a3a] transition-colors">
                        Post
                      </button>
                    </form>
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {notes.map((n, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-sm text-gray-700">{n.note}</p>
                          <p className="text-xs text-gray-400 mt-1">{n.author} · {n.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
