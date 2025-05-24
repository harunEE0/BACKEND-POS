//E:\learn-code\backend-pos\utils\sessionManager.js


const{ redisClient} = require('../config/redis');
const ErrorResponse = require('../utils/ErrorResponse');
const logger = require('../utils/logger');
class SessionManager {
    static async createSession (userId,userData,ttl = 86400) {
        try {
            const sessionKey = `session:${userId}:${Date.now()}`;
        
        await redisClient.set(sessionKey, JSON.stringify(userData), {
            EX: ttl,
        });
        
        return sessionKey; 
        } catch (err) {
            logger.error(`Failed to create session: ${err.message}` );
            throw new ErrorResponse('Failed to create session', 500);
            
            
        }

    }

    static async verifySession (sessionToken){

        if (typeof sessionToken !== 'string' || !sessionToken.startsWith('session:')) {
        logger.warn(`Rejected malformed token: ${sessionToken}`);
        return null;
    }
        try {
             // ตรวจสอบว่า token มีส่วนประกอบครบ (userId:timestamp)
        const parts = sessionToken.split(':');
        if (parts.length < 3) {
            logger.warn(`Invalid token structure: ${sessionToken}`);
            return null;
        }

        const sessionData = await redisClient.get(sessionToken);
        if (!sessionData) {
            logger.warn(`Session not found in Redis: ${sessionToken}`);
            return null;
        }

        return JSON.parse(sessionData);
        } catch (cerror) {
            logger.error('Failed to verify session', error);
            throw new ErrorResponse('Failed to verify session', 500);
            
        }
    }
    static async deleteSession (userId) {
        try {
            const sessionKey = `session:${userId}`;
            await client.del(sessionKey)
        } catch (error) {
            logger.error('Failed to delete session', error);
            throw new ErrorResponse('Failed to delete session', 500);
            
        }
    }
    static async refreshSession (userId,ttl = 86400) {
        try {
            const sessionKey = `session:${userId}`;
            await client.expire(sessionKey, ttl)
        } catch (error) {
            logger.error('Failed to refresh session', error);
            throw new ErrorResponse('Failed to refresh session', 500);
        }
    }
}


module.exports = SessionManager;