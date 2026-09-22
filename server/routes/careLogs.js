const express = require('express');
const router = express.Router();
const { addCareLog, getCareLogs, deleteCareLog } = require('../controllers/careLogController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, addCareLog)
  .get(protect, getCareLogs);

router.delete('/:id', protect, deleteCareLog);

module.exports = router;
