/**E:\learn-code\backend-pos\services\authService.js */


const User = require('../models/User');

exports.registerUser = async ({ username, password, role }) => {
  if (!username || !password || !role) {
    const error = new Error('Please provide username, password and role');
    error.statusCode = 400;
    throw error;
  }

  try {
    return await User.create({ username, password, role });
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error('Username already exists');
      error.statusCode = 400;
      throw error;
    }
    throw err;
  }
};
exports.generateRefreshToken = async (userId) => {
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
  
  await User.findByIdAndUpdate(userId, { refreshToken });
  return refreshToken;
};

exports.validateUserLogin = async ({ username, password }) => {
  if (!username || !password) {
    const error = new Error('Please provide username and password');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ username }).select('+password');
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  return user;
};

exports.getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};
