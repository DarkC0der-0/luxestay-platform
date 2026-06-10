const { registerSchema, loginSchema } = require('../../../server/validations/authSchema');

describe('Auth Validations', () => {
  describe('registerSchema', () => {
    it('should pass valid registration data', () => {
      const data = { name: 'John Doe', email: 'test@example.com', password: 'password123', role: 'guest' };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail if email is invalid', () => {
      const data = { name: 'John Doe', email: 'not-an-email', password: 'password123', role: 'guest' };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe('Invalid email address');
    });

    it('should fail if role is invalid', () => {
      const data = { name: 'John Doe', email: 'test@example.com', password: 'password123', role: 'admin' }; // Role must be guest or host usually
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should pass valid login data', () => {
      const data = { email: 'test@example.com', password: 'password123' };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail if password is empty', () => {
      const data = { email: 'test@example.com', password: '' };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
