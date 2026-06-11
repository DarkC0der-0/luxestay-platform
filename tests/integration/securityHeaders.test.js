const request = require('supertest');
const app = require('../../app');
const db = require('../../server/config/db');

jest.mock('../../server/config/db');

describe('Security Headers and CORS Policies', () => {
  beforeEach(() => {
    db.query.mockResolvedValue({ rows: [] });
  });

  describe('CORS Allowed Origins', () => {
    it('should allow whitelisted localhost origins', async () => {
      const response = await request(app)
        .options('/api/v1/properties')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('should dynamically allow origins ending with .railway.app', async () => {
      const response = await request(app)
        .options('/api/v1/properties')
        .set('Origin', 'https://luxestay-platform-production.up.railway.app')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.headers['access-control-allow-origin']).toBe('https://luxestay-platform-production.up.railway.app');
    });

    it('should reject non-whitelisted origins', async () => {
      const response = await request(app)
        .options('/api/v1/properties')
        .set('Origin', 'https://malicious-domain.com')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('Helmet CSP policy', () => {
    it('should not send content-security-policy header to allow external images and ws connection compatibility', async () => {
      const response = await request(app).get('/api/v1/properties');

      expect(response.headers['content-security-policy']).toBeUndefined();
    });
  });
});
