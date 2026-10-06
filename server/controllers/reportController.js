const MedicalReport = require('../models/MedicalReport');
const reportAnalyzer = require('../services/reportAnalyzer');
const emailService = require('../services/emailService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Please upload a file', 400);
    }

    const { reportType, targetLanguage } = req.body;
    const userId = req.user.id;
    const lang = targetLanguage || 'en';

    const report = await MedicalReport.create({
      userId,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      reportType: reportType || 'Medical Report',
      targetLanguage: lang,
      status: 'Processing'
    });

    try {
      const result = await reportAnalyzer.processReport(req.file, reportType || 'Medical Report', lang);
      report.extractedText = result.extractedText;
      report.aiAnalysis = result.analysis;
      report.targetLanguage = lang;
      report.status = 'Completed';
      await report.save();

      if (emailService && typeof emailService.sendReportReady === 'function') {
        emailService.sendReportReady(req.user, report).catch(console.error);
      }

      return successResponse(res, 'Report uploaded and analyzed successfully', report, 200);
    } catch (procErr) {
      console.error('Report processing failed:', procErr);
      report.status = 'Failed';
      await report.save();
      return errorResponse(res, `Failed to analyze report: ${procErr.message}`, 500);
    }
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
    const { targetLanguage } = req.body;
    const lang = targetLanguage || 'en';

    const report = await MedicalReport.findOne({ _id: req.params.id, userId: req.user.id });
    if (!report) return errorResponse(res, 'Report not found', 404);
    if (!report.extractedText) return errorResponse(res, 'No extracted text to analyze', 400);

    report.status = 'Processing';
    report.targetLanguage = lang;
    await report.save();

    try {
      const analysis = await reportAnalyzer.analyzeWithAI(report.extractedText, report.reportType, lang);
      report.aiAnalysis = analysis;
      report.targetLanguage = lang;
      report.status = 'Completed';
      await report.save();
      return successResponse(res, 'Re-analysis completed successfully', report, 200);
    } catch (procErr) {
      console.error('Re-analysis failed:', procErr);
      report.status = 'Failed';
      await report.save();
      return errorResponse(res, `Re-analysis failed: ${procErr.message}`, 500);
    }
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
