// tests/unit/models/User.test.js
const User = require('../../../server/models/User');
const db = require('../../../server/config/db');

jest.mock('../../../server/config/db');

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('findByEmail should execute the correct SQL', async () => {
    const mockUser = { id: 'uuid', email: 'test@example.com' };
    db.query.mockResolvedValue({ rows: [mockUser] });

    const user = await User.findByEmail('test@example.com');

    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM users WHERE email = $1',
      ['test@example.com']
    );
    expect(user).toEqual(mockUser);
  });

  it('create should return the new user', async () => {
    const newUser = { id: 'uuid', name: 'Test', email: 'test@example.com', role: 'guest' };
    db.query.mockResolvedValue({ rows: [newUser] });

    const user = await User.create({
      name: 'Test',
      email: 'test@example.com',
      password_hash: 'hash',
      role: 'guest'
    });

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO users'),
      ['Test', 'test@example.com', 'hash', 'guest']
    );
    expect(user).toEqual(newUser);
  });
});
