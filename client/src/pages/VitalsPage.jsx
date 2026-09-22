import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Heart, 
  Droplet, 
  Zap, 
  Scale, 
  Plus, 
  FileText, 
  Volume2, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  TrendingUp, 
  Calendar, 
  ShieldCheck, 
  Loader2,
  Printer
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import vitalsService from '../services/vitalsService';
import medicationService from '../services/medicationService';
import useAuth from '../hooks/useAuth';
import { speakText } from '../services/ttsService';

const VitalsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('BP'); // 'BP', 'BloodSugar', 'HeartRate', 'SpO2', 'Weight'
  const [vitalsSummary, setVitalsSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [medications, setMedications] = useState([]);

  // Form State
  const [type, setType] = useState('BP');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('mmHg');
  const [context, setContext] = useState('Routine');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchVitals = async () => {
    try {
      setLoading(true);
      const res = await vitalsService.getVitalsSummary();
      setVitalsSummary(res.data);
      
      const medsRes = await medicationService.getMedications();
      setMedications(medsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch vitals summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVitals();
  }, []);

  const handleTypeChange = (selectedType) => {
    setType(selectedType);
    if (selectedType === 'BP') setUnit('mmHg');
    else if (selectedType === 'BloodSugar') setUnit('mg/dL');
    else if (selectedType === 'HeartRate') setUnit('bpm');
    else if (selectedType === 'SpO2') setUnit('%');
    else if (selectedType === 'Weight') setUnit('kg');
  };

  const handleAddVital = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      await vitalsService.addVital({
        type,
        systolic: type === 'BP' ? Number(systolic) : undefined,
        diastolic: type === 'BP' ? Number(diastolic) : undefined,
        value: type !== 'BP' ? Number(value) : undefined,
        unit,
        context,
        notes
      });

      setShowAddModal(false);
      setSystolic('');
      setDiastolic('');
      setValue('');
      setNotes('');
      fetchVitals();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to log vital reading.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVital = async (id) => {
    try {
      await vitalsService.deleteVital(id);
      fetchVitals();
    } catch (err) {
      console.error('Failed to delete vital:', err);
    }
  };

  // 1-Click Health Passport PDF Print
  const handlePrintPassport = () => {
    window.print();
  };

  // Audio Readout of Vitals Summary
  const handleAudioReadout = () => {
    if (!vitalsSummary) return;
    const bp = vitalsSummary.BP?.latest;
    const sugar = vitalsSummary.BloodSugar?.latest;
    const hr = vitalsSummary.HeartRate?.latest;
    const spo2 = vitalsSummary.SpO2?.latest;

    let text = `Health Summary for ${user?.name || 'Senior'}. `;
    if (bp) text += `Blood Pressure is ${bp.systolic} over ${bp.diastolic} millimeter mercury. `;
    if (sugar) text += `Blood Sugar is ${sugar.value} milligram per deciliter. `;
    if (hr) text += `Heart Rate is ${hr.value} beats per minute. `;
    if (spo2) text += `Blood Oxygen level is ${spo2.value} percent. `;

    speakText(text);
  };

  const activeData = vitalsSummary?.[activeTab]?.history || [];
  const chartData = [...activeData].reverse().map(item => ({
    date: new Date(item.measuredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    val: item.type === 'BP' ? item.systolic : item.value,
    diastolic: item.type === 'BP' ? item.diastolic : undefined
  }));

  const vitalConfig = {
    BP: { label: 'Blood Pressure', icon: Activity, color: '#3D5A45', bg: 'bg-green-50', unit: 'mmHg' },
    BloodSugar: { label: 'Blood Sugar', icon: Droplet, color: '#E07A5F', bg: 'bg-orange-50', unit: 'mg/dL' },
    HeartRate: { label: 'Heart Rate', icon: Heart, color: '#D90429', bg: 'bg-red-50', unit: 'bpm' },
    SpO2: { label: 'Blood Oxygen (SpO2)', icon: Zap, color: '#0284C7', bg: 'bg-sky-50', unit: '%' },
    Weight: { label: 'Body Weight', icon: Scale, color: '#7C3AED', bg: 'bg-purple-50', unit: 'kg' }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Print-Only Health Passport Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #health-passport-print, #health-passport-print * { visibility: visible; }
          #health-passport-print { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#EEF3EF] text-[#3D5A45] rounded-full text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Vitals & Health Metrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Senior Health Tracker
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Monitor Blood Pressure, Sugar, Oxygen, Heart Rate & Generate Passport PDF
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAudioReadout}
            className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-2xl flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-[#3D5A45]" />
            <span>Listen Vitals</span>
          </button>

          <button
            onClick={handlePrintPassport}
            className="py-2.5 px-4 bg-[#EEF3EF] hover:bg-[#e2ebe4] text-[#3D5A45] font-bold text-xs rounded-2xl flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Health Passport PDF</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="py-2.5 px-4 bg-[#3D5A45] hover:bg-[#324a3a] text-white font-bold text-xs rounded-2xl flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Vital Reading</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {Object.keys(vitalConfig).map((key) => {
          const cfg = vitalConfig[key];
          const Icon = cfg.icon;
          const latest = vitalsSummary?.[key]?.latest;
          const isSelected = activeTab === key;

          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`p-4 rounded-3xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                isSelected 
                  ? 'bg-white border-[#3D5A45] ring-2 ring-[#3D5A45] shadow-md' 
                  : 'bg-white/80 border-gray-100 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-2xl ${cfg.bg}`}>
                  <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                </div>
                {latest?.isAbnormal && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-black rounded-md">
                    ALERT
                  </span>
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{cfg.label}</div>
                <div className="text-lg sm:text-xl font-black text-gray-900 mt-1">
                  {latest ? (
                    key === 'BP' ? `${latest.systolic}/${latest.diastolic}` : `${latest.value}`
                  ) : (
                    '--'
                  )}
                  <span className="text-xs font-normal text-gray-500 ml-1">{cfg.unit}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-[#3D5A45]" />
              <span>{vitalConfig[activeTab].label} Trend History</span>
            </h2>
            <p className="text-xs text-gray-500">Recent 10 readings</p>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#3D5A45] animate-spin" />
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-64 sm:h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="vitalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={vitalConfig[activeTab].color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={vitalConfig[activeTab].color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" domain={['auto', 'auto']} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="val" 
                  name={activeTab === 'BP' ? 'Systolic' : vitalConfig[activeTab].label}
                  stroke={vitalConfig[activeTab].color} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#vitalGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400">
            <Activity className="w-10 h-10 mb-2 stroke-1" />
            <p className="text-sm font-semibold">No readings logged for {vitalConfig[activeTab].label} yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-xs font-bold text-[#3D5A45] underline cursor-pointer"
            >
              Log First Reading
            </button>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <h3 className="text-base font-bold text-gray-900 mb-4">Detailed Readings Log</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Reading</th>
                <th className="py-3 px-4">Context</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activeData.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50/60 transition-all">
                  <td className="py-3.5 px-4 font-semibold text-gray-800">
                    {new Date(item.measuredAt).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#3D5A45]">{item.type}</td>
                  <td className="py-3.5 px-4 font-black text-gray-900">
                    {item.type === 'BP' ? `${item.systolic}/${item.diastolic} mmHg` : `${item.value} ${item.unit}`}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">{item.context}</td>
                  <td className="py-3.5 px-4">
                    {item.isAbnormal ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-lg inline-flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Abnormal</span>
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-lg inline-flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Normal</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteVital(item._id)}
                      className="text-gray-400 hover:text-red-600 cursor-pointer transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {activeData.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-400 text-xs font-medium">
                    No history recorded yet for this vital metric.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vital Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Log Health Vital Reading</h3>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleAddVital} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Select Metric Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45]"
                  >
                    <option value="BP">Blood Pressure (BP)</option>
                    <option value="BloodSugar">Blood Sugar</option>
                    <option value="HeartRate">Heart Rate</option>
                    <option value="SpO2">Blood Oxygen (SpO2)</option>
                    <option value="Weight">Body Weight</option>
                  </select>
                </div>

                {type === 'BP' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Systolic (mmHg)</label>
                      <input
                        type="number"
                        required
                        placeholder="120"
                        value={systolic}
                        onChange={(e) => setSystolic(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Diastolic (mmHg)</label>
                      <input
                        type="number"
                        required
                        placeholder="80"
                        value={diastolic}
                        onChange={(e) => setDiastolic(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45]"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                      Value ({unit})
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="Enter value"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Measurement Context
                  </label>
                  <select
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45]"
                  >
                    <option value="Routine">Routine Check</option>
                    <option value="Fasting">Fasting (Before Breakfast)</option>
                    <option value="PostMeal">Post Meal (2 hrs after food)</option>
                    <option value="Bedtime">Bedtime</option>
                    <option value="Random">Random / Unwell</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Notes / Symptoms (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Mild headache, felt relaxed"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45]"
                  />
                </div>

                <div className="flex space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-[#3D5A45] text-white font-bold text-xs rounded-xl hover:bg-[#324a3a] disabled:opacity-60 cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Reading</span>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden Print Container for Health Passport PDF */}
      <div id="health-passport-print" className="hidden print:block">
        <div className="border-4 border-[#3D5A45] p-6 rounded-3xl bg-white space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h1 className="text-3xl font-black text-[#3D5A45]">ZYVEN HEALTH PASSPORT</h1>
              <p className="text-sm font-bold text-gray-600">Official Patient Medical Summary Document</p>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold">Generated On: {new Date().toLocaleDateString()}</p>
              <p className="text-gray-500">ID: {user?._id?.slice(-8) || 'ZYV-8899'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl">
            <div>
              <p><strong>Patient Name:</strong> {user?.name || 'Ramesh Patel'}</p>
              <p><strong>Role / Category:</strong> {user?.role || 'Senior Patient'}</p>
              <p><strong>Email:</strong> {user?.email}</p>
            </div>
            <div>
              <p><strong>State / Region:</strong> {user?.state || 'All India'}</p>
              <p><strong>Emergency Contact:</strong> {user?.emergencyContacts?.[0]?.phone || 'Not Configured'}</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-[#3D5A45] mb-2 border-b pb-1">Latest Vitals Summary</h3>
            <table className="w-full text-left text-xs border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Vital Metric</th>
                  <th className="p-2 border">Latest Value</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Measured On</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(vitalConfig).map((key) => {
                  const item = vitalsSummary?.[key]?.latest;
                  return (
                    <tr key={key}>
                      <td className="p-2 border font-bold">{vitalConfig[key].label}</td>
                      <td className="p-2 border">{item ? (key === 'BP' ? `${item.systolic}/${item.diastolic} mmHg` : `${item.value} ${item.unit}`) : 'N/A'}</td>
                      <td className="p-2 border">{item?.isAbnormal ? 'Abnormal' : 'Normal'}</td>
                      <td className="p-2 border">{item ? new Date(item.measuredAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="font-bold text-[#3D5A45] mb-2 border-b pb-1">Active Prescribed Medications</h3>
            <ul className="list-disc pl-5 text-xs space-y-1">
              {medications.map((m) => (
                <li key={m._id}>
                  <strong>{m.medicineName}</strong> - {m.dosage} ({m.frequency}) - {m.foodInstruction}
                </li>
              ))}
              {medications.length === 0 && <li>No active medications listed.</li>}
            </ul>
          </div>

          <div className="text-center text-[10px] text-gray-400 border-t pt-4">
            Disclaimer: This Health Passport is generated automatically by ZYVEN Healthcare Platform for clinical reference only.
          </div>
        </div>
      </div>
    </div>
  );
};

export default VitalsPage;
