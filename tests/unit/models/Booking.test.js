// tests/unit/models/Booking.test.js
const Booking = require('../../../server/models/Booking');
const db = require('../../../server/config/db');

jest.mock('../../../server/config/db');

describe('Booking Model', () => {
  it('create should use provided client for transactions', async () => {
    const mockClient = { query: jest.fn().mockResolvedValue({ rows: [{ id: 'b1' }] }) };
    const bookingData = { property_id: 'p1', guest_id: 'g1', check_in: '2026-01-01', check_out: '2026-01-05', total_price: 400 };

    const booking = await Booking.create(bookingData, mockClient);

    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO bookings'),
      ['p1', 'g1', '2026-01-01', '2026-01-05', 400]
    );
    expect(booking.id).toBe('b1');
  });
});
