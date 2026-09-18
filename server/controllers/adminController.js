const User = require('../models/User');
const EmergencyEvent = require('../models/EmergencyEvent');
const MedicalReport = require('../models/MedicalReport');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getDashboardStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const emergencyCount = await EmergencyEvent.countDocuments();
    const activeEmergencies = await EmergencyEvent.countDocuments({ status: { $in: ['Triggered', 'Escalated'] } });
    const reportsAnalyzed = await MedicalReport.countDocuments({ status: 'Completed' });

    return successResponse(res, 'Dashboard stats retrieved', {
      userCount,
      emergencyCount,
      activeEmergencies,
      reportsAnalyzed
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-emergencyContacts -linkedUsers');
    return successResponse(res, 'All users retrieved', users);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const manageUser = async (req, res) => {
  try {
    const { action } = req.body; // e.g., 'suspend', 'activate'
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 'User not found', 404);
    
    // Dummy logic for management
    if (action === 'delete') {
      await User.findByIdAndDelete(req.params.id);
      return successResponse(res, 'User deleted');
    }

    return successResponse(res, 'User managed', user);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getSystemHealth = async (req, res) => {
  try {
    const dbStatus = require('mongoose').connection.readyState === 1 ? 'Healthy' : 'Unhealthy';
    
    return successResponse(res, 'System health retrieved', {
      database: dbStatus,
      uptime: process.uptime(),
      timestamp: new Date()
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const seedDemoData = async (req, res) => {
  try {
    // Basic seeder for admin testing
    return successResponse(res, 'Seed initiated. (Not implemented in production)');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const { sendTestEmail } = require('../services/emailService');

const sendTestEmailController = async (req, res) => {
  try {
    const { to = req.user?.email } = req.body;
    if (!to) return errorResponse(res, 'Recipient email address required', 400);

    const result = await sendTestEmail(to);
    return successResponse(res, 'Test email dispatched', result);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  manageUser,
  getSystemHealth,
  seedDemoData,
  sendTestEmailController
};
