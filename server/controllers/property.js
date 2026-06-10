// server/controllers/property.js
const Property = require('../models/Property');
const Location = require('../models/Location');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');
const Setting = require('../models/Setting');
const { logActivity } = require('../utils/activityLogger');

exports.createProperty = catchAsync(async (req, res, next) => {
  // Check Maintenance Mode
  const inMaintenance = await Setting.getByKey('maintenance_mode') === true;
  if (inMaintenance) {
    return res.status(503).json({
      success: false,
      error: { code: 'MAINTENANCE_MODE', message: 'Platform is undergoing maintenance. Listings are temporarily suspended.', status: 503 }
    });
  }

  const { title, description, location, price_per_night, property_type, bedrooms, bathrooms, max_guests } = req.body;
  
  let image_urls = req.body.image_urls || [];
  if (req.files && req.files.length > 0) {
    image_urls = req.files.map(file => file.path);
  } else if (req.file) {
    image_urls = [req.file.path];
  }
  
  const host_id = req.user.id;

  const newProperty = await Property.create({
    host_id,
    title,
    description,
    location,
    price_per_night,
    property_type,
    image_urls,
    bedrooms: parseInt(bedrooms) || 1,
    bathrooms: parseInt(bathrooms) || 1,
    max_guests: parseInt(max_guests) || 2
  });

  // Fetch host name for log details
  const user = await User.findById(host_id);
  const hostName = user?.name || 'Host';

  // Log property creation activity
  await logActivity(
    'property',
    `Listing added: "${title}" by ${hostName}`,
    host_id,
    { propertyId: newProperty.id }
  );

  res.status(201).json({ success: true, property: newProperty });
});

exports.getAllProperties = catchAsync(async (req, res, next) => {
  const { location, minPrice, maxPrice, property_type, limit, offset } = req.query;
  const filters = {
    location,
    minPrice: minPrice ? parseFloat(minPrice) : null,
    maxPrice: maxPrice ? parseFloat(maxPrice) : null,
    property_type,
    limit: limit ? parseInt(limit) : null,
    offset: offset ? parseInt(offset) : null
  };

  const properties = await Property.findAll(filters);
  res.json({ success: true, properties });
});

exports.getPropertyById = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Property not found', status: 404 } });
  }
  res.json({ success: true, property });
});

exports.updateProperty = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, location, price_per_night, property_type, bedrooms, bathrooms, max_guests } = req.body;
  
  const property = await Property.findById(id);
  if (!property) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Property not found', status: 404 } });
  }

  if (property.host_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized', status: 403 } });
  }

  let image_urls = property.image_urls; // Keep existing by default
  if (req.body.image_urls && req.body.image_urls.length > 0) {
    image_urls = req.body.image_urls;
  } else if (req.files && req.files.length > 0) {
    image_urls = req.files.map(file => file.path);
  } else if (req.file) {
    image_urls = [req.file.path];
  }

  const updatedProperty = await Property.update(id, {
    title,
    description,
    location,
    price_per_night,
    property_type,
    image_urls,
    bedrooms: parseInt(bedrooms) || property.bedrooms,
    bathrooms: parseInt(bathrooms) || property.bathrooms,
    max_guests: parseInt(max_guests) || property.max_guests
  });

  // Log property update activity
  await logActivity(
    'property',
    `Listing updated: "${updatedProperty.title}"`,
    req.user.id,
    { propertyId: id }
  );

  res.json({ success: true, property: updatedProperty });
});

exports.deleteProperty = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const property = await Property.findById(id);
  
  if (!property) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Property not found', status: 404 } });
  }

  if (property.host_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized', status: 403 } });
  }

  await Property.delete(id);

  // Log property deletion activity
  await logActivity(
    'property',
    `Listing deleted: "${property.title}"`,
    req.user.id,
    { propertyId: id }
  );

  res.json({ success: true, message: 'Property deleted successfully' });
});

exports.getPropertiesByHost = catchAsync(async (req, res, next) => {
  const hostId = req.user.id;
  const properties = await Property.findByHostId(hostId);
  res.json({ success: true, properties });
});

exports.getLocations = catchAsync(async (req, res, next) => {
  const locations = await Location.findAll();
  res.json({ success: true, locations });
});
