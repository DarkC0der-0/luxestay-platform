// server/validations/propertySchema.js
const { z } = require('zod');

const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  location: z.string().min(2, 'Location is required'),
  price_per_night: z.number().positive('Price must be positive'),
  property_type: z.enum(['Apartment', 'House', 'Villa', 'Cabin', 'Condo']),
  // We use coerce to handle form-data where everything might come in as strings initially,
  // but let's just make it basic. If image_urls are passed as JSON they are an array.
  image_urls: z.array(z.string()).optional()
});

// For multipart/form-data (where strings might come in instead of numbers)
const formPropertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  location: z.string().min(2, 'Location is required'),
  price_per_night: z.string().refine((val) => !isNaN(parseFloat(val)), { message: "Price must be a number" }).transform(val => parseFloat(val)),
  property_type: z.enum(['Apartment', 'House', 'Villa', 'Cabin', 'Condo']),
  image_urls: z.any().optional() // We handle image array internally via multer or string matching
});

module.exports = { propertySchema, formPropertySchema };
