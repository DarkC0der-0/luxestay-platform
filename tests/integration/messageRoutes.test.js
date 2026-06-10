const request = require('supertest');
const app = require('../../app');
const db = require('../../server/config/db');
const jwt = require('jsonwebtoken');

jest.mock('../../server/config/db');
process.env.JWT_SECRET = 'testsecret';

describe('Message API Routes', () => {
  let guestToken;

  beforeEach(() => {
    db._resetMocks();
    guestToken = jwt.sign({ id: 2, role: 'guest' }, process.env.JWT_SECRET);
  });

  describe('GET /api/v1/messages/:propertyId/:otherUserId', () => {
    it('should return a message thread', async () => {
      // 1. Mock user query in authMiddleware
      db.query.mockResolvedValueOnce({ rows: [{ role: 'guest', is_suspended: false }] });
      // 2. Mock chat history query in controller
      db.query.mockResolvedValueOnce({ rows: [{ id: 1, content: 'Hello' }] });

      const response = await request(app)
        .get('/api/v1/messages/10/1')
        .set('Authorization', `Bearer ${guestToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.history.length).toBe(1);
    });
  });
});
