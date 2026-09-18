const GovernmentScheme = require('../models/GovernmentScheme');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// 1. Get All Schemes with filters & search
const getSchemes = async (req, res) => {
  try {
    const { category, state, search } = req.query;
    const filter = { isActive: true };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (state && state !== 'All India' && state !== 'All') {
      filter.$or = [
        { state: state },
        { state: 'All India' },
        { state: { $exists: false } }
      ];
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const schemes = await GovernmentScheme.find(filter).sort({ createdAt: -1 });
    return successResponse(res, 'Schemes retrieved', schemes);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 2. Get Scheme by ID
const getSchemeById = async (req, res) => {
  try {
    const scheme = await GovernmentScheme.findById(req.params.id);
    if (!scheme) return errorResponse(res, 'Scheme not found', 404);
    return successResponse(res, 'Scheme retrieved', scheme);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 3. Step-by-Step Interactive Questionnaire Eligibility Checker
const checkEligibility = async (req, res) => {
  try {
    const { age, state, income, hasDisability, category } = req.body;
    const userAge = parseInt(age) || 60;

    // Build matching criteria
    const allSchemes = await GovernmentScheme.find({ isActive: true });

    const evaluatedSchemes = allSchemes.map(scheme => {
      let matchScore = 0;
      let reasons = [];

      // Age Check
      const minAge = scheme.ageCriteria?.min || 0;
      const maxAge = scheme.ageCriteria?.max || 120;
      if (userAge >= minAge && userAge <= maxAge) {
        matchScore += 40;
        reasons.push(`Meets age criterion (${minAge}+ years)`);
      } else {
        reasons.push(`Requires age between ${minAge}-${maxAge} years`);
      }

      // State Check
      if (!scheme.state || scheme.state === 'All India' || scheme.state === state) {
        matchScore += 30;
        reasons.push(`Valid in your region (${scheme.state || 'National'})`);
      }

      // Category / Disability Check
      if (hasDisability && scheme.category === 'Disability') {
        matchScore += 30;
        reasons.push('Special disability healthcare assistance applicable');
      } else if (category && (scheme.category === category || category === 'All')) {
        matchScore += 20;
      } else {
        matchScore += 10;
      }

      const isEligible = matchScore >= 60;

      return {
        ...scheme.toObject(),
        matchScore: Math.min(matchScore, 100),
        isEligible,
        eligibilityReasons: reasons
      };
    });

    // Sort by match score descending
    evaluatedSchemes.sort((a, b) => b.matchScore - a.matchScore);

    return successResponse(res, 'Eligibility evaluated successfully', {
      totalFound: evaluatedSchemes.length,
      eligibleCount: evaluatedSchemes.filter(s => s.isEligible).length,
      schemes: evaluatedSchemes
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 4. Admin CRUD
const createScheme = async (req, res) => {
  try {
    const scheme = await GovernmentScheme.create(req.body);
    return successResponse(res, 'Scheme created', scheme, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const updateScheme = async (req, res) => {
  try {
    const scheme = await GovernmentScheme.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!scheme) return errorResponse(res, 'Scheme not found', 404);
    return successResponse(res, 'Scheme updated', scheme);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const deleteScheme = async (req, res) => {
  try {
    const scheme = await GovernmentScheme.findByIdAndDelete(req.params.id);
    if (!scheme) return errorResponse(res, 'Scheme not found', 404);
    return successResponse(res, 'Scheme deleted');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getSchemes,
  getSchemeById,
  checkEligibility,
  getEligibleSchemes: checkEligibility,
  createScheme,
  updateScheme,
  deleteScheme
};
