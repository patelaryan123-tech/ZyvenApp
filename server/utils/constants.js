const ROLES = {
  SENIOR: 'Senior',
  CAREGIVER: 'Caregiver',
  FAMILY_MEMBER: 'FamilyMember',
  ADMIN: 'Admin'
};

const EVENT_TYPES = {
  SOS: 'SOS',
  FALL_DETECTION: 'FallDetection',
  MEDICAL_EMERGENCY: 'MedicalEmergency'
};

const MED_STATUS = {
  TAKEN: 'Taken',
  MISSED: 'Missed',
  PENDING: 'Pending',
  SKIPPED: 'Skipped'
};

const NOTIFICATION_TYPES = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
  MEDICATION: 'MEDICATION',
  EMERGENCY: 'EMERGENCY',
  REPORT: 'REPORT'
};

module.exports = {
  ROLES,
  EVENT_TYPES,
  MED_STATUS,
  NOTIFICATION_TYPES
};
