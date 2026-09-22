const CareLog = require('../models/CareLog');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// 1. ADD CARE LOG ENTRY
const addCareLog = async (req, res) => {
  try {
    const { seniorId, category, note, sentiment } = req.body;
    const targetSeniorId = seniorId || req.user._id;

    if (!note || !note.trim()) {
      return errorResponse(res, 'Care note text is required', 400);
    }

    const careLog = await CareLog.create({
      seniorId: targetSeniorId,
      authorId: req.user._id,
      authorName: req.user.name || 'Caregiver',
      category: category || 'General',
      note: note.trim(),
      sentiment: sentiment || 'Neutral'
    });

    return successResponse(res, 'Care log added successfully', careLog, 201);
  } catch (error) {
    console.error('addCareLog error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// 2. GET CARE LOGS FOR A SENIOR
const getCareLogs = async (req, res) => {
  try {
    const seniorId = req.query.seniorId || req.user._id;
    const limit = Number(req.query.limit) || 30;

    const logs = await CareLog.find({ seniorId })
      .sort({ createdAt: -1 })
      .limit(limit);

    return successResponse(res, 'Care logs retrieved', logs);
  } catch (error) {
    console.error('getCareLogs error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// 3. DELETE CARE LOG ENTRY
const deleteCareLog = async (req, res) => {
  try {
    const { id } = req.params;
    await CareLog.findOneAndDelete({ _id: id });
    return successResponse(res, 'Care log deleted');
  } catch (error) {
    console.error('deleteCareLog error:', error);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  addCareLog,
  getCareLogs,
  deleteCareLog
};
