import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, AlertCircle, CheckCircle, FileUp, Loader2, Info, ChevronRight, Trash2 } from 'lucide-react';
import { reportService } from '../services/reportService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const MedicalReportPage = () => {
  const [reports, setReports] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const res = await reportService.getReports().catch(() => ({ data: [] }));
      setReports(res.data || []);
      if (res.data?.length > 0) {
        setActiveReport(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('');
    if (rejectedFiles.length > 0) {
      setError('Invalid file. Please upload PDF, JPG, or PNG under 10MB.');
      return;
    }
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      
      if (file.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
      } else {
        setPreview(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('report', selectedFile);

    try {
      // Simulate analysis delay for realistic UX if API is too fast
      const res = await reportService.uploadReport(formData);
      
      if (res.data) {
        setReports([res.data, ...reports]);
        setActiveReport(res.data);
      }
      setSelectedFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze report. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const selectReport = async (report) => {
    try {
      // Fetch full details if needed
      setActiveReport(report);
      setSelectedFile(null);
    } catch (err) {
      console.error('Failed to load report details', err);
    }
  };

  const deleteReport = async (e, id) => {
    e.stopPropagation();
    try {
      await reportService.deleteReport(id);
      setReports(reports.filter(r => r._id !== id));
      if (activeReport?._id === id) {
        setActiveReport(null);
      }
    } catch (err) {
      console.error('Failed to delete report', err);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-6 bg-[#FDFBF7] min-h-[calc(100vh-4rem)]">
      
      {/* Left Panel: Upload & List */}
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        
        {/* Upload Area */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Report</h2>
          
          {!selectedFile ? (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-[#3D5A45] bg-[#3D5A45]/5' : 'border-gray-300 hover:border-[#3D5A45] hover:bg-gray-50'}`}
            >
              <input {...getInputProps()} />
              <FileUp className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-[#3D5A45]' : 'text-gray-400'}`} />
              <p className="text-gray-900 font-medium mb-1">Tap or drag to upload</p>
              <p className="text-sm text-gray-500">PDF, JPG, PNG (Max 10MB)</p>
            </div>
          ) : (
            <div className="border rounded-xl p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="w-8 h-8 text-[#3D5A45] flex-shrink-0" />
                  <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                </div>
                <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-red-500 p-1">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              {preview && (
                <div className="mb-4 h-32 w-full rounded-lg overflow-hidden border border-gray-200">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              
              <button
                onClick={handleAnalyze}
                disabled={isUploading}
                className="w-full bg-[#3D5A45] text-white p-3 rounded-lg font-medium hover:bg-[#2c4232] transition-colors flex justify-center items-center gap-2"
              >
                {isUploading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
                ) : (
                  <><CheckCircle className="w-5 h-5" /> Analyze Report</>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Recent Reports List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Recent Reports</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {isLoading ? (
              [1,2,3].map(i => <LoadingSkeleton key={i} className="h-16 rounded-xl mx-2" />)
            ) : reports.length > 0 ? (
              reports.map((report) => (
                <button
                  key={report._id}
                  onClick={() => selectReport(report)}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-colors
                    ${activeReport?._id === report._id ? 'bg-[#3D5A45]/10 border border-[#3D5A45]/30' : 'hover:bg-gray-50 border border-transparent'}
                  `}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2 rounded-lg ${activeReport?._id === report._id ? 'bg-white text-[#3D5A45]' : 'bg-gray-100 text-gray-500'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="font-medium text-gray-900 text-sm truncate">{report.filename || report.title || 'Medical Report'}</p>
                      <p className="text-xs text-gray-500">{new Date(report.createdAt || report.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${activeReport?._id === report._id ? 'text-[#3D5A45]' : 'text-gray-400'}`} />
                </button>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500 text-sm">
                No reports found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel: Analysis Results */}
      <div className="w-full md:w-2/3">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden relative">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-[#3D5A45] text-white">
            <h2 className="text-xl font-bold">AI Analysis Results</h2>
            {activeReport && <p className="text-sm opacity-80 mt-1">{activeReport.filename || activeReport.title}</p>}
          </div>

          {/* Disclaimer Banner */}
          <div className="bg-amber-50 border-b border-amber-200 p-3 flex items-start gap-3 text-amber-800 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="font-medium">DISCLAIMER: This analysis is AI-generated and not a medical diagnosis. Please consult your doctor for medical advice.</p>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {isUploading ? (
              <div className="space-y-6">
                <LoadingSkeleton className="h-24 rounded-xl" />
                <LoadingSkeleton className="h-32 rounded-xl" />
                <LoadingSkeleton className="h-40 rounded-xl" />
              </div>
            ) : !activeReport ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                <FileText className="w-16 h-16 opacity-20" />
                <p>Select a report to view analysis</p>
              </div>
            ) : !activeReport.analysis ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <p>Analysis not available for this report.</p>
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* Summary */}
                {activeReport.analysis.summary && (
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5 text-[#3D5A45]" /> Report Summary
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 leading-relaxed">
                      {activeReport.analysis.summary}
                    </div>
                  </section>
                )}

                {/* Abnormal Values */}
                {activeReport.analysis.abnormalValues && activeReport.analysis.abnormalValues.length > 0 && (
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-[#D90429]" /> Abnormal Values
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeReport.analysis.abnormalValues.map((item, idx) => (
                        <div key={idx} className="bg-red-50 p-3 rounded-xl border border-red-100 flex justify-between items-center">
                          <span className="font-medium text-red-900">{item.name}</span>
                          <div className="text-right">
                            <span className="font-bold text-red-700">{item.value}</span>
                            <span className="text-xs text-red-600 ml-1 bg-red-100 px-2 py-0.5 rounded-full">{item.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Key Findings */}
                {activeReport.analysis.keyFindings && activeReport.analysis.keyFindings.length > 0 && (
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-[#3D5A45]" /> Key Findings
                    </h3>
                    <ul className="space-y-2">
                      {activeReport.analysis.keyFindings.map((finding, idx) => (
                        <li key={idx} className="flex gap-3 text-gray-700 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3D5A45] mt-2 flex-shrink-0"></span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Recommendations */}
                {activeReport.analysis.recommendations && activeReport.analysis.recommendations.length > 0 && (
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Recommendations</h3>
                    <div className="bg-[#3D5A45]/5 p-4 rounded-xl border border-[#3D5A45]/20">
                      <ul className="space-y-3">
                        {activeReport.analysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex gap-3 text-gray-800">
                            <span className="text-[#3D5A45] font-bold">{idx + 1}.</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                )}

                {/* Questions for Doctor */}
                {activeReport.analysis.questionsForDoctor && activeReport.analysis.questionsForDoctor.length > 0 && (
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Questions for Your Doctor</h3>
                    <div className="bg-[#E07A5F]/5 p-4 rounded-xl border border-[#E07A5F]/20">
                      <ul className="space-y-3">
                        {activeReport.analysis.questionsForDoctor.map((q, idx) => (
                          <li key={idx} className="flex gap-3 text-gray-800">
                            <span className="text-[#E07A5F] font-bold text-lg leading-none mt-0.5">?</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                )}
                
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalReportPage;
