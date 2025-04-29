const StaffModel = require('../models/staffModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

module.exports = {
  /**
   * Create new staff (Owner only)
   */
  createStaff: async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      // Authorization check
      if (req.user.role !== 'owner') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only owners can create staff'
        });
      }

      const { 
        first_name, 
        last_name, 
        email, 
        password, 
        phone_number, 
        address, 
        age, 
        gender, 
        role = 'staff' 
      } = req.body;

      // Check for existing staff
      const existingStaff = await StaffModel.findByEmail(email);
      if (existingStaff) {
        return res.status(409).json({
          success: false,
          message: 'Staff with this email already exists'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create staff
      const staffId = await StaffModel.createStaff({
        first_name,
        last_name,
        email,
        password: hashedPassword,
        phone_number,
        address,
        age,
        gender,
        role: role.toLowerCase(),
        owner_id: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Staff created successfully',
        data: { 
          id: staffId,
          first_name,
          last_name,
          email,
          role
        }
      });

    } catch (error) {
      console.error('Staff creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Staff login
   */
  loginStaff: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      const staff = await StaffModel.findByEmail(email);
      if (!staff) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const isMatch = await bcrypt.compare(password, staff.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Create JWT token
      const token = jwt.sign(
        {
          id: staff.id,
          role: 'staff',
          email: staff.email,
          name: `${staff.first_name} ${staff.last_name}`,
          owner_id: staff.owner_id,
          staff_role: staff.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      // Remove sensitive data before sending response
      const { password: _, ...staffData } = staff;

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          staff: staffData
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Get all staff (Owner only) with pagination
   */
  getAllStaff: async (req, res) => {
    try {
      // Verify owner authentication
      if (req.user.role !== 'owner') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only owners can access this resource'
        });
      }

      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const { staff, total } = await StaffModel.findAllByOwner(
        req.user.id, 
        parseInt(limit), 
        parseInt(offset)
      );
      
      if (!staff || staff.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No staff found for this owner'
        });
      }

      // Remove sensitive data
      const sanitizedStaff = staff.map(member => {
        const { password, ...rest } = member;
        return rest;
      });

      res.json({
        success: true,
        data: sanitizedStaff,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Error fetching staff:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch staff',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Get staff by ID
   */
  getStaffById: async (req, res) => {
    try {
      const staffId = req.params.id;
      const staff = await StaffModel.findById(staffId);

      if (!staff) {
        return res.status(404).json({
          success: false,
          message: 'Staff not found'
        });
      }

      // Authorization check
      if (req.user.role === 'owner' && staff.owner_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Not your staff member'
        });
      }

      if (req.user.role === 'staff' && staff.id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Can only view own profile'
        });
      }

      // Remove sensitive data
      const { password, ...staffData } = staff;

      res.json({
        success: true,
        data: staffData
      });

    } catch (error) {
      console.error('Get staff error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Update staff profile
   */
  updateStaff: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const staffId = req.params.id;
      const staff = await StaffModel.findById(staffId);

      if (!staff) {
        return res.status(404).json({
          success: false,
          message: 'Staff not found'
        });
      }

      // Authorization check
      if (req.user.role === 'owner' && staff.owner_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Not your staff member'
        });
      }

      if (req.user.role === 'staff' && staff.id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Can only update own profile'
        });
      }

      // Staff can't update their role
      if (req.user.role === 'staff' && req.body.role) {
        delete req.body.role;
      }

      // Hash password if provided
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }

      const result = await StaffModel.updateStaff(staffId, req.body);
      
      if (result === 0) {
        return res.status(400).json({
          success: false,
          message: 'No changes made'
        });
      }

      const updatedStaff = await StaffModel.findById(staffId);
      const { password, ...staffData } = updatedStaff;

      res.json({
        success: true,
        message: 'Staff updated successfully',
        data: staffData
      });

    } catch (error) {
      console.error('Update staff error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Delete staff (Owner only)
   */
  deleteStaff: async (req, res) => {
    try {
      if (req.user.role !== 'owner') {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only owners can delete staff'
        });
      }

      const staffId = req.params.id;
      const staff = await StaffModel.findById(staffId);

      if (!staff) {
        return res.status(404).json({
          success: false,
          message: 'Staff not found'
        });
      }

      if (staff.owner_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Not your staff member'
        });
      }

      const result = await StaffModel.deleteStaff(staffId);
      
      if (result === 0) {
        return res.status(400).json({
          success: false,
          message: 'Failed to delete staff'
        });
      }

      res.json({
        success: true,
        message: 'Staff deleted successfully'
      });

    } catch (error) {
      console.error('Delete staff error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Change staff password
   */
  changePassword: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const staffId = req.params.id;
      const { currentPassword, newPassword } = req.body;

      const staff = await StaffModel.findById(staffId);
      if (!staff) {
        return res.status(404).json({
          success: false,
          message: 'Staff not found'
        });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, staff.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await StaffModel.updateStaff(staffId, { password: hashedPassword });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};