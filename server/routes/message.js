// server/routers/messageRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const messageController = require('../controllers/message');

router.get('/', authMiddleware, messageController.getConversations);
router.post('/', authMiddleware, messageController.sendMessage);
router.get('/:bookingId', authMiddleware, messageController.getChatHistory);
router.get('/:propertyId/:otherUserId', authMiddleware, messageController.getDirectChatHistory);

module.exports = router;
