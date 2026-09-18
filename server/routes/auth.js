const express = require('express');
const router = express.Router();
const { 
  registerWithEmailOtp, 
  verifyEmailOtp, 
  resendEmailOtp, 
  loginWithEmail, 
  syncUser, 
  getMe, 
  getProfile, 
  updateProfile, 
  deleteAccount 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public 6-Digit Email OTP routes
router.post('/register-otp', registerWithEmailOtp);
router.post('/verify-otp', verifyEmailOtp);
router.post('/resend-otp', resendEmailOtp);
router.post('/login-email', loginWithEmail);

// User Profile & Sync routes
router.post('/sync', protect, syncUser);
router.post('/profile', protect, syncUser);
router.get('/me', protect, getMe);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteAccount);

module.exports = router;
