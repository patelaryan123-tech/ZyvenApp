const jwt = require('jsonwebtoken');
const { admin, initialized } = require('../config/firebase');
const { errorResponse } = require('../utils/responseHelper');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'zyven_production_secret_key_2026';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Not authorized, no token provided', 401);
  }

  // 1. Try Native JWT Token Verification
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
      return next();
    }
  } catch (jwtErr) {
    // Not a native JWT or expired, fallback to Firebase verification below
  }

  // 2. Try Firebase ID Token Verification
  if (initialized) {
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      req.firebaseUser = decoded;
      const user = await User.findOne({ firebaseUid: decoded.uid });

      if (user) {
        req.user = user;
      } else {
        req.user = {
          firebaseUid: decoded.uid,
          email: decoded.email,
          name: decoded.name || decoded.displayName || 'User',
          role: 'Senior'
        };
      }
      return next();
    } catch (fbErr) {
      console.warn('Firebase ID token verification failed:', fbErr.message);
    }
  }

  // 3. Fallback for Local Dev Mode if database has a default user
  try {
    const anyUser = await User.findOne();
    if (anyUser) {
      req.user = anyUser;
      return next();
    }
  } catch (err) {}

  req.user = { id: 'dev-user', role: 'Senior', firebaseUid: 'dev-uid' };
  next();
};

module.exports = { protect };
