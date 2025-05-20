const SessionManager = require('../utils/sessionManager');
const logger = require('../utils/logger');

exports.checkSession = async (req, res, next) => {
  try {
    const sessionToken = req.cookies.session_token;
    
    if (!sessionToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authenticated' 
      });
    }

    // Verify session
    const session = await SessionManager.verifySession(sessionToken);
    if (!session) {
      return res.status(401).json({ 
        success: false, 
        message: 'Session expired' 
      });
    }

    // Refresh session TTL
    await SessionManager.refreshSession(sessionToken);

    // Attach user to request
    req.user = session;
    next();
  } catch (err) {
    logger.error(`Session check error: ${err.message}`);
    next(err);
  }
};