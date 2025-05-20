const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const helmet = require('helmet');
require('dotenv').config();

// Utilities
const logger = require('./utils/logger');
const connectDB = require('./config/db');
const { PORT } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

// Routes
const auth = require('./routes/authRoute');
const products = require('./routes/productRoute');
const orders = require('./routes/orderRoute');
const payments = require('./routes/paymentRoute');
const customers = require('./routes/customerRoute');
const inventory = require('./routes/inventoryRoute')
const cart = require('./routes/cartRoute')
const dashboard = require('./routes/dashboardRoute')
// ... import routes อื่นๆ ...

// Database Connections
const initializeServers = async () => {
  try {
    // เชื่อมต่อ MongoDB
    await connectDB();
    
    // เชื่อมต่อ Redis 

    // Middleware
    app.use(express.json());
    app.use(cookieParser(process.env.COOKIE_SECRET || 'fallback-secret-key'));
    app.use('/uploads', express.static('uploads'));
    app.use(helmet());
    app.use(cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    }));

    // Production Static Files
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../client/build')));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
      });
    }

    // Routes
    app.use('/api/v1/auth', auth);
    app.use('/api/v1/products', products);
    app.use('/api/v1/orders', orders);
    app.use('/api/v1/payments', payments);
    app.use('/api/v1/customers', customers);
    app.use('/api/v1/inventory', inventory);
    app.use('/api/v1/cart', cart);
    app.use('/api/v1/dashboard', dashboard);
    // ... ใช้ routes อื่นๆ ...

    // Error Handling
    app.use(errorHandler);

    // Start Server
    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful Shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
      await mongoose.connection.close();
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (err) {
    logger.error(`Server initialization failed: ${err.message}`);
    process.exit(1);
  }
};

// Event Listeners
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Initialize
initializeServers();