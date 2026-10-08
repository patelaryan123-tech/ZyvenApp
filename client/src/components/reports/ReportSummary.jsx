import React from 'react';
import { FileText, CheckCircle2, AlertTriangle, List, HelpCircle, AlertCircle } from 'lucide-react';

const ReportSummary = ({ report }) => {
  if (!report || !report.aiAnalysis) return null;

  const rawRisk = aiAnalysis?.riskLevel || 
    (aiAnalysis?.abnormalValues?.length >= 2 ? 'High' : (aiAnalysis?.abnormalValues?.length === 1 ? 'Medium' : 'Low'));
  const isHigh = rawRisk === 'High';
  const isMedium = rawRisk === 'Medium';
  const isLow = rawRisk === 'Low';

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>Disclaimer:</strong> This is an AI-generated summary intended to help you understand your report. It is not a medical diagnosis. Always consult with your doctor.
          </p>
        </div>
      </div>

      {/* Traffic Light Risk Level Card */}
      <div className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
        isHigh 
          ? 'bg-red-50/90 border-red-500 shadow-xs' 
          : isMedium 
          ? 'bg-amber-50/90 border-amber-500 shadow-xs' 
          : 'bg-emerald-50/90 border-emerald-500 shadow-xs'
      }`}>
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="bg-gray-900 p-2.5 rounded-2xl flex items-center gap-2 shadow-inner shrink-0">
            <div 
              title="🔴 High Risk Indicator"
              className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                isHigh 
                  ? 'bg-red-600 border-red-300 shadow-[0_0_12px_rgba(220,38,38,0.9)] animate-pulse scale-110' 
                  : 'bg-red-950/60 border-red-900/40 opacity-30'
              }`}
            >
              <span className="text-[10px]">🔴</span>
            </div>
            <div 
              title="🟡 Medium Risk Indicator"
              className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                isMedium 
                  ? 'bg-amber-500 border-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-pulse scale-110' 
                  : 'bg-amber-950/60 border-amber-900/40 opacity-30'
              }`}
            >
              <span className="text-[10px]">🟡</span>
            </div>
            <div 
              title="🟢 Safe/Low Risk Indicator"
              className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                isLow 
                  ? 'bg-emerald-500 border-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.9)] animate-pulse scale-110' 
                  : 'bg-emerald-950/60 border-emerald-900/40 opacity-30'
              }`}
            >
              <span className="text-[10px]">🟢</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Document Health Risk Assessment</span>
            </div>
            <h4 className={`text-base sm:text-lg font-black tracking-tight ${
              isHigh ? 'text-red-700' : isMedium ? 'text-amber-800' : 'text-emerald-800'
            }`}>
              {isHigh && '🔴 High Risk Level'}
              {isMedium && '🟡 Medium Risk Level'}
              {isLow && '🟢 Safe / Low Risk'}
            </h4>
            <p className="text-xs text-gray-700 font-medium mt-0.5">
              {isHigh && 'Critical medical parameters found. Prompt doctor consultation & close monitoring recommended.'}
              {isMedium && 'Moderate parameters require monitoring. Follow up with your physician.'}
              {isLow && 'Report parameters are safe and within normal physiological limits.'}
            </p>
          </div>
        </div>

        <div className="shrink-0 self-end sm:self-center">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide border flex items-center gap-1.5 ${
            isHigh 
              ? 'bg-red-600 text-white border-red-700 shadow-2xs' 
              : isMedium 
              ? 'bg-amber-500 text-white border-amber-600 shadow-2xs' 
              : 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
          }`}>
            <span>{isHigh ? '🔴' : isMedium ? '🟡' : '🟢'}</span>
            <span>{isHigh ? 'High Risk' : isMedium ? 'Medium Risk' : 'Safe / Low Risk'}</span>
          </span>
        </div>
      </div>

      {/* Main Summary */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-3">
          <FileText className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-bold text-gray-900">Overall Summary</h3>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {aiAnalysis.summary || "No general summary available."}
        </p>
      </div>

      {/* Abnormal Values (if any) */}
      {aiAnalysis.abnormalValues && aiAnalysis.abnormalValues.length > 0 && (
        <div className="bg-red-50 p-5 rounded-xl border border-red-100">
          <div className="flex items-center gap-2 mb-3 border-b border-red-200 pb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-bold text-red-900">Requires Attention</h3>
          </div>
          <ul className="space-y-2">
            {aiAnalysis.abnormalValues.map((val, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-red-800">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></span>
                <span>{val}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Findings */}
      {aiAnalysis.keyFindings && aiAnalysis.keyFindings.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">Key Findings</h3>
          </div>
          <ul className="space-y-3">
            {aiAnalysis.keyFindings.map((finding, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommendations */}
        {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
          <div className="bg-primary-50 p-5 rounded-xl border border-primary-100">
            <div className="flex items-center gap-2 mb-3 border-b border-primary-200 pb-3">
              <List className="h-5 w-5 text-primary-700" />
              <h3 className="text-lg font-bold text-primary-900">Recommendations</h3>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-sm text-primary-800">
              {aiAnalysis.recommendations.map((rec, idx) => (
                <li key={idx} className="pl-1">{rec}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Questions for Doctor */}
        {aiAnalysis.questionsForDoctor && aiAnalysis.questionsForDoctor.length > 0 && (
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-3 border-b border-blue-200 pb-3">
              <HelpCircle className="h-5 w-5 text-blue-700" />
              <h3 className="text-lg font-bold text-blue-900">Ask Your Doctor</h3>
            </div>
            <ul className="space-y-3">
              {aiAnalysis.questionsForDoctor.map((q, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                  <span className="font-bold text-blue-500">Q:</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportSummary;
