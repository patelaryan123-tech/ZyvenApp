import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, FileText, Image as ImageIcon, X, Loader2 } from 'lucide-react';

const ReportUploader = ({ onUpload, loading, accept = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png']
} }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (type.includes('image')) return <ImageIcon className="h-8 w-8 text-blue-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div 
          {...getRootProps()} 
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 bg-gray-50 hover:bg-gray-100'}
          `}
        >
          <input {...getInputProps()} />
          <UploadCloud className={`h-12 w-12 mx-auto mb-4 ${isDragActive ? 'text-primary-600' : 'text-gray-400'}`} />
          <p className="text-base font-medium text-gray-700 mb-1">
            {isDragActive ? 'Drop file here...' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-gray-500 mb-4">or click to browse</p>
          
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-500">
            <span className="bg-white px-2 py-1 rounded border border-gray-200">PDF</span>
            <span className="bg-white px-2 py-1 rounded border border-gray-200">JPG</span>
            <span className="bg-white px-2 py-1 rounded border border-gray-200">PNG</span>
            <span className="ml-2 text-gray-400">• Max 10MB</span>
          </div>
        </div>
      ) : (
        <div className="border rounded-xl p-6 bg-white shadow-sm flex flex-col items-center">
          <div className="flex w-full items-center justify-between mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex items-center gap-4 overflow-hidden">
              {getFileIcon(selectedFile.type)}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px] sm:max-w-xs">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            {!loading && (
              <button 
                onClick={clearFile}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <button
            onClick={handleUpload}
            disabled={loading}
            className={`
              w-full py-3 px-4 flex items-center justify-center rounded-lg text-sm font-medium text-white transition-colors
              ${loading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}
            `}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Uploading...
              </>
            ) : (
              'Upload Document'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportUploader;
