// src/utils/helpers.js
import { format, parseISO } from 'date-fns';

/**
 * Format a date string to a readable format
 * @param {string} dateString - ISO date string
 * @param {string} formatStr - Format string (default: 'MM/dd/yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, formatStr = 'MM/dd/yyyy') => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format a number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Generate a random SKU code
 * @param {string} prefix - Prefix for the SKU
 * @returns {string} Random SKU code
 */
export const generateSKU = (prefix = 'PRD') => {
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${randomPart}-${timestamp}`;
};

/**
 * Calculate the total value of items
 * @param {Array} items - Array of items with price and quantity
 * @returns {number} Total value
 */
export const calculateTotalValue = (items) => {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((total, item) => {
    return total + ((item.price || 0) * (item.quantity || 0));
  }, 0);
};

/**
 * Convert query parameters to a query string
 * @param {Object} params - Query parameters object
 * @returns {string} Query string
 */
export const buildQueryString = (params) => {
  if (!params || typeof params !== 'object') return '';
  
  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
  
  return queryParams ? `?${queryParams}` : '';
};

/**
 * Parse query string from URL
 * @param {string} queryString - Query string to parse
 * @returns {Object} Parsed query parameters
 */
export const parseQueryString = (queryString) => {
  if (!queryString || typeof queryString !== 'string') return {};
  
  const params = {};
  const searchParams = new URLSearchParams(queryString.startsWith('?') ? queryString.substring(1) : queryString);
  
  for (const [key, value] of searchParams.entries()) {
    if (params[key]) {
      if (Array.isArray(params[key])) {
        params[key].push(value);
      } else {
        params[key] = [params[key], value];
      }
    } else {
      params[key] = value;
    }
  }
  
  return params;
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Get status color based on order status
 * @param {string} status - Order status
 * @returns {string} Color code for the status
 */
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'warning';
    case 'processing':
      return 'info';
    case 'shipped':
      return 'primary';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Calculate days left until reorder point
 * @param {number} currentStock - Current stock level
 * @param {number} threshold - Reorder threshold
 * @param {number} averageDailyUsage - Average daily usage
 * @returns {number} Days left until reorder point
 */
export const calculateDaysUntilReorder = (currentStock, threshold, averageDailyUsage) => {
  if (!averageDailyUsage || averageDailyUsage <= 0) return Infinity;
  return Math.floor((currentStock - threshold) / averageDailyUsage);
};