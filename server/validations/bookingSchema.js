// server/validations/bookingSchema.js
const { z } = require('zod');

const createBookingSchema = z.object({
  property_id: z.string().uuid('Invalid property ID format'),
  check_in: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid check-in date' }),
  check_out: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid check-out date' }),
  total_price: z.number().positive('Total price must be positive'),
  payment_intent_id: z.string().optional()
}).refine(data => new Date(data.check_out) > new Date(data.check_in), {
  message: "check_out must be after check_in",
  path: ["check_out"],
});

module.exports = { createBookingSchema };
