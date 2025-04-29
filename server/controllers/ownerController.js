const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { executeQuery } = require('../config/db');

module.exports = {
  // Owner Authentication
 login: async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Find owner
    const owner = await OwnerModel.findByEmail(email);
    if (!owner) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, owner.Password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: owner.Owner_ID, role: 'owner' },
      config.jwt.secret,
      { expiresIn: '8h' }
    );

    // Return response
    res.json({
      success: true,
      token,
      user: {
        id: owner.Owner_ID,
        name: owner.Name,
        email: owner.Email,
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

  // Owner Profile Management
  getProfile: async (req, res) => {
    try {
      const query = `
        SELECT Owner_ID, Name, Email, Address, Phone_Number, Created_At 
        FROM owner 
        WHERE Owner_ID = ?
      `;
      const owner = await executeQuery(query, [req.user.id]);
      
      if (owner.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: 'Owner not found' 
        });
      }
      
      res.json({
        success: true,
        data: owner[0]
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error' 
      });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { name, email, password, address, phone_number } = req.body;
      let updateFields = [];
      let updateValues = [];

      if (name) {
        updateFields.push('Name = ?');
        updateValues.push(name);
      }
      if (email) {
        updateFields.push('Email = ?');
        updateValues.push(email);
      }
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        updateFields.push('Password = ?');
        updateValues.push(hashedPassword);
      }
      if (address) {
        updateFields.push('Address = ?');
        updateValues.push(address);
      }
      if (phone_number) {
        updateFields.push('Phone_Number = ?');
        updateValues.push(phone_number);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: 'No fields to update' 
        });
      }

      updateValues.push(req.user.id);
      const query = `UPDATE owner SET ${updateFields.join(', ')} WHERE Owner_ID = ?`;
      
      await executeQuery(query, updateValues);
      
      const updatedQuery = 'SELECT Owner_ID, Name, Email, Address, Phone_Number FROM owner WHERE Owner_ID = ?';
      const updatedOwner = await executeQuery(updatedQuery, [req.user.id]);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedOwner[0]
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error' 
      });
    }
  },

  // Staff Management
  createStaff: async (req, res) => {
    try {
      const { first_name, last_name, email, password, phone_number, address, role } = req.body;
      
      if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ 
          success: false,
          message: 'Required fields are missing' 
        });
      }

      const checkQuery = 'SELECT Staff_ID FROM staff WHERE Email = ?';
      const existingStaff = await executeQuery(checkQuery, [email]);
      
      if (existingStaff.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Staff with this email already exists' 
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const insertQuery = `
        INSERT INTO staff 
        (First_Name, Last_Name, Email, Password, Phone_Number, Address, Role, Owner_ID) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const result = await executeQuery(insertQuery, 
        [first_name, last_name, email, hashedPassword, phone_number, address, role || 'staff', req.user.id]);

      res.status(201).json({ 
        success: true,
        message: 'Staff created successfully',
        data: { staffId: result.insertId }
      });
    } catch (error) {
      console.error('Create staff error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error creating staff' 
      });
    }
  },

  getAllStaff: async (req, res) => {
    try {
      const query = `
        SELECT Staff_ID, First_Name, Last_Name, Email, Phone_Number, Address, Role, Created_At 
        FROM staff 
        WHERE Owner_ID = ?
      `;
      const staff = await executeQuery(query, [req.user.id]);
      
      res.json({
        success: true,
        data: staff
      });
    } catch (error) {
      console.error('Get staff error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error fetching staff' 
      });
    }
  },

  getStaffById: async (req, res) => {
    try {
      const { id } = req.params;
      const query = `
        SELECT Staff_ID, First_Name, Last_Name, Email, Phone_Number, Address, Role, Created_At 
        FROM staff 
        WHERE Staff_ID = ? AND Owner_ID = ?
      `;
      const staff = await executeQuery(query, [id, req.user.id]);
      
      if (staff.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: 'Staff not found' 
        });
      }
      
      res.json({
        success: true,
        data: staff[0]
      });
    } catch (error) {
      console.error('Get staff by ID error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error fetching staff' 
      });
    }
  },

  updateStaff: async (req, res) => {
    try {
      const { id } = req.params;
      const { first_name, last_name, email, password, phone_number, address, role } = req.body;
      
      let updateFields = [];
      let updateValues = [];

      if (first_name) {
        updateFields.push('First_Name = ?');
        updateValues.push(first_name);
      }
      if (last_name) {
        updateFields.push('Last_Name = ?');
        updateValues.push(last_name);
      }
      if (email) {
        updateFields.push('Email = ?');
        updateValues.push(email);
      }
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        updateFields.push('Password = ?');
        updateValues.push(hashedPassword);
      }
      if (phone_number) {
        updateFields.push('Phone_Number = ?');
        updateValues.push(phone_number);
      }
      if (address) {
        updateFields.push('Address = ?');
        updateValues.push(address);
      }
      if (role) {
        updateFields.push('Role = ?');
        updateValues.push(role);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: 'No fields to update' 
        });
      }

      updateValues.push(id, req.user.id);
      const query = `
        UPDATE staff 
        SET ${updateFields.join(', ')} 
        WHERE Staff_ID = ? AND Owner_ID = ?
      `;
      
      const result = await executeQuery(query, updateValues);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          success: false,
          message: 'Staff not found or not authorized' 
        });
      }

      res.json({
        success: true,
        message: 'Staff updated successfully'
      });
    } catch (error) {
      console.error('Update staff error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error updating staff' 
      });
    }
  },

  deleteStaff: async (req, res) => {
    try {
      const { id } = req.params;
      const query = 'DELETE FROM staff WHERE Staff_ID = ? AND Owner_ID = ?';
      const result = await executeQuery(query, [id, req.user.id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          success: false,
          message: 'Staff not found or not authorized' 
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
        message: 'Server error deleting staff' 
      });
    }
  }
};