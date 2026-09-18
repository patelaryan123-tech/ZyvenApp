import { 
  Home, 
  Mic, 
  FileText, 
  Pill, 
  Building2, 
  ShieldCheck, 
  PhoneCall, 
  Users 
} from 'lucide-react';

export const ROLES = {
  SENIOR: 'Senior',
  CAREGIVER: 'Caregiver',
  FAMILY_MEMBER: 'FamilyMember',
  ADMIN: 'Admin'
};

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' }
];

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: Home, roles: [ROLES.SENIOR, ROLES.CAREGIVER, ROLES.FAMILY_MEMBER] },
  { path: '/voice', label: 'Voice Companion', icon: Mic, roles: [ROLES.SENIOR, ROLES.CAREGIVER, ROLES.FAMILY_MEMBER] },
  { path: '/reports', label: 'Medical Reports', icon: FileText, roles: [ROLES.SENIOR, ROLES.CAREGIVER, ROLES.FAMILY_MEMBER] },
  { path: '/medications', label: 'Medications', icon: Pill, roles: [ROLES.SENIOR, ROLES.CAREGIVER, ROLES.FAMILY_MEMBER] },
  { path: '/hospitals', label: 'Hospitals', icon: Building2, roles: [ROLES.SENIOR, ROLES.CAREGIVER, ROLES.FAMILY_MEMBER] },
  { path: '/schemes', label: 'Schemes', icon: ShieldCheck, roles: [ROLES.SENIOR, ROLES.CAREGIVER, ROLES.FAMILY_MEMBER] },
  { path: '/emergency', label: 'Emergency', icon: PhoneCall, roles: [ROLES.SENIOR, ROLES.CAREGIVER, ROLES.FAMILY_MEMBER] },
  { path: '/caregiver', label: 'Caregiver Dashboard', icon: Users, roles: [ROLES.CAREGIVER, ROLES.FAMILY_MEMBER] }
];

export const API_ENDPOINTS = {
  AUTH: '/auth',
  MEDICATIONS: '/medications',
  REPORTS: '/reports',
  AI: '/ai',
  EMERGENCY: '/emergency',
  HOSPITALS: '/hospitals',
  SCHEMES: '/schemes',
  NOTIFICATIONS: '/notifications'
};
