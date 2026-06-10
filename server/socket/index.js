const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

const initializeSocket = (server, allowedOrigins) => {
  const io = socketIO(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
    },
  });

  // Socket.io Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Track online users
  const onlineUsers = new Map(); // userId -> Set(socketIds)

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`New socket connection from user: ${userId}`);
    
    // Add to online users
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    
    // Broadcast updated online users list
    io.emit('online_users', Array.from(onlineUsers.keys()));
    
    // Room management for private messaging
    socket.on('join_booking', (bookingId) => {
      socket.join(bookingId);
      console.log(`User ${userId} joined room: ${bookingId}`);
    });

    socket.on('leave_booking', (bookingId) => {
      socket.leave(bookingId);
      console.log(`User ${userId} left room: ${bookingId}`);
    });

    // Disconnect event
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id} (User: ${userId})`);
      
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
        }
      }
      
      // Broadcast updated online users list
      io.emit('online_users', Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

module.exports = initializeSocket;
