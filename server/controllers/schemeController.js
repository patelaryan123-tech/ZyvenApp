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

// 3. Continuous Personalized Scheme Matching for Logged-In User
const getPersonalizedSchemes = async (req, res) => {
  try {
    const User = require('../models/User');
    const userId = req.user?._id || req.user?.id;
    let user = null;
    if (userId) {
      user = await User.findById(userId);
    }

    const { category, state: stateOverride, search } = req.query;

    const userAge = user?.age || 60;
    const userState = stateOverride || user?.state || 'All India';
    const userIncome = user?.incomeCategory || 'Low Income (< Rs. 2.5 Lakh/yr)';
    const userHasDisability = Boolean(user?.hasDisability);
    const userGender = user?.gender || 'All';

    // Query filter for categories / search
    const filter = { isActive: true };
    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const allSchemes = await GovernmentScheme.find(filter);

    const evaluatedSchemes = allSchemes.map(scheme => {
      let matchScore = 0;
      let reasons = [];
      let missingCriteria = [];

      // 1. Age Check
      const minAge = scheme.ageCriteria?.min ?? 0;
      const maxAge = scheme.ageCriteria?.max ?? 120;
      if (userAge >= minAge && userAge <= maxAge) {
        matchScore += 40;
        reasons.push(`Eligible age (${userAge} yrs meets requirement of ${minAge === 0 ? 'any age' : minAge + '+ yrs'})`);
      } else {
        missingCriteria.push(`Requires age between ${minAge}-${maxAge} yrs (current: ${userAge} yrs)`);
      }

      // 2. Region / State Check
      const schemeState = scheme.state || 'All India';
      if (schemeState === 'All India' || schemeState === userState || userState === 'All India') {
        matchScore += 30;
        reasons.push(`Valid in your region (${schemeState})`);
      } else {
        missingCriteria.push(`Applicable in ${schemeState}`);
      }

      // 3. Income / BPL Check
      const isLowIncomeUser = userIncome.toLowerCase().includes('low') || userIncome.toLowerCase().includes('bpl') || userIncome.toLowerCase().includes('1.5');
      const isSchemeLowIncome = scheme.incomeCriteria?.toLowerCase().includes('bpl') || scheme.incomeCriteria?.toLowerCase().includes('low') || scheme.description?.toLowerCase().includes('bpl') || scheme.description?.toLowerCase().includes('low income');

      if (isSchemeLowIncome) {
        if (isLowIncomeUser) {
          matchScore += 20;
          reasons.push('Meets income / BPL criteria');
        } else {
          missingCriteria.push('Priority given to Low Income / BPL households');
        }
      } else {
        matchScore += 20;
        reasons.push('Open to all income categories');
      }

      // 4. Disability / Assisted Aid Check
      if (scheme.category === 'Disability' || scheme.category === 'Senior Support') {
        if (userHasDisability) {
          matchScore += 10;
          reasons.push('Assisted aid / disability coverage available');
        } else {
          matchScore += 5;
        }
      } else {
        matchScore += 10;
      }

      const isEligible = matchScore >= 60;

      return {
        ...scheme.toObject(),
        matchScore: Math.min(matchScore, 100),
        isEligible,
        eligibilityReasons: reasons,
        missingCriteria
      };
    });

    // Sort by match score descending
    evaluatedSchemes.sort((a, b) => b.matchScore - a.matchScore);

    return successResponse(res, 'Personalized schemes retrieved', {
      beneficiaryProfile: {
        age: userAge,
        state: userState,
        incomeCategory: userIncome,
        hasDisability: userHasDisability,
        gender: userGender
      },
      totalFound: evaluatedSchemes.length,
      eligibleCount: evaluatedSchemes.filter(s => s.isEligible).length,
      schemes: evaluatedSchemes
    });

  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 4. Step-by-Step Interactive Questionnaire Eligibility Checker (Manual Fallback)
const checkEligibility = async (req, res) => {
  try {
    const { age, state, income, hasDisability, category } = req.body;
    const userAge = parseInt(age) || 60;

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

// 5. Admin CRUD
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
  getPersonalizedSchemes,
  checkEligibility,
  getEligibleSchemes: getPersonalizedSchemes,
  createScheme,
  updateScheme,
  deleteScheme
};
