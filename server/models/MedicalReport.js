const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema({
  summary: { type: String },
  riskLevel: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Low' },
  keyFindings: [{ type: String }],
  abnormalValues: [{ type: String }],
  recommendations: [{ type: String }],
  questionsForDoctor: [{ type: String }]
}, { _id: false });

const medicalReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String
  },
  fileType: {
    type: String,
    required: true
  },
  reportType: {
    type: String,
    required: true
  },
  extractedText: {
    type: String
  },
  aiAnalysis: aiAnalysisSchema,
  status: {
    type: String,
    enum: ['Uploaded', 'Processing', 'Completed', 'Failed'],
    default: 'Uploaded'
  },
  targetLanguage: {
    type: String,
    default: 'en'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MedicalReport', medicalReportSchema);
