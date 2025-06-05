//E:\learn-code\backend-pos\server.js

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
const {connectRedis} = require('./config/redis')
const {CORS_ORIGIN} = require('./config/env')
 
// Routes
const auth = require('./routes/authRoute');
const products = require('./routes/productRoute');
const orders = require('./routes/orderRoute');
const payments = require('./routes/paymentRoute');
const customers = require('./routes/customerRoute');
const inventory = require('./routes/inventoryRoute')
const cart = require('./routes/cartRoute')
const dashboard = require('./routes/dashboardRoute')
const storeRoutes = require('./routes/store');
// ... import routes อื่นๆ ...

// Database Connections
const initializeServers = async () => {
  try {
    // เชื่อมต่อ MongoDB
    await connectDB();
    await connectRedis();
    
    // เชื่อมต่อ Redis 
    // Middleware
    app.use(express.json());
    app.use('/uploads', express.static('uploads'));
    app.use(helmet());
   app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      CORS_ORIGIN,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://172.17.32.1:3000', 
      'http://localhost:5000',
      'http://127.0.0.1:5000'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// ตั้งค่า Cookie อย่างปลอดภัย
app.use(cookieParser(process.env.COOKIE_SECRET || 'fallback-secret-key', {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
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
    app.use('/api/v1/stores', storeRoutes);
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