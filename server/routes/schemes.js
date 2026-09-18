const express = require('express');
const router = express.Router();
const { 
  getSchemes, 
  getSchemeById, 
  checkEligibility,
  createScheme, 
  updateScheme, 
  deleteScheme 
} = require('../controllers/schemeController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

router.get('/', getSchemes);
router.post('/check-eligibility', checkEligibility);
router.post('/eligible', checkEligibility);
router.get('/:id', getSchemeById);

// Admin Routes
router.post('/', protect, authorize('Admin'), createScheme);
router.put('/:id', protect, authorize('Admin'), updateScheme);
router.delete('/:id', protect, authorize('Admin'), deleteScheme);

module.exports = router;
