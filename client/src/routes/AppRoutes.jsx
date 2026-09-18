import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import { ROLES } from '../utils/constants';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

// Lazy-loaded pages for code splitting
const WelcomePage = lazy(() => import('../pages/WelcomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const VerifyEmailPage = lazy(() => import('../pages/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const VoiceCompanionPage = lazy(() => import('../pages/VoiceCompanionPage'));
const MedicalReportPage = lazy(() => import('../pages/MedicalReportPage'));
const MedicationPage = lazy(() => import('../pages/MedicationPage'));
const HospitalFinderPage = lazy(() => import('../pages/HospitalFinderPage'));
const GovernmentSchemesPage = lazy(() => import('../pages/GovernmentSchemesPage'));
const EmergencyPage = lazy(() => import('../pages/EmergencyPage'));
const CaregiverDashboardPage = lazy(() => import('../pages/CaregiverDashboardPage'));

const PageLoader = () => (
  <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
    <div className="w-full max-w-4xl p-6">
      <LoadingSkeleton variant="card" count={3} />
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public auth routes with AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Protected routes with MainLayout */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          
          <Route path="/voice" element={
            <RoleRoute allowedRoles={[ROLES.SENIOR, ROLES.CAREGIVER, ROLES.FAMILY_MEMBER]}>
              <VoiceCompanionPage />
            </RoleRoute>
          } />
          
          <Route path="/reports" element={
            <RoleRoute allowedRoles={[ROLES.SENIOR, ROLES.CAREGIVER, ROLES.FAMILY_MEMBER]}>
              <MedicalReportPage />
            </RoleRoute>
          } />
          
          <Route path="/medications" element={
            <RoleRoute allowedRoles={[ROLES.SENIOR, ROLES.CAREGIVER, ROLES.FAMILY_MEMBER]}>
              <MedicationPage />
            </RoleRoute>
          } />
          
          <Route path="/hospitals" element={
            <RoleRoute allowedRoles={[ROLES.SENIOR, ROLES.CAREGIVER, ROLES.FAMILY_MEMBER]}>
              <HospitalFinderPage />
            </RoleRoute>
          } />
          
          <Route path="/schemes" element={
            <RoleRoute allowedRoles={[ROLES.SENIOR, ROLES.CAREGIVER, ROLES.FAMILY_MEMBER]}>
              <GovernmentSchemesPage />
            </RoleRoute>
          } />
          
          <Route path="/emergency" element={
            <RoleRoute allowedRoles={[ROLES.SENIOR, ROLES.CAREGIVER, ROLES.FAMILY_MEMBER]}>
              <EmergencyPage />
            </RoleRoute>
          } />
          
          <Route path="/caregiver" element={
            <RoleRoute allowedRoles={[ROLES.CAREGIVER, ROLES.FAMILY_MEMBER]}>
              <CaregiverDashboardPage />
            </RoleRoute>
          } />
        </Route>

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
