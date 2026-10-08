const express = require('express');
const router = express.Router();
const { getAllUsers, getAvailablePatients, getUserById, updateUser, linkUser, unlinkUser, getLinkedUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');
const { ROLES } = require('../utils/constants');

router.get('/', protect, authorize(ROLES.ADMIN), getAllUsers);
router.get('/patients/available', protect, getAvailablePatients);
router.get('/link/all', protect, getLinkedUsers);
router.post('/link', protect, linkUser);
router.delete('/link/:targetUserId', protect, unlinkUser);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);

module.exports = router;
