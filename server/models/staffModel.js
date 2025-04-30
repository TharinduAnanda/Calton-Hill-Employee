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
function hashPassword(password) {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Sanitizes staff data by removing sensitive fields
 * @param {object} staff - The staff record
 * @returns {object|null} Sanitized staff data
 */
function sanitizeStaffData(staff) {
  if (!staff) return null;
  const { password, reset_token, reset_token_expiry, ...sanitized } = staff;
  return sanitized;
}

/**
 * Creates a new staff member
 * @param {object} staffData - Staff data including password
 * @returns {Promise<string>} The new staff ID
 */
function createStaff(staffData) {
  return hashPassword(staffData.password)
    .then(hashedPassword => {
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
      
      return executeQuery(query, [
        staffId,
        staffData.owner_id,
        staffData.first_name,
        staffData.last_name,
        staffData.email.toLowerCase(),
        hashedPassword,
        staffData.phone_number || null,
        staffData.address || null,
        staffData.role?.toLowerCase() || 'staff'
      ])
      .then(() => staffId);
    })
    .catch(error => {
      console.error('Error creating staff:', error);
      throw new Error(error.code === 'ER_DUP_ENTRY' 
        ? 'Email already exists' 
        : 'Failed to create staff member');
    });
}

/**
 * Finds staff by email (case insensitive)
 * @param {string} email - Staff email
 * @returns {Promise<object|null>} Staff record or null
 */
function findByEmail(email) {
  const query = `
    SELECT * FROM staff 
    WHERE LOWER(email) = LOWER(?)
  `;
  
  return executeQuery(query, [email])
    .then(results => results[0] || null)
    .catch(error => {
      console.error('Error finding staff by email:', error);
      throw new Error('Failed to find staff');
    });
}

/**
 * Finds staff by ID
 * @param {string} staffId - Staff ID
 * @returns {Promise<object|null>} Staff record or null
 */
function findById(staffId) {
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
  
  return executeQuery(query, [staffId])
    .then(results => results[0] || null)
    .catch(error => {
      console.error('Error finding staff by ID:', error);
      throw new Error('Failed to find staff member');
    });
}

/**
 * Finds all staff for an owner with pagination
 * @param {string} ownerId - Owner ID
 * @param {number} limit - Pagination limit
 * @param {number} offset - Pagination offset
 * @returns {Promise<{staff: array, total: number}>} Staff records and total count
 */
function findAllByOwner(ownerId, limit = 10, offset = 0) {
  const countQuery = 'SELECT COUNT(*) as total FROM staff WHERE owner_id = ?';
  
  // First get the total count
  return executeQuery(countQuery, [ownerId])
    .then(countResult => {
      // Then get the paginated staff list
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
      
      return executeQuery(query, [ownerId, limit, offset])
        .then(staff => ({
          staff: staff.map(sanitizeStaffData),
          total: countResult[0].total
        }));
    })
    .catch(error => {
      console.error('Error finding staff by owner:', error);
      throw new Error('Failed to fetch staff list');
    });
}

/**
 * Updates staff record
 * @param {string} staffId - Staff ID
 * @param {object} updates - Fields to update
 * @returns {Promise<number>} Number of affected rows
 */
function updateStaff(staffId, updates) {
  const fields = [];
  const values = [];
  
  // Prepare fields and values for update
  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'password' && key !== 'staff_id' && value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(key === 'email' ? value.toLowerCase() : value);
    }
  });

  // Handle password update separately if provided
  if (updates.password) {
    return hashPassword(updates.password)
      .then(hashedPassword => {
        fields.push('password = ?');
        values.push(hashedPassword);
        
        if (fields.length === 0) {
          throw new Error('No valid fields to update');
        }

        values.push(staffId);
        
        const query = `
          UPDATE staff 
          SET ${fields.join(', ')}, updated_at = NOW()
          WHERE staff_id = ?
        `;
        
        return executeQuery(query, values)
          .then(result => result.affectedRows);
      });
  } else {
    if (fields.length === 0) {
      return Promise.reject(new Error('No valid fields to update'));
    }

    values.push(staffId);
    
    const query = `
      UPDATE staff 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE staff_id = ?
    `;
    
    return executeQuery(query, values)
      .then(result => result.affectedRows)
      .catch(error => {
        console.error('Error updating staff:', error);
        throw new Error(error.code === 'ER_DUP_ENTRY' 
          ? 'Email already in use' 
          : 'Failed to update staff member');
      });
  }
}

/**
 * Deletes a staff member
 * @param {string} staffId - Staff ID
 * @returns {Promise<number>} Number of affected rows
 */
function deleteStaff(staffId) {
  // Soft delete implementation (recommended)
  const query = `
    UPDATE staff 
    SET status = 'deleted', updated_at = NOW() 
    WHERE staff_id = ?
  `;
  
  return executeQuery(query, [staffId])
    .then(result => result.affectedRows)
    .catch(error => {
      console.error('Error deleting staff:', error);
      throw new Error('Failed to delete staff member');
    });
}

/**
 * Verifies staff credentials
 * @param {string} email - Staff email
 * @param {string} password - Plain text password
 * @returns {Promise<object|null>} Sanitized staff data or null
 */
function verifyCredentials(email, password) {
  return findByEmail(email)
    .then(staff => {
      if (!staff || staff.status !== 'active') return null;

      return bcrypt.compare(password, staff.password)
        .then(isValid => isValid ? sanitizeStaffData(staff) : null);
    })
    .catch(error => {
      console.error('Error verifying credentials:', error);
      throw new Error('Failed to verify credentials');
    });
}

/**
 * Counts active staff for an owner
 * @param {string} ownerId - Owner ID
 * @returns {Promise<number>} Count of staff members
 */
function countByOwner(ownerId) {
  const query = `
    SELECT COUNT(*) as count 
    FROM staff 
    WHERE owner_id = ? AND status = 'active'
  `;
  
  return executeQuery(query, [ownerId])
    .then(results => results[0].count)
    .catch(error => {
      console.error('Error counting staff:', error);
      throw new Error('Failed to count staff members');
    });
}

/**
 * Sets password reset token
 * @param {string} email - Staff email
 * @param {string} token - Reset token
 * @param {Date} expiry - Token expiry date
 * @returns {Promise<boolean>} Success status
 */
function setPasswordResetToken(email, token, expiry) {
  const query = `
    UPDATE staff 
    SET 
      reset_token = ?,
      reset_token_expiry = ?
    WHERE email = ?
  `;
  
  return executeQuery(query, [token, expiry, email])
    .then(result => result.affectedRows > 0)
    .catch(error => {
      console.error('Error setting reset token:', error);
      throw new Error('Failed to set password reset token');
    });
}

/**
 * Resets password using token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} Success status
 */
function resetPasswordWithToken(token, newPassword) {
  return hashPassword(newPassword)
    .then(hashedPassword => {
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
      
      return executeQuery(query, [hashedPassword, token])
        .then(result => result.affectedRows > 0);
    })
    .catch(error => {
      console.error('Error resetting password:', error);
      throw new Error('Failed to reset password');
    });
}

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