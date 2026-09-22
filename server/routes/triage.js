const express = require('express');
const router = express.Router();
const { evaluateSymptoms } = require('../controllers/triageController');
const { protect } = require('../middleware/auth');

router.post('/evaluate', protect, evaluateSymptoms);

module.exports = router;
