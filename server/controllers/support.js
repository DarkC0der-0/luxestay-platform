// server/controllers/support.js
const SupportTicket = require('../models/SupportTicket');
const { logActivity } = require('../utils/activityLogger');
const catchAsync = require('../utils/catchAsync');

exports.createTicket = catchAsync(async (req, res) => {
  const { subject, message, category, priority } = req.body;
  const { name, email, id: userId } = req.user;

  if (!subject || !message) {
    return res.status(400).json({ success: false, error: 'Subject and message are required' });
  }

  const newTicket = await SupportTicket.create({
    name,
    email,
    subject,
    message,
    category,
    priority
  });

  // Log support ticket creation activity (instantly renders in admin log feed)
  await logActivity(
    'support',
    `New support ticket created: "${subject}" by ${name} (${email})`,
    userId,
    { ticketId: newTicket.id }
  );

  res.status(201).json({ success: true, ticket: newTicket });
});
