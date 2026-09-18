const MedicalReport = require('../models/MedicalReport');
const reportAnalyzer = require('../services/reportAnalyzer');
const emailService = require('../services/emailService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Please upload a file', 400);
    }

    const { reportType } = req.body;
    const userId = req.user.id;

    const report = await MedicalReport.create({
      userId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      reportType,
      status: 'Processing'
    });

    // Process async
    reportAnalyzer.processReport(req.file, reportType)
      .then(async (result) => {
        report.extractedText = result.extractedText;
        report.aiAnalysis = result.analysis;
        report.status = 'Completed';
        await report.save();
        
        emailService.sendReportReady(req.user, report).catch(console.error);
      })
      .catch(async (error) => {
        console.error('Report processing failed:', error);
        report.status = 'Failed';
        await report.save();
      });

    return successResponse(res, 'Report uploaded and processing started', report, 202);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getReports = async (req, res) => {
  try {
    const userId = req.query.userId || req.user.id;
    const reports = await MedicalReport.find({ userId }).sort({ uploadedAt: -1 }).select('-extractedText');
    return successResponse(res, 'Reports retrieved', reports);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await MedicalReport.findOne({ _id: req.params.id, userId: req.user.id });
    if (!report) return errorResponse(res, 'Report not found', 404);
    return successResponse(res, 'Report retrieved', report);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await MedicalReport.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!report) return errorResponse(res, 'Report not found', 404);
    return successResponse(res, 'Report deleted');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const reanalyzeReport = async (req, res) => {
  try {
    const report = await MedicalReport.findOne({ _id: req.params.id, userId: req.user.id });
    if (!report) return errorResponse(res, 'Report not found', 404);
    if (!report.extractedText) return errorResponse(res, 'No extracted text to analyze', 400);

    report.status = 'Processing';
    await report.save();

    reportAnalyzer.analyzeWithAI(report.extractedText, report.reportType)
      .then(async (analysis) => {
        report.aiAnalysis = analysis;
        report.status = 'Completed';
        await report.save();
      })
      .catch(async (error) => {
        report.status = 'Failed';
        await report.save();
      });

    return successResponse(res, 'Re-analysis started', report, 202);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  uploadReport,
  getReports,
  getReportById,
  deleteReport,
  reanalyzeReport
};
