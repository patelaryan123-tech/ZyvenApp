const Hospital = require('../models/Hospital');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// 1. Get Hospitals with Filters & Search
const getHospitals = async (req, res) => {
  try {
    const { type, emergency, city, specialty, search } = req.query;
    const query = {};

    if (type && type !== 'All') query.type = type;
    if (emergency === 'true') query.emergencyAvailable = true;
    if (city) query.city = { $regex: city, $options: 'i' };
    if (specialty) query.specialties = { $in: [new RegExp(specialty, 'i')] };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { specialties: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const hospitals = await Hospital.find(query).sort({ emergencyAvailable: -1, rating: -1 });
    return successResponse(res, 'Hospitals retrieved', hospitals);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 2. Get Hospital by ID
const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return errorResponse(res, 'Hospital not found', 404);
    return successResponse(res, 'Hospital retrieved', hospital);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 3. Search Nearby (Geospatial)
const searchNearby = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 50000, type, emergency } = req.query;
    
    if (!lat || !lng) {
      return getHospitals(req, res);
    }

    const geoQuery = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    };

    if (type && type !== 'All') geoQuery.type = type;
    if (emergency === 'true') geoQuery.emergencyAvailable = true;

    const hospitals = await Hospital.find(geoQuery);
    return successResponse(res, 'Nearby hospitals retrieved', hospitals);
  } catch (error) {
    // If 2dsphere index query fails or points are unindexed, fallback to standard list
    return getHospitals(req, res);
  }
};

// 4. Create Hospital (Admin / Setup)
const createHospital = async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body);
    return successResponse(res, 'Hospital created successfully', hospital, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 5. Update Hospital
const updateHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hospital) return errorResponse(res, 'Hospital not found', 404);
    return successResponse(res, 'Hospital updated', hospital);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 6. Delete Hospital
const deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) return errorResponse(res, 'Hospital not found', 404);
    return successResponse(res, 'Hospital deleted');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getHospitals,
  getHospitalById,
  searchNearby,
  createHospital,
  updateHospital,
  deleteHospital
};
