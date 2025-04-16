//**E:\learn-code\backend-pos\server.js */


const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path'); 
require('dotenv').config();


// Import routes
const auth = require('./routes/authRoute');
const products = require('./routes/productRoute');
const orders = require('./routes/orderRoute');
const payments = require('./routes/paymentRoute');
const customers = require('./routes/customerRoute');
const inventory = require('./routes/inventoryRoute')
const cart = require('./routes/cartRoute')
const dashboard = require('./routes/dashboardRoute')

// Import config and middleware
const connectDB = require('./config/db');
const { PORT } = require('./config/env'); //port is 5000
const errorHandler = require('./middleware/errorHandler');

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Serve static files in production
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

// Error handling middleware
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`);
  console.error('Shutting down the server due to unhandled promise rejection');
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Error: ${err.message}`);
  console.error('Shutting down the server due to uncaught exception');
  process.exit(1);
});
process.on('exit', (code) => {
  console.log('Exiting with code:', code);
});

