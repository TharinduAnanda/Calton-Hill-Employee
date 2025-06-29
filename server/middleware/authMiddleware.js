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
    
    console.log('Auth middleware - Headers received:', Object.keys(req.headers));
    console.log('Auth middleware - Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth middleware - No Bearer token found');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const token = authHeader.split(' ')[1];
    console.log('Auth middleware - Token found:', token.substring(0, 10) + '...');
    
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
      if (err) {
        console.log('Auth middleware - Token verification failed:', err.message);
        console.log('Auth middleware - JWT_SECRET:', process.env.JWT_SECRET ? 'exists (hidden)' : 'not set, using default');
        console.log('Auth middleware - Error details:', {
          name: err.name,
          message: err.message,
          expiredAt: err.expiredAt // If token expired
        });
        
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }
      
      console.log('Auth middleware - Token verified successfully, user ID:', decoded.userId || decoded.id);
      
      // Add user data to request - ensure we handle various user ID formats
      req.user = {
        userId: decoded.userId || decoded.id || decoded.owner_id,
        role: decoded.role,
        email: decoded.email
      };
      
      next();
    });
  } catch (error) {
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