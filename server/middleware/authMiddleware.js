const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { executeQuery } = require('../config/db');

/**
 * Middleware to protect routes by verifying JWT token
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function protect(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }
      
      // Add user data to request
      req.user = decoded;
      
      // Removed the console.log that was showing user data
      next();
    });
  } catch (error) {
    // Keep error logging for debugging auth issues
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Middleware to check user role
 * @param {Array} roles - Array of allowed roles
 * @returns {Function} Middleware function
 */
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    next();
  };
}

/**
 * Middleware to ensure JSON content type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function ensureJson(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  next();
}

module.exports = {
  protect,
  requireRole,
  ensureJson
};