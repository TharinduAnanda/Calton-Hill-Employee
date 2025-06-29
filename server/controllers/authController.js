const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { executeQuery } = require('../config/db');
const config = require('../config/config');

/**
 * Verify if a staff email exists in the database
 * This function is used by the frontend to validate email before login
 * 
 * @param {Object} req - Express request object with email in body
 * @param {Object} res - Express response object
 */
async function verifyStaffEmail(req, res) {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }
  
  try {
    // Query to check if staff exists
    const query = 'SELECT Staff_ID FROM staff WHERE Email = ?';
    const results = await executeQuery(query, [email]);
    
    return res.json({
      success: true,
      exists: results.length > 0
    });
  } catch (error) {
    console.error('Error verifying staff email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify staff email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Login staff member
 * 
 * @param {Object} req - Express request object with email and password
 * @param {Object} res - Express response object
 */
async function loginStaff(req, res) {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  try {
    // Get staff with the provided email
    const query = `
      SELECT Staff_ID, First_Name, Last_Name, Email, Password, Role, Owner_ID
      FROM staff
      WHERE Email = ?
    `;
    const results = await executeQuery(query, [email]);
    
    // Check if staff exists
    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const staff = results[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, staff.Password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: staff.Staff_ID,
        email: staff.Email,
        role: staff.Role,
        type: 'staff'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Return successful response with token and staff data (excluding password)
    delete staff.Password;
    
    return res.json({
      success: true,
      data: {
        token,
        staff
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Login owner
 * 
 * @param {Object} req - Express request object with email and password
 * @param {Object} res - Express response object
 */
async function loginOwner(req, res) {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  try {
    // Get owner with the provided email
    const query = `
      SELECT Owner_ID, Name, Email, Password
      FROM owner
      WHERE Email = ?
    `;
    const results = await executeQuery(query, [email]);
    
    // Check if owner exists
    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const owner = results[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, owner.Password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: owner.Owner_ID,
        email: owner.Email,
        role: 'owner',
        type: 'owner'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Return successful response with token and owner data (excluding password)
    delete owner.Password;
    
    return res.json({
      success: true,
      data: {
        token,
        owner
      }
    });
  } catch (error) {
    console.error('Owner login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get current authenticated user's information
 * 
 * @param {Object} req - Express request object with user attached by middleware
 * @param {Object} res - Express response object
 */
async function getCurrentUser(req, res) {
  try {
    const { userId, type } = req.user;
    
    let query, tableName, idField;
    
    if (type === 'owner') {
      tableName = 'owner';
      idField = 'Owner_ID';
      query = `
        SELECT Owner_ID, Name, Email
        FROM ${tableName}
        WHERE ${idField} = ?
      `;
    } else {
      tableName = 'staff';
      idField = 'Staff_ID';
      query = `
        SELECT Staff_ID, First_Name, Last_Name, Email, Role, Owner_ID
        FROM ${tableName}
        WHERE ${idField} = ?
      `;
    }
    
    const results = await executeQuery(query, [userId]);
    
    if (results.length === 0) {
      console.error(`User not found in database. User ID: ${userId}, Type: ${type}`);
      
      // Return minimal user info from token
      return res.json({
        success: true,
        data: {
          id: userId,
          email: req.user.email,
          role: req.user.role,
          type: req.user.type
        }
      });
    }
    
    // Add role information from token
    const userData = {
      ...results[0],
      type,
      role: req.user.role
    };
    
    return res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Validate JWT token
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function validateToken(req, res) {
  // Token is already validated by the middleware
  return res.json({
    success: true,
    message: 'Token is valid',
    user: {
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      type: req.user.type
    }
  });
}

// Add placeholder functions for password reset
function requestPasswordReset(req, res) {
  // Implementation for password reset request
  res.status(501).json({
    success: false,
    message: 'Password reset functionality not implemented yet'
  });
}

function resetPassword(req, res) {
  // Implementation for password reset
  res.status(501).json({
    success: false,
    message: 'Password reset functionality not implemented yet'
  });
}

module.exports = {
  loginStaff,
  loginOwner,
  getCurrentUser,
  validateToken,
  requestPasswordReset,
  resetPassword,
  verifyStaffEmail
};