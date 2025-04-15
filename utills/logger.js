/**E:\learn-code\backend-pos\utills\logger.js */
const winston = require('winston');
const { combine, timestamp, printf, colorize } = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
  });
  
  const logger = winston.createLogger({
    level: 'info',
    format: combine(
      colorize(),
      timestamp(),
      myFormat
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
  });
  
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple(),
    }));
  }
  
  module.exports = logger;
