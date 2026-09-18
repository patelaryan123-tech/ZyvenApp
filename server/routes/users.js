const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, linkUser, getLinkedUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');
const { ROLES } = require('../utils/constants');

router.get('/', protect, authorize(ROLES.ADMIN), getAllUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);

router.post('/link', protect, linkUser);
router.get('/link/all', protect, getLinkedUsers);

module.exports = router;
