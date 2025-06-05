//E:\learn-code\backend-pos\utils\sessionManager.js


const{ redisClient} = require('../config/redis');
const ErrorResponse = require('../utils/ErrorResponse');
const logger = require('../utils/logger');
class SessionManager {
    static async createSession (userId,userData,ttl = 86400) {
       
        const timestamp = Date.now();
    const randomString = require('crypto').randomBytes(16).toString('hex');
    const sessionKey = `session:${userId}:${timestamp}.${randomString}`;
    
    await redisClient.set(sessionKey, JSON.stringify(userData), {
      EX: ttl,
    });
    
    return sessionKey;

    }

    static async verifySession (sessionToken){

        
        try {

           
   if (typeof sessionToken !== 'string' || !sessionToken.startsWith('session:')) {
      logger.warn(`Rejected malformed token: ${sessionToken}`);
      return null;
    }
             // ตรวจสอบว่า token มีส่วนประกอบครบ (userId:timestamp)
        const parts = sessionToken.split(':');
        if (parts.length < 3) {
            logger.warn(`Invalid token structure: ${sessionToken}`);
            return null;
        }
const sessionData = await redisClient.get(sessionToken);
    return sessionData ? JSON.parse(sessionData) : null;
       
        } catch (cerror) {
            logger.error('Failed to verify session', error);
            throw new ErrorResponse('Failed to verify session', 500);
            
        }
    }
    static async deleteSession (sessionToken) {
        try {
              if (!sessionToken) return false;

        // ตรวจสอบก่อนว่ามี session นี้จริงหรือไม่
        const exists = await redisClient.exists(sessionToken);
        if (!exists) return false;

        // ลบ session ออกจาก Redis
        const result = await redisClient.del(sessionToken);
        return result === 1; // คืนค่า true ถ้าลบสำเร็จ
        } catch (error) {
            logger.error('Failed to delete session', error);
            throw new ErrorResponse('Failed to delete session', 500);
            
        }
    }
    static async refreshSession (sessionToken,ttl = 86400) {
        try {
             if (!sessionToken) {
      logger.warn('No session token provided for refresh');
      return false;
    }
            await redisClient.expire(sessionToken, ttl)
        } catch (error) {
            logger.error('Failed to refresh session', error);
            throw new ErrorResponse('Failed to refresh session', 500);
        }
    }
}


module.exports = SessionManager;