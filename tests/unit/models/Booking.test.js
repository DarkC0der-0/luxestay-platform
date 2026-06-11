// tests/unit/models/Booking.test.js
const Booking = require('../../../server/models/Booking');
const db = require('../../../server/config/db');

jest.mock('../../../server/config/db');

describe('Booking Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should insert a booking using the provided transaction client', async () => {
      const mockClient = { query: jest.fn().mockResolvedValue({ rows: [{ id: 'b1', property_id: 'p1' }] }) };
      const bookingData = { 
        property_id: 'p1', 
        guest_id: 'g1', 
        check_in: '2026-01-01', 
        check_out: '2026-01-05', 
        total_price: 400, 
        payment_intent_id: 'pi_123' 
      };

      const booking = await Booking.create(bookingData, mockClient);

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO bookings'),
        ['p1', 'g1', '2026-01-01', '2026-01-05', 400, 'pi_123']
      );
      expect(booking.id).toBe('b1');
    });
  });

  describe('findByGuestId', () => {
    it('should return bookings for a specific guest ID', async () => {
      const mockBookings = [{ id: 'b1', guest_id: 'g1', property_name: 'Luxury Villa' }];
      db.query.mockResolvedValue({ rows: mockBookings });

      const results = await Booking.findByGuestId('g1');

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE b.guest_id = $1'),
        ['g1']
      );
      expect(results).toEqual(mockBookings);
    });
  });

  describe('findByHostId', () => {
    it('should return bookings for a specific host ID', async () => {
      const mockBookings = [{ id: 'b1', host_id: 'h1', property_name: 'Luxury Villa' }];
      db.query.mockResolvedValue({ rows: mockBookings });

      const results = await Booking.findByHostId('h1');

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE p.host_id = $1'),
        ['h1']
      );
      expect(results).toEqual(mockBookings);
    });
  });

  describe('updateStatus', () => {
    it('should update status using custom client', async () => {
      const mockClient = { query: jest.fn().mockResolvedValue({ rows: [{ id: 'b1', status: 'cancelled' }] }) };
      
      const result = await Booking.updateStatus('b1', 'cancelled', mockClient);

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE bookings SET status = $1 WHERE id = $2'),
        ['cancelled', 'b1']
      );
      expect(result.status).toBe('cancelled');
    });
  });

  describe('delete', () => {
    it('should return true if rowCount > 0', async () => {
      db.query.mockResolvedValue({ rowCount: 1 });

      const result = await Booking.delete('b1');

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM bookings WHERE id = $1'),
        ['b1']
      );
      expect(result).toBe(true);
    });

    it('should return false if rowCount is 0', async () => {
      db.query.mockResolvedValue({ rowCount: 0 });

      const result = await Booking.delete('b1');
      expect(result).toBe(false);
    });
  });

  describe('findAvailabilityByPropertyId', () => {
    it('should retrieve active booked ranges for a property', async () => {
      const mockRanges = [{ check_in: '2026-01-01', check_out: '2026-01-05' }];
      db.query.mockResolvedValue({ rows: mockRanges });

      const result = await Booking.findAvailabilityByPropertyId('p1');

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE property_id = $1 AND check_out >= CURRENT_DATE'),
        ['p1']
      );
      expect(result).toEqual(mockRanges);
    });
  });

  describe('findAllAdmin', () => {
    it('should list all bookings with guest and property details', async () => {
      const mockAll = [{ id: 'b1', guest_name: 'Guest User' }];
      db.query.mockResolvedValue({ rows: mockAll });

      const result = await Booking.findAllAdmin();

      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT b.id, b.property_id'));
      expect(result).toEqual(mockAll);
    });
  });

  describe('countAll', () => {
    it('should return total count of bookings as integer', async () => {
      db.query.mockResolvedValue({ rows: [{ count: '10' }] });

      const count = await Booking.countAll();

      expect(db.query).toHaveBeenCalledWith('SELECT COUNT(*) FROM bookings');
      expect(count).toBe(10);
    });

    it('should return 0 if count is missing', async () => {
      db.query.mockResolvedValue({ rows: [{ count: null }] });

      const count = await Booking.countAll();
      expect(count).toBe(0);
    });
  });

  describe('findRecent', () => {
    it('should fetch recent bookings with limit', async () => {
      const mockRecent = [{ id: 'b1', guest_name: 'Alice' }];
      db.query.mockResolvedValue({ rows: mockRecent });

      const result = await Booking.findRecent(5);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY b.created_at DESC'),
        [5]
      );
      expect(result).toEqual(mockRecent);
    });
  });

  describe('findDetailsForActivity', () => {
    it('should retrieve custom fields for logging activity', async () => {
      const mockDetails = { guest_name: 'Alice', property_title: 'Villa 1', total_price: 150 };
      db.query.mockResolvedValue({ rows: [mockDetails] });

      const result = await Booking.findDetailsForActivity('b1');

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE b.id = $1'),
        ['b1']
      );
      expect(result).toEqual(mockDetails);
    });
  });

  describe('globalSearch', () => {
    it('should query bookings based on term and limit', async () => {
      const mockMatches = [{ id: 'b1', property_title: 'Beach House' }];
      db.query.mockResolvedValue({ rows: mockMatches });

      const result = await Booking.globalSearch('%beach%', 3);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE p.title ILIKE $1 OR u.name ILIKE $1 LIMIT $2'),
        ['%beach%', 3]
      );
      expect(result).toEqual(mockMatches);
    });
  });
});
