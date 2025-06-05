//E:\learn-code\backend-pos\middleware\sessionCheck.js

const SessionManager = require('../utils/sessionManager');
const logger = require('../utils/logger');

exports.checkSession = async (req, res, next) => {
  try {
     const sessionToken = req.cookies.session_token || req.headers?.authorization?.split(' ')[1];
    
    if (!sessionToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authenticated' 
      });
    }

    if (!sessionToken.startsWith('session:')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid session format' 
      });
    }

    const session = await SessionManager.verifySession(sessionToken);
    if (!session) {
      return res.status(401).json({ 
        success: false, 
        message: 'Session expired' 
      });
    }

    await SessionManager.refreshSession(sessionToken);
    req.user = session;
    next();
  } catch (err) {
    logger.error(`Session check error: ${err.message}`);
    next(err);
  }
};