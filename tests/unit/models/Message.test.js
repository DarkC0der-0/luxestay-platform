const Message = require('../../../server/models/Message');
const db = require('../../../server/config/db');

jest.mock('../../../server/config/db');

describe('Message Model', () => {
  beforeEach(() => {
    db._resetMocks();
  });

  describe('findChatHistory', () => {
    it('should execute SELECT query for conversation between two users on a property', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });
      await Message.findChatHistory(10, 1, 2);
      expect(db.query).toHaveBeenCalledWith(
        `SELECT * FROM messages 
       WHERE property_id = $1 
       AND ((sender_id = $2 AND receiver_id = $3) OR (sender_id = $3 AND receiver_id = $2))
       ORDER BY created_at ASC`,
        [10, 1, 2]
      );
    });
  });

  describe('create', () => {
    it('should execute INSERT query', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      await Message.create({ property_id: 10, sender_id: 1, receiver_id: 2, content: 'Hello' });
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO messages (property_id, sender_id, receiver_id, content) VALUES ($1, $2, $3, $4) RETURNING *',
        [10, 1, 2, 'Hello']
      );
    });
  });
});
