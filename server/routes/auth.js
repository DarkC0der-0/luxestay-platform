// server/routers/authRoutes.js
const express = require('express');
const authController = require('../controllers/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validations/authSchema');
const router = express.Router();

// Signup route
router.post(
  '/signup',
  validate(registerSchema),
  authController.signup
);

// Login route
router.post(
  '/login',
  validate(loginSchema),
  authController.login
);

// Get current user profile
const { authMiddleware } = require('../middleware/auth');
router.get('/me', authMiddleware, authController.getMe);

// Update user profile
router.patch('/profile', authMiddleware, authController.updateProfile);

// Change password
router.patch('/change-password', authMiddleware, authController.changePassword);

// Delete account
router.delete('/account', authMiddleware, authController.deleteAccount);

module.exports = router;
