/**E:\learn-code\backend-pos\utils\ErrorResponse.js */
class ErrorResponse extends Error {
    constructor(message, statusCode,errorCode = null) {
      super(message);
      this.statusCode = statusCode;
      this.errorCode = errorCode;
      this.isOperational = true; 
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = ErrorResponse;