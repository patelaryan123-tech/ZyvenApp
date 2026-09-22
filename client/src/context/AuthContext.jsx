import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync Firebase user (e.g. Google Sign-In) with MongoDB profile
  const syncWithBackend = async (fbUser, roleHint = null, extraProfile = {}) => {
    try {
      const token = await fbUser.getIdToken(true);
      const payload = {
        firebaseUid: fbUser.uid,
        name: extraProfile.name || fbUser.displayName || 'User',
        email: fbUser.email || extraProfile.email || `${fbUser.uid.slice(0, 10)}@zyven.app`,
        phone: extraProfile.phone || '',
        role: roleHint || extraProfile.role || 'Senior'
      };

      const response = await api.post('/auth/sync', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data?.data;
      const dbUser = data?.user || data;
      if (data?.token) {
        localStorage.setItem('zyven_token', data.token);
      }
      setUser(dbUser);
      return dbUser;
    } catch (error) {
      console.warn("Backend sync fallback:", error.message);
      const fallbackUser = {
        firebaseUid: fbUser.uid,
        name: extraProfile.name || fbUser.displayName || 'User',
        email: fbUser.email || `${fbUser.uid.slice(0, 10)}@zyven.app`,
        phone: extraProfile.phone || '',
        role: roleHint || extraProfile.role || 'Senior',
        isVerified: true,
        emailVerified: fbUser.emailVerified || true
      };
      setUser(fallbackUser);
      return fallbackUser;
    }
  };

  // Initial Auth Check & Session Hydration
  useEffect(() => {
    let unsubscribe = () => {};

    const initAuth = async () => {
      const localToken = localStorage.getItem('zyven_token');
      if (localToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.data) {
            setUser(res.data.data);
            setLoading(false);
            return; // Authenticated via local JWT — no need for Firebase listener
          }
        } catch (err) {
          console.warn('JWT token invalid or server offline, clearing token.');
          localStorage.removeItem('zyven_token');
        }
      }

      // Safety timeout: if Firebase takes too long or is unconfigured, stop spinner
      const safetyTimer = setTimeout(() => setLoading(false), 4000);

      // Firebase listener for Google Sign-In sessions
      unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
        clearTimeout(safetyTimer);
        setFirebaseUser(currentFirebaseUser);
        if (currentFirebaseUser) {
          await syncWithBackend(currentFirebaseUser);
        } else if (!localStorage.getItem('zyven_token')) {
          setUser(null);
        }
        setLoading(false);
      });
    };

    initAuth();

    return () => unsubscribe();
  }, []);


  // 1. REGISTER WITH EMAIL & 6-DIGIT OTP (NODEMAILER)
  const registerWithEmailOtp = async (name, email, password, role) => {
    const response = await api.post('/auth/register-otp', {
      name,
      email,
      password,
      role: role || 'Senior'
    });
    return response.data;
  };

  // 2. VERIFY 6-DIGIT EMAIL OTP
  const verifyEmailOtp = async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    const { token, user: verifiedUser } = response.data?.data || {};
    if (token) {
      localStorage.setItem('zyven_token', token);
    }
    if (verifiedUser) {
      setUser(verifiedUser);
    }
    return response.data;
  };

  // 3. RESEND 6-DIGIT EMAIL OTP
  const resendEmailOtp = async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  };

  // 4. EMAIL & PASSWORD LOGIN
  const loginWithEmail = async (email, password) => {
    const response = await api.post('/auth/login-email', { email, password });
    const data = response.data?.data;
    if (data?.isVerified === false) {
      return { isVerified: false, email: data.email, name: data.name };
    }
    if (data?.token) {
      localStorage.setItem('zyven_token', data.token);
    }
    if (data?.user) {
      setUser(data.user);
    }
    return { isVerified: true, user: data?.user, token: data?.token };
  };

  // 5. GOOGLE SIGN-IN
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const fbUser = userCredential.user;
    const dbUser = await syncWithBackend(fbUser);
    setFirebaseUser(fbUser);
    setUser(dbUser);
    return { emailVerified: true, firebaseUser: fbUser, user: dbUser };
  };

  // 6. FORGOT PASSWORD (NODEMAILER 6-DIGIT OTP)
  const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  };

  // 7. RESET PASSWORD WITH 6-DIGIT OTP
  const resetPasswordWithOtp = async (email, otp, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, otp, newPassword });
    const data = response.data?.data;
    if (data?.token) {
      localStorage.setItem('zyven_token', data.token);
    }
    if (data?.user) {
      setUser(data.user);
    }
    return response.data;
  };

  // 8. LOGOUT
  const logout = async () => {
    localStorage.removeItem('zyven_token');
    try {
      await signOut(auth);
    } catch (e) {}
    setUser(null);
    setFirebaseUser(null);
  };

  // 9. UPDATE PROFILE
  const updateUserProfile = async (data) => {
    const response = await api.put('/auth/profile', data);
    setUser(response.data.data);
    return response.data;
  };

  const value = {
    user,
    firebaseUser,
    loading,
    registerWithEmailOtp,
    verifyEmailOtp,
    resendEmailOtp,
    loginWithEmail,
    loginWithGoogle,
    forgotPassword,
    resetPasswordWithOtp,
    resetPassword: forgotPassword, // backward compatibility
    logout,
    updateUserProfile,
    syncWithBackend
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
export default AuthContext;

