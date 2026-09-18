import React from 'react';
import { FileText, CheckCircle2, AlertTriangle, List, HelpCircle, AlertCircle } from 'lucide-react';

const ReportSummary = ({ report }) => {
  if (!report || !report.aiAnalysis) return null;

  const { aiAnalysis } = report;

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
