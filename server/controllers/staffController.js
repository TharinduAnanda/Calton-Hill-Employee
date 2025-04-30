const staffModel = require('../models/staffModel');
const { validateStaffData } = require('../utils/validation');
const { executeQuery } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Get all staff members for an owner
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getAllStaff(req, res) {
  const ownerId = req.user.owner_id || req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  
  staffModel.findAllByOwner(ownerId, limit, offset)
    .then(result => {
      res.json({
        success: true,
        message: 'Staff retrieved successfully',
        data: {
          staff: result.staff,
          total: result.total
        },
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit)
        }
      });
    })
    .catch(error => {
      console.error('Error getting staff:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve staff list',
        error: error.message
      });
    });
}

/**
 * Get a specific staff member by ID
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getStaffById(req, res) {
  const { staffId } = req.params;
  const ownerId = req.user.owner_id || req.user.id;
  
  // First check if staff belongs to this owner
  executeQuery(
    'SELECT owner_id FROM staff WHERE staff_id = ?',
    [staffId]
  )
    .then(results => {
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Staff not found'
        });
      }
      
      if (results[0].owner_id !== ownerId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      // Now get the staff details
      return staffModel.findById(staffId);
    })
    .then(staff => {
      if (!staff) {
        return res.status(404).json({
          success: false,
          message: 'Staff not found'
        });
      }
      
      res.json({
        success: true,
        data: staff
      });
    })
    .catch(error => {
      console.error('Error getting staff:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve staff details',
        error: error.message
      });
    });
}

/**
 * Create a new staff member
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function createStaff(req, res) {
  // Verify the current user is an owner
  if (req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      message: 'Only owners can create staff accounts'
    });
  }
  
  // Validate input
  const { valid, errors } = validateStaffData(req.body);
  if (!valid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  // Prepare staff data
  const staffData = {
    ...req.body,
    owner_id: req.user.id || req.user.userId
  };
  
  // Create staff member
  staffModel.createStaff(staffData)
    .then(staffId => {
      return staffModel.findById(staffId);
    })
    .then(newStaff => {
      res.status(201).json({
        success: true,
        message: 'Staff created successfully',
        data: newStaff
      });
    })
    .catch(error => {
      console.error('Error creating staff:', error);
      res.status(error.message === 'Email already exists' ? 409 : 500).json({
        success: false,
        message: error.message || 'Failed to create staff'
      });
    });
}

/**
 * Update an existing staff member
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function updateStaff(req, res) {
  const { staffId } = req.params;
  const ownerId = req.user.owner_id || req.user.id;
  
  // Validate input
  const { valid, errors } = validateStaffData(req.body, true);
  if (!valid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  // First check if staff belongs to this owner
  executeQuery(
    'SELECT owner_id FROM staff WHERE staff_id = ?',
    [staffId]
  )
    .then(results => {
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Staff not found'
        });
      }
      
      if (results[0].owner_id !== ownerId && req.user.role !== 'owner') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      // Update the staff
      return staffModel.updateStaff(staffId, req.body);
    })
    .then(() => {
      return staffModel.findById(staffId);
    })
    .then(updatedStaff => {
      res.json({
        success: true,
        message: 'Staff updated successfully',
        data: updatedStaff
      });
    })
    .catch(error => {
      console.error('Error updating staff:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update staff'
      });
    });
}

/**
 * Delete a staff member
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function deleteStaff(req, res) {
  const { staffId } = req.params;
  const ownerId = req.user.owner_id || req.user.id;
  
  // First check if staff belongs to this owner
  executeQuery(
    'SELECT owner_id FROM staff WHERE staff_id = ?',
    [staffId]
  )
    .then(results => {
      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Staff not found'
        });
      }
      
      if (results[0].owner_id !== ownerId && req.user.role !== 'owner') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      // Delete the staff
      return staffModel.deleteStaff(staffId);
    })
    .then(() => {
      res.json({
        success: true,
        message: 'Staff deleted successfully'
      });
    })
    .catch(error => {
      console.error('Error deleting staff:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete staff'
      });
    });
}

/**
 * Staff self-update (can only update certain fields)
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function updateSelfProfile(req, res) {
  const staffId = req.user.id;
  
  // Staff can only update certain fields
  const allowedFields = ['phone_number', 'address'];
  const updates = {};
  
  // Filter allowed fields
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });
  
  // Handle password update separately
  if (req.body.password && req.body.currentPassword) {
    // Verify current password first
    staffModel.findByEmail(req.user.email)
      .then(staff => {
        if (!staff) {
          return res.status(404).json({
            success: false,
            message: 'Staff not found'
          });
        }
        
        return bcrypt.compare(req.body.currentPassword, staff.password);
      })
      .then(isMatch => {
        if (!isMatch) {
          return res.status(401).json({
            success: false,
            message: 'Current password is incorrect'
          });
        }
        
        // Current password is correct, update password
        updates.password = req.body.password;
        
        // Update the staff
        return staffModel.updateStaff(staffId, updates);
      })
      .then(() => {
        return staffModel.findById(staffId);
      })
      .then(updatedStaff => {
        res.json({
          success: true,
          message: 'Profile updated successfully',
          data: updatedStaff
        });
      })
      .catch(error => {
        console.error('Error updating staff profile:', error);
        res.status(500).json({
          success: false,
          message: error.message || 'Failed to update profile'
        });
      });
  } else {
    // Regular update without password
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }
    
    staffModel.updateStaff(staffId, updates)
      .then(() => {
        return staffModel.findById(staffId);
      })
      .then(updatedStaff => {
        res.json({
          success: true,
          message: 'Profile updated successfully',
          data: updatedStaff
        });
      })
      .catch(error => {
        console.error('Error updating staff profile:', error);
        res.status(500).json({
          success: false,
          message: error.message || 'Failed to update profile'
        });
      });
  }
}

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  updateSelfProfile
};