const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return successResponse(res, 'Users retrieved', users);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, 'User retrieved', user);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, 'User updated', user);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const linkUser = async (req, res) => {
  try {
    const { email, relationship, permissions } = req.body;
    
    const linkedUser = await User.findOne({ email });
    if (!linkedUser) return errorResponse(res, 'User to link not found', 404);

    const currentUser = await User.findById(req.user.id);
    
    const alreadyLinked = currentUser.linkedUsers.find(u => u.userId.toString() === linkedUser._id.toString());
    if (alreadyLinked) return errorResponse(res, 'User already linked', 400);

    currentUser.linkedUsers.push({
      userId: linkedUser._id,
      relationship,
      permissions: permissions || []
    });

    await currentUser.save();
    return successResponse(res, 'User linked successfully', currentUser.linkedUsers);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getLinkedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('linkedUsers.userId', 'name email role phone');
    return successResponse(res, 'Linked users retrieved', user.linkedUsers);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  linkUser,
  getLinkedUsers
};
