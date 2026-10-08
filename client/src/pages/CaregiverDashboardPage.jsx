import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Activity, Bell, ShieldAlert, Heart, Calendar, Clock,
  AlertTriangle, AlertCircle, CheckCircle, XCircle, Phone, FileText,
  PlusCircle, TrendingUp, Pill, Zap, ChevronRight, User, MessageSquare,
  Trash2, Search, X, Loader2, Sparkles
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis
} from 'recharts';
import useAuth from '../hooks/useAuth';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import patientService from '../services/patientService';
import careLogService from '../services/careLogService';

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
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState([]);

  // Modal State for Linking Patient
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [availablePatients, setAvailablePatients] = useState([]);
  const [linkInput, setLinkInput] = useState('');
  const [relationship, setRelationship] = useState('Father');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const res = await patientService.getLinkedPatients();
      const data = res?.data || res || [];
      setPatients(data);
      if (data.length > 0) {
        setSelectedPatient(data[0]);
        setNotes(data[0].careNotes || []);
      } else {
        setSelectedPatient(null);
        setNotes([]);
      }
    } catch (err) {
      console.error('Failed to load dynamic linked patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPatient) {
      setNotes(selectedPatient.careNotes || []);
    }
  }, [selectedPatient]);

  // Open Link Modal & fetch available registered patients
  const handleOpenLinkModal = async () => {
    setShowLinkModal(true);
    setLinkError('');
    setLinkSuccess('');
    setLinkInput('');
    try {
      const res = await patientService.getAvailablePatients();
      setAvailablePatients(res?.data || []);
    } catch (err) {
      console.error('Failed to fetch available patients:', err);
    }
  };

  // Handle Link Patient Submit
  const handleLinkPatient = async (targetUser = null) => {
    setLinkLoading(true);
    setLinkError('');
    setLinkSuccess('');

    try {
      let payload = { relationship };
      if (targetUser && targetUser._id) {
        payload.userId = targetUser._id;
      } else if (linkInput.includes('@')) {
        payload.email = linkInput.trim();
      } else if (linkInput.trim()) {
        payload.phone = linkInput.trim();
      } else {
        setLinkError('Please enter a valid patient email address or phone number.');
        setLinkLoading(false);
        return;
      }

      await patientService.linkPatient(payload);
      setLinkSuccess('Patient linked successfully!');
      
      // Reload dynamic list
      await loadPatients();
      
      setTimeout(() => {
        setShowLinkModal(false);
        setLinkSuccess('');
      }, 1200);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to link patient.';
      setLinkError(msg);
    } finally {
      setLinkLoading(false);
    }
  };

  // Handle Unlink Patient
  const handleUnlinkPatient = async (e, patientId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this linked patient from your care list?')) return;
    try {
      await patientService.unlinkPatient(patientId);
      const updated = patients.filter(p => p._id !== patientId);
      setPatients(updated);
      if (selectedPatient?._id === patientId) {
        setSelectedPatient(updated[0] || null);
      }
    } catch (err) {
      console.error('Failed to unlink patient', err);
    }
  };

  // Add Care Note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim() || !selectedPatient) return;

    const noteContent = noteText.trim();
    setNoteText('');

    // Optimistic UI update
    const newNoteObj = { author: 'You', note: noteContent, time: 'Just now' };
    setNotes(prev => [newNoteObj, ...prev]);

    try {
      await careLogService.addCareLog({
        seniorId: selectedPatient._id,
        note: noteContent
      });
    } catch (err) {
      console.error('Failed to save care log to server:', err);
    }
  };

  // Stats calculation
  const totalAlerts = patients.reduce((acc, p) => acc + (p.medications?.missed || 0) + (p.sosEvents || 0), 0);
  const avgAdherence = patients.length > 0 
    ? Math.round(patients.reduce((acc, p) => acc + (p.adherence || 0), 0) / patients.length) 
    : 100;
  const medsDueToday = patients.reduce((acc, p) => acc + Math.max(0, (p.medications?.total || 0) - (p.medications?.taken || 0)), 0);

  const pieData = [
    { name: 'Taken', value: selectedPatient?.adherence || 0, color: '#3D5A45' },
    { name: 'Missed', value: 100 - (selectedPatient?.adherence || 0), color: '#E07A5F' },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-7xl mx-auto">
        <LoadingSkeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <LoadingSkeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <LoadingSkeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF7] min-h-screen font-sans pb-16">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#3D5A45] to-[#4a7057] px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3 tracking-tight">
                <Users size={28} className="text-[#E07A5F]" /> Caregiver Command Center
              </h1>
              <p className="mt-1 text-green-100 text-xs sm:text-sm font-medium">
                Welcome back, {user?.name || 'Caregiver'} — monitoring {patients.length} dynamic patient{patients.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleOpenLinkModal}
                className="bg-white text-[#3D5A45] hover:bg-green-50 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-md flex items-center space-x-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#E07A5F]" />
                <span>Link Patient</span>
              </button>

              {totalAlerts > 0 && (
                <div className="bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 animate-pulse shadow-md">
                  <Bell size={14} /> {totalAlerts} Alert{totalAlerts !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-10">

        {/* ── Stats Bar ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Users} label="Linked Patients" value={patients.length} sub="Real dynamic connections" color="bg-[#3D5A45]" />
          <StatCard icon={Pill} label="Medications Due" value={medsDueToday} sub="Across all patients" color="bg-[#E07A5F]" />
          <StatCard icon={Bell} label="Active Alerts" value={totalAlerts} sub={totalAlerts > 0 ? 'Needs attention' : 'All clear'} color={totalAlerts > 0 ? 'bg-red-500' : 'bg-emerald-600'} />
          <StatCard icon={TrendingUp} label="Avg Adherence" value={`${avgAdherence}%`} sub="Real health average" color="bg-blue-600" />
        </div>

        {/* ── Main Grid ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Patient List Sidebar ──────────────────────────────────────── */}
          <div className="lg:w-72 xl:w-80 flex-shrink-0 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-extrabold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Users size={16} className="text-[#3D5A45]" /> Linked Patients
                </h3>
                <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {patients.length} Live
                </span>
              </div>

              <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                {patients.length > 0 ? (
                  patients.map(p => {
                    const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.Good;
                    const isSelected = selectedPatient?._id === p._id;
                    return (
                      <div
                        key={p._id}
                        onClick={() => setSelectedPatient(p)}
                        className={`w-full text-left p-4 transition-all cursor-pointer relative group ${
                          isSelected ? 'bg-[#EEF3EF] border-l-4 border-[#3D5A45]' : 'hover:bg-gray-50/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-[#3D5A45] text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-xs">
                            {p.name?.charAt(0) || 'P'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-gray-900 text-sm truncate">{p.name}</p>
                              <div className="flex items-center space-x-1.5">
                                <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                                <button
                                  type="button"
                                  onClick={(e) => handleUnlinkPatient(e, p._id)}
                                  title="Unlink patient"
                                  className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">{p.relation || 'Patient'} · {p.age || 65} yrs</p>
                            <div className="mt-1.5 flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                <div className="bg-[#3D5A45] h-1.5 rounded-full transition-all" style={{ width: `${p.adherence || 0}%` }} />
                              </div>
                              <span className="text-xs font-bold text-gray-600">{p.adherence || 0}%</span>
                            </div>
                          </div>
                        </div>

                        {p.medications?.missed > 0 && (
                          <div className="mt-2 text-xs text-red-600 font-bold flex items-center gap-1 bg-red-50 p-1.5 rounded-lg border border-red-100">
                            <AlertTriangle size={12} /> {p.medications.missed} missed dose{p.medications.missed !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center space-y-3">
                    <User className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="text-xs text-gray-500 font-semibold">No patients linked yet.</p>
                    <p className="text-[11px] text-gray-400">Click below to link a senior or patient account dynamically!</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={handleOpenLinkModal}
                  className="w-full py-2.5 border-2 border-dashed border-[#3D5A45]/40 rounded-xl text-[#3D5A45] text-xs font-extrabold hover:bg-[#3D5A45] hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <PlusCircle size={16} /> Link New Patient
                </button>
              </div>
            </div>
          </div>

          {/* ── Patient Detail Panel ──────────────────────────────────────── */}
          <div className="flex-1">
            {selectedPatient ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedPatient._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* Patient Header */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-gradient-to-br from-[#3D5A45] to-[#4a7057] text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm">
                          {selectedPatient.name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{selectedPatient.name}</h2>
                          <p className="text-xs text-gray-500 font-medium">
                            {selectedPatient.relation || 'Patient'} · {selectedPatient.age || 65} years old · {selectedPatient.phone || 'Phone not set'}
                          </p>
                          <div className="mt-1 flex items-center space-x-2">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${STATUS_CONFIG[selectedPatient.status]?.bg} ${STATUS_CONFIG[selectedPatient.status]?.text}`}>
                              <div className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[selectedPatient.status]?.dot}`} />
                              {selectedPatient.status} Status
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              ID: {selectedPatient?._id ? String(selectedPatient._id).slice(-6) : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {selectedPatient.phone && selectedPatient.phone !== 'N/A' && (
                          <a href={`tel:${selectedPatient.phone}`} className="flex items-center gap-2 px-4 py-2 bg-[#3D5A45] text-white rounded-xl text-xs font-bold hover:bg-[#324a3a] transition-colors shadow-2xs">
                            <Phone size={15} /> Call Patient
                          </a>
                        )}
                        <button 
                          onClick={() => window.location.href = '/reports'}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
                        >
                          <FileText size={15} /> Medical Reports
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
                        <p className="text-xs font-extrabold text-gray-600 uppercase tracking-wider">Today's Meds</p>
                      </div>
                      <p className="text-2xl font-black text-gray-900">
                        {selectedPatient.medications?.taken || 0}/{selectedPatient.medications?.total || 1}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(selectedPatient.medications?.missed || 0) > 0
                          ? <span className="text-red-500 font-bold">{selectedPatient.medications.missed} missed dose(s)</span>
                          : <span className="text-green-600 font-bold">All taken ✓</span>}
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Activity size={16} className="text-blue-600" />
                        </div>
                        <p className="text-xs font-extrabold text-gray-600 uppercase tracking-wider">Last Vitals</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">BP: {selectedPatient.lastVitals?.bp || '120/80'}</p>
                      <p className="text-sm font-bold text-gray-900">Sugar: {selectedPatient.lastVitals?.sugar || '100 mg/dL'}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{selectedPatient.lastVitals?.recorded || 'Recorded today'}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${(selectedPatient.sosEvents || 0) > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                          <Zap size={16} className={(selectedPatient.sosEvents || 0) > 0 ? 'text-red-600' : 'text-gray-400'} />
                        </div>
                        <p className="text-xs font-extrabold text-gray-600 uppercase tracking-wider">SOS Alerts</p>
                      </div>
                      <p className="text-2xl font-black text-gray-900">{selectedPatient.sosEvents || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(selectedPatient.sosEvents || 0) > 0
                          ? <span className="text-red-500 font-bold">Active SOS event</span>
                          : <span className="text-emerald-600 font-bold">No active emergency</span>}
                      </p>
                    </div>
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Adherence Donut */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                      <h3 className="font-extrabold text-gray-800 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
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
                            <span className="text-xl font-black text-[#3D5A45]">{selectedPatient.adherence || 0}%</span>
                          </div>
                        </div>
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="flex items-center gap-2"><div className="w-3 h-3 bg-[#3D5A45] rounded-full" />Taken</span>
                            <span className="text-green-700">{selectedPatient.adherence || 0}%</span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="flex items-center gap-2"><div className="w-3 h-3 bg-[#E07A5F] rounded-full" />Missed</span>
                            <span className="text-red-600">{100 - (selectedPatient.adherence || 0)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Weekly Bar Chart */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                      <h3 className="font-extrabold text-gray-800 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                        <Calendar size={16} className="text-[#3D5A45]" /> Weekly Health Trend
                      </h3>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={selectedPatient.weeklyData || []} barSize={22}>
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
                      <h3 className="font-extrabold text-gray-800 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                        <Clock size={16} className="text-[#3D5A45]" /> Live Activity Log
                      </h3>
                      <div className="space-y-3 max-h-56 overflow-y-auto">
                        {(selectedPatient.activityLog || []).map((item, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <ActivityIcon type={item.icon} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900">{item.label}</p>
                              <p className="text-[11px] text-gray-500 truncate">{item.desc}</p>
                            </div>
                            <span className="text-[10px] font-semibold text-gray-400 flex-shrink-0">{item.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Care Notes */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                      <h3 className="font-extrabold text-gray-800 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
                        <MessageSquare size={16} className="text-[#3D5A45]" /> Care Notes Log
                      </h3>
                      <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
                        <input
                          type="text"
                          value={noteText}
                          onChange={e => setNoteText(e.target.value)}
                          placeholder="Post a care note for patient..."
                          className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3D5A45]"
                        />
                        <button 
                          type="submit" 
                          disabled={!noteText.trim()}
                          className="px-3 py-2 bg-[#3D5A45] text-white rounded-xl text-xs font-bold hover:bg-[#324a3a] transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          Post
                        </button>
                      </form>
                      <div className="space-y-2.5 max-h-40 overflow-y-auto">
                        {notes.length > 0 ? (
                          notes.map((n, i) => (
                            <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                              <p className="text-xs text-gray-800 font-medium">{n.note}</p>
                              <p className="text-[10px] text-gray-400 font-semibold mt-1">{n.author} · {n.time}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-400 text-center py-4">No care notes posted yet.</p>
                        )}
                      </div>
                    </div>
                  </div>

                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 space-y-4">
                <Users className="w-16 h-16 text-[#3D5A45]/30 mx-auto" />
                <h3 className="text-lg font-bold text-gray-800">No Patient Selected</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Click "+ Link New Patient" to connect a patient or senior user to your caregiver account.
                </p>
                <button
                  onClick={handleOpenLinkModal}
                  className="px-5 py-2.5 bg-[#3D5A45] text-white rounded-xl text-xs font-extrabold shadow-md hover:bg-[#324a3a] transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle size={16} /> Link Your First Patient
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── LINK NEW PATIENT MODAL ────────────────────────────────────────────── */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-gray-100 relative"
          >
            <button
              onClick={() => setShowLinkModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#EEF3EF] text-[#3D5A45] flex items-center justify-center mb-2">
                <PlusCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Link New Patient</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Connect a patient or senior by entering their email/phone or selecting from registered users.
              </p>
            </div>

            {linkError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{linkError}</span>
              </div>
            )}

            {linkSuccess && (
              <div className="p-3 bg-green-50 text-green-700 text-xs rounded-xl border border-green-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{linkSuccess}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Relationship to Patient
                </label>
                <select
                  value={relationship}
                  onChange={e => setRelationship(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 font-bold focus:ring-2 focus:ring-[#3D5A45] outline-none"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Grandparent">Grandparent</option>
                  <option value="Relative">Relative</option>
                  <option value="Patient">Patient</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Patient Email or Phone Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={linkInput}
                    onChange={e => setLinkInput(e.target.value)}
                    placeholder="Enter email (e.g. senior@gmail.com) or phone"
                    className="flex-1 px-3 py-2.5 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3D5A45]"
                  />
                  <button
                    onClick={() => handleLinkPatient()}
                    disabled={linkLoading || !linkInput.trim()}
                    className="px-4 py-2.5 bg-[#3D5A45] text-white rounded-xl text-xs font-extrabold hover:bg-[#324a3a] transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                  >
                    {linkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Link</span>}
                  </button>
                </div>
              </div>

              {/* Registered Users Selection */}
              {availablePatients.length > 0 && (
                <div className="pt-2">
                  <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">
                    Available Registered Users:
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {availablePatients.map(ap => (
                      <div
                        key={ap._id}
                        onClick={() => handleLinkPatient(ap)}
                        className="p-2.5 rounded-xl border border-gray-200 hover:border-[#3D5A45] hover:bg-[#EEF3EF] flex items-center justify-between cursor-pointer transition-all"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <div className="w-7 h-7 rounded-full bg-[#3D5A45] text-white font-bold text-xs flex items-center justify-center">
                            {ap.name?.charAt(0) || 'U'}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-gray-900 truncate">{ap.name}</p>
                            <p className="text-[10px] text-gray-500 truncate">{ap.email}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-extrabold text-[#3D5A45] bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-2xs">
                          + Link
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
