const { executeQuery } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const OwnerModel = {
  /**
   * Create a new owner in the database
   * @param {Object} owner - Owner details
   * @returns {Promise<number>} - ID of the created owner
   */
  createOwner: async (owner) => {
    try {
      const hashedPassword = await bcrypt.hash(owner.password, 10);
      const query = `
        INSERT INTO owner (Name, Address, Phone_Number, Email, Password) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const result = await executeQuery(query, [
        owner.name,
        owner.address,
        owner.phone_number,
        owner.email,
        hashedPassword
      ]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating owner:', error);
      throw error;
    }
  },

  /**
   * Find owner by email
   * @param {string} email - Owner's email
   * @returns {Promise<Object|null>} - Owner object or null if not found
   */
  findByEmail: async (email) => {
    try {
      const rows = await executeQuery(
        'SELECT * FROM owner WHERE Email = ?', 
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding owner by email:', error);
      throw error;
    }
  },

  /**
   * Find owner by ID
   * @param {number} id - Owner ID
   * @returns {Promise<Object|null>} - Owner object or null if not found
   */
  findById: async (id) => {
    try {
      const rows = await executeQuery(
        'SELECT * FROM owner WHERE Owner_ID = ?', 
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding owner by ID:', error);
      throw error;
    }
  },

  /**
   * Get all owners (without passwords)
   * @returns {Promise<Array>} - List of owners
   */
  getAllOwners: async () => {
    try {
      const rows = await executeQuery(
        'SELECT Owner_ID, Name, Address, Phone_Number, Email FROM owner'
      );
      return rows;
    } catch (error) {
      console.error('Error getting all owners:', error);
      throw error;
    }
  },

  /**
   * Update owner details
   * @param {number} id - Owner ID
   * @param {Object} data - Updated fields
   * @returns {Promise<number>} - Number of affected rows
   */
  updateOwner: async (id, data) => {
    try {
      const fields = [];
      const values = [];
      
      Object.keys(data).forEach(key => {
        if (key !== 'password' && key !== 'owner_id') {
          fields.push(`${key} = ?`);
          values.push(data[key]);
        }
      });
      
      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        fields.push('Password = ?');
        values.push(hashedPassword);
      }
      
      values.push(id);
      
      const query = `UPDATE owner SET ${fields.join(', ')} WHERE Owner_ID = ?`;
      const result = await executeQuery(query, values);
      return result.affectedRows;
    } catch (error) {
      console.error('Error updating owner:', error);
      throw error;
    }
  },

  /**
   * Verify owner credentials
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object|null>} - Owner data if valid, null otherwise
   */
  verifyCredentials: async (email, password) => {
    try {
      console.log('Verifying credentials for:', email);
      const owner = await OwnerModel.findByEmail(email);
      if (!owner) {
        console.log('No owner found with email:', email);
        return null;
      }

      console.log('Stored hash:', owner.Password);
      const isValid = await bcrypt.compare(password, owner.Password);
      console.log('Password match:', isValid);
      
      return isValid ? owner : null;
    } catch (error) {
      console.error('Credential verification error:', error);
      throw error;
    }
  },

  /**
   * Generate JWT token for owner
   * @param {number} ownerId 
   * @returns {string} - JWT token
   */
  generateAuthToken: (ownerId) => {
    return jwt.sign(
      { userId: ownerId, role: 'owner' },  // Changed from id to userId
      config.jwt.secret,
      { 
        expiresIn: config.jwt.expiresIn,
        algorithm: 'HS256'
      }
    );
  },

  /**
   * Validate JWT token
   * @param {string} token 
   * @returns {Promise<Object>} - Decoded token
   */
  validateToken: async (token) => {
    try {
      return jwt.verify(token, config.jwt.secret, { 
        algorithms: ['HS256'] 
      });
    } catch (error) {
      console.error('Token validation error:', error);
      throw error;
    }
  }
};

module.exports = OwnerModel;