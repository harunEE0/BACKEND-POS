const client = require('../config/redis');
const {ErrorResponse} = require('../utils/ErrorResponse');
const {logger} = require('../utils/logger');
class SessionManager {
    static async createSession (user,userData,ttl = 86400) {
        try {
            const sessionKey = `session:${user._id}`;
            await client.set(sessionKey, JSON.stringify(userData), {
                EX: ttl, // Set expiration time in seconds
                NX: true // Only set the key if it does not already exist
            });
            await client.sAdd(`user+session:${userId}`,sessionKey);
            return sessionKey;
        } catch (error) {
            throw new ErrorResponse('Failed to create session', 500);
            logger.error('Failed to create session', error);
            
        }

    }

    static async verifySession (userId){
        try {
            const sessionKey = `session:${userId}`;
            const sessionData = await client.get(sessionKey);
            return sessionData ? JSON.parse(sessionData) : null;
        } catch (cerror) {
            throw new ErrorResponse('Failed to verify session', 500);
            logger.error('Failed to verify session', error);
            
        }
    }
    static async deleteSesion (userId) {
        try {
            const sessionKey = `session:${userId}`;
            await client.del(sessionKey)
        } catch (error) {
            throw new ErrorResponse('Failed to delete session', 500);
            logger.error('Failed to delete session', error);
            
        }
    }
    static async refreshSession (userId) {
        try {
            const sessionKey = `session:${userId}`;
            await client.expire(sessionKey, ttl)
        } catch (error) {
            throw new ErrorResponse('Failed to refresh session', 500);
            logger.error('Failed to refresh session', error);
        }
    }
}


module.exports = SessionManager;