const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { executeQuery } = require('../config/db');
const config = require('../config/config');

const authController = {
  /**
   * Universal login handler with enhanced security
   */
  _handleLogin: async (req, res, userType) => {
    try {
      // Enforce JSON response headers
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Content-Type-Options', 'nosniff');

      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
          error: 'MISSING_CREDENTIALS'
        });
      }

      // Database configuration
      const table = userType === 'owner' ? 'owner' : 'staff';
      const idField = userType === 'owner' ? 'Owner_ID' : 'Staff_ID';
      const nameField = userType === 'owner' 
        ? 'Name' 
        : 'CONCAT(First_Name, " ", Last_Name)';

      // Get user from database
      const [user] = await executeQuery(
        `SELECT ${idField} as id, ${nameField} as name, Email as email, Password 
         FROM ${table} WHERE Email = ?`,
        [email]
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          error: 'INVALID_CREDENTIALS'
        });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.Password);
      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          error: 'INVALID_CREDENTIALS'
        });
      }

      // Create JWT token
      const tokenPayload = {
        userId: user.id,
        role: userType,
        email: user.email,
        name: user.name,
        iat: Math.floor(Date.now() / 1000),
        iss: config.jwt.issuer || 'your-app-name',
        aud: config.jwt.audience || 'web-client'
      };

      const token = jwt.sign(
        tokenPayload,
        config.jwt.secret,
        { 
          expiresIn: config.jwt.expiresIn || '8h',
          algorithm: 'HS256'
        }
      );

      // Prepare response
      const { Password, ...userData } = user;
      
      return res.status(200).json({
        success: true,
        token,
        user: {
          ...userData,
          role: userType
        },
        expiresIn: config.jwt.expiresIn || '8h',
        path: userType
      });

    } catch (error) {
      console.error('Login error:', {
        endpoint: `${userType} login`,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });

      return res.status(500).json({
        success: false,
        message: 'Authentication service unavailable',
        error: 'SERVER_ERROR',
        ...(process.env.NODE_ENV === 'development' && {
          debug: error.message
        })
      });
    }
  },

  loginOwner: async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    const query = 'SELECT Owner_ID, Name, Email, Password FROM owner WHERE Email = ?';
    const owner = await executeQuery(query, [email]);
    
    if (owner.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const isMatch = await bcrypt.compare(password, owner[0].Password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const token = jwt.sign(
      { 
        userId: owner[0].Owner_ID,
        role: 'owner',
        email: owner[0].Email,
        name: owner[0].Name
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      success: true,
      token,
      user: {
        id: owner[0].Owner_ID,
        name: owner[0].Name,
        email: owner[0].Email,
        role: 'owner'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
},

  loginStaff: async (req, res) => {
    return authController._handleLogin(req, res, 'staff');
  },

  verifyToken: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Authorization token required',
          error: 'MISSING_TOKEN'
        });
      }

      // Verify token with full validation
      const decoded = jwt.verify(token, config.jwt.secret, {
        algorithms: ['HS256'],
        issuer: config.jwt.issuer,
        audience: config.jwt.audience
      });

      // Check user existence
      const table = decoded.role === 'owner' ? 'owner' : 'staff';
      const idField = decoded.role === 'owner' ? 'Owner_ID' : 'Staff_ID';
      
      const [user] = await executeQuery(
        `SELECT ${idField} as id FROM ${table} WHERE ${idField} = ?`,
        [decoded.userId]
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User account not found',
          error: 'USER_NOT_FOUND'
        });
      }

      return res.json({
        success: true,
        valid: true,
        user: decoded,
        expiresIn: decoded.exp - Math.floor(Date.now() / 1000)
      });

    } catch (error) {
      let status = 401;
      let errorCode = 'INVALID_TOKEN';
      
      if (error.name === 'TokenExpiredError') {
        errorCode = 'TOKEN_EXPIRED';
      } else if (error.name === 'JsonWebTokenError') {
        errorCode = 'MALFORMED_TOKEN';
      } else {
        status = 500;
        errorCode = 'SERVER_ERROR';
      }

      return res.status(status).json({
        success: false,
        message: error.message,
        error: errorCode,
        ...(process.env.NODE_ENV === 'development' && {
          debug: error.stack
        })
      });
    }
  },

  validateToken: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(400).json({ 
          success: false,
          error: 'MISSING_TOKEN',
          message: 'No token provided'
        });
      }
      
      const decoded = jwt.verify(token, config.jwt.secret, { 
        algorithms: ['HS256'] 
      });
      
      return res.json({ 
        success: true,
        valid: true,
        decoded,
        expiresIn: decoded.exp - Math.floor(Date.now() / 1000)
      });
    } catch (error) {
      return res.status(401).json({ 
        success: false,
        error: 'INVALID_TOKEN',
        message: error.message
      });
    }
  },

  logout: (req, res) => {
    try {
      console.log('User logged out', { userId: req.user?.userId });
      return res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error during logout',
        error: 'LOGOUT_ERROR'
      });
    }
  },

  requestPasswordReset: async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
          error: 'MISSING_EMAIL'
        });
      }
      
      // In production: Implement actual password reset logic
      console.log('Password reset requested for:', email);
      
      return res.json({
        success: true,
        message: 'If this email exists, a reset link has been sent'
      });
    } catch (error) {
      console.error('Password reset error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error processing reset request',
        error: 'RESET_ERROR'
      });
    }
  },

  tempResetPassword: async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      
      if (!email || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Email and new password are required',
          error: 'MISSING_FIELDS'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      await executeQuery(
        'UPDATE owner SET Password = ? WHERE Email = ?',
        [hashedPassword, email]
      );
      
      return res.json({ 
        success: true, 
        message: 'Password updated (temporary method)' 
      });
    } catch (error) {
      console.error('Password reset error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Reset failed',
        error: 'RESET_FAILED'
      });
    }
  },

  handleErrors: (err, req, res, next) => {
    console.error('Auth controller error:', {
      path: req.path,
      method: req.method,
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    res.status(err.status || 500).json({
      success: false,
      message: 'Authentication service error',
      error: 'AUTH_SERVICE_UNAVAILABLE',
      ...(process.env.NODE_ENV === 'development' && {
        debug: err.message
      })
    });
  }
};

module.exports = authController;