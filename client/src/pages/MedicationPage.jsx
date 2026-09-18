import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pill, 
  Plus, 
  Check, 
  X, 
  Calendar,
  Clock,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Info,
  Search,
  Filter,
  FileText,
  Upload,
  User,
  Trash2,
  Edit2,
  AlertCircle,
  TrendingUp,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import useAuth from '../hooks/useAuth';
import { medicationService } from '../services/medicationService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

const timeSlots = [
  { id: 'Morning', label: 'Morning', icon: Sun, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'Afternoon', label: 'Afternoon', icon: CloudSun, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { id: 'Evening', label: 'Evening', icon: Sunset, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'Night', label: 'Night', icon: Moon, color: 'text-blue-600 bg-blue-50 border-blue-200' }
];

export default function MedicationPage() {
  const { user } = useAuth();
  const [medications, setMedications] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [adherenceStats, setAdherenceStats] = useState({ rate: 100, total: 0, taken: 0, missed: 0, skipped: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState({});

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [editingMed, setEditingMed] = useState(null);

  // Add/Edit Form State
  const [formData, setFormData] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'Daily',
    timeOfDay: 'Morning',
    foodInstruction: 'After Food',
    doctorName: '',
    instructions: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  // Prescription Form State
  const [prescriptionForm, setPrescriptionForm] = useState({
    fileName: '',
    doctorName: '',
    notes: '',
    fileType: 'image/jpeg',
    fileUrl: ''
  });

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [todayRes, allMedsRes, adhRes, prescRes] = await Promise.all([
        medicationService.getTodaySchedule().catch(() => ({ data: [] })),
        medicationService.getMedications().catch(() => ({ data: [] })),
        medicationService.getAdherenceStats().catch(() => ({ data: { rate: 100, total: 0, taken: 0, missed: 0, skipped: 0 } })),
        medicationService.getPrescriptions().catch(() => ({ data: [] }))
      ]);

      setMedications(todayRes.data?.length > 0 ? todayRes.data : allMedsRes.data || []);
      setAdherenceStats(adhRes.data || { rate: 100, total: 0, taken: 0, missed: 0, skipped: 0 });
      setPrescriptions(prescRes.data || []);
    } catch (err) {
      console.error('Fetch medications error:', err);
      setError('Unable to load medications. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleTake = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: 'taking' }));
    try {
      await medicationService.takeMedication(id);
      await fetchAllData();
    } catch (err) {
      console.error('Take med error:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleSkip = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: 'skipping' }));
    try {
      await medicationService.skipMedication(id);
      await fetchAllData();
    } catch (err) {
      console.error('Skip med error:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this medication?')) return;
    try {
      await medicationService.deleteMedication(id);
      fetchAllData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSaveMedication = async (e) => {
    e.preventDefault();
    try {
      if (editingMed) {
        await medicationService.updateMedication(editingMed._id, formData);
      } else {
        await medicationService.createMedication(formData);
      }
      setShowAddModal(false);
      setEditingMed(null);
      setFormData({
        medicineName: '',
        dosage: '',
        frequency: 'Daily',
        timeOfDay: 'Morning',
        foodInstruction: 'After Food',
        doctorName: '',
        instructions: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });
      fetchAllData();
    } catch (err) {
      console.error('Save medication error:', err);
    }
  };

  const handleUploadPrescription = async (e) => {
    e.preventDefault();
    try {
      await medicationService.createPrescription({
        fileName: prescriptionForm.fileName || 'Dr_Prescription_Card.jpg',
        doctorName: prescriptionForm.doctorName || 'Dr. Specialist',
        notes: prescriptionForm.notes || 'Routine follow-up prescription',
        fileType: prescriptionForm.fileType,
        fileUrl: prescriptionForm.fileUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600'
      });
      setShowPrescriptionModal(false);
      setPrescriptionForm({ fileName: '', doctorName: '', notes: '', fileType: 'image/jpeg', fileUrl: '' });
      fetchAllData();
    } catch (err) {
      console.error('Upload prescription error:', err);
    }
  };

  const handleDeletePrescription = async (id) => {
    if (!window.confirm('Delete this prescription?')) return;
    try {
      await medicationService.deletePrescription(id);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter and Search Logic
  const filteredMeds = medications.filter(med => {
    const matchesSearch = med.medicineName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          med.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          med.dosage?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || med.timeOfDay === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const todayTakenCount = medications.filter(m => m.todayStatus === 'Taken').length;
  const todayPendingCount = medications.filter(m => m.todayStatus === 'Pending' || !m.todayStatus).length;
  const todayMissedCount = medications.filter(m => m.todayStatus === 'Skipped' || m.todayStatus === 'Missed').length;

  const weeklyChartData = [
    { day: 'Mon', adherence: 100 },
    { day: 'Tue', adherence: 85 },
    { day: 'Wed', adherence: 100 },
    { day: 'Thu', adherence: 90 },
    { day: 'Fri', adherence: 95 },
    { day: 'Sat', adherence: 80 },
    { day: 'Sun', adherence: 100 }
  ];

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  if (loading && medications.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <LoadingSkeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <LoadingSkeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <LoadingSkeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error && medications.length === 0) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-12">
        <ErrorState message={error} onRetry={fetchAllData} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-xs gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-[#3D5A45] bg-[#eef3ef] px-3 py-1 rounded-full mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{currentDateFormatted}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Medication & Prescriptions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track daily doses, mark intake, and organize digital prescriptions
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPrescriptionModal(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs"
          >
            <Upload className="w-4 h-4 text-[#E07A5F]" />
            <span>Upload Prescription</span>
          </button>
          
          <button
            onClick={() => {
              setEditingMed(null);
              setFormData({
                medicineName: '',
                dosage: '',
                frequency: 'Daily',
                timeOfDay: 'Morning',
                foodInstruction: 'After Food',
                doctorName: '',
                instructions: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: ''
              });
              setShowAddModal(true);
            }}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-[#3D5A45] hover:bg-[#324a3a] text-white font-semibold rounded-xl text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medication</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[#eef3ef] text-[#3D5A45] flex items-center justify-center flex-shrink-0">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{medications.length}</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Scheduled</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-green-700">{todayTakenCount}</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Taken Today</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-700">{todayPendingCount}</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Doses</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-700">{adherenceStats.rate}%</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Adherence Rate</div>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-100">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medicine, doctor, or dosage..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#3D5A45] focus:bg-white transition-all"
          />
        </div>

        {/* Time Slot Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Morning', 'Afternoon', 'Evening', 'Night', 'Prescriptions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === tab
                  ? 'bg-[#3D5A45] text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tab Content: Prescriptions or Medication Schedule */}
      {activeFilter === 'Prescriptions' ? (
        /* Prescriptions Tab View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#3D5A45]" />
              <span>Uploaded Prescriptions ({prescriptions.length})</span>
            </h3>
            <button
              onClick={() => setShowPrescriptionModal(true)}
              className="text-xs font-bold text-[#3D5A45] hover:underline"
            >
              + Upload New
            </button>
          </div>

          {prescriptions.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-gray-700">No Prescriptions Uploaded</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Keep your physical prescriptions organized digitally by uploading photos or PDFs.
              </p>
              <button
                onClick={() => setShowPrescriptionModal(true)}
                className="mt-4 px-4 py-2 bg-[#3D5A45] text-white text-xs font-semibold rounded-xl"
              >
                Upload Prescription
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prescriptions.map((p) => (
                <div key={p._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 bg-[#eef3ef] text-[#3D5A45] rounded-xl">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">{p.fileName}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Prescribed by <strong>{p.doctorName}</strong></p>
                    {p.notes && <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded-lg">{p.notes}</p>}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <a
                      href={p.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#3D5A45] hover:text-[#24342a] flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Document</span>
                    </a>
                    <button
                      onClick={() => handleDeletePrescription(p._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Medication Schedule View Grouped by Time Slots */
        <div className="space-y-6">
          {filteredMeds.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-gray-100 text-center">
              <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-gray-800">No Medications Found</h4>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                {searchQuery ? 'No medications match your search query.' : 'You have no scheduled medications yet.'}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-5 py-2.5 bg-[#3D5A45] text-white text-sm font-semibold rounded-xl"
              >
                + Add First Medication
              </button>
            </div>
          ) : (
            timeSlots
              .filter(slot => activeFilter === 'All' || activeFilter === slot.id)
              .map(slot => {
                const SlotIcon = slot.icon;
                const slotMeds = filteredMeds.filter(m => m.timeOfDay === slot.id);

                if (slotMeds.length === 0 && activeFilter !== 'All') {
                  return (
                    <div key={slot.id} className="bg-white p-6 rounded-2xl border border-gray-100 text-center text-xs text-gray-500">
                      No {slot.label} medications scheduled.
                    </div>
                  );
                }
                if (slotMeds.length === 0) return null;

                return (
                  <div key={slot.id} className="space-y-3">
                    {/* Time Slot Section Header */}
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-1.5 rounded-lg border ${slot.color}`}>
                        <SlotIcon className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-gray-800 text-base">{slot.label} Routine</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                        {slotMeds.length}
                      </span>
                    </div>

                    {/* Medication Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {slotMeds.map((med) => {
                        const isTaken = med.todayStatus === 'Taken';
                        const isSkipped = med.todayStatus === 'Skipped';
                        const isActionBusy = actionLoading[med._id];

                        return (
                          <motion.div
                            key={med._id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-5 rounded-2xl border transition-all bg-white flex flex-col justify-between ${
                              isTaken 
                                ? 'border-green-300 shadow-xs bg-green-50/20' 
                                : isSkipped 
                                  ? 'border-gray-200 opacity-60' 
                                  : 'border-gray-200 hover:border-[#3D5A45]/40 shadow-xs'
                            }`}
                          >
                            <div>
                              {/* Top Bar: Name + Status */}
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-extrabold text-gray-900 text-base">{med.medicineName}</h4>
                                  <p className="text-xs font-semibold text-[#3D5A45] mt-0.5">{med.dosage}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  isTaken 
                                    ? 'bg-green-100 text-green-800' 
                                    : isSkipped 
                                      ? 'bg-gray-100 text-gray-600' 
                                      : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {med.todayStatus || 'Pending'}
                                </span>
                              </div>

                              {/* Details */}
                              <div className="space-y-1.5 text-xs text-gray-600 my-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-400 font-medium">Food Instruction:</span>
                                  <span className="font-semibold text-gray-700 bg-gray-50 px-2 py-0.5 rounded-md">
                                    {med.foodInstruction || 'After Food'}
                                  </span>
                                </div>
                                {med.doctorName && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-400 font-medium">Doctor:</span>
                                    <span className="text-gray-700">{med.doctorName}</span>
                                  </div>
                                )}
                                {med.instructions && (
                                  <div className="pt-1 text-gray-500 italic text-[11px] line-clamp-2">
                                    "{med.instructions}"
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                              <div className="flex items-center space-x-1.5 flex-1">
                                <button
                                  type="button"
                                  onClick={() => handleTake(med._id)}
                                  disabled={isTaken || isActionBusy}
                                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                                    isTaken
                                      ? 'bg-green-600 text-white cursor-default'
                                      : 'bg-[#3D5A45] hover:bg-[#324a3a] text-white shadow-xs'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{isTaken ? 'Taken ✓' : 'Mark Taken'}</span>
                                </button>

                                {!isTaken && (
                                  <button
                                    type="button"
                                    onClick={() => handleSkip(med._id)}
                                    disabled={isSkipped || isActionBusy}
                                    className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
                                    title="Skip dose"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => {
                                    setEditingMed(med);
                                    setFormData({
                                      medicineName: med.medicineName,
                                      dosage: med.dosage,
                                      frequency: med.frequency || 'Daily',
                                      timeOfDay: med.timeOfDay || 'Morning',
                                      foodInstruction: med.foodInstruction || 'After Food',
                                      doctorName: med.doctorName || '',
                                      instructions: med.instructions || '',
                                      startDate: med.startDate ? new Date(med.startDate).toISOString().split('T')[0] : '',
                                      endDate: med.endDate ? new Date(med.endDate).toISOString().split('T')[0] : ''
                                    });
                                    setShowAddModal(true);
                                  }}
                                  className="p-2 text-gray-400 hover:text-[#3D5A45] hover:bg-gray-100 rounded-lg"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(med._id)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* 5. Add / Edit Medication Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingMed ? 'Edit Medication' : 'Add New Medication'}
                </h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMedication} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Medicine Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.medicineName}
                    onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                    placeholder="e.g. Metformin, Amlodipine"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Dosage *</label>
                    <input
                      type="text"
                      required
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      placeholder="e.g. 500mg, 1 tablet"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Time Slot *</label>
                    <select
                      value={formData.timeOfDay}
                      onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45]"
                    >
                      <option value="Morning">Morning (8:00 AM)</option>
                      <option value="Afternoon">Afternoon (1:00 PM)</option>
                      <option value="Evening">Evening (6:00 PM)</option>
                      <option value="Night">Night (9:00 PM)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Food Timing</label>
                    <select
                      value={formData.foodInstruction}
                      onChange={(e) => setFormData({ ...formData, foodInstruction: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45]"
                    >
                      <option value="After Food">After Food</option>
                      <option value="Before Food">Before Food</option>
                      <option value="With Food">With Food</option>
                      <option value="Empty Stomach">Empty Stomach</option>
                      <option value="Anytime">Anytime</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Prescribing Doctor</label>
                    <input
                      type="text"
                      value={formData.doctorName}
                      onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                      placeholder="Dr. Sharma"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Instructions / Notes</label>
                  <textarea
                    rows={2}
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Take with a full glass of water..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45]"
                  />
                </div>

                <div className="flex space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#3D5A45] hover:bg-[#324a3a] text-white font-semibold rounded-xl text-sm shadow-sm"
                  >
                    {editingMed ? 'Update Medication' : 'Save Medication'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Upload Prescription Modal */}
      <AnimatePresence>
        {showPrescriptionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Upload Prescription</h3>
                <button 
                  onClick={() => setShowPrescriptionModal(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadPrescription} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Prescription Document Name *</label>
                  <input
                    type="text"
                    required
                    value={prescriptionForm.fileName}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, fileName: e.target.value })}
                    placeholder="e.g. Cardiology_Prescription_Sept.pdf"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Doctor Name</label>
                  <input
                    type="text"
                    value={prescriptionForm.doctorName}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, doctorName: e.target.value })}
                    placeholder="e.g. Dr. Ramesh Mehta"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Notes / Diagnosis</label>
                  <textarea
                    rows={2}
                    value={prescriptionForm.notes}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })}
                    placeholder="Prescribed for hypertension and cholesterol control..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45]"
                  />
                </div>

                {/* Dropzone mock */}
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-2xl text-center bg-gray-50/50">
                  <Upload className="w-8 h-8 text-[#E07A5F] mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-700">Attach file (PDF, JPG, PNG)</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Max size 10MB</p>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPrescriptionModal(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#3D5A45] hover:bg-[#324a3a] text-white font-semibold rounded-xl text-sm shadow-sm"
                  >
                    Save Prescription
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
