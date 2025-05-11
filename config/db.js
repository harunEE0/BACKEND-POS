/**E:\learn-code\backend-pos\config\db.js */
const mongoose = require('mongoose');
 const logger = require('../utils/logger');

const connectDB = async () => {
    try{const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // 5 วินาที
        socketTimeoutMS: 45000, // 45 วินาที
        maxPoolSize: 10, // Connection Pool
        retryWrites: true,
        w: 'majority'
      });
  
      logger.info(`MongoDB Connected: ${conn.connection.host}`);
  
      // Event Listeners
      mongoose.connection.on('connected', () => {
        logger.info('MongoDB connection established');
      });
  
      mongoose.connection.on('error', (err) => {
        logger.error(`MongoDB connection error: ${err.message}`);
      });
  
      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB connection disconnected');
      });
  
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed due to app termination');
        process.exit(0);
      });
  
    } catch(err){
        console.log('MONGO error',err);
        process.exit(1);
    }
}

module.exports = connectDB;