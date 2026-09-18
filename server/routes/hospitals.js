const express = require('express');
const router = express.Router();
const { getHospitals, getHospitalById, createHospital, updateHospital, deleteHospital, searchNearby } = require('../controllers/hospitalController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');
const { hospitalValidation } = require('../utils/validators');
const { validate } = require('../middleware/validate');
const { ROLES } = require('../utils/constants');

router.get('/search', searchNearby);

router.route('/')
  .get(getHospitals)
  .post(protect, authorize(ROLES.ADMIN), hospitalValidation, validate, createHospital);

router.route('/:id')
  .get(getHospitalById)
  .put(protect, authorize(ROLES.ADMIN), hospitalValidation, validate, updateHospital)
  .delete(protect, authorize(ROLES.ADMIN), deleteHospital);

module.exports = router;
