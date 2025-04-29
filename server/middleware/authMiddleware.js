const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { executeQuery } = require('../config/db');

const authMiddleware = {
  // General protection middleware
  protect: async (req, res, next) => {
    try {
      res.setHeader('Content-Type', 'application/json');

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized, no token provided'
        });
      }

      const token = authHeader.split(' ')[1].trim();
      
      if (typeof token !== 'string' || token.split('.').length !== 3) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid token format' 
        });
      }

      const decoded = jwt.verify(token, config.jwt.secret, { 
        algorithms: ['HS256'],
        ignoreExpiration: false
      });

      if (!decoded.userId || !decoded.role) {
        return res.status(401).json({ 
          success: false,
          message: 'Token missing required claims' 
        });
      }

      const [owner] = await executeQuery(
        'SELECT Owner_ID as id, Name, Email, "owner" as role FROM owner WHERE Owner_ID = ?', 
        [decoded.userId]
      );

      const [staff] = await executeQuery(
        'SELECT Staff_ID as id, First_Name, Last_Name, Email, Role as role FROM staff WHERE Staff_ID = ?',
        [decoded.userId]
      );

      const user = owner || staff;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        });
      }

      req.user = {
        id: user.id,
        ...(user.role === 'owner' 
          ? { name: user.Name, email: user.Email }
          : { 
              firstName: user.First_Name, 
              lastName: user.Last_Name,
              email: user.Email 
            }),
        role: user.role
      };

      next();
    } catch (error) {
      let message = 'Not authorized, token failed';
      if (error.name === 'TokenExpiredError') {
        message = 'Session expired, please login again';
      } else if (error.name === 'JsonWebTokenError') {
        message = 'Invalid token';
      }

      res.status(401).json({ 
        success: false,
        message
      });
    }
  },

  // Owner-specific protection
  protectOwner: async (req, res, next) => {
    await authMiddleware.protect(req, res, () => {
      if (req.user?.role === 'owner') {
        return next();
      }
      res.status(403).json({
        success: false,
        message: 'Owner access required'
      });
    });
  },

  // Staff-specific protection
  protectStaff: async (req, res, next) => {
    await authMiddleware.protect(req, res, () => {
      if (req.user?.role === 'staff') {
        return next();
      }
      res.status(403).json({
        success: false,
        message: 'Staff access required'
      });
    });
  },

  // Role-based access control
  requireRole: (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          success: false,
          message: `Requires roles: ${allowedRoles.join(', ')}`
        });
      }
      next();
    };
  },

  // Content-Type validation
  ensureJson: (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  }
};

module.exports = authMiddleware;