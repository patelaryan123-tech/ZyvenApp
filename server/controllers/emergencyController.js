const emergencyService = require('../services/emergencyService');
const EmergencyEvent = require('../models/EmergencyEvent');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getUserId = async (req) => {
  if (req.user && req.user._id) return req.user._id;
  if (req.user && req.user.id && req.user.id !== 'dev-user') return req.user.id;
  const fbUid = (req.user && req.user.firebaseUid) || (req.firebaseUser && req.firebaseUser.uid);
  if (fbUid) {
    const u = await User.findOne({ firebaseUid: fbUid });
    if (u) return u._id;
  }
  return req.user?.id || req.user?._id;
};

// 1. Trigger SOS
const triggerSOS = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { eventType = 'SOS', location } = req.body;
    const event = await emergencyService.createEmergency(userId, eventType, location);
    return successResponse(res, 'Emergency alert triggered successfully', event, 201);
  } catch (error) {
    console.error('triggerSOS error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// 2. Cancel SOS
const cancelSOS = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const event = await emergencyService.cancelEmergency(req.params.id, userId);
    return successResponse(res, 'Emergency alert cancelled', event);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 3. Acknowledge SOS (Caregiver)
const acknowledgeSOS = async (req, res) => {
  try {
    const event = await emergencyService.acknowledgeEmergency(req.params.id);
    return successResponse(res, 'Emergency acknowledged by caregiver', event);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 4. Resolve SOS
const resolveSOS = async (req, res) => {
  try {
    const event = await emergencyService.resolveEmergency(req.params.id);
    return successResponse(res, 'Emergency resolved', event);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 5. Emergency History
const getEmergencyHistory = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const history = await emergencyService.getEmergencyHistory(userId);
    return successResponse(res, 'Emergency history retrieved', history);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 6. Active Emergency
const getActiveEmergency = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const active = await EmergencyEvent.findOne({ 
      userId, 
      status: { $in: ['Triggered', 'Active', 'Escalated'] } 
    }).sort({ createdAt: -1 });
    
    return successResponse(res, 'Active emergency retrieved', active);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 7. Get Emergency Contacts
const getContacts = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const user = await User.findById(userId);
    return successResponse(res, 'Contacts retrieved', user?.emergencyContacts || []);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 8. Add / Update Emergency Contact
const addContact = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const { name, phone, email, relationship } = req.body;
    
    if (!name || !phone) {
      return errorResponse(res, 'Name and phone are required for emergency contact', 400);
    }

    const user = await User.findById(userId);
    if (!user) return errorResponse(res, 'User not found', 404);

    user.emergencyContacts.push({ name, phone, email, relationship: relationship || 'Family' });
    await user.save();

    return successResponse(res, 'Emergency contact added', user.emergencyContacts, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// 9. Delete Emergency Contact
const deleteContact = async (req, res) => {
  try {
    const userId = await getUserId(req);
    const user = await User.findById(userId);
    if (!user) return errorResponse(res, 'User not found', 404);

    user.emergencyContacts = user.emergencyContacts.filter(c => c._id?.toString() !== req.params.id);
    await user.save();

    return successResponse(res, 'Emergency contact removed', user.emergencyContacts);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  triggerSOS,
  cancelSOS,
  acknowledgeSOS,
  resolveSOS,
  getEmergencyHistory,
  getActiveEmergency,
  getContacts,
  addContact,
  deleteContact
};
