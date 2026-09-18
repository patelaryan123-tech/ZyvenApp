import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { resetPassword } = useAuth();

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSuccess('Password reset link sent! Please check your inbox and spam folder.');
    } catch (err) {
      if (err.message?.includes('auth/user-not-found')) {
        setError('No account found with this email address.');
      } else if (err.message?.includes('auth/invalid-email')) {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Failed to send password reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#eef3ef] text-[#3D5A45] flex items-center justify-center mx-auto mb-4">
        <KeyRound className="w-7 h-7 text-[#3D5A45]" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Forgot Password?
      </h1>
      <p className="text-xs sm:text-sm text-gray-600 mb-6">
        Enter your registered email address and we'll send you instructions to reset your password.
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

      <form onSubmit={handleReset} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#3D5A45] focus:border-[#3D5A45] transition-all outline-none text-gray-900 text-sm"
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
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sending Reset Link...</span>
            </>
          ) : (
            <span>SEND RESET LINK</span>
          )}
        </button>
      </form>

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
