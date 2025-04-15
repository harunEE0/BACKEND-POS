const { Server } = require('socket.io');
const socketAuth = require('../middleware/socketAuth');
const orderSocket = require('../sockets/orderSocket');
const notificationSocket = require('../sockets/notificationSocket');

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.use(socketAuth);

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    orderSocket(io, socket);
    notificationSocket(io, socket);
  });

  return io;
};

module.exports = initSocket;
