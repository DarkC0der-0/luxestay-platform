// tests/unit/models/Property.test.js
const Property = require('../../../server/models/Property');
const db = require('../../../server/config/db');

jest.mock('../../../server/config/db');

describe('Property Model', () => {
  it('findAll should return all properties', async () => {
    const mockProps = [{ id: '1', title: 'Villa' }];
    db.query.mockResolvedValue({ rows: mockProps });

    const props = await Property.findAll();

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM properties WHERE 1=1'),
      []
    );
    expect(props).toEqual(mockProps);
  });

  it('create should insert correctly', async () => {
    const newProp = { host_id: 'u1', title: 'A', description: 'D', location: 'L', price_per_night: 100, property_type: 'T', image_urls: [] };
    db.query.mockResolvedValue({ rows: [newProp] });

    await Property.create(newProp);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO properties'),
      ['u1', 'A', 'D', 'L', 100, 'T', [], 1, 1, 2]
    );
  });
});
