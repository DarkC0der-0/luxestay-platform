// tests/integration/bookings_auth.test.js
const request = require('supertest');
const app = require('../../app');
const db = require('../../server/config/db');
const jwt = require('jsonwebtoken');

jest.mock('../../server/config/db');

describe('Bookings Authorization & Constraints', () => {
  let guestToken, hostToken;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    guestToken = jwt.sign({ id: 'guest-id', role: 'guest' }, process.env.JWT_SECRET);
    hostToken = jwt.sign({ id: 'host-id', role: 'host' }, process.env.JWT_SECRET);
  });

  beforeEach(() => {
    db._resetMocks();
    db.query.mockImplementation((queryText, params) => {
      if (queryText.includes('users')) {
        const role = params[0] === 'host-id' ? 'host' : 'guest';
        return Promise.resolve({ rows: [{ role, is_suspended: false, name: 'Test User' }] });
      }
      if (queryText.includes('platform_settings')) {
        return Promise.resolve({ rows: [{ value: false }] });
      }
      return Promise.resolve({ rows: [] });
    });
  });

  describe('POST /api/v1/bookings', () => {
    it('should return 401 if no token provided', async () => {
      const res = await request(app).post('/api/v1/bookings').send({});
      expect(res.status).toBe(401);
    });

    it('should return 403 if host tries to book', async () => {
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          property_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          check_in: '2026-09-01',
          check_out: '2026-09-10',
          total_price: 1000
        });
      expect(res.status).toBe(403);
    });

    it('should return 409 on double booking (Exclusion Violation)', async () => {
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({}) // BEGIN
          .mockRejectedValueOnce({ code: '23P01' }) // Violation
          .mockResolvedValueOnce({}), // ROLLBACK
        release: jest.fn()
      };
      db.pool.connect.mockResolvedValue(mockClient);

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          property_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          check_in: '2026-09-01',
          check_out: '2026-09-10',
          total_price: 1000
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('DOUBLE_BOOKING_CONFLICT');
    });
  });
});
