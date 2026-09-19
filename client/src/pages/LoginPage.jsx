import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  Mail, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Clock,
  ShieldCheck,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

const LoginPage = () => {
  // Email Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailNeedsOtp, setEmailNeedsOtp] = useState(false);
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [emailCooldown, setEmailCooldown] = useState(0);

  // General UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Forgot Password Modal State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = enter email, 2 = enter OTP & new password
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetCooldown, setResetCooldown] = useState(0);

  const { loginWithEmail, verifyEmailOtp, resendEmailOtp, loginWithGoogle, forgotPassword, resetPasswordWithOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let timer;
    if (emailCooldown > 0) {
      timer = setInterval(() => setEmailCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [emailCooldown]);

  useEffect(() => {
    let timer;
    if (resetCooldown > 0) {
      timer = setInterval(() => setResetCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resetCooldown]);

  useEffect(() => {
    if (location.state?.verifiedSuccess) {
      setSuccessMessage('Email verified successfully! Please log in to your account.');
    }
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const formatAuthError = (err) => {
    return err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
  };

  const handleRedirectByRole = (dbUser) => {
    const role = dbUser?.role;
    if (role === ROLES.CAREGIVER || role === ROLES.FAMILY_MEMBER || role === 'caregiver') {
      navigate('/caregiver');
    } else {
      navigate('/dashboard');
    }
  };

  // 1. Handle Email & Password Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginWithEmail(email.trim(), password);

      if (result.isVerified === false) {
        setEmailNeedsOtp(true);
        setEmailCooldown(30);
        setSuccessMessage(`Please enter the 6-digit OTP sent to ${email.trim()}`);
        return;
      }

      handleRedirectByRole(result.user);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Email OTP Verification during Login
  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    setError('');
    const fullOtp = emailOtp.join('');
    if (fullOtp.length < 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyEmailOtp(email.trim(), fullOtp);
      const user = res.data?.user;
      handleRedirectByRole(user);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Resend Email OTP during Login
  const handleResendEmailOtp = async () => {
    if (emailCooldown > 0) return;
    setError('');
    setIsLoading(true);
    try {
      await resendEmailOtp(email.trim());
      setEmailCooldown(30);
      setSuccessMessage(`Fresh 6-digit OTP sent to ${email.trim()}`);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      const result = await loginWithGoogle();
      handleRedirectByRole(result.user);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1 of Forgot Password: Request OTP
  const handleRequestPasswordReset = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetEmail.trim()) {
      setResetError('Please enter your registered email address.');
      return;
    }

    setResetLoading(true);
    try {
      await forgotPassword(resetEmail.trim());
      setForgotStep(2);
      setResetCooldown(30);
      setResetSuccess(`A 6-digit reset code has been sent to ${resetEmail.trim()}`);
    } catch (err) {
      setResetError(err.response?.data?.message || err.message || 'Failed to send password reset code.');
    } finally {
      setResetLoading(false);
    }
  };

  // Step 2 of Forgot Password: Submit OTP + New Password
  const handleSubmitNewPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    const fullOtp = resetOtp.join('');
    if (fullOtp.length < 6) {
      setResetError('Please enter the full 6-digit reset code.');
      return;
    }

    if (newPassword.length < 6) {
      setResetError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setResetLoading(true);
    try {
      await resetPasswordWithOtp(resetEmail.trim(), fullOtp, newPassword);
      setSuccessMessage('Password successfully updated! You can now sign in.');
      setShowForgotPassword(false);
      setPassword('');
    } catch (err) {
      setResetError(err.response?.data?.message || err.message || 'Failed to reset password. Please verify the code.');
    } finally {
      setResetLoading(false);
    }
  };

  // Resend Reset OTP
  const handleResendResetOtp = async () => {
    if (resetCooldown > 0 || resetLoading) return;
    setResetError('');
    setResetLoading(true);
    try {
      await forgotPassword(resetEmail.trim());
      setResetCooldown(30);
      setResetSuccess(`New 6-digit code sent to ${resetEmail.trim()}`);
    } catch (err) {
      setResetError(err.response?.data?.message || err.message || 'Failed to resend code.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleDigitChange = (index, value, currentArray, setArray, prefix) => {
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      const newArr = [...currentArray];
      pasted.forEach((char, i) => {
        if (i < 6) newArr[i] = char;
      });
      setArray(newArr);
      const nextInput = document.getElementById(`${prefix}-${Math.min(pasted.length, 5)}`);
      if (nextInput) nextInput.focus();
      return;
    }

    const newArr = [...currentArray];
    newArr[index] = value;
    setArray(newArr);

    if (value && index < 5) {
      const nextInput = document.getElementById(`${prefix}-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleDigitKeyDown = (index, e, currentArray, prefix) => {
    if (e.key === 'Backspace' && !currentArray[index] && index > 0) {
      const prevInput = document.getElementById(`${prefix}-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-lg mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100/80"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#EEF3EF] text-[#3D5A45] mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Welcome Back
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Sign in to access your ZYVEN healthcare portal
        </p>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-5 p-3.5 bg-green-50 text-green-800 text-xs sm:text-sm rounded-xl border border-green-200 flex items-start space-x-2"
        >
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{successMessage}</span>
        </motion.div>
      )}

      {/* Error Banner */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-5 p-3.5 bg-red-50 text-red-700 text-xs sm:text-sm rounded-xl border border-red-200 flex items-start space-x-2"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </motion.div>
      )}

      {/* Form Area */}
      {!emailNeedsOtp ? (
        /* 1. Standard Email & Password Form */
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#3D5A45] focus:border-[#3D5A45] transition-all outline-none text-gray-900 text-sm"
                placeholder="your.email@gmail.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(true);
                  setForgotStep(1);
                  setResetEmail(email);
                  setResetOtp(['', '', '', '', '', '']);
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setResetError('');
                  setResetSuccess('');
                }}
                className="text-xs font-bold text-[#E07A5F] hover:text-[#c45e43] hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-gray-50/60 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#3D5A45] focus:border-[#3D5A45] transition-all outline-none text-gray-900 text-sm"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 bg-[#3D5A45] hover:bg-[#324a3a] active:scale-[0.99] text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>LOGIN</span>
            )}
          </button>
        </form>
      ) : (
        /* 2. Unverified Email OTP Gate */
        <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
          <div className="text-center">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Enter 6-Digit Email Verification Code
            </label>
            <p className="text-xs text-gray-500 mb-4">
              Enter the code sent to <strong className="text-gray-800">{email}</strong>
            </p>
            
            <div className="flex justify-center items-center gap-1.5 sm:gap-2">
              {emailOtp.map((digit, index) => (
                <input
                  key={index}
                  id={`login-email-otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value, emailOtp, setEmailOtp, 'login-email-otp')}
                  onKeyDown={(e) => handleDigitKeyDown(index, e, emailOtp, 'login-email-otp')}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-black bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-[#3D5A45] focus:ring-2 focus:ring-[#3D5A45] outline-none transition-all text-gray-900"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || emailOtp.join('').length < 6}
            className="w-full py-3.5 px-4 bg-[#3D5A45] hover:bg-[#324a3a] active:scale-[0.99] text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying & Logging in...</span>
              </>
            ) : (
              <>
                <span>VERIFY OTP & LOGIN</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setEmailNeedsOtp(false)}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 underline cursor-pointer"
            >
              Back to Password
            </button>

            <button
              type="button"
              onClick={handleResendEmailOtp}
              disabled={emailCooldown > 0 || isLoading}
              className="text-xs font-bold text-[#E07A5F] hover:underline disabled:opacity-50 flex items-center space-x-1 cursor-pointer"
            >
              {emailCooldown > 0 ? (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Resend in {emailCooldown}s</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend OTP</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Google Login */}
      <div className="my-5 flex items-center">
        <div className="flex-1 border-t border-gray-200" />
        <span className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">or</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full py-2.5 px-4 border border-gray-200/90 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2.5 text-xs sm:text-sm cursor-pointer shadow-xs disabled:opacity-70"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z" />
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
          <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-3.1z" />
          <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16.1C3.5 19.9 7.4 23 12 23z" />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Switch to Register */}
      <div className="mt-6 pt-5 border-t border-gray-100 text-center">
        <p className="text-xs sm:text-sm text-gray-600">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="font-bold text-[#3D5A45] hover:text-[#24342a] hover:underline"
          >
            REGISTER
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal (2-Step 6-Digit OTP Reset) */}
      <AnimatePresence>
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#EEF3EF] text-[#3D5A45] flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 text-center">
                {forgotStep === 1 ? 'Reset Your Password' : 'Set New Password'}
              </h3>
              <p className="text-xs text-gray-500 mb-4 text-center">
                {forgotStep === 1 
                  ? 'Enter your registered email address to receive a 6-digit reset code.' 
                  : `Enter the 6-digit code sent to ${resetEmail} and choose a new password.`}
              </p>

              {resetError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs rounded-xl border border-green-200 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              {forgotStep === 1 ? (
                /* Step 1: Input Email */
                <form onSubmit={handleRequestPasswordReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="your.email@gmail.com"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45]"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 text-xs sm:text-sm font-bold rounded-xl hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="flex-1 py-2.5 px-4 bg-[#3D5A45] hover:bg-[#324a3a] text-white text-xs sm:text-sm font-bold rounded-xl disabled:opacity-60 cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      {resetLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Code</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Input OTP and New Password */
                <form onSubmit={handleSubmitNewPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 text-center">
                      6-Digit Reset Code
                    </label>
                    <div className="flex justify-center items-center gap-1.5">
                      {resetOtp.map((digit, index) => (
                        <input
                          key={index}
                          id={`forgot-otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength="6"
                          value={digit}
                          onChange={(e) => handleDigitChange(index, e.target.value, resetOtp, setResetOtp, 'forgot-otp')}
                          onKeyDown={(e) => handleDigitKeyDown(index, e, resetOtp, 'forgot-otp')}
                          className="w-9 h-11 sm:w-10 sm:h-12 text-center text-lg font-black bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-[#3D5A45] focus:ring-2 focus:ring-[#3D5A45] outline-none transition-all text-gray-900"
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-900 underline cursor-pointer"
                    >
                      Change Email
                    </button>

                    <button
                      type="button"
                      onClick={handleResendResetOtp}
                      disabled={resetCooldown > 0 || resetLoading}
                      className="text-xs font-bold text-[#E07A5F] hover:underline disabled:opacity-50 flex items-center space-x-1 cursor-pointer"
                    >
                      {resetCooldown > 0 ? (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Resend in {resetCooldown}s</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Resend Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 text-xs sm:text-sm font-bold rounded-xl hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading || resetOtp.join('').length < 6}
                      className="flex-1 py-2.5 px-4 bg-[#3D5A45] hover:bg-[#324a3a] text-white text-xs sm:text-sm font-bold rounded-xl disabled:opacity-60 cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      {resetLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <span>Set Password</span>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default LoginPage;

