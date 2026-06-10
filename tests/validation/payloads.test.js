// tests/validation/payloads.test.js
const request = require('supertest');
const app = require('../../app');

describe('Payload Validation (Zod)', () => {
  describe('POST /api/v1/auth/signup', () => {
    it('should return 400 for malformed email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          name: 'Test',
          email: 'not-an-email',
          password: 'short',
          role: 'guest'
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.message).toContain('email');
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app).post('/api/v1/auth/signup').send({});
      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('name');
      expect(res.body.error.message).toContain('email');
    });
  });
});
