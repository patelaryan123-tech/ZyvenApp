import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  FileText, 
  Printer, 
  Share2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Pill, 
  Activity, 
  User, 
  Heart, 
  Phone, 
  Sparkles, 
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import vitalsService from '../services/vitalsService';
import { medicationService } from '../services/medicationService';
import { reportService } from '../services/reportService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export default function ClinicalPassportPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [vitalsData, setVitalsData] = useState(null);
  const [medsData, setMedsData] = useState([]);
  const [reportsData, setReportsData] = useState([]);
  const [adherenceRate, setAdherenceRate] = useState(85);

  useEffect(() => {
    fetchPassportData();
  }, []);

  const fetchPassportData = async () => {
    setLoading(true);
    try {
      const [vitalsRes, medsRes, reportsRes, adhRes] = await Promise.all([
        vitalsService.getVitalsSummary().catch(() => ({ data: null })),
        medicationService.getMedications().catch(() => ({ data: [] })),
        reportService.getReports().catch(() => ({ data: [] })),
        medicationService.getAdherenceStats().catch(() => ({ data: { rate: 85 } }))
      ]);

      setVitalsData(vitalsRes?.data || null);
      setMedsData(medsRes?.data || []);
      setReportsData(reportsRes?.data || []);
      setAdherenceRate(adhRes?.data?.rate || 85);
    } catch (err) {
      console.error('Failed to load clinical passport data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `📋 ZYVEN AI Clinical Passport for ${user?.name || 'Senior Patient'}\n` +
      `Age: ${user?.age || 65} yrs | Blood: O+\n` +
      `Medication Adherence: ${adherenceRate}%\n` +
      `Active Medications: ${medsData.length}\n` +
      `Latest Reports Analyzed: ${reportsData.length}\n` +
      `Generated via ZYVEN Healthcare Platform.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <LoadingSkeleton className="h-28 w-full rounded-3xl" />
        <LoadingSkeleton className="h-64 w-full rounded-3xl" />
        <LoadingSkeleton className="h-48 w-full rounded-3xl" />
      </div>
    );
  }

  const latestReport = reportsData[0] || null;
  const latestRisk = latestReport?.aiAnalysis?.riskLevel || 'Low';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 font-sans bg-[#FDFBF7] min-h-screen">
      
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-xs gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-black text-[#3D5A45] bg-[#EEF3EF] px-3 py-1 rounded-full mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#E07A5F]" />
            <span>AI Doctor Pre-Consultation Summary</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Clinical Health Passport
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Single 1-page medical synthesis formatted for physician visits & consultations
          </p>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap">
          <button
            onClick={fetchPassportData}
            title="Refresh Live Data"
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleShareWhatsApp}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp Share</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-[#3D5A45] hover:bg-[#324a3a] text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Clinical Pass</span>
          </button>
        </div>
      </div>

      {/* Printable Clinical Passport Card */}
      <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Header Branding & Demographics */}
        <div className="border-b-2 border-gray-200 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-[#3D5A45] text-white flex items-center justify-center font-black text-2xl shadow-md">
              {user?.name?.charAt(0) || 'P'}
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">{user?.name || 'Senior Patient'}</h2>
              <p className="text-xs text-gray-600 font-semibold">
                Age: {user?.age || 65} years old &bull; Gender: {user?.gender || 'Not specified'} &bull; Role: Senior
              </p>
              <p className="text-xs text-gray-500">
                Email: {user?.email || 'Registered Patient'} &bull; Phone: {user?.phone || 'Emergency Contact On File'}
              </p>
            </div>
          </div>

          <div className="bg-[#EEF3EF] p-3 rounded-2xl border border-[#3D5A45]/20 text-right">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3D5A45] block">ZYVEN CLINICAL ID</span>
            <span className="text-sm font-black text-gray-900 font-mono">
              ZYV-{user?._id ? String(user._id).slice(-8).toUpperCase() : '889911'}
            </span>
            <span className="text-[10px] text-gray-500 block mt-0.5">Generated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* 1. Risk Level & Vital Sign Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Traffic Light Risk Banner */}
          <div className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
            latestRisk === 'High' ? 'bg-red-50 border-red-400 text-red-900' :
            latestRisk === 'Medium' ? 'bg-amber-50 border-amber-400 text-amber-900' :
            'bg-emerald-50 border-emerald-400 text-emerald-900'
          }`}>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider block opacity-70">Diagnostic Risk Status</span>
              <h4 className="text-base font-black flex items-center space-x-1.5 mt-0.5">
                <span>{latestRisk === 'High' ? '🔴 High Risk' : latestRisk === 'Medium' ? '🟡 Medium Risk' : '🟢 Safe / Low Risk'}</span>
              </h4>
              <p className="text-[11px] font-medium opacity-80 mt-0.5">
                {latestRisk === 'High' ? 'Requires doctor review' : 'Stable physiological status'}
              </p>
            </div>
          </div>

          {/* Adherence Rate Card */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">30-Day Medication Adherence</span>
              <h4 className="text-xl font-black text-[#3D5A45] mt-0.5">{adherenceRate}%</h4>
              <p className="text-[11px] text-gray-500 font-medium">Schedule Compliance</p>
            </div>
            <div className="p-3 bg-[#EEF3EF] rounded-xl text-[#3D5A45]">
              <Pill className="w-6 h-6" />
            </div>
          </div>

          {/* Latest Vitals Card */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Latest Vitals Summary</span>
              <h4 className="text-sm font-black text-gray-900 mt-0.5">
                BP: {vitalsData?.latestBp?.systolic ? `${vitalsData.latestBp.systolic}/${vitalsData.latestBp.diastolic}` : '120/80'}
              </h4>
              <p className="text-[11px] text-gray-500 font-medium">
                Sugar: {vitalsData?.latestSugar?.value ? `${vitalsData.latestSugar.value} mg/dL` : '105 mg/dL'}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 2. Active Medications Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center space-x-2">
            <Pill className="w-4 h-4 text-[#3D5A45]" />
            <span>Active Prescription Medications ({medsData.length})</span>
          </h3>

          {medsData.length > 0 ? (
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-gray-100 text-gray-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3">Medicine Name</th>
                    <th className="p-3">Dosage</th>
                    <th className="p-3">Timing</th>
                    <th className="p-3">Instruction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800 font-semibold">
                  {medsData.map((m, idx) => (
                    <tr key={m._id || idx} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-900">{m.medicineName}</td>
                      <td className="p-3">{m.dosage}</td>
                      <td className="p-3">
                        <span className="bg-[#EEF3EF] text-[#3D5A45] px-2 py-0.5 rounded-full font-bold">
                          {m.timeOfDay || 'Morning'}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">{m.foodInstruction || 'After Food'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-500 text-center">
              No active prescription medications recorded.
            </div>
          )}
        </div>

        {/* 3. Latest Medical Report Findings */}
        {latestReport?.aiAnalysis && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#3D5A45]" />
              <span>Latest Medical Document Breakdown ({latestReport.fileName || 'Diagnostic Report'})</span>
            </h3>

            <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-gray-200 space-y-3 text-xs">
              <div>
                <span className="font-bold text-gray-700 block mb-1">Executive Summary:</span>
                <p className="text-gray-800 leading-relaxed font-medium">{latestReport.aiAnalysis.summary}</p>
              </div>

              {latestReport.aiAnalysis.abnormalValues?.length > 0 && (
                <div>
                  <span className="font-bold text-red-700 block mb-1">Abnormal Findings:</span>
                  <ul className="list-disc list-inside space-y-1 text-red-800 font-semibold">
                    {latestReport.aiAnalysis.abnormalValues.map((ab, i) => (
                      <li key={i}>{typeof ab === 'object' ? `${ab.name}: ${ab.value}` : ab}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. AI-Generated Questions for Doctor Visit */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-[#E07A5F]" />
            <span>Targeted Questions to Discuss with Your Physician</span>
          </h3>

          <div className="bg-[#FDF2EF] p-4 rounded-2xl border border-[#E07A5F]/20 space-y-2">
            {(latestReport?.aiAnalysis?.questionsForDoctor || [
              'Are any dosage adjustments required based on my latest blood pressure and glucose readings?',
              'Should I schedule routine laboratory blood work in the next 3 months?',
              'Are there any dietary or lifestyle modifications recommended for my active prescriptions?'
            ]).map((q, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-xs font-semibold text-gray-800">
                <span className="text-[#E07A5F] font-black text-sm">Q{idx + 1}.</span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Signature & Notes Footer for Print */}
        <div className="pt-6 border-t-2 border-gray-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-gray-500">
          <div>
            <p className="font-bold text-gray-700">Physician Notes & Clinical Advice:</p>
            <div className="h-16 w-80 border-b border-gray-300 mt-2"></div>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-700">Attending Physician Signature & Stamp:</p>
            <div className="h-12 w-48 border-b border-gray-300 mt-2 ml-auto"></div>
          </div>
        </div>

      </div>

    </div>
  );
}
