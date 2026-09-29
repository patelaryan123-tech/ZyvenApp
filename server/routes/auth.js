const express = require('express');
const router = express.Router();
const { 
  registerWithEmailOtp, 
  verifyEmailOtp, 
  resendEmailOtp, 
  loginWithEmail, 
  forgotPassword,
  resetPasswordWithOtp,
  syncUser, 
  getMe, 
  getProfile, 
  updateProfile, 
  deleteAccount 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public 6-Digit Email OTP & Password routes
router.post('/register-otp', registerWithEmailOtp);
router.post('/verify-otp', verifyEmailOtp);
router.post('/resend-otp', resendEmailOtp);
router.post('/login-email', loginWithEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordWithOtp);

// Email diagnostic test (remove after confirming emails work)
router.get('/test-email', async (req, res) => {
  try {
    const { sendTestEmail } = require('../services/emailService');
    const result = await sendTestEmail('patelaryan4908@gmail.com');
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// User Profile & Sync routes
router.post('/sync', protect, syncUser);
router.post('/profile', protect, syncUser);
router.get('/me', protect, getMe);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteAccount);

module.exports = router;
