// server/routers/propertyRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { formPropertySchema } = require('../validations/propertySchema');
const propertyController = require('../controllers/property');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

const bookingController = require('../controllers/booking');

// Public routes
router.get('/', propertyController.getAllProperties);
router.get('/locations', propertyController.getLocations);
router.get('/:id', propertyController.getPropertyById);
router.get('/:id/availability', bookingController.getPropertyAvailability);

// Protected routes (Host/Admin only)
// Note: validate is run AFTER upload so req.body is populated from the multipart form
router.post('/', authMiddleware, requireRole('host', 'admin'), upload.array('images', 10), validate(formPropertySchema), propertyController.createProperty);
router.put('/:id', authMiddleware, requireRole('host', 'admin'), upload.array('images', 10), validate(formPropertySchema), propertyController.updateProperty);
router.delete('/:id', authMiddleware, requireRole('host', 'admin'), propertyController.deleteProperty);
router.get('/host/my-properties', authMiddleware, requireRole('host', 'admin'), propertyController.getPropertiesByHost);

module.exports = router;
