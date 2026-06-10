// server/routes/support.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const supportController = require('../controllers/support');

router.post('/', authMiddleware, supportController.createTicket);

module.exports = router;
