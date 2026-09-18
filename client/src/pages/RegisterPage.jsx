import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  User, 
  Mail, 
  Phone,
  Lock, 
  HeartHandshake, 
  Activity, 
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

const roleOptions = [
  {
    id: ROLES.SENIOR,
    label: 'Senior / Patient',
    badge: 'Senior Care',
    icon: Activity,
    description: 'Medication reminders, AI companion, SOS & Health reports',
    color: 'border-[#3D5A45] bg-[#EEF3EF] text-[#3D5A45]'
  },
  {
    id: ROLES.CAREGIVER,
    label: 'Caregiver',
    badge: 'Care Helper',
    icon: HeartHandshake,
    description: 'Patient monitoring, adherence tracking & emergency alerts',
    color: 'border-[#E07A5F] bg-[#FDF2EF] text-[#E07A5F]'
  }
];

const RegisterPage = () => {
  const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'phone'
  
  // Common fields
  const [name, setName] = useState('');
  const [role, setRole] = useState(ROLES.SENIOR);
  
  // Email fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [emailCooldown, setEmailCooldown] = useState(0);

  // Phone fields
  const [phone, setPhone] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState(['', '', '', '', '', '']);
  const [phoneCooldown, setPhoneCooldown] = useState(0);

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { registerWithEmailOtp, verifyEmailOtp, resendEmailOtp, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const navigate = useNavigate();

  // Cooldown countdown timers
  useEffect(() => {
    let timer;
    if (emailCooldown > 0) {
      timer = setInterval(() => setEmailCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [emailCooldown]);

  useEffect(() => {
    let timer;
    if (phoneCooldown > 0) {
      timer = setInterval(() => setPhoneCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [phoneCooldown]);

  const formatAuthError = (err) => {
    const message = err.message || '';
    if (message.includes('auth/billing-not-enabled')) {
      return 'Firebase SMS billing is not enabled. Please enable billing or test numbers in Firebase Console.';
    }
    return err.response?.data?.message || err.message || 'Registration failed. Please try again.';
  };

  // 1. Send Email 6-Digit OTP
  const handleSendEmailOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await registerWithEmailOtp(name.trim(), email.trim(), password, role);
      setEmailOtpSent(true);
      setEmailCooldown(30);
      setSuccessMsg(`6-Digit OTP sent to ${email.trim()}. (Check your inbox or backend terminal)`);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify Email 6-Digit OTP
  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    setError('');
    const fullOtp = emailOtp.join('');
    if (fullOtp.length < 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    try {
      await verifyEmailOtp(email.trim(), fullOtp);
      if (role === ROLES.CAREGIVER) {
        navigate('/caregiver');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Resend Email OTP
  const handleResendEmailOtp = async () => {
    if (emailCooldown > 0) return;
    setError('');
    setIsLoading(true);
    try {
      await resendEmailOtp(email.trim());
      setEmailCooldown(30);
      setSuccessMsg(`New 6-digit OTP sent to ${email.trim()}`);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Send Phone OTP
  const handleSendPhoneOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    const cleanPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPhoneOtp(cleanPhone, 'recaptcha-reg-container');
      setPhoneOtpSent(true);
      setPhoneCooldown(30);
      setSuccessMsg(`SMS OTP sent to +91 ${cleanPhone.slice(-10)}`);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Verify Phone OTP
  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault();
    setError('');
    const fullOtp = phoneOtp.join('');
    if (fullOtp.length < 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    try {
      await verifyPhoneOtp(fullOtp, {
        name: name.trim(),
        role: role,
        phone: phone.trim()
      });

      if (role === ROLES.CAREGIVER) {
        navigate('/caregiver');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
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
      <div id="recaptcha-reg-container"></div>

      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#EEF3EF] text-[#3D5A45] mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Create ZYVEN Account
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Healthcare assistance designed for Seniors & Caregivers
        </p>
      </div>

      {/* Auth Method Switcher Tabs */}
      <div className="flex bg-gray-100/80 p-1 rounded-2xl mb-6">
        <button
          type="button"
          onClick={() => { setAuthMethod('email'); setError(''); setSuccessMsg(''); }}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            authMethod === 'email'
              ? 'bg-white text-[#3D5A45] shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Email (6-Digit OTP)</span>
        </button>
        <button
          type="button"
          onClick={() => { setAuthMethod('phone'); setError(''); setSuccessMsg(''); }}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            authMethod === 'phone'
              ? 'bg-white text-[#3D5A45] shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Mobile Phone</span>
        </button>
      </div>

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

      {/* Success Banner */}
      {successMsg && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-5 p-3.5 bg-green-50 text-green-800 text-xs sm:text-sm rounded-xl border border-green-200 flex items-start space-x-2"
        >
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{successMsg}</span>
        </motion.div>
      )}

      {/* Role Selection */}
      <div className="mb-5">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
          Select Your Role <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roleOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = role === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRole(opt.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected 
                    ? `${opt.color} ring-2 ring-[#3D5A45] shadow-xs font-semibold` 
                    : 'border-gray-200/90 bg-white hover:bg-gray-50/80 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/80' : 'bg-gray-100'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-[#3D5A45]" />}
                </div>
                <div>
                  <div className="text-sm font-bold">{opt.label}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-tight">
                    {opt.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Email OTP Flow */}
      {authMethod === 'email' ? (
        !emailOtpSent ? (
          <form onSubmit={handleSendEmailOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#3D5A45] focus:border-[#3D5A45] transition-all outline-none text-gray-900 text-sm"
                  placeholder="e.g. Ramesh Patel"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-red-500">*</span>
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
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-gray-50/60 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#3D5A45] focus:border-[#3D5A45] transition-all outline-none text-gray-900 text-sm"
                  placeholder="Minimum 6 characters"
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
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-gray-50/60 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#3D5A45] focus:border-[#3D5A45] transition-all outline-none text-gray-900 text-sm"
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  <span>Generating 6-Digit OTP...</span>
                </>
              ) : (
                <>
                  <span>CREATE ACCOUNT & GET OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Email OTP Verification Box */
          <form onSubmit={handleVerifyEmailOtp} className="space-y-5">
            <div className="text-center">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Enter 6-Digit Email Verification Code
              </label>
              <p className="text-xs text-gray-500 mb-4">
                We sent a 6-digit code to <strong className="text-gray-800">{email}</strong>
              </p>
              
              <div className="flex justify-center items-center gap-1.5 sm:gap-2">
                {emailOtp.map((digit, index) => (
                  <input
                    key={index}
                    id={`email-reg-otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value, emailOtp, setEmailOtp, 'email-reg-otp')}
                    onKeyDown={(e) => handleDigitKeyDown(index, e, emailOtp, 'email-reg-otp')}
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
                  <span>Verifying OTP & Activating...</span>
                </>
              ) : (
                <>
                  <span>VERIFY OTP & ACTIVATE</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setEmailOtpSent(false)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-900 underline cursor-pointer"
              >
                Change Details
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
        )
      ) : (
        /* 2. Phone Auth Flow */
        !phoneOtpSent ? (
          <form onSubmit={handleSendPhoneOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#3D5A45] focus:border-[#3D5A45] transition-all outline-none text-gray-900 text-sm"
                  placeholder="e.g. Ramesh Patel"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Mobile Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative flex">
                <div className="flex items-center justify-center px-3.5 bg-gray-100/90 border border-r-0 border-gray-200 rounded-l-xl text-xs sm:text-sm font-bold text-gray-700 select-none">
                  🇮🇳 +91
                </div>
                <input
                  type="tel"
                  required
                  maxLength="10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-3.5 pr-4 py-3 bg-gray-50/60 border border-gray-200 rounded-r-xl focus:bg-white focus:ring-2 focus:ring-[#3D5A45] focus:border-[#3D5A45] transition-all outline-none text-gray-900 text-sm font-semibold tracking-wider"
                  placeholder="9876543210"
                />
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
                  <span>Sending SMS OTP...</span>
                </>
              ) : (
                <>
                  <span>SEND 6-DIGIT OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyPhoneOtp} className="space-y-5">
            <div className="text-center">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                Enter 6-Digit SMS Verification Code
              </label>
              
              <div className="flex justify-center items-center gap-1.5 sm:gap-2">
                {phoneOtp.map((digit, index) => (
                  <input
                    key={index}
                    id={`phone-reg-otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value, phoneOtp, setPhoneOtp, 'phone-reg-otp')}
                    onKeyDown={(e) => handleDigitKeyDown(index, e, phoneOtp, 'phone-reg-otp')}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-black bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-[#3D5A45] focus:ring-2 focus:ring-[#3D5A45] outline-none transition-all text-gray-900"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || phoneOtp.join('').length < 6}
              className="w-full py-3.5 px-4 bg-[#3D5A45] hover:bg-[#324a3a] active:scale-[0.99] text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying & Activating...</span>
                </>
              ) : (
                <>
                  <span>VERIFY OTP & ACTIVATE</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setPhoneOtpSent(false)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-900 underline cursor-pointer"
              >
                Change Number
              </button>

              <button
                type="button"
                onClick={handleSendPhoneOtp}
                disabled={phoneCooldown > 0 || isLoading}
                className="text-xs font-bold text-[#E07A5F] hover:underline disabled:opacity-50 flex items-center space-x-1 cursor-pointer"
              >
                {phoneCooldown > 0 ? (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    <span>Resend in {phoneCooldown}s</span>
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
        )
      )}

      {/* Switch to Login */}
      <div className="mt-6 pt-5 border-t border-gray-100 text-center">
        <p className="text-xs sm:text-sm text-gray-600">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="font-bold text-[#3D5A45] hover:text-[#24342a] hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default RegisterPage;
