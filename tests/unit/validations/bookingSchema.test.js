const { createBookingSchema } = require('../../../server/validations/bookingSchema');

describe('Booking Validations', () => {
  describe('createBookingSchema', () => {
    it('should pass valid booking data', () => {
      const data = {
        property_id: '550e8400-e29b-41d4-a716-446655440000',
        check_in: '2025-01-01',
        check_out: '2025-01-05',
        total_price: 500,
        payment_intent_id: 'pi_123'
      };
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail if check_out is before check_in', () => {
      const data = {
        property_id: '550e8400-e29b-41d4-a716-446655440000',
        check_in: '2025-01-05',
        check_out: '2025-01-01',
        total_price: 500,
        payment_intent_id: 'pi_123'
      };
      const result = createBookingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
