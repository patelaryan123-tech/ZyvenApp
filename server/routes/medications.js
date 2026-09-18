const express = require('express');
const router = express.Router();
const { 
  createMedication, 
  getMedications, 
  getMedicationById, 
  updateMedication, 
  deleteMedication, 
  recordAdherence, 
  takeMedication, 
  skipMedication, 
  getTodaySchedule, 
  getOverallAdherence,
  getPrescriptions,
  createPrescription,
  deletePrescription
} = require('../controllers/medicationController');
const { protect } = require('../middleware/auth');

// Prescriptions
router.get('/prescriptions', protect, getPrescriptions);
router.post('/prescriptions', protect, createPrescription);
router.delete('/prescriptions/:id', protect, deletePrescription);

// Adherence & Schedules
router.get('/today', protect, getTodaySchedule);
router.get('/adherence', protect, getOverallAdherence);

// Medication CRUD
router.route('/')
  .post(protect, createMedication)
  .get(protect, getMedications);

router.route('/:id')
  .get(protect, getMedicationById)
  .put(protect, updateMedication)
  .delete(protect, deleteMedication);

// Actions
router.post('/:id/take', protect, takeMedication);
router.post('/:id/skip', protect, skipMedication);
router.post('/:id/adherence', protect, recordAdherence);

module.exports = router;
