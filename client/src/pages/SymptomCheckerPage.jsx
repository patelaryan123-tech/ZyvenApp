import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Volume2, 
  Loader2, 
  PhoneCall, 
  ShieldCheck, 
  ArrowRight,
  Info,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import triageService from '../services/triageService';
import useAuth from '../hooks/useAuth';
import { speakText } from '../services/ttsService';

const commonSymptomsList = [
  'Dizziness & Lightheadedness',
  'Joint or Knee Pain',
  'Chest Pressure / Tightness',
  'Shortness of Breath',
  'Headache',
  'Extreme Fatigue',
  'Nausea or Stomach Upset',
  'High Fever',
  'Back Pain',
  'Difficulty Sleeping'
];

const SymptomCheckerPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [duration, setDuration] = useState('1 to 2 Days');
  const [severity, setSeverity] = useState(5);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms([...selectedSymptoms, customSymptom.trim()]);
      setCustomSymptom('');
    }
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedSymptoms.length === 0) {
      setErrorMsg('Please select or type at least one symptom.');
      return;
    }

    setEvaluating(true);
    try {
      const res = await triageService.evaluateSymptoms({
        symptoms: selectedSymptoms,
        age: user?.age || 65,
        gender: user?.gender || 'Unspecified',
        duration,
        severity,
        existingConditions: []
      });

      setResult(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to evaluate symptoms.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleAudioReadout = () => {
    if (!result) return;
    const text = `Symptom Evaluation Results. Urgency level is ${result.urgencyLevel}. ${result.summary}. Recommended actions include: ${result.recommendedActions.join('. ')}`;
    speakText(text);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#EEF3EF] text-[#3D5A45] rounded-full text-xs font-bold mb-2">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>AI Senior Triage Assistant</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            AI Symptom Checker
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Get instant, preliminary healthcare risk assessment & guidance before visiting your doctor
          </p>
        </div>

        {result && (
          <button
            onClick={() => { setResult(null); setSelectedSymptoms([]); }}
            className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl flex items-center space-x-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Check New Symptoms</span>
          </button>
        )}
      </div>

      {!result ? (
        /* Symptom Selection Form */
        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleEvaluate} 
          className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs"
        >
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* 1. Quick Select Common Symptoms */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              1. Select What You Are Experiencing
            </label>
            <div className="flex flex-wrap gap-2">
              {commonSymptomsList.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`py-2 px-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                      isSelected 
                        ? 'bg-[#3D5A45] text-white border-[#3D5A45] shadow-xs' 
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Symptom Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Or Type Other Symptoms
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                placeholder="e.g. Swollen ankles, Blurred vision"
                className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45]"
              />
              <button
                type="button"
                onClick={handleAddCustom}
                className="py-3 px-5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Selected Symptoms Chips */}
          {selectedSymptoms.length > 0 && (
            <div className="p-4 bg-[#EEF3EF] rounded-2xl border border-[#3D5A45]/20">
              <div className="text-xs font-bold text-[#3D5A45] uppercase tracking-wider mb-2">
                Selected Symptoms ({selectedSymptoms.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map((s) => (
                  <span 
                    key={s} 
                    className="px-3 py-1 bg-white text-gray-800 text-xs font-bold rounded-xl border border-gray-200 flex items-center space-x-1"
                  >
                    <span>{s}</span>
                    <button 
                      type="button" 
                      onClick={() => toggleSymptom(s)} 
                      className="text-gray-400 hover:text-red-500 ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 2. Duration & Severity Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                2. Symptom Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45]"
              >
                <option value="Started Today">Started Today</option>
                <option value="1 to 2 Days">1 to 2 Days</option>
                <option value="3 to 7 Days">3 to 7 Days</option>
                <option value="More than 1 Week">More than 1 Week</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  3. Discomfort Level (1 to 10)
                </label>
                <span className="text-sm font-black text-[#E07A5F]">{severity} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#3D5A45]"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={evaluating || selectedSymptoms.length === 0}
            className="w-full py-4 bg-[#3D5A45] hover:bg-[#324a3a] text-white font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer text-sm"
          >
            {evaluating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Evaluating Symptoms with AI...</span>
              </>
            ) : (
              <>
                <span>EVALUATE SYMPTOMS WITH AI</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </motion.form>
      ) : (
        /* Evaluation Results Card */
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Urgency Badge Banner */}
          <div className={`p-6 rounded-3xl border flex items-center justify-between ${
            result.urgencyLevel === 'Urgent' 
              ? 'bg-red-50 border-red-200 text-red-900' 
              : result.urgencyLevel === 'Moderate'
              ? 'bg-orange-50 border-orange-200 text-orange-900'
              : 'bg-green-50 border-green-200 text-green-900'
          }`}>
            <div className="flex items-center space-x-3">
              {result.urgencyLevel === 'Urgent' ? (
                <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-[#3D5A45] flex-shrink-0" />
              )}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider">Evaluation Urgency Level</span>
                <h2 className="text-2xl font-black">{result.urgencyLevel} Urgency</h2>
              </div>
            </div>

            <button
              onClick={handleAudioReadout}
              className="p-3 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs rounded-2xl border border-gray-200 flex items-center space-x-2 cursor-pointer shadow-xs"
            >
              <Volume2 className="w-4 h-4 text-[#3D5A45]" />
              <span className="hidden sm:inline">Listen Result</span>
            </button>
          </div>

          {/* Urgent SOS Escalation */}
          {result.urgencyLevel === 'Urgent' && (
            <div className="p-5 bg-red-600 text-white rounded-3xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <PhoneCall className="w-6 h-6 animate-bounce" />
                <div>
                  <h3 className="font-bold text-base">Immediate Attention Advised</h3>
                  <p className="text-xs opacity-90">If you are feeling acute distress, trigger emergency SOS or call 112.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/emergency')}
                className="py-2.5 px-5 bg-white text-red-700 font-black text-xs rounded-xl shadow-xs hover:bg-gray-100 cursor-pointer"
              >
                TRIGGER SOS NOW
              </button>
            </div>
          )}

          {/* Analysis Breakdown */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">AI Assessment Summary</h3>
              <p className="text-base font-semibold text-gray-900 leading-relaxed">{result.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <HelpCircle className="w-4 h-4 text-[#3D5A45]" />
                  <span>Possible Causes</span>
                </h4>
                <ul className="list-disc pl-5 text-xs text-gray-700 space-y-1">
                  {result.possibleCauses?.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>

              <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100">
                <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Red Flag Symptoms to Watch For</span>
                </h4>
                <ul className="list-disc pl-5 text-xs text-red-900 space-y-1">
                  {result.redFlags?.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#3D5A45]" />
                <span>Recommended Actions</span>
              </h4>
              <ul className="space-y-2">
                {result.recommendedActions?.map((act, i) => (
                  <li key={i} className="p-3 bg-[#EEF3EF] rounded-xl text-xs font-bold text-[#3D5A45] flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#3D5A45] text-white text-[10px] flex items-center justify-center font-black">
                      {i + 1}
                    </span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t text-center text-xs text-gray-400 flex items-center justify-center space-x-1">
              <Info className="w-3.5 h-3.5" />
              <span>Disclaimer: This AI assessment is for informational guidance only and is not a clinical medical diagnosis.</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SymptomCheckerPage;
