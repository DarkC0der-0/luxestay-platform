// server/controllers/auth.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const { logActivity } = require('../utils/activityLogger');
const Setting = require('../models/Setting');

exports.signup = catchAsync(async (req, res, next) => {
  // Check if registrations are allowed
  const allowRegVal = await Setting.getByKey('allow_registrations');
  const allowReg = allowRegVal !== false; // default true if not found
  if (!allowReg) {
    return res.status(403).json({
      success: false,
      error: { code: 'REGISTRATIONS_DISABLED', message: 'New user registrations are currently disabled.', status: 403 }
    });
  }

  // Extract user data from request body (Zod middleware handles validation before this)
  const { name, email, password, role } = req.body;

  // Check if the user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(409).json({ 
      success: false, 
      error: { code: 'USER_EXISTS', message: 'User with this email already exists', status: 409 } 
    });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = await User.create({
    name,
    email,
    password_hash: hashedPassword,
    role,
  });

  // Log user signup activity
  await logActivity('user', `New user signup: ${newUser.name} (${newUser.role})`, newUser.id);

  res.status(201).json({ 
    success: true, 
    message: 'User created successfully', 
    user: { id: newUser.id, role: newUser.role } 
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password, role } = req.body;
  
  // Check if the user exists
  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials', status: 401 } });
  }

  // Check if the password is correct
  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials', status: 401 } });
  }

  // Check if user is suspended
  if (user.is_suspended) {
    return res.status(403).json({ success: false, error: { code: 'SUSPENDED', message: 'Your account has been suspended', status: 403 } });
  }

  // Role check if provided
  if (role && user.role !== role) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Invalid credentials for the selected role', status: 403 } });
  }

  // Generate a JWT token
  const token = jwt.sign(
    { 
      id: user.id, 
      name: user.name, 
      role: user.role, 
      email: user.email, 
      avatar_url: user.avatar_url 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ 
    success: true, 
    token, 
    user: { 
      id: user.id, 
      name: user.name, 
      role: user.role, 
      email: user.email, 
      avatar_url: user.avatar_url,
      created_at: user.created_at
    } 
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  // req.user is already populated and verified by authMiddleware
  res.json({ success: true, user: req.user });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const { name, email, avatar_url } = req.body;
  const userId = req.user.id;

  const updatedUser = await User.update(userId, { name, email, avatar_url });

  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User not found', status: 404 }
    });
  }

  await logActivity('user', `User updated profile: ${updatedUser.name}`, userId);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser
  });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Find user to get current password hash
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, error: { message: 'User not found' } });
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    return res.status(400).json({ success: false, error: { message: 'Incorrect current password' } });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await User.updatePassword(userId, hashedPassword);

  await logActivity('user', `User changed password`, userId);

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  await User.delete(userId);
  await logActivity('user', `User deleted account`, userId);

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
});
