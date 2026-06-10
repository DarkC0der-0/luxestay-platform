// server/models/Message.js
const db = require('../config/db');

const Message = {
  create: async ({ property_id, sender_id, receiver_id, content }) => {
    const { rows } = await db.query(
      'INSERT INTO messages (property_id, sender_id, receiver_id, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [property_id, sender_id, receiver_id, content]
    );
    return rows[0];
  },

  findChatHistory: async (property_id, user1_id, user2_id) => {
    const { rows } = await db.query(
      `SELECT * FROM messages 
       WHERE property_id = $1 
       AND ((sender_id = $2 AND receiver_id = $3) OR (sender_id = $3 AND receiver_id = $2))
       ORDER BY created_at ASC`,
      [property_id, user1_id, user2_id]
    );
    return rows;
  }
};

module.exports = Message;
