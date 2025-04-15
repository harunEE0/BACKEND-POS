/**backend-pos/middleware/socketAuth */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketAuth = async (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) return next(new Error('No token provided'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error('User not found');

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
};

module.exports = socketAuth;
