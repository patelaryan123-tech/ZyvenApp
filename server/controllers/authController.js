const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmailOtp, sendWelcomeEmail } = require('../services/emailService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const JWT_SECRET = process.env.JWT_SECRET || 'zyven_production_secret_key_2026';

// Helper: Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      firebaseUid: user.firebaseUid,
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// 1. REGISTER WITH EMAIL & SEND 6-DIGIT OTP
const registerWithEmailOtp = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Please provide name, email and password', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters', 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    let existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser && existingUser.isVerified) {
      return errorResponse(res, 'An account already exists with this email. Please log in.', 400);
    }

    // Generate random 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (existingUser) {
      // Update unverified user
      existingUser.name = name.trim();
      existingUser.password = hashedPassword;
      existingUser.role = role || 'Senior';
      existingUser.otp = { code: otpCode, expiresAt: otpExpiresAt };
      existingUser.isVerified = false;
      await existingUser.save();
    } else {
      // Create new unverified user
      existingUser = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: role || 'Senior',
        otp: { code: otpCode, expiresAt: otpExpiresAt },
        isVerified: false
      });
    }

    // Send 6-digit OTP email
    await sendEmailOtp(cleanEmail, otpCode, name.trim());

    return successResponse(res, '6-Digit verification code sent to your email.', {
      email: cleanEmail,
      name: name.trim(),
      role: role || 'Senior'
    }, 201);

  } catch (error) {
    console.error('registerWithEmailOtp error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// 2. VERIFY 6-DIGIT EMAIL OTP & LOG IN
const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return errorResponse(res, 'Email and 6-digit OTP code are required', 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return errorResponse(res, 'User not found. Please register first.', 404);
    }

    if (!user.otp || !user.otp.code) {
      return errorResponse(res, 'No pending OTP found. Please request a new code.', 400);
    }

    if (new Date() > new Date(user.otp.expiresAt)) {
      return errorResponse(res, 'OTP has expired. Please request a new code.', 400);
    }

    if (user.otp.code !== cleanOtp) {
      return errorResponse(res, 'Invalid 6-digit code. Please check and try again.', 400);
    }

    // Mark as verified & clear OTP
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    // Send Welcome Email in background
    try {
      await sendWelcomeEmail(user);
    } catch (e) {
      console.warn('Welcome email dispatch error:', e.message);
    }

    return successResponse(res, 'Email verified successfully!', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true
      }
    });

  } catch (error) {
    console.error('verifyEmailOtp error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// 3. RESEND 6-DIGIT EMAIL OTP
const resendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 'Email is required to resend OTP', 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return errorResponse(res, 'No registered account found with this email.', 404);
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = { code: otpCode, expiresAt: otpExpiresAt };
    await user.save();

    await sendEmailOtp(cleanEmail, otpCode, user.name);

    return successResponse(res, 'New 6-digit verification code sent to your email.');

  } catch (error) {
    console.error('resendEmailOtp error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// 4. EMAIL & PASSWORD LOGIN
const loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Please provide email and password', 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return errorResponse(res, 'Incorrect email or password.', 401);
    }

    if (!user.password) {
      return errorResponse(res, 'This account was created with Phone/Google. Please sign in with that method.', 400);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Incorrect email or password.', 401);
    }

    // If email is unverified, trigger a new OTP and inform frontend
    if (!user.isVerified) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = { code: otpCode, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
      await user.save();
      await sendEmailOtp(cleanEmail, otpCode, user.name);

      return successResponse(res, 'Please verify your email OTP before logging in.', {
        isVerified: false,
        email: user.email,
        name: user.name
      }, 200);
    }

    const token = generateToken(user);

    return successResponse(res, 'Login successful', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true
      }
    });

  } catch (error) {
    console.error('loginWithEmail error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// 5. FIREBASE / GENERAL SYNC USER
const syncUser = async (req, res) => {
  try {
    const firebaseUid = req.body.firebaseUid || (req.user && req.user.firebaseUid) || (req.firebaseUser && req.firebaseUser.uid);
    const email = (req.body.email || (req.user && req.user.email) || (req.firebaseUser && req.firebaseUser.email) || '').toLowerCase();
    const name = req.body.name || (req.user && req.user.name) || (req.firebaseUser && (req.firebaseUser.name || req.firebaseUser.displayName)) || 'User';
    const role = req.body.role || (req.user && req.user.role) || 'Senior';
    const phone = req.body.phone || '';
    
    let user = null;
    if (firebaseUid) {
      user = await User.findOne({ firebaseUid });
    }
    if (!user && email) {
      user = await User.findOne({ email });
    }

    if (user) {
      if (firebaseUid && !user.firebaseUid) user.firebaseUid = firebaseUid;
      if (name && name !== 'User') user.name = name;
      if (phone) user.phone = phone;
      if (role && user.role !== role) user.role = role;
      user.isVerified = true;
      await user.save();
      const token = generateToken(user);
      return successResponse(res, 'User synced successfully', { user, token });
    } else {
      user = await User.create({
        firebaseUid: firebaseUid || undefined,
        name,
        email: email || `${Date.now()}@zyven.local`,
        phone,
        role,
        isVerified: true
      });

      const token = generateToken(user);
      return successResponse(res, 'User created successfully', { user, token }, 201);
    }
  } catch (error) {
    console.error('syncUser error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// 6. GET CURRENT PROFILE
const getMe = async (req, res) => {
  try {
    let user = null;
    if (req.user && req.user._id) {
      user = await User.findById(req.user._id).populate('linkedUsers.userId', 'name email role');
    } else if (req.user && req.user.id) {
      user = await User.findById(req.user.id).populate('linkedUsers.userId', 'name email role');
    } else if (req.firebaseUser && req.firebaseUser.uid) {
      user = await User.findOne({ firebaseUid: req.firebaseUser.uid }).populate('linkedUsers.userId', 'name email role');
    }

    if (!user) {
      return errorResponse(res, 'User profile not found in database', 404);
    }

    return successResponse(res, 'Profile retrieved', user);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getProfile = async (req, res) => {
  return getMe(req, res);
};

const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.role;
    delete updates.firebaseUid;
    delete updates.password;

    const userId = req.user?._id || req.user?.id;
    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
    return successResponse(res, 'Profile updated', user);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    await User.findByIdAndDelete(userId);
    return successResponse(res, 'Account deleted');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  registerWithEmailOtp,
  verifyEmailOtp,
  resendEmailOtp,
  loginWithEmail,
  syncUser,
  getMe,
  getProfile,
  updateProfile,
  deleteAccount
};
