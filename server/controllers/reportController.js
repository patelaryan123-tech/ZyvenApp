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
      reportType,
      targetLanguage: lang,
      status: 'Processing'
    });

    // Process async
    reportAnalyzer.processReport(req.file, reportType, lang)
      .then(async (result) => {
        const freshReport = await MedicalReport.findById(report._id);
        if (!freshReport) {
          console.log('Report document was removed during processing, skipping update.');
          return;
        }
        freshReport.extractedText = result.extractedText;
        freshReport.aiAnalysis = result.analysis;
        freshReport.targetLanguage = lang;
        freshReport.status = 'Completed';
        await freshReport.save();
        
        emailService.sendReportReady(req.user, freshReport).catch(console.error);
      })
      .catch(async (error) => {
        console.error('Report processing failed:', error);
        try {
          const freshReport = await MedicalReport.findById(report._id);
          if (freshReport) {
            freshReport.status = 'Failed';
            await freshReport.save();
          }
        } catch (e) {
          console.error('Failed to mark report as Failed:', e.message);
        }
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
    const { targetLanguage } = req.body;
    const lang = targetLanguage || 'en';

    const report = await MedicalReport.findOne({ _id: req.params.id, userId: req.user.id });
    if (!report) return errorResponse(res, 'Report not found', 404);
    if (!report.extractedText) return errorResponse(res, 'No extracted text to analyze', 400);

    report.status = 'Processing';
    report.targetLanguage = lang;
    await report.save();

    reportAnalyzer.analyzeWithAI(report.extractedText, report.reportType, lang)
      .then(async (analysis) => {
        const freshReport = await MedicalReport.findById(report._id);
        if (!freshReport) return;
        freshReport.aiAnalysis = analysis;
        freshReport.targetLanguage = lang;
        freshReport.status = 'Completed';
        await freshReport.save();
      })
      .catch(async (error) => {
        console.error('Re-analysis failed:', error);
        try {
          const freshReport = await MedicalReport.findById(report._id);
          if (freshReport) {
            freshReport.status = 'Failed';
            await freshReport.save();
          }
        } catch (e) {}
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
