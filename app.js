// server/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const propertyRoutes = require('./server/routes/property');
const authRoutes = require('./server/routes/auth');
const bookingRoutes = require('./server/routes/booking');
const messageRoutes = require('./server/routes/message');
const errorHandler = require('./server/middleware/errorHandler');

require('dotenv').config();

const app = express();
const server = http.createServer(app);

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      if (ALLOWED_ORIGINS.indexOf(origin) !== -1 || origin.endsWith('.onrender.com')) {
        callback(null, true);
      } else {
        console.error(`[CORS Error] Origin ${origin} not allowed by policy`);
        callback(new Error('Not allowed by CORS'));
      }

    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};

// Middleware
app.use(helmet());
app.use(express.json());
app.use(cors(corsOptions));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/messages', messageRoutes);

const supportRoutes = require('./server/routes/support');
app.use('/api/v1/support', supportRoutes);

const adminRoutes = require('./server/routes/admin');
app.use('/api/v1/admin', adminRoutes);

// Serve static files from the React dist folder (Single Instance Deployment)
const path = require('path');
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res, next) => {
  // Bypass static serving for API endpoints to allow correct JSON error responses
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Global Error Handler
app.use(errorHandler);


const initializeSocket = require('./server/socket/index.js');

const PORT = process.env.PORT || 5000;
const io = initializeSocket(server, ALLOWED_ORIGINS);

if (require.main === module) {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

app.server = server;
app.io = io;

module.exports = app;