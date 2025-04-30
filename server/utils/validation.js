/**
 * Validation utilities for all application entities
 * Provides consistent input validation across controllers
 * Using structured procedural approach
 */

// Constants
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_MIN_LENGTH = 8;
const VALID_ROLES = ['staff', 'manager', 'admin'];
const PHONE_REGEX = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is email valid
 */
function isValidEmail(email) {
  if (!email) return false;
  return EMAIL_REGEX.test(String(email).toLowerCase());
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {boolean} Is password valid
 */
function isValidPassword(password) {
  if (!password) return false;
  return password.length >= PASSWORD_MIN_LENGTH;
}

/**
 * Validates phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is phone number valid
 */
function isValidPhone(phone) {
  if (!phone) return true; // Phone is optional
  return PHONE_REGEX.test(phone);
}

/**
 * Validates user role
 * @param {string} role - Role to validate
 * @returns {boolean} Is role valid
 */
function isValidRole(role) {
  if (!role) return true; // Role can be undefined (defaults to staff)
  return VALID_ROLES.includes(role.toLowerCase());
}

/**
 * Validates login data (email and password)
 * @param {Object} data - Object containing email and password
 * @returns {Object} Object with validation result and errors
 */
function validateLoginData(data) {
  const errors = {};
  
  // Email validation
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates staff data for creation or update
 * @param {Object} data - Staff data to validate
 * @param {boolean} isUpdate - Whether this is for update (some fields optional)
 * @returns {Object} Object with validation result and errors
 */
function validateStaffData(data, isUpdate) {
  const errors = {};
  
  // First name validation
  if (!data.first_name && !isUpdate) {
    errors.first_name = 'First name is required';
  }
  
  // Last name validation
  if (!data.last_name && !isUpdate) {
    errors.last_name = 'Last name is required';
  }
  
  // Email validation
  if (!data.email && !isUpdate) {
    errors.email = 'Email is required';
  } else if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  // Password validation (only required for new staff)
  if (!data.password && !isUpdate) {
    errors.password = 'Password is required';
  } else if (data.password && !isValidPassword(data.password)) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  
  // Role validation
  if (data.role && !isValidRole(data.role)) {
    errors.role = 'Invalid role. Must be: staff, manager, or admin';
  }
  
  // Phone validation - simple format check if provided
  if (data.phone_number && !isValidPhone(data.phone_number)) {
    errors.phone_number = 'Invalid phone number format';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates password reset request data
 * @param {Object} data - Object containing email
 * @returns {Object} Object with validation result and errors
 */
function validatePasswordResetRequest(data) {
  const errors = {};
  
  // Email validation
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates password reset completion data
 * @param {Object} data - Object containing token, password and confirmPassword
 * @returns {Object} Object with validation result and errors
 */
function validatePasswordReset(data) {
  const errors = {};
  
  // Token validation
  if (!data.token) {
    errors.token = 'Reset token is required';
  }
  
  // Password validation
  if (!data.password) {
    errors.password = 'New password is required';
  } else if (!isValidPassword(data.password)) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  
  // Password confirmation
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates owner data for registration or update
 * @param {Object} data - Owner data to validate
 * @param {boolean} isUpdate - Whether this is for update (some fields optional)
 * @returns {Object} Object with validation result and errors
 */
function validateOwnerData(data, isUpdate) {
  const errors = {};
  
  // Name validation
  if (!data.name && !isUpdate) {
    errors.name = 'Name is required';
  }
  
  // Email validation
  if (!data.email && !isUpdate) {
    errors.email = 'Email is required';
  } else if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  // Password validation (only required for new owners)
  if (!data.password && !isUpdate) {
    errors.password = 'Password is required';
  } else if (data.password && !isValidPassword(data.password)) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates inventory data
 * @param {Object} data - Inventory data to validate
 * @returns {Object} Object with validation result and errors
 */
function validateInventoryData(data) {
  const errors = {};
  
  // Product name validation
  if (!data.product_name) {
    errors.product_name = 'Product name is required';
  }
  
  // Quantity validation
  if (data.quantity === undefined || data.quantity === null) {
    errors.quantity = 'Quantity is required';
  } else if (isNaN(Number(data.quantity)) || Number(data.quantity) < 0) {
    errors.quantity = 'Quantity must be a non-negative number';
  }
  
  // Price validation
  if (data.price === undefined || data.price === null) {
    errors.price = 'Price is required';
  } else if (isNaN(Number(data.price)) || Number(data.price) < 0) {
    errors.price = 'Price must be a non-negative number';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitizes data to prevent SQL injection and XSS
 * @param {Object} data - Data object to sanitize
 * @returns {Object} Sanitized data
 */
function sanitizeData(data) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Basic sanitization for strings
      sanitized[key] = value
        .replace(/[<>]/g, '') // Remove < and > to prevent HTML
        .trim();
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Transforms field names from camelCase/PascalCase to snake_case
 * @param {Object} data - Data to transform
 * @returns {Object} Transformed data
 */
function normalizeFieldNames(data) {
  const normalized = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Transform camelCase or PascalCase to snake_case
    const normalizedKey = key
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
      
    normalized[normalizedKey] = value;
  }
  
  return normalized;
}

// Export functions and constants
module.exports = {
  // Validation helper functions
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidRole,
  
  // Main validation functions
  validateLoginData,
  validateStaffData,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateOwnerData,
  validateInventoryData,
  
  // Utility functions
  sanitizeData,
  normalizeFieldNames,
  
  // Constants
  PASSWORD_MIN_LENGTH,
  EMAIL_REGEX,
  VALID_ROLES
};