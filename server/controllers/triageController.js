const { analyzeSymptoms } = require('../services/aiService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const evaluateSymptoms = async (req, res) => {
  try {
    const { symptoms, age, gender, duration, severity, existingConditions } = req.body;

    if (!symptoms || (Array.isArray(symptoms) && symptoms.length === 0)) {
      return errorResponse(res, 'Please provide at least one symptom.', 400);
    }

    const evaluation = await analyzeSymptoms(
      symptoms, 
      age || req.user.age || 65, 
      gender || req.user.gender || 'Unspecified', 
      duration, 
      severity, 
      existingConditions || []
    );

    return successResponse(res, 'Symptom triage evaluation complete', evaluation);
  } catch (error) {
    console.error('evaluateSymptoms error:', error);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  evaluateSymptoms
};
