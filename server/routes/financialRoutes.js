const express = require('express');
const { body } = require('express-validator');
const financialController = require('../controllers/financialController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Diagnostic route - doesn't require authentication
router.get('/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Financial API is accessible',
    timestamp: new Date().toISOString()
  });
});

// Debug route - no authentication
router.get('/debug', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Financial routes are accessible',
    timestamp: new Date().toISOString()
  });
});

// Apply authentication middleware to all routes except debug and status
router.use(protect);

// Financial summary and reports
router.get('/summary', financialController.getFinancialSummary);
router.get('/report', financialController.generateFinancialReport);
router.get('/balance-sheet', financialController.getBalanceSheet);
router.get('/cash-flow', financialController.getCashFlowStatement);
router.get('/department-profitability', financialController.getDepartmentProfitability);
router.get('/metrics', financialController.getFinancialMetrics);

// Transactions
router.get('/transactions', financialController.getSalesTransactions);
router.post('/transactions', [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('transaction_type').isIn(['SALE', 'REFUND', 'DISCOUNT', 'TAX']).withMessage('Invalid transaction type')
], financialController.createSalesTransaction);

// Financial accounts
router.get('/accounts', financialController.getFinancialAccounts);
router.post('/accounts', [
  body('account_name').notEmpty().withMessage('Account name is required'),
  body('account_type').isIn(['BANK', 'CASH', 'CREDIT', 'OTHER']).withMessage('Invalid account type'),
  body('opening_balance').isNumeric().withMessage('Opening balance must be a number')
], financialController.createFinancialAccount);

// Expenses
router.get('/expenses', financialController.getExpenses);
router.get('/expense-categories', financialController.getExpenseCategories);
router.post('/expense-categories', financialController.createExpenseCategory);
router.post('/expenses', [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('expense_category_id').isNumeric().withMessage('Category ID must be a number'),
  body('expense_date').isDate().withMessage('Valid expense date is required')
], financialController.createExpense);

// Tax rates
router.get('/tax-rates', financialController.getTaxRates);
router.post('/tax-rates', [
  body('tax_name').notEmpty().withMessage('Tax name is required'),
  body('tax_rate').isNumeric().withMessage('Tax rate must be a number')
], financialController.createTaxRate);

// Invoices
router.get('/invoice/:orderId', financialController.generateInvoice);

module.exports = router;