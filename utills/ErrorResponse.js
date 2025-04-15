/**E:\learn-code\backend-pos\utills\ErrorResponse.js */
class ErrorResponse extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true; // แยก error ที่เราควบคุมได้จาก error อื่นๆ
      
      // เก็บ stack trace สำหรับ debugging
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = ErrorResponse;