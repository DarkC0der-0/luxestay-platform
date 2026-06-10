const { propertySchema } = require('../../../server/validations/propertySchema');

describe('Property Validations', () => {
  describe('propertySchema', () => {
    it('should pass valid property data', () => {
      const data = {
        title: 'Beautiful Villa',
        description: 'A very beautiful villa by the sea.',
        location: 'Miami',
        price_per_night: 150,
        property_type: 'Villa'
      };
      const result = propertySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail if price is negative', () => {
      const data = {
        title: 'Beautiful Villa',
        description: 'A very beautiful villa by the sea.',
        location: 'Miami',
        price_per_night: -10,
        property_type: 'Villa'
      };
      const result = propertySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should fail if property_type is invalid', () => {
      const data = {
        title: 'Beautiful Villa',
        description: 'A very beautiful villa by the sea.',
        location: 'Miami',
        price_per_night: 150,
        property_type: 'spaceship'
      };
      const result = propertySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
