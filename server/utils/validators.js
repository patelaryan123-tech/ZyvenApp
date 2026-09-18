const { body } = require('express-validator');

const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().isString(),
  body('role').optional().isIn(['Senior', 'Caregiver', 'FamilyMember', 'Admin']).withMessage('Invalid role')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required')
];

const medicationValidation = [
  body('medicineName').notEmpty().withMessage('Medicine name is required'),
  body('dosage').notEmpty().withMessage('Dosage is required'),
  body('frequency').isIn(['Daily', 'Weekly', 'AsNeeded']).withMessage('Invalid frequency')
];

const reportValidation = [
  body('reportType').notEmpty().withMessage('Report type is required')
];

const emergencyValidation = [
  body('eventType').isIn(['SOS', 'FallDetection', 'MedicalEmergency']).withMessage('Invalid event type'),
  body('location.latitude').isNumeric().withMessage('Latitude is required'),
  body('location.longitude').isNumeric().withMessage('Longitude is required')
];

const hospitalValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('location.coordinates').isArray().withMessage('Coordinates array required')
];

const schemeValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('category').notEmpty().withMessage('Category is required')
];

module.exports = {
  registerValidation,
  loginValidation,
  medicationValidation,
  reportValidation,
  emergencyValidation,
  hospitalValidation,
  schemeValidation
};
