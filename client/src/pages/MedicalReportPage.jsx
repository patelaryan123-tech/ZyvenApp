import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  FileText, 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  FileUp, 
  Loader2, 
  Info, 
  ChevronRight, 
  Trash2,
  Camera,
  RefreshCw,
  SwitchCamera,
  Check,
  X,
  ScanLine,
  Sparkles
} from 'lucide-react';
import { reportService } from '../services/reportService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const MedicalReportPage = () => {
  const [reports, setReports] = useState([]);
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'camera'
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Camera state
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    loadReports();
    return () => {
      stopCamera();
    };
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

  // Start Camera Stream
  const startCamera = async (mode = facingMode) => {
    stopCamera();
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported by your browser or device.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError(err.message || 'Unable to access camera. Please allow camera permissions in your browser.');
      setCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  // Handle switching camera between front and back
  const handleToggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Switch between Upload and Camera Tabs
  const handleModeSwitch = (mode) => {
    setInputMode(mode);
    setError('');
    setCameraError('');
    if (mode === 'camera') {
      setSelectedFile(null);
      setPreview(null);
      setCapturedImage(null);
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
    }
  };

  // Capture Photo from Video Stream
  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(imageDataUrl);
    
    // Convert base64 to File object
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `medical_scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreview(imageDataUrl);
      }
    }, 'image/jpeg', 0.92);

    stopCamera();
  };

  // Retake Photo
  const handleRetakePhoto = () => {
    setCapturedImage(null);
    setSelectedFile(null);
    setPreview(null);
    startCamera();
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
    // Always include reportType (required by backend validator)
    const reportType = selectedFile.type === 'application/pdf' ? 'Lab Report' : 'Medical Image';
    formData.append('reportType', reportType);

    try {
      const res = await reportService.uploadReport(formData);
      // Backend returns 202 (accepted) - report processes async with Ollama
      const reportData = res?.data || res;
      if (reportData) {
        setReports(prev => [reportData, ...prev]);
        setActiveReport(reportData);
      }
      setSelectedFile(null);
      setPreview(null);
      setCapturedImage(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to upload report.';
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };


  const selectReport = async (report) => {
    try {
      setActiveReport(report);
      setSelectedFile(null);
      setPreview(null);
      setCapturedImage(null);
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
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-6 bg-[#FDFBF7] min-h-[calc(100vh-4rem)] font-sans">
      
      {/* Hidden Canvas for Camera Snapshots */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Left Panel: Upload / Scan & Recent Reports */}
      <div className="w-full md:w-5/12 lg:w-4/12 flex flex-col gap-6">
        
        {/* Document Intake Card */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="mb-4">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              Medical Report Intake
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload PDF or take a live camera photo of your prescription
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-gray-100/90 p-1 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => handleModeSwitch('upload')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                inputMode === 'upload'
                  ? 'bg-white text-[#3D5A45] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <FileUp className="w-4 h-4" />
              <span>Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('camera')}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                inputMode === 'camera'
                  ? 'bg-white text-[#3D5A45] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Camera className="w-4 h-4 text-[#E07A5F]" />
              <span>Scan with Camera</span>
            </button>
          </div>

          {/* 1. File Upload View */}
          {inputMode === 'upload' && (
            <div>
              {!selectedFile ? (
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                    isDragActive 
                      ? 'border-[#3D5A45] bg-[#3D5A45]/5' 
                      : 'border-gray-200 hover:border-[#3D5A45] hover:bg-gray-50/80'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="w-12 h-12 rounded-2xl bg-[#EEF3EF] text-[#3D5A45] flex items-center justify-center mx-auto mb-3">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <p className="text-gray-900 font-bold text-sm mb-1">
                    Tap to browse or drop file here
                  </p>
                  <p className="text-xs text-gray-500">PDF, JPG, or PNG (Max 10MB)</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/70">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="p-2 bg-white rounded-xl text-[#3D5A45] border border-gray-200">
                        <FileText className="w-5 h-5 flex-shrink-0" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-gray-900 truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setSelectedFile(null); setPreview(null); }} 
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-white cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {preview && (
                    <div className="mb-3 h-36 w-full rounded-xl overflow-hidden border border-gray-200 bg-white">
                      <img src={preview} alt="Document Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                  
                  <button
                    onClick={handleAnalyze}
                    disabled={isUploading}
                    className="w-full bg-[#3D5A45] hover:bg-[#324a3a] text-white p-3 rounded-xl font-bold text-xs transition-all shadow-xs flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Extracting & Analyzing with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#E07A5F]" />
                        <span>Analyze Document with AI</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. Live Camera Scanner View */}
          {inputMode === 'camera' && (
            <div>
              {cameraError ? (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                  <p className="text-xs text-amber-800 font-semibold">{cameraError}</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => startCamera()}
                      className="px-3 py-1.5 bg-[#3D5A45] text-white text-xs font-bold rounded-xl"
                    >
                      Try Again
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('upload')}
                      className="px-3 py-1.5 bg-gray-200 text-gray-800 text-xs font-bold rounded-xl"
                    >
                      Use File Upload
                    </button>
                  </div>
                </div>
              ) : !capturedImage ? (
                <div className="space-y-3">
                  {/* Live Viewfinder Box */}
                  <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border-2 border-[#3D5A45]">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Scanner Framing Guide */}
                    <div className="absolute inset-4 border-2 border-dashed border-white/80 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                      <div className="flex justify-between text-[10px] text-white bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded self-center font-bold">
                        <span>Align prescription inside frame</span>
                      </div>
                      <div className="w-full text-center">
                        <ScanLine className="w-6 h-6 text-[#E07A5F] mx-auto animate-pulse" />
                      </div>
                    </div>

                    {/* Camera Switch Button */}
                    <button
                      type="button"
                      onClick={handleToggleCamera}
                      title="Switch Front/Back Camera"
                      className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-xl backdrop-blur-xs cursor-pointer"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Capture Button */}
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    disabled={!cameraActive}
                    className="w-full py-3.5 bg-[#3D5A45] hover:bg-[#324a3a] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4 text-[#E07A5F]" />
                    <span>CAPTURE PHOTO</span>
                  </button>
                </div>
              ) : (
                /* Captured Image Review */
                <div className="space-y-3">
                  <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-gray-200 bg-black">
                    <img
                      src={capturedImage}
                      alt="Scanned Report"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleRetakePhoto}
                      disabled={isUploading}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retake</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAnalyze}
                      disabled={isUploading}
                      className="flex-2 py-3 bg-[#3D5A45] hover:bg-[#324a3a] text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-70"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Analyzing Scan...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-[#E07A5F]" />
                          <span>Analyze with AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Recent Reports List */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col max-h-[380px]">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Recent Reports</h3>
            <span className="text-[11px] text-gray-400 font-semibold">{reports.length} Saved</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
            {isLoading ? (
              [1, 2, 3].map(i => <LoadingSkeleton key={i} className="h-16 rounded-2xl mx-2" />)
            ) : reports.length > 0 ? (
              reports.map((report) => (
                <div
                  key={report._id}
                  onClick={() => selectReport(report)}
                  className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                    activeReport?._id === report._id 
                      ? 'bg-[#EEF3EF] border border-[#3D5A45]/30 shadow-2xs' 
                      : 'hover:bg-gray-50/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2 rounded-xl ${activeReport?._id === report._id ? 'bg-[#3D5A45] text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-gray-900 text-xs truncate">{report.fileName || report.title || 'Medical Report'}</p>
                      <p className="text-[10px] text-gray-400">{new Date(report.uploadedAt || report.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => deleteReport(e, report._id)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className={`w-4 h-4 ${activeReport?._id === report._id ? 'text-[#3D5A45]' : 'text-gray-300'}`} />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-400 text-xs">
                No reports analyzed yet. Upload or scan a report above!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel: AI Analysis Insights */}
      <div className="w-full md:w-7/12 lg:w-8/12">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden relative">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-100 bg-[#3D5A45] text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E07A5F] block">
                Artificial Intelligence Report Diagnostic
              </span>
              <h2 className="text-lg sm:text-xl font-black">AI Report Breakdown</h2>
              {activeReport && <p className="text-xs opacity-80 mt-0.5 truncate max-w-md">{activeReport.fileName || activeReport.title}</p>}
            </div>
            {activeReport?.aiAnalysis && (
              <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-[#E07A5F]" />
                <span>Analyzed</span>
              </div>
            )}
          </div>

          {/* Medical Disclaimer Banner */}
          <div className="bg-amber-50/80 border-b border-amber-200/80 p-3.5 flex items-start gap-2.5 text-amber-900 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Medical Disclaimer:</strong> This analysis is AI-assisted translation and summary. Always consult your certified physician before modifying any medications or treatments.
            </p>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {isUploading ? (
              <div className="space-y-5">
                <div className="text-center py-6">
                  <Loader2 className="w-8 h-8 text-[#3D5A45] animate-spin mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-800">Analyzing Document with Google AI...</p>
                  <p className="text-xs text-gray-500">Extracting medical metrics, abnormal lab markers & recommendations</p>
                </div>
                <LoadingSkeleton className="h-24 rounded-2xl" />
                <LoadingSkeleton className="h-32 rounded-2xl" />
              </div>
            ) : !activeReport ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 py-12">
                <FileText className="w-16 h-16 opacity-20" />
                <p className="text-sm font-semibold">Select a report from the left or scan a new document</p>
              </div>
            ) : !activeReport.aiAnalysis ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 py-12">
                <p className="text-sm">Analysis summary not available for this report.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* 1. Summary */}
                {activeReport.aiAnalysis.summary && (
                  <section>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-[#3D5A45]" /> Patient Summary
                    </h3>
                    <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-gray-200/80 text-gray-700 text-xs sm:text-sm leading-relaxed">
                      {activeReport.aiAnalysis.summary}
                    </div>
                  </section>
                )}

                {/* 2. Abnormal Values */}
                {activeReport.aiAnalysis.abnormalValues && activeReport.aiAnalysis.abnormalValues.length > 0 && (
                  <section>
                    <h3 className="text-sm font-black text-[#D90429] uppercase tracking-wider mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#D90429]" /> Critical & Abnormal Metrics
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeReport.aiAnalysis.abnormalValues.map((item, idx) => (
                        <div key={idx} className="bg-red-50/80 p-3 rounded-2xl border border-red-200 flex justify-between items-center text-xs">
                          <span className="font-bold text-red-900">{item.name || item}</span>
                          {item.value && (
                            <div className="text-right">
                              <span className="font-black text-red-700">{item.value}</span>
                              <span className="text-[10px] text-red-600 ml-1 bg-red-100 px-2 py-0.5 rounded-full font-bold">
                                {item.status || 'High'}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 3. Key Findings */}
                {activeReport.aiAnalysis.keyFindings && activeReport.aiAnalysis.keyFindings.length > 0 && (
                  <section>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#3D5A45]" /> Key Findings
                    </h3>
                    <ul className="space-y-2">
                      {activeReport.aiAnalysis.keyFindings.map((finding, idx) => (
                        <li key={idx} className="flex gap-2.5 text-xs sm:text-sm text-gray-700 bg-white p-3 rounded-xl border border-gray-100 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-[#3D5A45] mt-1.5 flex-shrink-0"></span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* 4. Lifestyle & Medical Recommendations */}
                {activeReport.aiAnalysis.recommendations && activeReport.aiAnalysis.recommendations.length > 0 && (
                  <section>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2">
                      Next Step Recommendations
                    </h3>
                    <div className="bg-[#EEF3EF]/70 p-4 rounded-2xl border border-[#3D5A45]/20">
                      <ul className="space-y-2.5">
                        {activeReport.aiAnalysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex gap-2.5 text-xs sm:text-sm text-gray-800">
                            <span className="text-[#3D5A45] font-extrabold">{idx + 1}.</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                )}

                {/* 5. Questions for Doctor */}
                {activeReport.aiAnalysis.questionsForDoctor && activeReport.aiAnalysis.questionsForDoctor.length > 0 && (
                  <section>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2">
                      Questions to Ask Your Doctor
                    </h3>
                    <div className="bg-[#FDF2EF] p-4 rounded-2xl border border-[#E07A5F]/20">
                      <ul className="space-y-2">
                        {activeReport.aiAnalysis.questionsForDoctor.map((q, idx) => (
                          <li key={idx} className="flex gap-2.5 text-xs sm:text-sm text-gray-800">
                            <span className="text-[#E07A5F] font-black text-base leading-none">?</span>
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
