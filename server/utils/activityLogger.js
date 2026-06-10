// server/utils/activityLogger.js
const ActivityLog = require('../models/ActivityLog');

/**
 * Logs a system or administrative activity to the database.
 * @param {string} type - 'user', 'property', 'booking', 'support', 'payout', 'setting'
 * @param {string} message - Descriptive text log of the activity
 * @param {string|null} actorId - ID of the user performing the action (optional)
 * @param {object|null} metadata - Additional structured metadata (optional)
 */
exports.logActivity = async (type, message, actorId = null, metadata = null) => {
  await ActivityLog.create({ type, message, actorId, metadata });
};
