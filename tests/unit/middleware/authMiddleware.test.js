jest.mock('jsonwebtoken');
jest.mock('../../../server/models/User');

const { authMiddleware, requireRole } = require('../../../server/middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../../../server/models/User');

describe('Auth Middlewares', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { header: jest.fn() };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  describe('authMiddleware', () => {
    it('should return 401 if no token provided', async () => {
      req.header.mockReturnValue(undefined);
      await authMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: { code: 'UNAUTHORIZED', message: 'No authentication token provided.', status: 401 } });
    });

    it('should call next and set req.user if token is valid', async () => {
      req.header.mockReturnValue('Bearer validtoken');
      jwt.verify.mockReturnValue({ id: 1, role: 'host' });
      User.findSecurityStatusById.mockResolvedValue({ role: 'host', is_suspended: false });
      
      await authMiddleware(req, res, next);
      
      expect(req.user).toEqual({ id: 1, role: 'host', is_suspended: false });
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      req.header.mockReturnValue('Bearer invalidtoken');
      jwt.verify.mockImplementation(() => { throw new Error('Invalid token') });
      
      await authMiddleware(req, res, next);
      
      // Because authMiddleware is wrapped in catchAsync, it passes the error to next()
      const error = next.mock.calls[0][0];
      expect(error).toBeDefined();
      expect(error.message).toBe('Invalid token');
    });
  });

  describe('requireRole', () => {
    it('should call next if user has correct role', () => {
      req.user = { role: 'host' };
      const middleware = requireRole('host');
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user lacks correct role', () => {
      req.user = { role: 'guest' };
      const middleware = requireRole('host');
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to perform this action.', status: 403 } });
    });
  });
});
