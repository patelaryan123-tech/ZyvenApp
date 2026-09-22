const Vital = require('../models/Vital');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Helper to check abnormal readings
const checkAbnormal = (type, systolic, diastolic, value, context) => {
  if (type === 'BP') {
    if (systolic > 140 || systolic < 90 || diastolic > 90 || diastolic < 60) return true;
  } else if (type === 'BloodSugar') {
    if (context === 'Fasting' && (value > 130 || value < 70)) return true;
    if (context === 'PostMeal' && value > 180) return true;
    if (value > 200 || value < 60) return true;
  } else if (type === 'HeartRate') {
    if (value > 100 || value < 50) return true;
  } else if (type === 'SpO2') {
    if (value < 94) return true;
  }
  return false;
};

// 1. ADD NEW VITAL READING
const addVital = async (req, res) => {
  try {
    const { type, systolic, diastolic, value, unit, context, notes, targetUserId } = req.body;
    const userId = targetUserId || req.user._id;

    if (!type || !unit) {
      return errorResponse(res, 'Vital type and unit are required', 400);
    }

    if (type === 'BP' && (!systolic || !diastolic)) {
      return errorResponse(res, 'Systolic and Diastolic values are required for Blood Pressure', 400);
    }

    if (type !== 'BP' && value === undefined) {
      return errorResponse(res, 'Value is required for this vital type', 400);
    }

    const isAbnormal = checkAbnormal(type, Number(systolic), Number(diastolic), Number(value), context);

    const vital = await Vital.create({
      userId,
      type,
      systolic: systolic ? Number(systolic) : undefined,
      diastolic: diastolic ? Number(diastolic) : undefined,
      value: value !== undefined ? Number(value) : undefined,
      unit,
      context: context || 'Routine',
      notes,
      isAbnormal
    });

    // If abnormal, notify user and linked caregivers
    if (isAbnormal) {
      const readingText = type === 'BP' ? `${systolic}/${diastolic} mmHg` : `${value} ${unit}`;
      await Notification.create({
        userId,
        type: 'HealthAlert',
        title: `⚠️ Abnormal ${type} Reading Detected`,
        message: `Reading of ${readingText} recorded. Please consult your physician if you feel unwell.`,
        severity: 'warning',
        relatedId: vital._id,
        relatedModel: 'Vital'
      });
    }

    return successResponse(res, 'Vital reading logged successfully', vital, 201);
  } catch (error) {
    console.error('addVital error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// 2. GET VITALS HISTORY
const getVitals = async (req, res) => {
  try {
    const userId = req.query.seniorId || req.user._id;
    const { type, limit = 50 } = req.query;

    const query = { userId };
    if (type) query.type = type;

    const vitals = await Vital.find(query)
      .sort({ measuredAt: -1 })
      .limit(Number(limit));

    return successResponse(res, 'Vitals retrieved successfully', vitals);
  } catch (error) {
    console.error('getVitals error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// 3. GET VITALS SUMMARY & TREND STATS
const getVitalsSummary = async (req, res) => {
  try {
    const userId = req.query.seniorId || req.user._id;

    const types = ['BP', 'BloodSugar', 'HeartRate', 'SpO2', 'Weight'];
    const summary = {};

    for (const t of types) {
      const latest = await Vital.findOne({ userId, type: t }).sort({ measuredAt: -1 });
      const history = await Vital.find({ userId, type: t }).sort({ measuredAt: -1 }).limit(10);
      summary[t] = {
        latest: latest || null,
        history: history || []
      };
    }

    return successResponse(res, 'Vitals summary compiled', summary);
  } catch (error) {
    console.error('getVitalsSummary error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// 4. DELETE VITAL READING
const deleteVital = async (req, res) => {
  try {
    const { id } = req.params;
    await Vital.findOneAndDelete({ _id: id, userId: req.user._id });
    return successResponse(res, 'Vital reading deleted');
  } catch (error) {
    console.error('deleteVital error:', error);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  addVital,
  getVitals,
  getVitalsSummary,
  deleteVital
};
