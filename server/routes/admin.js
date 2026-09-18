const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, manageUser, getSystemHealth, seedDemoData, sendTestEmailController } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');
const { ROLES } = require('../utils/constants');

router.use(protect);

router.post('/test-email', sendTestEmailController);

router.use(authorize(ROLES.ADMIN));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.post('/users/:id/manage', manageUser);
router.get('/health', getSystemHealth);
router.post('/seed', seedDemoData);

module.exports = router;
