/**E:\learn-code\backend-pos\services\authService.js */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  constructor() {
    this.userModel = User;
  }

  async register({ username, password, role }) {
    if (!username || !password || !role) {
      throw new Error('Please provide username, password and role');
    }

    try {
      return await this.userModel.create({ username, password, role });
    } catch (err) {
      if (err.code === 11000) {
        const error = new Error('Username already exists');
        error.statusCode = 400;
        throw error;
      }
      throw err;
    }
  }

  async login({ username, password }) {
    if (!username || !password) {
      throw new Error('Please provide username and password');
    }

    const user = await this.userModel.findOne({ username }).select('+password');
    if (!user) throw new Error('Invalid credentials');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Invalid credentials');

    return user;
  }

  async generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  }

  async generateRefreshToken(userId) {
    const refreshToken = jwt.sign(
      { id: userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
    await this.userModel.findByIdAndUpdate(userId, { refreshToken });
    return refreshToken;
  }
}

module.exports = new AuthService();

