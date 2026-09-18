const express = require('express');
const router = express.Router();
const { chat, getConversations, getConversationById, deleteConversation } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/chat', chat);
router.get('/conversations', getConversations);
router.route('/conversations/:id')
  .get(getConversationById)
  .delete(deleteConversation);

module.exports = router;
