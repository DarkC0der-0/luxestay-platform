const request = require('supertest');
const app = require('../../app');
const db = require('../../server/config/db');
const jwt = require('jsonwebtoken');

jest.mock('../../server/config/db');
process.env.JWT_SECRET = 'testsecret';

describe('Property API Routes', () => {
  let hostToken, guestToken;

  beforeEach(() => {
    db._resetMocks();
    hostToken = jwt.sign({ id: 1, role: 'host' }, process.env.JWT_SECRET);
    guestToken = jwt.sign({ id: 2, role: 'guest' }, process.env.JWT_SECRET);
  });

  describe('GET /api/v1/properties', () => {
    it('should return a list of properties', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 10, title: 'Villa' }] });

      const response = await request(app).get('/api/v1/properties');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.properties.length).toBe(1);
    });
  });

  describe('POST /api/v1/properties', () => {
    beforeEach(() => {
      db.query.mockImplementation((queryText, params) => {
        if (queryText.includes('users')) {
          const role = params[0] === 1 ? 'host' : 'guest';
          return Promise.resolve({ rows: [{ role, is_suspended: false, name: 'Test User' }] });
        }
        if (queryText.includes('platform_settings')) {
          return Promise.resolve({ rows: [{ value: false }] });
        }
        if (queryText.includes('properties')) {
          return Promise.resolve({ rows: [{ id: 10, title: 'New Villa' }] });
        }
        return Promise.resolve({ rows: [] });
      });
    });

    it('should allow host to create property', async () => {
      const response = await request(app)
        .post('/api/v1/properties')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          title: 'New Villa',
          description: 'A very beautiful property',
          location: 'City',
          price_per_night: "200",
          property_type: 'Villa'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should reject guest from creating property', async () => {
      const response = await request(app)
        .post('/api/v1/properties')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ title: 'New Villa', description: 'A very beautiful property', location: 'City', price_per_night: "200", property_type: 'Villa' });

      expect(response.status).toBe(403);
    });
  });
});
