const express = require('express');
const router = express.Router();
const { addVital, getVitals, getVitalsSummary, deleteVital } = require('../controllers/vitalsController');
const { protect } = require('../middleware/auth');

router.get('/summary', protect, getVitalsSummary);

router.route('/')
  .post(protect, addVital)
  .get(protect, getVitals);

router.delete('/:id', protect, deleteVital);

module.exports = router;
