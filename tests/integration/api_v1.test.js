// tests/integration/api_v1.test.js
const request = require('supertest');
const app = require('../../app');
const db = require('../../server/config/db');

jest.mock('../../server/config/db');

describe('API v1 Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/properties', () => {
    it('should return 200 and a list of properties', async () => {
      const mockProperties = [
        { id: 'uuid-1', title: 'Beach Villa', location: 'Malibu', price_per_night: 500 }
      ];
      db.query.mockResolvedValue({ rows: mockProperties });

      const res = await request(app).get('/api/v1/properties');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.properties)).toBe(true);
      expect(res.body.properties[0].title).toBe('Beach Villa');
    });
  });

  describe('Security Headers', () => {
    it('should include helmet security headers', async () => {
      const res = await request(app).get('/api/v1/properties');
      expect(res.headers).toHaveProperty('x-dns-prefetch-control');
      expect(res.headers).toHaveProperty('x-frame-options');
    });
  });
});
