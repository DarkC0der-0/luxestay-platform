const request = require('supertest');
const app = require('../../app');
const db = require('../../server/config/db');
const jwt = require('jsonwebtoken');

jest.mock('../../server/config/db');
process.env.JWT_SECRET = 'testsecret';

describe('Booking API Routes', () => {
  let guestToken;

  beforeEach(() => {
    db._resetMocks();
    db.query.mockImplementation((queryText, params) => {
      if (queryText.includes('users')) {
        return Promise.resolve({ rows: [{ role: 'guest', is_suspended: false, name: 'Guest User' }] });
      }
      if (queryText.includes('platform_settings')) {
        return Promise.resolve({ rows: [{ value: false }] });
      }
      return Promise.resolve({ rows: [] });
    });

    db._mockClient.query.mockImplementation((queryText, params) => {
      if (queryText.includes('BEGIN') || queryText.includes('COMMIT') || queryText.includes('ROLLBACK')) {
        return Promise.resolve({});
      }
      if (queryText.includes('INSERT INTO bookings')) {
        return Promise.resolve({ rows: [{ id: 1 }] });
      }
      if (queryText.includes('users')) {
        return Promise.resolve({ rows: [{ name: 'Guest User' }] });
      }
      if (queryText.includes('properties')) {
        return Promise.resolve({ rows: [{ title: 'Property', host_id: 1 }] });
      }
      if (queryText.includes('platform_settings')) {
        return Promise.resolve({ rows: [{ value: 10 }] });
      }
      if (queryText.includes('transactions')) {
        return Promise.resolve({ rows: [{ id: 9 }] });
      }
      return Promise.resolve({ rows: [] });
    });

    guestToken = jwt.sign({ id: 2, role: 'guest' }, process.env.JWT_SECRET);
  });

  describe('POST /api/v1/bookings', () => {
    it('should allow guest to create a booking', async () => {
      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          property_id: '550e8400-e29b-41d4-a716-446655440000',
          check_in: '2025-01-01',
          check_out: '2025-01-05',
          total_price: 500
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should catch 23P01 DB error and return 409 Conflict', async () => {
      db._mockClient.query.mockImplementationOnce(() => Promise.resolve({})); // BEGIN succeeds
      const dbError = new Error('Database exclusion');
      dbError.code = '23P01';
      db._mockClient.query.mockRejectedValueOnce(dbError); // Booking create throws
      db._mockClient.query.mockResolvedValueOnce({}); // ROLLBACK succeeds

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          property_id: '550e8400-e29b-41d4-a716-446655440000',
          check_in: '2025-01-01',
          check_out: '2025-01-05',
          total_price: 500
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('DOUBLE_BOOKING_CONFLICT');
    });
  });
});
