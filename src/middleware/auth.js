
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const logger = require('../utils/logger');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const tokens = req.header('Authorization')?.replace('Bearer ', '');
    console.log("Helo");
    const token = req.cookies.token;
    logger.info(token);
    console.log("Hello")

    if (!token && !tokens) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    // Verify token
    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.userId = decoded.userId;
      req.role = decoded.role;
      next();

    }
    else if (tokens) {
      const decoded = jwt.verify(tokens, config.jwtSecret);
      req.userId = decoded.userId;
      req.role = decoded.role;
      next();

    }

  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid authentication token'
    });
  }
};

module.exports = authMiddleware;