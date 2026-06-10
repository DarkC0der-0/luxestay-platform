// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');

const authMiddleware = catchAsync(async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No authentication token provided.', status: 401 } });
  }

  const token = authHeader.replace('Bearer ', '');
  
  // jwt.verify will throw JsonWebTokenError if invalid, which catchAsync will catch and pass to global errorHandler
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // Verify user existence, suspension, and role in database for real-time security updates
  const userSecurity = await User.findSecurityStatusById(decoded.id);
  if (!userSecurity) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User account no longer exists.', status: 401 } });
  }
  
  if (userSecurity.is_suspended) {
    return res.status(403).json({ success: false, error: { code: 'SUSPENDED', message: 'Your account has been suspended.', status: 403 } });
  }

  // Hydrate user info from the database to keep role and suspension details in real-time sync
  req.user = {
    ...decoded,
    role: userSecurity.role,
    is_suspended: userSecurity.is_suspended,
    created_at: userSecurity.created_at
  };
  req.token = token;
  
  next();
});

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action.', status: 403 } });
    }
    next();
  };
};

module.exports = { authMiddleware, requireRole };
