/**E:\learn-code\backend-pos\config\socket.js*/

const { Server } = require('socket.io');
const socketAuth = require('../middleware/socketAuth');
const { CORS_ORIGIN, NODE_ENV } = require('./env');
const logger = require('../utils/logger');

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: NODE_ENV === 'production' ? CORS_ORIGIN : '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000 // 2 นาที
    }
  });

  io.use(socketAuth);

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.user?.id || 'anonymous'})`);
    socket.on('error', (err) => {
      logger.error(`Socket error [${socket.id}]: ${err.message}`);
      socket.emit('socket_error', { message: 'Internal server error' });
    });
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected [${socket.id}]: ${reason}`);
    });
  });
  io.on('error', (err) => {
    logger.error(`Socket.IO server error: ${err.message}`);
  });

  return io;
};

module.exports = initSocket;
