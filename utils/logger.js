/**E:\learn-code\backend-pos\utlls\logger.js */
const winston = require('winston');
const { combine, timestamp, printf, json, metadata } = winston.format;
const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack  || message}`;
});
const prodFormat = combine(
  timestamp(),
  metadata(),
  winston.format.json()
);
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? prodFormat : combine(
    winston.format.colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    devFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: prodFormat
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      format: prodFormat
    }),
  ],
 
});

  
  module.exports = logger;
