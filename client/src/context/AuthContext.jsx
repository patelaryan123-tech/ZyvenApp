import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Sync Firebase user with MongoDB profile
  const syncWithBackend = async (fbUser, roleHint = null, extraProfile = {}) => {
    try {
      const token = await fbUser.getIdToken(true);
      const payload = {
        firebaseUid: fbUser.uid,
        name: extraProfile.name || fbUser.displayName || (fbUser.phoneNumber ? `User ${fbUser.phoneNumber.slice(-4)}` : 'User'),
        email: fbUser.email || extraProfile.email || `${fbUser.uid.slice(0, 10)}@zyven.phone`,
        phone: fbUser.phoneNumber || extraProfile.phone || '',
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
        email: fbUser.email || `${fbUser.uid.slice(0, 10)}@zyven.phone`,
        phone: fbUser.phoneNumber || extraProfile.phone || '',
        role: roleHint || extraProfile.role || 'Senior',
        isVerified: true,
        emailVerified: fbUser.emailVerified || !!fbUser.phoneNumber
      };
      setUser(fallbackUser);
      return fallbackUser;
    }
  };

  // Initial Auth Check & Session Hydration
  useEffect(() => {
    const initAuth = async () => {
      const localToken = localStorage.getItem('zyven_token');
      if (localToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.data) {
            setUser(res.data.data);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('JWT token session expired, clearing storage.');
          localStorage.removeItem('zyven_token');
        }
      }

      // Firebase listener
      const unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
        setFirebaseUser(currentFirebaseUser);
        if (currentFirebaseUser) {
          const isVerified = currentFirebaseUser.emailVerified || !!currentFirebaseUser.phoneNumber;
          if (isVerified) {
            await syncWithBackend(currentFirebaseUser);
          } else {
            setUser(null);
          }
        } else if (!localStorage.getItem('zyven_token')) {
          setUser(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    };

    initAuth();
  }, []);

  // 1. OPTION 1: 6-DIGIT EMAIL OTP REGISTRATION
  const registerWithEmailOtp = async (name, email, password, role) => {
    const response = await api.post('/auth/register-otp', {
      name,
      email,
      password,
      role: role || 'Senior'
    });
    return response.data;
  };

  // 2. OPTION 1: VERIFY 6-DIGIT EMAIL OTP
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

  // 3. OPTION 1: RESEND 6-DIGIT EMAIL OTP
  const resendEmailOtp = async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  };

  // 4. OPTION 1: EMAIL & PASSWORD LOGIN
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

  // 5. PHONE OTP AUTHENTICATION
  const setupRecaptcha = (containerId = 'recaptcha-container') => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => {
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
      }
    });

    return window.recaptchaVerifier;
  };

  const sendPhoneOtp = async (rawPhone, containerId = 'recaptcha-container') => {
    let cleanPhone = rawPhone.replace(/\s+/g, '').replace(/-/g, '');
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.length === 10) {
        cleanPhone = `+91${cleanPhone}`;
      } else {
        cleanPhone = `+${cleanPhone}`;
      }
    }

    const appVerifier = setupRecaptcha(containerId);
    const confirmation = await signInWithPhoneNumber(auth, cleanPhone, appVerifier);
    setConfirmationResult(confirmation);
    return confirmation;
  };

  const verifyPhoneOtp = async (otpCode, profileData = {}) => {
    if (!confirmationResult) {
      throw new Error('No active OTP request. Please request a new OTP.');
    }

    const userCredential = await confirmationResult.confirm(otpCode);
    const fbUser = userCredential.user;

    if (profileData.name) {
      await updateProfile(fbUser, { displayName: profileData.name });
    }

    const dbUser = await syncWithBackend(fbUser, profileData.role, profileData);
    setFirebaseUser(fbUser);
    setUser(dbUser);

    return { success: true, user: dbUser, firebaseUser: fbUser };
  };

  // 6. GOOGLE SIGN-IN
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const fbUser = userCredential.user;
    const dbUser = await syncWithBackend(fbUser);
    setFirebaseUser(fbUser);
    setUser(dbUser);
    return { emailVerified: true, firebaseUser: fbUser, user: dbUser };
  };

  // 7. FORGOT / RESET PASSWORD
  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  // 8. LOGOUT
  const logout = async () => {
    localStorage.removeItem('zyven_token');
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    try {
      await signOut(auth);
    } catch (e) {}
    setUser(null);
    setFirebaseUser(null);
    setConfirmationResult(null);
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
    confirmationResult,
    registerWithEmailOtp,
    verifyEmailOtp,
    resendEmailOtp,
    loginWithEmail,
    sendPhoneOtp,
    verifyPhoneOtp,
    loginWithGoogle,
    resetPassword,
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
