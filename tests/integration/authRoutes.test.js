const request = require('supertest');
const app = require('../../app');
const db = require('../../server/config/db');
const jwt = require('jsonwebtoken');

jest.mock('../../server/config/db');
process.env.JWT_SECRET = 'testsecret';

describe('Auth API Routes', () => {
  beforeEach(() => {
    db._resetMocks();
    db.query.mockImplementation((queryText, params) => {
      if (queryText.includes('platform_settings')) {
        return Promise.resolve({ rows: [{ value: true }] });
      }
      if (queryText.includes('INSERT INTO users')) {
        return Promise.resolve({ rows: [{ id: 1, email: 'test@example.com', role: 'guest', name: 'Test User' }] });
      }
      if (queryText.includes('SELECT') && queryText.includes('users')) {
        if (queryText.includes('email')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [{ id: 1, email: 'test@example.com', role: 'guest', is_suspended: false }] });
      }
      return Promise.resolve({ rows: [] });
    });
  });

  describe('POST /api/v1/auth/signup', () => {
    it('should register a new user and return a token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({ name: 'Test User', email: 'test@example.com', password: 'password123', role: 'guest' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('guest');
    });

    it('should return 400 if validation fails', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({ email: 'not-an-email' }); // Missing fields, invalid email

      console.log('DEBUG RESPONSE:', response.status, response.text);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return user info if token is valid', async () => {
      const token = jwt.sign({ id: 1, role: 'guest', email: 'test@example.com' }, process.env.JWT_SECRET);
      
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('test@example.com');
    });
  });

  describe('PATCH /api/v1/auth/profile', () => {
    it('should update user profile info', async () => {
      const token = jwt.sign({ id: 1, role: 'guest', email: 'test@example.com' }, process.env.JWT_SECRET);
      
      db.query.mockImplementation((queryText) => {
        if (queryText.includes('UPDATE users')) {
          return Promise.resolve({ rows: [{ id: 1, name: 'Updated Name', email: 'test@example.com', role: 'guest' }] });
        }
        return Promise.resolve({ rows: [{ id: 1, role: 'guest', is_suspended: false }] });
      });

      const response = await request(app)
        .patch('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.name).toBe('Updated Name');
    });
  });

  describe('PATCH /api/v1/auth/change-password', () => {
    it('should change user password if current password is correct', async () => {
      const token = jwt.sign({ id: 1, role: 'guest', email: 'test@example.com' }, process.env.JWT_SECRET);
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('oldpassword', 10);

      db.query.mockImplementation((queryText) => {
        if (queryText.includes('SELECT * FROM users')) {
          return Promise.resolve({ rows: [{ id: 1, password_hash: hashedPassword }] });
        }
        return Promise.resolve({ rows: [{ id: 1, role: 'guest', is_suspended: false }] });
      });

      const response = await request(app)
        .patch('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'oldpassword', newPassword: 'newpassword123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/auth/account', () => {
    it('should delete user account', async () => {
      const token = jwt.sign({ id: 1, role: 'guest', email: 'test@example.com' }, process.env.JWT_SECRET);

      db.query.mockImplementation((queryText) => {
        if (queryText.includes('DELETE FROM users')) {
          return Promise.resolve({ rows: [{ id: 1 }] });
        }
        return Promise.resolve({ rows: [{ id: 1, role: 'guest', is_suspended: false }] });
      });

      const response = await request(app)
        .delete('/api/v1/auth/account')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });
  });
});
