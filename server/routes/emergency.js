const express = require('express');
const router = express.Router();
const { 
  triggerSOS, 
  cancelSOS, 
  acknowledgeSOS,
  resolveSOS,
  getEmergencyHistory, 
  getActiveEmergency,
  getContacts,
  addContact,
  deleteContact
} = require('../controllers/emergencyController');
const { protect } = require('../middleware/auth');

router.post('/sos', protect, triggerSOS);
router.post('/trigger', protect, triggerSOS);
router.post('/:id/cancel', protect, cancelSOS);
router.post('/:id/acknowledge', protect, acknowledgeSOS);
router.post('/:id/resolve', protect, resolveSOS);
router.get('/history', protect, getEmergencyHistory);
router.get('/active', protect, getActiveEmergency);

// Contacts
router.get('/contacts', protect, getContacts);
router.post('/contacts', protect, addContact);
router.delete('/contacts/:id', protect, deleteContact);

module.exports = router;
