// tests/security/socket.test.js
const http = require('http');
const socketIOClient = require('socket.io-client');
const app = require('../../app');
const jwt = require('jsonwebtoken');

describe('Socket.io Security', () => {
  let server, socket, port;

  beforeAll((done) => {
    server = app.server;
    server.listen(() => {
      port = server.address().port;
      done();
    });
    process.env.JWT_SECRET = 'test-secret';
  });

  afterAll((done) => {
    server.close(done);
  });

  afterEach(() => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
  });

  it('should reject connection without token', (done) => {
    socket = socketIOClient(`http://localhost:${port}`, {
      transports: ['websocket'],
      forceNew: true
    });
    socket.on('connect_error', (err) => {
      expect(err.message).toContain('No token provided');
      done();
    });
  });

  it('should accept connection with valid token', (done) => {
    const token = jwt.sign({ id: 'u1' }, process.env.JWT_SECRET);
    socket = socketIOClient(`http://localhost:${port}`, {
      auth: { token },
      transports: ['websocket'],
      forceNew: true
    });
    socket.on('connect', () => {
      expect(socket.connected).toBe(true);
      done();
    });
    socket.on('connect_error', (err) => {
      done(err);
    });
  });
});
