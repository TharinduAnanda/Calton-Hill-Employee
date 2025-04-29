const { executeQuery } = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Password configuration
const SALT_ROUNDS = 12;
const PASSWORD_MIN_LENGTH = 8;

/**
 * Hashes a password with bcrypt
 * @param {string} password - The plain text password
 * @returns {Promise<string>} The hashed password
 */
const hashPassword = async (password) => {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Sanitizes staff data by removing sensitive fields
 * @param {object} staff - The staff record
 * @returns {object|null} Sanitized staff data
 */
const sanitizeStaffData = (staff) => {
  if (!staff) return null;
  const { password, reset_token, reset_token_expiry, ...sanitized } = staff;
  return sanitized;
};

/**
 * Creates a new staff member
 * @param {object} staffData - Staff data including password
 * @returns {Promise<string>} The new staff ID
 */
const createStaff = async (staffData) => {
  try {
    const hashedPassword = await hashPassword(staffData.password);
    const staffId = uuidv4();
    
    const query = `
      INSERT INTO staff (
        staff_id,
        owner_id,
        first_name,
        last_name,
        email,
        password,
        phone_number,
        address,
        role,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [
      staffId,
      staffData.owner_id,
      staffData.first_name,
      staffData.last_name,
      staffData.email.toLowerCase(),
      hashedPassword,
      staffData.phone_number || null,
      staffData.address || null,
      staffData.role?.toLowerCase() || 'staff'
    ]);

    return staffId;
  } catch (error) {
    console.error('Error creating staff:', error);
    throw new Error(error.code === 'ER_DUP_ENTRY' 
      ? 'Email already exists' 
      : 'Failed to create staff member');
  }
};

/**
 * Finds staff by email (case insensitive)
 * @param {string} email - Staff email
 * @returns {Promise<object|null>} Staff record or null
 */
const findByEmail = async (email) => {
  try {
    const query = `
      SELECT * FROM staff 
      WHERE LOWER(email) = LOWER(?)
    `;
    const [staff] = await executeQuery(query, [email]);
    return staff || null;
  } catch (error) {
    console.error('Error finding staff by email:', error);
    throw new Error('Failed to find staff');
  }
};

/**
 * Finds staff by ID
 * @param {string} staffId - Staff ID
 * @returns {Promise<object|null>} Staff record or null
 */
const findById = async (staffId) => {
  try {
    const query = `
      SELECT 
        staff_id,
        owner_id,
        first_name,
        last_name,
        email,
        phone_number,
        address,
        role,
        status,
        created_at,
        updated_at
      FROM staff 
      WHERE staff_id = ?
    `;
    const [staff] = await executeQuery(query, [staffId]);
    return staff || null;
  } catch (error) {
    console.error('Error finding staff by ID:', error);
    throw new Error('Failed to find staff member');
  }
};

/**
 * Finds all staff for an owner with pagination
 * @param {string} ownerId - Owner ID
 * @param {number} limit - Pagination limit
 * @param {number} offset - Pagination offset
 * @returns {Promise<{staff: array, total: number}>} Staff records and total count
 */
const findAllByOwner = async (ownerId, limit = 10, offset = 0) => {
  try {
    const countQuery = 'SELECT COUNT(*) as total FROM staff WHERE owner_id = ?';
    const [countResult] = await executeQuery(countQuery, [ownerId]);

    const query = `
      SELECT 
        staff_id,
        first_name,
        last_name,
        email,
        phone_number,
        address,
        role,
        status,
        created_at
      FROM staff 
      WHERE owner_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const staff = await executeQuery(query, [ownerId, limit, offset]);

    return {
      staff: staff.map(sanitizeStaffData),
      total: countResult.total
    };
  } catch (error) {
    console.error('Error finding staff by owner:', error);
    throw new Error('Failed to fetch staff list');
  }
};

/**
 * Updates staff record
 * @param {string} staffId - Staff ID
 * @param {object} updates - Fields to update
 * @returns {Promise<number>} Number of affected rows
 */
const updateStaff = async (staffId, updates) => {
  try {
    const fields = [];
    const values = [];
    
    // Prepare fields and values for update
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'password' && key !== 'staff_id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(key === 'email' ? value.toLowerCase() : value);
      }
    });

    // Handle password update separately
    if (updates.password) {
      const hashedPassword = await hashPassword(updates.password);
      fields.push('password = ?');
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(staffId);
    
    const query = `
      UPDATE staff 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE staff_id = ?
    `;
    
    const result = await executeQuery(query, values);
    return result.affectedRows;
  } catch (error) {
    console.error('Error updating staff:', error);
    throw new Error(error.code === 'ER_DUP_ENTRY' 
      ? 'Email already in use' 
      : 'Failed to update staff member');
  }
};

/**
 * Deletes a staff member
 * @param {string} staffId - Staff ID
 * @returns {Promise<number>} Number of affected rows
 */
const deleteStaff = async (staffId) => {
  try {
    // Soft delete implementation (recommended)
    const query = `
      UPDATE staff 
      SET status = 'deleted', updated_at = NOW() 
      WHERE staff_id = ?
    `;
    const result = await executeQuery(query, [staffId]);
    return result.affectedRows;
    
    // Alternative hard delete:
    // const query = 'DELETE FROM staff WHERE staff_id = ?';
    // const result = await executeQuery(query, [staffId]);
    // return result.affectedRows;
  } catch (error) {
    console.error('Error deleting staff:', error);
    throw new Error('Failed to delete staff member');
  }
};

/**
 * Verifies staff credentials
 * @param {string} email - Staff email
 * @param {string} password - Plain text password
 * @returns {Promise<object|null>} Sanitized staff data or null
 */
const verifyCredentials = async (email, password) => {
  try {
    const staff = await findByEmail(email);
    if (!staff || staff.status !== 'active') return null;

    const isValid = await bcrypt.compare(password, staff.password);
    return isValid ? sanitizeStaffData(staff) : null;
  } catch (error) {
    console.error('Error verifying credentials:', error);
    throw new Error('Failed to verify credentials');
  }
};

/**
 * Counts active staff for an owner
 * @param {string} ownerId - Owner ID
 * @returns {Promise<number>} Count of staff members
 */
const countByOwner = async (ownerId) => {
  try {
    const query = `
      SELECT COUNT(*) as count 
      FROM staff 
      WHERE owner_id = ? AND status = 'active'
    `;
    const [result] = await executeQuery(query, [ownerId]);
    return result.count;
  } catch (error) {
    console.error('Error counting staff:', error);
    throw new Error('Failed to count staff members');
  }
};

/**
 * Sets password reset token
 * @param {string} email - Staff email
 * @param {string} token - Reset token
 * @param {Date} expiry - Token expiry date
 * @returns {Promise<boolean>} Success status
 */
const setPasswordResetToken = async (email, token, expiry) => {
  try {
    const query = `
      UPDATE staff 
      SET 
        reset_token = ?,
        reset_token_expiry = ?
      WHERE email = ?
    `;
    const result = await executeQuery(query, [token, expiry, email]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error setting reset token:', error);
    throw new Error('Failed to set password reset token');
  }
};

/**
 * Resets password using token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} Success status
 */
const resetPasswordWithToken = async (token, newPassword) => {
  try {
    const hashedPassword = await hashPassword(newPassword);
    const query = `
      UPDATE staff 
      SET 
        password = ?,
        reset_token = NULL,
        reset_token_expiry = NULL,
        updated_at = NOW()
      WHERE reset_token = ? 
      AND reset_token_expiry > NOW()
    `;
    const result = await executeQuery(query, [hashedPassword, token]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw new Error('Failed to reset password');
  }
};

module.exports = {
  createStaff,
  findByEmail,
  findById,
  findAllByOwner,
  updateStaff,
  deleteStaff,
  verifyCredentials,
  countByOwner,
  setPasswordResetToken,
  resetPasswordWithToken,
  sanitizeStaffData
};