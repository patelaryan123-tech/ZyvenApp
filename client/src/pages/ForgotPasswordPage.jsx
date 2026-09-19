import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  KeyRound, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Clock,
  ArrowRight
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter OTP & new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const { forgotPassword, resetPasswordWithOtp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleDigitChange = (index, value) => {
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      const newArr = [...otp];
      pasted.forEach((char, i) => {
        if (i < 6) newArr[i] = char;
      });
      setOtp(newArr);
      const nextInput = document.getElementById(`forgot-page-otp-${Math.min(pasted.length, 5)}`);
      if (nextInput) nextInput.focus();
      return;
    }

    const newArr = [...otp];
    newArr[index] = value;
    setOtp(newArr);

    if (value && index < 5) {
      const nextInput = document.getElementById(`forgot-page-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`forgot-page-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Step 1: Request 6-digit OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setStep(2);
      setCooldown(30);
      setSuccess(`A 6-digit password reset code has been sent to ${email.trim()}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send password reset code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP & New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setError('Please enter the complete 6-digit reset code.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithOtp(email.trim(), fullOtp, newPassword);
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { state: { email: email.trim() } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password. Please verify your OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || loading) return;
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setCooldown(30);
      setSuccess(`New 6-digit code sent to ${email.trim()}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to resend reset code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#EEF3EF] text-[#3D5A45] flex items-center justify-center mx-auto mb-4">
        <KeyRound className="w-7 h-7 text-[#3D5A45]" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {step === 1 ? 'Forgot Password?' : 'Set New Password'}
      </h1>
      <p className="text-xs sm:text-sm text-gray-600 mb-6">
        {step === 1 
          ? "Enter your registered email address and we'll send you a 6-digit reset code."
          : `Enter the 6-digit code sent to ${email} and choose a new password.`}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start space-x-2 text-left">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs rounded-xl border border-green-200 flex items-start space-x-2 text-left">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#3D5A45] focus:border-[#3D5A45] transition-all outline-none text-gray-900 text-sm"
                placeholder="your.email@gmail.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#3D5A45] hover:bg-[#324a3a] text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending 6-Digit Code...</span>
              </>
            ) : (
              <>
                <span>SEND RESET CODE</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 text-center">
              6-Digit Reset Code
            </label>
            <div className="flex justify-center items-center gap-1.5 sm:gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`forgot-page-otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(index, e)}
                  className="w-10 h-12 sm:w-11 sm:h-13 text-center text-lg sm:text-xl font-black bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-[#3D5A45] focus:ring-2 focus:ring-[#3D5A45] outline-none transition-all text-gray-900"
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#3D5A45] transition-all outline-none text-gray-900 text-sm"
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

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#3D5A45] transition-all outline-none text-gray-900 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 underline cursor-pointer"
            >
              Change Email
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={cooldown > 0 || loading}
              className="text-xs font-bold text-[#E07A5F] hover:underline disabled:opacity-50 flex items-center space-x-1 cursor-pointer"
            >
              {cooldown > 0 ? (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Resend in {cooldown}s</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend Code</span>
                </>
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length < 6}
            className="w-full py-3.5 px-4 bg-[#3D5A45] hover:bg-[#324a3a] text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>RESET PASSWORD</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      <div className="mt-6 pt-5 border-t border-gray-100">
        <Link 
          to="/login" 
          className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-[#3D5A45] hover:text-[#24342a] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordPage;

