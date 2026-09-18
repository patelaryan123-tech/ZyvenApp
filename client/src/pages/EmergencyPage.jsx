import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  X, 
  History, 
  UserPlus,
  ShieldAlert,
  Radio,
  CheckCircle2,
  Trash2,
  Clock,
  Compass,
  Volume2,
  VolumeX,
  AlertOctagon,
  RefreshCw,
  PhoneCall
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useGeolocation from '../hooks/useGeolocation';
import useSocket from '../hooks/useSocket';
import { emergencyService } from '../services/emergencyService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';

export default function EmergencyPage() {
  const { user } = useAuth();
  const { location: geoLoc } = useGeolocation();
  const socket = useSocket();

  const [activeEmergency, setActiveEmergency] = useState(null);
  const [history, setHistory] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // SOS Press-and-hold states
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
  const holdIntervalRef = useRef(null);

  // 5-Second Countdown State
  const [countdown, setCountdown] = useState(null); // null or number
  const countdownIntervalRef = useRef(null);

  // Add Contact Modal
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: 'Family Member'
  });

  // Fall Detection Simulation state
  const [fallSimulated, setFallSimulated] = useState(false);

  const fetchEmergencyData = async () => {
    setLoading(true);
    setError('');
    try {
      const [histRes, actRes, contRes] = await Promise.all([
        emergencyService.getEmergencyHistory().catch(() => ({ data: [] })),
        emergencyService.getActiveEmergency().catch(() => ({ data: null })),
        emergencyService.getContacts().catch(() => ({ data: [] }))
      ]);

      setHistory(histRes.data || []);
      setActiveEmergency(actRes.data || null);
      setContacts(contRes.data || user?.emergencyContacts || []);
    } catch (err) {
      console.error('Fetch emergency data error:', err);
      setError('Unable to load emergency center. Please verify connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyData();
  }, []);

  // Listen for realtime emergency events via socket
  useEffect(() => {
    if (socket) {
      socket.on('emergency_alert', (event) => {
        setActiveEmergency(event);
        fetchEmergencyData();
      });
      socket.on('emergency_cancelled', () => {
        setActiveEmergency(null);
        fetchEmergencyData();
      });
    }
  }, [socket]);

  // Handle Press & Hold
  const handleMouseDown = () => {
    if (activeEmergency) return;
    setIsHolding(true);
    setHoldProgress(0);

    const startTime = Date.now();
    const duration = 2500; // 2.5 seconds hold

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setHoldProgress(pct);

      if (pct >= 100) {
        clearInterval(holdIntervalRef.current);
        setIsHolding(false);
        setHoldProgress(0);
        startCountdown();
      }
    }, 50);
  };

  const handleMouseUp = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  // Start 5s countdown
  const startCountdown = () => {
    setCountdown(5);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          dispatchEmergency('SOS');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cancel during countdown
  const cancelCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setCountdown(null);
  };

  // Dispatch Emergency to Backend
  const dispatchEmergency = async (type = 'SOS') => {
    try {
      const locationData = {
        latitude: geoLoc?.latitude || 22.5726,
        longitude: geoLoc?.longitude || 88.3639,
        address: geoLoc ? `GPS: ${geoLoc.latitude.toFixed(4)}, ${geoLoc.longitude.toFixed(4)}` : 'Current Registered Location'
      };

      const res = await emergencyService.triggerSOS({
        eventType: type,
        location: locationData
      });

      setActiveEmergency(res.data);
      fetchEmergencyData();
    } catch (err) {
      console.error('Dispatch SOS error:', err);
    }
  };

  // Cancel Active Emergency
  const handleCancelActiveSOS = async () => {
    if (!activeEmergency) return;
    try {
      await emergencyService.cancelSOS(activeEmergency._id);
      setActiveEmergency(null);
      fetchEmergencyData();
    } catch (err) {
      console.error('Cancel SOS error:', err);
    }
  };

  // Resolve Active Emergency
  const handleResolveSOS = async () => {
    if (!activeEmergency) return;
    try {
      await emergencyService.resolveSOS(activeEmergency._id);
      setActiveEmergency(null);
      fetchEmergencyData();
    } catch (err) {
      console.error('Resolve SOS error:', err);
    }
  };

  // Add Contact
  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const res = await emergencyService.addContact(contactForm);
      setContacts(res.data || []);
      setShowAddContactModal(false);
      setContactForm({ name: '', phone: '', email: '', relationship: 'Family Member' });
    } catch (err) {
      console.error('Add contact error:', err);
    }
  };

  // Delete Contact
  const handleDeleteContact = async (id) => {
    try {
      const res = await emergencyService.deleteContact(id);
      setContacts(res.data || []);
    } catch (err) {
      console.error('Delete contact error:', err);
    }
  };

  // Fall Detection Simulation
  const handleSimulateFall = () => {
    setFallSimulated(true);
    startCountdown();
  };

  if (loading && history.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <LoadingSkeleton className="h-28 w-full rounded-3xl" />
        <LoadingSkeleton className="h-80 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-xs gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-[#D90429] bg-red-50 px-3 py-1 rounded-full mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>24/7 Rapid Emergency Response Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Emergency SOS & Safety Alert
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Instant priority broadcast to registered caregivers, family members & medical dispatch
          </p>
        </div>

        {/* GPS location preview */}
        <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-200 text-xs">
          <MapPin className="w-4 h-4 text-[#D90429] flex-shrink-0" />
          <div>
            <span className="font-bold text-gray-800 block">
              {geoLoc ? `${geoLoc.latitude.toFixed(4)}, ${geoLoc.longitude.toFixed(4)}` : 'GPS Coordinates Active'}
            </span>
            <span className="text-[11px] text-gray-400">Emergency Geolocation</span>
          </div>
        </div>
      </div>

      {/* 2. Active Emergency Live Alert Banner */}
      {activeEmergency && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#D90429] text-white p-6 rounded-3xl shadow-lg border-2 border-red-400 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 animate-bounce">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-red-200">
                ACTIVE EMERGENCY EVENT TRIGGERED
              </div>
              <h3 className="text-xl font-extrabold text-white">
                Emergency Alert Sent to {activeEmergency.contactedPeople?.length || contacts.length} Contacts
              </h3>
              <p className="text-xs text-red-100 mt-0.5">
                Triggered at {new Date(activeEmergency.triggeredAt || activeEmergency.createdAt).toLocaleTimeString()} &bull; Real-time Caregiver broadcast live
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button
              onClick={handleCancelActiveSOS}
              className="flex-1 md:flex-none px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl text-xs backdrop-blur-sm transition-all cursor-pointer"
            >
              Cancel Alert
            </button>
            <button
              onClick={handleResolveSOS}
              className="flex-1 md:flex-none px-6 py-2.5 bg-white text-[#D90429] hover:bg-gray-100 font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              I Am Safe Now (Resolve)
            </button>
          </div>
        </motion.div>
      )}

      {/* 3. Main SOS Center & Interactive Trigger Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Big Obvious Circular SOS Trigger */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden">
          
          <div className="max-w-md w-full flex flex-col items-center">
            <h2 className="text-xl font-extrabold text-gray-900 mb-1">
              Press & Hold SOS Button
            </h2>
            <p className="text-xs text-gray-500 mb-8 max-w-xs">
              Hold the button for 2.5 seconds to dispatch your emergency contacts with real-time GPS location
            </p>

            {/* Circular SOS Button with Animated Progress Ring */}
            <div className="relative w-56 h-56 flex items-center justify-center mb-6 select-none">
              {/* SVG Ring */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="112"
                  cy="112"
                  r="96"
                  stroke="#FEE2E2"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="112"
                  cy="112"
                  r="96"
                  stroke="#D90429"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={603}
                  strokeDashoffset={603 - (603 * holdProgress) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-75"
                />
              </svg>

              {/* Inner Button */}
              <button
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchEnd={handleMouseUp}
                disabled={!!activeEmergency}
                className={`absolute w-40 h-40 rounded-full bg-[#D90429] hover:bg-[#b90323] active:scale-95 text-white font-black text-2xl tracking-widest shadow-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isHolding ? 'scale-95 ring-8 ring-red-200' : ''
                } disabled:opacity-50`}
              >
                <AlertOctagon className="w-9 h-9 mb-1" />
                <span>SOS</span>
                <span className="text-[10px] font-normal tracking-normal opacity-80 mt-0.5">
                  {isHolding ? `${Math.round(holdProgress)}%` : 'HOLD 2.5s'}
                </span>
              </button>
            </div>

            <p className="text-xs text-gray-400 font-medium">
              Designed with deliberate interaction to avoid false triggers
            </p>

            {/* Fall Detection Sensor / Simulation Card */}
            <div className="w-full mt-8 p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-amber-900">Fall Detection Simulator</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded">DEMO MODE</span>
                </div>
                <p className="text-[11px] text-amber-700 mt-0.5">Simulate sudden drop or impact detection</p>
              </div>

              <button
                onClick={handleSimulateFall}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
              >
                Simulate Fall ⚠️
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Configured Emergency Contacts */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center space-x-2">
                <PhoneCall className="w-4 h-4 text-[#D90429]" />
                <span>Emergency Contacts ({contacts.length})</span>
              </h3>
              <button
                onClick={() => setShowAddContactModal(true)}
                className="text-xs font-bold text-[#3D5A45] hover:underline"
              >
                + Add Contact
              </button>
            </div>

            {contacts.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-2xl border border-gray-200 text-gray-500">
                <UserPlus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-semibold">No emergency contacts added yet</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Add family members, caregivers, or doctors</p>
                <button
                  onClick={() => setShowAddContactModal(true)}
                  className="mt-3 px-3 py-1.5 bg-[#3D5A45] text-white text-xs font-bold rounded-xl"
                >
                  Add First Contact
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((c, idx) => (
                  <div key={idx} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900 text-sm">{c.name}</span>
                        <span className="text-[10px] font-bold text-gray-500 bg-white border px-1.5 py-0.5 rounded">
                          {c.relationship}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                        <p>📞 {c.phone}</p>
                        {c.email && <p className="text-[11px] text-gray-400">✉️ {c.email}</p>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <a
                        href={`tel:${c.phone}`}
                        className="p-2 bg-[#eef3ef] text-[#3D5A45] hover:bg-[#d8e6dc] rounded-xl text-xs font-bold"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      {c._id && (
                        <button
                          onClick={() => handleDeleteContact(c._id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-xl"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Guidance Box */}
          <div className="bg-[#eef3ef] p-5 rounded-3xl border border-[#3D5A45]/20 text-xs text-[#3D5A45] space-y-1.5">
            <span className="font-bold uppercase tracking-wider text-[11px] block">Emergency Protocol:</span>
            <p>1. In-app loud alert & GPS dispatch are sent immediately.</p>
            <p>2. Automated HTML email with Google Maps directions is delivered to all listed contacts.</p>
            <p>3. Always dial 112 / 108 for national emergency services if immediate paramedic attention is required.</p>
          </div>
        </div>

      </div>

      {/* 4. Emergency History Log */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
          <History className="w-4 h-4 text-[#3D5A45]" />
          <span>Emergency Event History</span>
        </h3>

        {history.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">
            No past emergency events recorded on this account.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {history.slice(0, 5).map((item) => (
              <div key={item._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900">{item.eventType} Alert</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      item.status === 'Resolved' 
                        ? 'bg-green-100 text-green-800' 
                        : item.status === 'Cancelled'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-gray-400 mt-0.5">
                    {new Date(item.triggeredAt || item.createdAt).toLocaleString()} &bull; {item.location?.address || 'GPS Coordinates Captured'}
                  </p>
                </div>
                <span className="text-[11px] text-gray-500 font-medium">
                  {item.contactedPeople?.length || 0} Contacts Notified
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. 5-Second Countdown Override Modal */}
      <AnimatePresence>
        {countdown !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl border-4 border-[#D90429]"
            >
              <div className="w-24 h-24 rounded-full bg-red-100 text-[#D90429] font-black text-5xl flex items-center justify-center mx-auto mb-4 animate-ping">
                {countdown}
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-1">
                Triggering SOS in {countdown}s
              </h2>
              <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                Emergency alert and GPS coordinates will be dispatched to your registered caregivers.
              </p>

              <button
                onClick={cancelCountdown}
                className="w-full py-4 bg-gray-900 hover:bg-black text-white font-extrabold rounded-2xl text-base shadow-lg cursor-pointer"
              >
                CANCEL EMERGENCY ❌
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Add Contact Modal */}
      <AnimatePresence>
        {showAddContactModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Add Emergency Contact</h3>
                <button 
                  onClick={() => setShowAddContactModal(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddContact} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="e.g. Dr. Ramesh / Priya Patel"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#D90429]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#D90429]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="contact@example.com (for instant alerts)"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#D90429]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Relationship</label>
                  <select
                    value={contactForm.relationship}
                    onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#D90429]"
                  >
                    <option value="Daughter">Daughter</option>
                    <option value="Son">Son</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Caregiver">Caregiver</option>
                    <option value="Primary Doctor">Primary Doctor</option>
                    <option value="Neighbor">Neighbor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddContactModal(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#D90429] hover:bg-[#b90323] text-white font-bold rounded-xl text-sm shadow-sm"
                  >
                    Save Contact
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
