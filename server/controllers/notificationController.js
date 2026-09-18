const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    return successResponse(res, 'Notifications retrieved', notifications);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) return errorResponse(res, 'Notification not found', 404);
    return successResponse(res, 'Notification marked as read', notification);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true }
    );
    return successResponse(res, 'All notifications marked as read');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!notification) return errorResponse(res, 'Notification not found', 404);
    return successResponse(res, 'Notification deleted');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user.id, read: false });
    return successResponse(res, 'Unread count retrieved', { count });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
};
