import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  ArrowRight, 
  CheckCircle, 
  RefreshCw, 
  AlertCircle, 
  ShieldCheck,
  Clock,
  ExternalLink
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resendVerification, checkEmailVerification } = useAuth();

  const email = location.state?.email || 'your registered email';
  const name = location.state?.name || 'User';
  const unverifiedAttempt = location.state?.unverifiedAttempt || false;

  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [status, setStatus] = useState({ 
    message: unverifiedAttempt ? 'Please verify your email before accessing ZYVEN.' : '', 
    type: unverifiedAttempt ? 'warning' : '' 
  });

  // Cooldown countdown effect
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle Resend Verification Email with cooldown
  const handleResend = async () => {
    if (cooldown > 0) return;
    
    setResending(true);
    setStatus({ message: '', type: '' });

    try {
      await resendVerification();
      setCooldown(60); // 60 seconds cooldown
      setStatus({ 
        message: 'Verification email sent! Please check your inbox and spam folder.', 
        type: 'success' 
      });
    } catch (err) {
      setStatus({ 
        message: err.message || 'Please log in with your credentials to request a new verification link.', 
        type: 'info' 
      });
    } finally {
      setResending(false);
    }
  };

  // Handle "I've Verified — Continue"
  const handleCheckVerified = async () => {
    setChecking(true);
    setStatus({ message: '', type: '' });

    try {
      const isVerified = await checkEmailVerification();
      if (isVerified) {
        setStatus({
          message: 'Email successfully verified! Redirecting to login...',
          type: 'success'
        });
        setTimeout(() => {
          navigate('/login', { state: { verifiedSuccess: true, email } });
        }, 1200);
      } else {
        setStatus({
          message: 'Your email is not verified yet. Please check your email and try again.',
          type: 'error'
        });
      }
    } catch (err) {
      setStatus({
        message: 'Unable to check status. Please click the verification link in your email and log in.',
        type: 'info'
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-lg mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 text-center"
    >
      {/* Brand Icon */}
      <div className="w-16 h-16 rounded-2xl bg-[#eef3ef] text-[#3D5A45] flex items-center justify-center mx-auto mb-5 shadow-xs">
        <Mail className="w-8 h-8 text-[#3D5A45]" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Verify Your Email
      </h1>
      
      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
        We've sent a verification link to:
      </p>

      {/* Target Email Box */}
      <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200 mb-5 inline-block w-full">
        <span className="font-mono text-sm sm:text-base font-bold text-[#3D5A45] break-all">
          {email}
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-6 leading-relaxed">
        Please check your inbox (and spam folder) and click the verification link to activate your ZYVEN account.
      </p>

      {/* Status Messages */}
      {status.message && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-5 p-3.5 rounded-xl text-xs sm:text-sm flex items-start space-x-2 text-left border ${
            status.type === 'success' 
              ? 'bg-green-50 text-green-800 border-green-200' 
              : status.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : status.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          ) : status.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          )}
          <span>{status.message}</span>
        </motion.div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {/* 1. I've Verified — Continue */}
        <button
          type="button"
          onClick={handleCheckVerified}
          disabled={checking}
          className="w-full py-3.5 px-4 bg-[#3D5A45] hover:bg-[#324a3a] text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70"
        >
          {checking ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Checking Verification...</span>
            </>
          ) : (
            <>
              <span>I'VE VERIFIED — CONTINUE</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* 2. Resend Verification Email with Cooldown */}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
        >
          {resending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Sending Verification Email...</span>
            </>
          ) : cooldown > 0 ? (
            <>
              <Clock className="w-4 h-4 text-gray-500" />
              <span>Resend available in {cooldown}s</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Resend Verification Email</span>
            </>
          )}
        </button>
      </div>

      {/* 3. Back to Login */}
      <div className="mt-6 pt-5 border-t border-gray-100">
        <Link 
          to="/login" 
          className="text-xs sm:text-sm font-semibold text-[#3D5A45] hover:text-[#24342a] hover:underline"
        >
          ← Back to Login
        </Link>
      </div>
    </motion.div>
  );
};

export default VerifyEmailPage;
