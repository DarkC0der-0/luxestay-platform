// tests/unit/middleware/errorHandler.test.js
const errorHandler = require('../../../server/middleware/errorHandler');

describe('Global Error Handler', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    // Silence console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('should format ZodError into 400 Bad Request', () => {
    const zodError = {
      name: 'ZodError',
      issues: [
        { path: ['email'], message: 'Invalid email' }
      ]
    };

    errorHandler(zodError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      error: expect.objectContaining({
        code: 'VALIDATION_ERROR',
        message: expect.stringContaining('email: Invalid email')
      })
    }));
  });

  it('should handle generic errors as 500 Internal Server Error', () => {
    const error = new Error('Database explode');
    
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Database explode',
        status: 500
      }
    });
  });
});
