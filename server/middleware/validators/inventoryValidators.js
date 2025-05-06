const { body } = require('express-validator');

/**
 * Validation rules for inventory item creation and updates
 */
exports.validateInventoryItem = [
  body('product_id')
    .optional()
    .isInt()
    .withMessage('Product ID must be an integer'),
  
  body('stock_level')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock level must be a non-negative integer'),
  
  body('reorder_level')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reorder level must be a non-negative integer'),
  
  body('supplier_id')
    .optional()
    .isInt()
    .withMessage('Supplier ID must be an integer'),
];

/**
 * Validation rules for inventory quantity adjustments
 */
exports.validateInventoryAdjustment = [
  body('quantity_change')
    .isInt()
    .withMessage('Quantity change must be an integer'),
  
  body('adjustment_reason')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Adjustment reason is required'),
];

/**
 * Validation rules for batch creation
 */
exports.validateBatch = [
  body('batch_number')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Batch number is required'),
  
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('cost_per_unit')
    .isFloat({ min: 0 })
    .withMessage('Cost per unit must be a non-negative number'),
  
  body('manufactured_date')
    .optional()
    .isDate()
    .withMessage('Manufactured date must be a valid date'),
  
  body('expiry_date')
    .optional()
    .isDate()
    .withMessage('Expiry date must be a valid date'),
];

/**
 * Validation rules for stock count
 */
exports.validateStockCount = [
  body('counts')
    .isArray()
    .withMessage('Counts must be an array'),
  
  body('counts.*.product_id')
    .isInt()
    .withMessage('Product ID must be an integer'),
  
  body('counts.*.counted_quantity')
    .isInt({ min: 0 })
    .withMessage('Counted quantity must be a non-negative integer'),
];