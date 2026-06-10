// server/controllers/message.js
const Message = require('../models/Message');
const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');

exports.sendMessage = catchAsync(async (req, res, next) => {
  const { bookingId, content } = req.body;
  const sender_id = req.user.id;

  let targetPropertyId, targetReceiverId;

  if (bookingId && !bookingId.startsWith('direct-')) {
    // 1. Fetch booking details to get property_id, guest_id, and host_id
    const { rows: bookingRows } = await db.query(`
      SELECT b.property_id, b.guest_id, p.host_id 
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = $1
    `, [bookingId]);

    if (bookingRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const { property_id, guest_id, host_id } = bookingRows[0];
    targetPropertyId = property_id;
    targetReceiverId = sender_id === guest_id ? host_id : guest_id;
  } else if (bookingId && bookingId.startsWith('direct-')) {
    // It's a direct pre-booking chat! bookingId format: direct-PROPERTYID__HOSTID
    const parts = bookingId.split('__');
    targetPropertyId = parts[0].replace('direct-', '');
    targetReceiverId = parts[1];
  }

  if (!targetPropertyId || !targetReceiverId) {
    return res.status(400).json({ success: false, error: 'Recipient and property details are required' });
  }

  // 2. Persist the message to database
  const newMessage = await Message.create({
    property_id: targetPropertyId,
    sender_id,
    receiver_id: targetReceiverId,
    content
  });

  // 3. Attach booking_id and broadcast via Socket.io for instant real-time synchronization
  const socketPayload = {
    ...newMessage,
    booking_id: bookingId
  };

  if (req.app.io) {
    req.app.io.emit('receive_message', socketPayload);
  }

  res.status(201).json({ success: true, message: newMessage });
});

exports.getChatHistory = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;
  const current_user_id = req.user.id;

  if (bookingId && bookingId.startsWith('direct-')) {
    const parts = bookingId.split('__');
    const property_id = parts[0].replace('direct-', '');
    const other_user_id = parts[1];

    const history = await Message.findChatHistory(property_id, current_user_id, other_user_id);
    return res.json({ success: true, data: history, history: history });
  }

  // 1. Fetch booking details to get property_id, guest_id, and host_id
  const { rows: bookingRows } = await db.query(`
    SELECT b.property_id, b.guest_id, p.host_id 
    FROM bookings b
    JOIN properties p ON b.property_id = p.id
    WHERE b.id = $1
  `, [bookingId]);

  if (bookingRows.length === 0) {
    return res.status(404).json({ success: false, error: 'Booking not found' });
  }

  const { property_id, guest_id, host_id } = bookingRows[0];

  // The other party is the guest if current user is host, or host if current user is guest
  const other_user_id = current_user_id === guest_id ? host_id : guest_id;

  // 2. Query conversation history
  const history = await Message.findChatHistory(property_id, current_user_id, other_user_id);
  res.json({ success: true, data: history, history: history });
});

exports.getDirectChatHistory = catchAsync(async (req, res, next) => {
  const { propertyId, otherUserId } = req.params;
  const current_user_id = req.user.id;

  const history = await Message.findChatHistory(propertyId, current_user_id, otherUserId);
  res.json({ success: true, data: history, history: history });
});

exports.getConversations = catchAsync(async (req, res, next) => {
  const current_user_id = req.user.id;

  const { rows } = await db.query(
    `SELECT 
       m.property_id,
       p.title as property_name,
       p.location,
       p.image_urls,
       CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END as other_user_id,
       u.name as other_user_name,
       u.role as other_user_role,
       u.avatar_url as other_user_avatar,
       m.content as last_message_content,
       m.created_at as last_message_time,
       (
         SELECT COUNT(*) 
         FROM messages m2
         WHERE m2.property_id = m.property_id
         AND ((m2.sender_id = m.sender_id AND m2.receiver_id = m.receiver_id) OR (m2.sender_id = m.receiver_id AND m2.receiver_id = m.sender_id))
       ) as message_count
     FROM messages m
     JOIN properties p ON m.property_id = p.id
     JOIN users u ON (CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END) = u.id
     WHERE m.id IN (
       SELECT DISTINCT ON (
         property_id, 
         LEAST(sender_id, receiver_id), 
         GREATEST(sender_id, receiver_id)
       ) id
       FROM messages
       WHERE sender_id = $1 OR receiver_id = $1
       ORDER BY 
         property_id, 
         LEAST(sender_id, receiver_id), 
         GREATEST(sender_id, receiver_id), 
         created_at DESC
     )
     ORDER BY m.created_at DESC`,
    [current_user_id]
  );

  const formatted = rows.map((r) => ({
    id: `direct-${r.property_id}__${r.other_user_id}`,
    property_id: r.property_id,
    other_user_id: r.other_user_id,
    lastMessageContent: r.last_message_content,
    lastMessageTime: r.last_message_time,
    messageCount: parseInt(r.message_count) || 0,
    property: {
      id: r.property_id,
      title: r.property_name,
      location: r.location,
      image: r.image_urls?.[0] || '/placeholder.png',
      host_id: {
        id: r.other_user_id,
        name: r.other_user_name,
        avatar_url: r.other_user_avatar
      }
    },
    user: {
      id: r.other_user_id,
      name: r.other_user_name,
      role: r.other_user_role,
      avatar_url: r.other_user_avatar
    }
  }));

  res.json({ success: true, data: formatted, conversations: formatted });
});
