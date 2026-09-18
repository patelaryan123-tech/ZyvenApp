import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const ProtectedRoute = ({ children }) => {
  const { user, firebaseUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#FDFBF7]">
        <LoadingSkeleton variant="card" className="w-64 h-32" />
      </div>
    );
  }

  // Check if authenticated via Native JWT or Firebase
  const isAuthenticated = Boolean(user || firebaseUser || localStorage.getItem('zyven_token'));
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check verification status:
  // 1. Native OTP verified in MongoDB (`user.isVerified === true`)
  // 2. Firebase Phone OTP (`firebaseUser.phoneNumber`)
  // 3. Firebase Email link verified (`firebaseUser.emailVerified`)
  const isVerified = Boolean(user?.isVerified) || Boolean(firebaseUser?.phoneNumber) || Boolean(firebaseUser?.emailVerified);

  if (!isVerified && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
