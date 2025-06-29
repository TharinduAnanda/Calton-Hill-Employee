const { executeQuery, executeTransaction } = require('../config/db');
const { validationResult } = require('express-validator');

// Get financial dashboard summary
exports.getFinancialSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = '';
    const params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE transaction_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Get sales summary
    const salesQuery = `
      SELECT 
        SUM(CASE WHEN transaction_type = 'SALE' THEN amount ELSE 0 END) as total_sales,
        SUM(CASE WHEN transaction_type = 'REFUND' THEN amount ELSE 0 END) as total_refunds,
        SUM(CASE WHEN transaction_type = 'SALE' THEN amount ELSE -amount END) as net_revenue,
        COUNT(CASE WHEN transaction_type = 'SALE' THEN 1 END) as sale_count,
        COUNT(CASE WHEN transaction_type = 'REFUND' THEN 1 END) as refund_count
      FROM sales_transaction
      ${dateFilter}
    `;
    
    const [salesSummary] = await executeQuery(salesQuery, params);

    // Get expense summary
    const expenseQuery = `
      SELECT 
        SUM(amount) as total_expenses,
        COUNT(*) as expense_count
      FROM expense
      ${dateFilter ? dateFilter.replace('transaction_date', 'expense_date') : ''}
    `;
    
    const [expenseSummary] = await executeQuery(expenseQuery, dateFilter ? params : []);

    // Get profit
    const profit = (salesSummary[0]?.net_revenue || 0) - (expenseSummary[0]?.total_expenses || 0);

    // Get tax summary
    const taxQuery = `
      SELECT 
        SUM(amount) as total_tax_collected
      FROM sales_transaction
      WHERE transaction_type = 'TAX' ${dateFilter ? 'AND ' + dateFilter.replace('WHERE ', '') : ''}
    `;
    
    const [taxSummary] = await executeQuery(taxQuery, dateFilter ? params : []);

    // Top selling products
    const topProductsQuery = `
      SELECT 
        p.Product_ID as id,
        p.Name as name,
        SUM(oi.Quantity) as quantity_sold,
        SUM(oi.Quantity * oi.Price) as total_sales
      FROM order_item oi
      JOIN product p ON oi.Product_ID = p.Product_ID
      JOIN customerorder co ON oi.Order_ID = co.Order_ID
      ${dateFilter ? dateFilter.replace('transaction_date', 'co.Order_Date') : ''}
      GROUP BY p.Product_ID, p.Name
      ORDER BY total_sales DESC
      LIMIT 5
    `;
    
    const topProducts = await executeQuery(topProductsQuery, dateFilter ? params : []);

    // Monthly sales trend
    const salesTrendQuery = `
      SELECT 
        DATE_FORMAT(co.Order_Date, '%Y-%m') as month,
        SUM(co.Total_Amount) as total_sales
      FROM customerorder co
      ${dateFilter ? dateFilter.replace('transaction_date', 'co.Order_Date') : ''}
      GROUP BY DATE_FORMAT(co.Order_Date, '%Y-%m')
      ORDER BY month ASC
    `;
    
    const salesTrend = await executeQuery(salesTrendQuery, dateFilter ? params : []);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total_sales: salesSummary[0]?.total_sales || 0,
          total_refunds: salesSummary[0]?.total_refunds || 0,
          net_revenue: salesSummary[0]?.net_revenue || 0,
          total_expenses: expenseSummary[0]?.total_expenses || 0,
          profit,
          tax_collected: taxSummary[0]?.total_tax_collected || 0,
          sale_count: salesSummary[0]?.sale_count || 0,
          refund_count: salesSummary[0]?.refund_count || 0
        },
        top_products: topProducts,
        sales_trend: salesTrend
      }
    });
  } catch (error) {
    console.error('Error getting financial summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve financial summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get sales transactions
exports.getSalesTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = [];
    const params = [];
    
    if (startDate && endDate) {
      whereClause.push('st.transaction_date BETWEEN ? AND ?');
      params.push(startDate, endDate);
    }
    
    if (type) {
      whereClause.push('st.transaction_type = ?');
      params.push(type);
    }
    
    const whereStr = whereClause.length > 0 ? 'WHERE ' + whereClause.join(' AND ') : '';
    
    const query = `
      SELECT 
        st.transaction_id,
        st.transaction_date,
        st.amount,
        st.transaction_type,
        st.payment_method,
        st.reference_number,
        st.notes,
        co.Order_ID as order_id,
        fa.account_name,
        CONCAT(s.first_name, ' ', s.last_name) as staff_name
      FROM sales_transaction st
      LEFT JOIN customerorder co ON st.order_id = co.Order_ID
      LEFT JOIN financial_account fa ON st.account_id = fa.account_id
      LEFT JOIN staff s ON st.created_by = s.Staff_ID
      ${whereStr}
      ORDER BY st.transaction_date DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(parseInt(limit), offset);
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM sales_transaction st
      ${whereStr}
    `;
    
    const [transactions, countResult] = await Promise.all([
      executeQuery(query, params),
      executeQuery(countQuery, params.slice(0, -2))
    ]);
    
    const total = countResult[0].total;
    
    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting sales transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sales transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create sales transaction
exports.createSalesTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { 
      order_id, 
      amount, 
      transaction_type, 
      payment_method, 
      account_id, 
      reference_number, 
      notes 
    } = req.body;

    const result = await executeTransaction(async (connection) => {
      // Insert transaction
      const [insertResult] = await connection.query(
        `INSERT INTO sales_transaction 
        (order_id, amount, transaction_type, payment_method, account_id, reference_number, notes, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [order_id, amount, transaction_type, payment_method, account_id, reference_number, notes, req.user.userId]
      );

      // If this is a sale or refund, update the financial account balance
      if ((transaction_type === 'SALE' || transaction_type === 'TAX') && account_id) {
        await connection.query(
          `UPDATE financial_account 
          SET current_balance = current_balance + ? 
          WHERE account_id = ?`,
          [amount, account_id]
        );
      } else if (transaction_type === 'REFUND' && account_id) {
        await connection.query(
          `UPDATE financial_account 
          SET current_balance = current_balance - ? 
          WHERE account_id = ?`,
          [amount, account_id]
        );
      }

      // If this transaction is for an order, update the order's payment status
      if (order_id) {
        // Check total amount paid for this order
        const [paymentResults] = await connection.query(
          `SELECT SUM(CASE WHEN transaction_type = 'SALE' OR transaction_type = 'TAX' THEN amount
                          WHEN transaction_type = 'REFUND' THEN -amount
                          ELSE 0 END) as total_paid
            FROM sales_transaction
            WHERE order_id = ?`,
          [order_id]
        );
        
        const totalPaid = paymentResults[0].total_paid || 0;
        
        // Get order total
        const [orderResults] = await connection.query(
          `SELECT Total_Amount FROM customerorder WHERE Order_ID = ?`,
          [order_id]
        );
        
        if (orderResults.length > 0) {
          const orderTotal = orderResults[0].Total_Amount;
          let paymentStatus = 'Pending';
          
          if (totalPaid >= orderTotal) {
            paymentStatus = 'Paid';
          } else if (totalPaid > 0) {
            paymentStatus = 'Partial';
          }
          
          await connection.query(
            `UPDATE customerorder SET Payment_Status = ? WHERE Order_ID = ?`,
            [paymentStatus, order_id]
          );
        }
      }

      return insertResult.insertId;
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: { transaction_id: result }
    });
  } catch (error) {
    console.error('Error creating sales transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create sales transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get financial accounts
exports.getFinancialAccounts = async (req, res) => {
  try {
    const accounts = await executeQuery(
      `SELECT * FROM financial_account WHERE is_active = TRUE ORDER BY account_name`
    );
    
    res.status(200).json({
      success: true,
      data: accounts
    });
  } catch (error) {
    console.error('Error getting financial accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve financial accounts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create financial account
exports.createFinancialAccount = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { 
      account_name, 
      account_type, 
      account_number, 
      opening_balance, 
      currency 
    } = req.body;

    const result = await executeQuery(
      `INSERT INTO financial_account 
      (account_name, account_type, account_number, opening_balance, current_balance, currency) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [account_name, account_type, account_number, opening_balance, opening_balance, currency]
    );
    
    res.status(201).json({
      success: true,
      message: 'Financial account created successfully',
      data: { account_id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating financial account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create financial account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get expense categories
exports.getExpenseCategories = async (req, res) => {
  try {
    const categories = await executeQuery(
      `SELECT * FROM expense_category ORDER BY Category_Name`
    );
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error getting expense categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve expense categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create expense category
exports.createExpenseCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body;
    
    if (!category_name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }
    
    const result = await executeQuery(
      `INSERT INTO expense_category (Category_Name, Description) VALUES (?, ?)`,
      [category_name, description]
    );
    
    res.status(201).json({
      success: true,
      message: 'Expense category created successfully',
      data: { category_id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating expense category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create expense category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create expense
exports.createExpense = async (req, res) => {
  try {
    const { 
      amount, 
      expense_date, 
      description, 
      expense_category_id, 
      payment_method,
      reference_number,
      account_id
    } = req.body;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }
    
    // Store staff ID from authenticated user
    const staffId = req.user.userId;
    
    const result = await executeTransaction(async (connection) => {
      // Create expense record
      const [insertResult] = await connection.query(
        `INSERT INTO expense 
        (Amount, Expense_Date, Description, Expense_Category, Staff_ID, Payment_Method, Reference_Number) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [amount, expense_date, description, expense_category_id, staffId, payment_method, reference_number]
      );
      
      // Update account balance if an account was specified
      if (account_id) {
        await connection.query(
          `UPDATE financial_account 
          SET current_balance = current_balance - ? 
          WHERE account_id = ?`,
          [amount, account_id]
        );
      }
      
      return insertResult.insertId;
    });
    
    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: { expense_id: result }
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create expense',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get expenses
exports.getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = [];
    const params = [];
    
    if (startDate && endDate) {
      whereClause.push('e.Expense_Date BETWEEN ? AND ?');
      params.push(startDate, endDate);
    }
    
    if (category) {
      whereClause.push('e.Expense_Category = ?');
      params.push(category);
    }
    
    const whereStr = whereClause.length > 0 ? 'WHERE ' + whereClause.join(' AND ') : '';
    
    const query = `
      SELECT 
        e.Expense_ID,
        e.Amount,
        e.Expense_Date,
        e.Description,
        ec.Category_Name,
        CONCAT(s.first_name, ' ', s.last_name) as staff_name,
        e.Payment_Method,
        e.Reference_Number
      FROM expense e
      LEFT JOIN expense_category ec ON e.Expense_Category = ec.Expense_Category_ID
      LEFT JOIN staff s ON e.Staff_ID = s.Staff_ID
      ${whereStr}
      ORDER BY e.Expense_Date DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(parseInt(limit), offset);
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM expense e
      ${whereStr}
    `;
    
    const [expenses, countResult] = await Promise.all([
      executeQuery(query, params),
      executeQuery(countQuery, params.slice(0, -2))
    ]);
    
    const total = countResult[0].total;
    
    res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve expenses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get tax rates
exports.getTaxRates = async (req, res) => {
  try {
    const taxRates = await executeQuery(
      `SELECT * FROM tax_rate WHERE is_active = TRUE ORDER BY tax_name`
    );
    
    res.status(200).json({
      success: true,
      data: taxRates
    });
  } catch (error) {
    console.error('Error getting tax rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tax rates',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create tax rate
exports.createTaxRate = async (req, res) => {
  try {
    const { tax_name, tax_rate, tax_type, is_default } = req.body;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const result = await executeTransaction(async (connection) => {
      // If this is the default tax rate, unset any existing default
      if (is_default) {
        await connection.query(
          `UPDATE tax_rate SET is_default = FALSE WHERE is_default = TRUE`
        );
      }
      
      // Insert new tax rate
      const [insertResult] = await connection.query(
        `INSERT INTO tax_rate 
        (tax_name, tax_rate, tax_type, is_default) 
        VALUES (?, ?, ?, ?)`,
        [tax_name, tax_rate, tax_type, is_default]
      );
      
      return insertResult.insertId;
    });
    
    res.status(201).json({
      success: true,
      message: 'Tax rate created successfully',
      data: { tax_id: result }
    });
  } catch (error) {
    console.error('Error creating tax rate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tax rate',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Generate financial reports
exports.generateFinancialReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;
    
    if (!reportType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Report type, start date, and end date are required'
      });
    }
    
    let reportData = {};
    
    switch (reportType) {
      case 'income_statement':
        // Revenue
        const salesQuery = `
          SELECT SUM(amount) as total_revenue
          FROM sales_transaction
          WHERE transaction_type = 'SALE'
          AND transaction_date BETWEEN ? AND ?
        `;
        const [salesResult] = await executeQuery(salesQuery, [startDate, endDate]);
        
        // Refunds
        const refundsQuery = `
          SELECT SUM(amount) as total_refunds
          FROM sales_transaction
          WHERE transaction_type = 'REFUND'
          AND transaction_date BETWEEN ? AND ?
        `;
        const [refundsResult] = await executeQuery(refundsQuery, [startDate, endDate]);
        
        // Expenses by category
        const expensesQuery = `
          SELECT ec.Category_Name, SUM(e.Amount) as total_amount
          FROM expense e
          JOIN expense_category ec ON e.Expense_Category = ec.Expense_Category_ID
          WHERE e.Expense_Date BETWEEN ? AND ?
          GROUP BY ec.Category_Name
        `;
        const expenses = await executeQuery(expensesQuery, [startDate, endDate]);
        
        // Total expenses
        const totalExpensesQuery = `
          SELECT SUM(Amount) as total_expenses
          FROM expense
          WHERE Expense_Date BETWEEN ? AND ?
        `;
        const [totalExpensesResult] = await executeQuery(totalExpensesQuery, [startDate, endDate]);
        
        reportData = {
          report_type: 'Income Statement',
          period: `${startDate} to ${endDate}`,
          revenue: {
            total_revenue: salesResult[0]?.total_revenue || 0,
            total_refunds: refundsResult[0]?.total_refunds || 0,
            net_revenue: (salesResult[0]?.total_revenue || 0) - (refundsResult[0]?.total_refunds || 0)
          },
          expenses: {
            by_category: expenses,
            total_expenses: totalExpensesResult[0]?.total_expenses || 0
          },
          net_profit: (salesResult[0]?.total_revenue || 0) - 
                      (refundsResult[0]?.total_refunds || 0) - 
                      (totalExpensesResult[0]?.total_expenses || 0)
        };
        break;
      
      case 'sales_tax':
        // Sales tax collected by month
        const taxByMonthQuery = `
          SELECT DATE_FORMAT(transaction_date, '%Y-%m') as month, 
                 SUM(amount) as tax_amount
          FROM sales_transaction
          WHERE transaction_type = 'TAX'
          AND transaction_date BETWEEN ? AND ?
          GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
          ORDER BY month
        `;
        const taxByMonth = await executeQuery(taxByMonthQuery, [startDate, endDate]);
        
        // Total tax collected
        const totalTaxQuery = `
          SELECT SUM(amount) as total_tax
          FROM sales_transaction
          WHERE transaction_type = 'TAX'
          AND transaction_date BETWEEN ? AND ?
        `;
        const [totalTaxResult] = await executeQuery(totalTaxQuery, [startDate, endDate]);
        
        reportData = {
          report_type: 'Sales Tax Report',
          period: `${startDate} to ${endDate}`,
          tax_by_month: taxByMonth,
          total_tax_collected: totalTaxResult[0]?.total_tax || 0
        };
        break;
      
      // Add more report types as needed
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }
    
    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate financial report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Generate invoice for customer
exports.generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Get order details
    const orderQuery = `
      SELECT 
        co.*,
        c.NAME as customer_name,
        c.EMAIL as customer_email,
        c.PHONE_NUM as customer_phone
      FROM customerorder co
      JOIN customer c ON co.Customer_ID = c.ID
      WHERE co.Order_ID = ?
    `;
    const orders = await executeQuery(orderQuery, [orderId]);
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const order = orders[0];
    
    // Get order items
    const itemsQuery = `
      SELECT 
        oi.*,
        p.Name as product_name,
        p.SKU as product_sku
      FROM order_item oi
      JOIN product p ON oi.Product_ID = p.Product_ID
      WHERE oi.Order_ID = ?
    `;
    const orderItems = await executeQuery(itemsQuery, [orderId]);
    
    // Get payment transactions for this order
    const paymentsQuery = `
      SELECT transaction_date, amount, payment_method, reference_number
      FROM sales_transaction
      WHERE order_id = ? AND transaction_type IN ('SALE', 'TAX')
    `;
    const payments = await executeQuery(paymentsQuery, [orderId]);
    
    const invoiceData = {
      invoice_number: `INV-${orderId}`,
      order_id: orderId,
      date: order.Order_Date,
      due_date: order.Order_Date, // Can be modified based on your payment terms
      customer: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        address: order.Shipping_Address
      },
      items: orderItems.map(item => ({
        id: item.Order_Item_ID,
        name: item.product_name,
        sku: item.product_sku,
        quantity: item.Quantity,
        price: item.Price,
        subtotal: item.Quantity * item.Price
      })),
      subtotal: orderItems.reduce((sum, item) => sum + (item.Quantity * item.Price), 0),
      tax: order.Tax_Amount || 0,
      shipping: order.Shipping_Cost || 0,
      total: order.Total_Amount,
      payments: payments,
      amount_paid: payments.reduce((sum, payment) => sum + payment.amount, 0),
      amount_due: order.Total_Amount - payments.reduce((sum, payment) => sum + payment.amount, 0),
      payment_status: order.Payment_Status,
      notes: order.Notes
    };
    
    res.status(200).json({
      success: true,
      data: invoiceData
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Generate balance sheet
exports.getBalanceSheet = async (req, res) => {
  try {
    const { date } = req.query;
    const reportDate = date || new Date().toISOString().split('T')[0]; // Default to today if no date provided
    
    // Get assets
    // 1. Cash and cash equivalents
    const cashQuery = `
      SELECT SUM(current_balance) as total_cash
      FROM financial_account
      WHERE account_type IN ('BANK', 'CASH')
      AND is_active = TRUE
    `;
    const [cashResult] = await executeQuery(cashQuery);
    
    // 2. Accounts receivable (unpaid customer orders)
    const accountsReceivableQuery = `
      SELECT SUM(Total_Amount) as total_receivable
      FROM customerorder
      WHERE Payment_Status IN ('pending', 'Pending', 'partial', 'Partial')
      AND Order_Date <= ?
    `;
    const [accountsReceivableResult] = await executeQuery(accountsReceivableQuery, [reportDate]);
    
    // 3. Inventory value
    const inventoryQuery = `
      SELECT SUM(i.Stock_Level * p.cost_price) as total_inventory_value
      FROM inventory i
      JOIN product p ON i.Product_ID = p.Product_ID
      WHERE p.cost_price IS NOT NULL
    `;
    const [inventoryResult] = await executeQuery(inventoryQuery);
    
    // Get liabilities
    // 1. Accounts payable (unpaid purchase orders)
    const accountsPayableQuery = `
      SELECT SUM(total_amount) as total_payable
      FROM purchase_orders
      WHERE status IN ('pending', 'sent', 'confirmed')
      AND order_date <= ?
    `;
    const [accountsPayableResult] = await executeQuery(accountsPayableQuery, [reportDate]);
    
    // 2. Credit accounts (negative balances)
    const creditQuery = `
      SELECT SUM(current_balance) as total_credit
      FROM financial_account
      WHERE account_type = 'CREDIT'
      AND is_active = TRUE
      AND current_balance < 0
    `;
    const [creditResult] = await executeQuery(creditQuery);
    
    // Calculate totals
    const totalAssets = (cashResult[0]?.total_cash || 0) + 
                        (accountsReceivableResult[0]?.total_receivable || 0) + 
                        (inventoryResult[0]?.total_inventory_value || 0);
    
    const totalLiabilities = (accountsPayableResult[0]?.total_payable || 0) +
                            Math.abs(creditResult[0]?.total_credit || 0);
    
    const equity = totalAssets - totalLiabilities;
    
    const balanceSheetData = {
      report_date: reportDate,
      assets: {
        cash_and_equivalents: cashResult[0]?.total_cash || 0,
        accounts_receivable: accountsReceivableResult[0]?.total_receivable || 0,
        inventory: inventoryResult[0]?.total_inventory_value || 0,
        total_assets: totalAssets
      },
      liabilities: {
        accounts_payable: accountsPayableResult[0]?.total_payable || 0,
        credit_accounts: Math.abs(creditResult[0]?.total_credit || 0),
        total_liabilities: totalLiabilities
      },
      equity: {
        owners_equity: equity,
        total_equity: equity
      },
      total_liabilities_and_equity: totalLiabilities + equity
    };
    
    res.status(200).json({
      success: true,
      data: balanceSheetData
    });
  } catch (error) {
    console.error('Error generating balance sheet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate balance sheet',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Generate cash flow statement
exports.getCashFlowStatement = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    // Get cash balance at start date
    const startingBalanceQuery = `
      SELECT SUM(amount) as balance
      FROM sales_transaction
      WHERE transaction_date < ?
    `;
    const [startingBalanceResult] = await executeQuery(startingBalanceQuery, [startDate]);
    
    // Operating activities
    // Cash from sales
    const cashFromSalesQuery = `
      SELECT SUM(amount) as total
      FROM sales_transaction
      WHERE transaction_type = 'SALE'
      AND transaction_date BETWEEN ? AND ?
    `;
    const [cashFromSalesResult] = await executeQuery(cashFromSalesQuery, [startDate, endDate]);
    
    // Cash for expenses
    const cashForExpensesQuery = `
      SELECT SUM(Amount) as total
      FROM expense
      WHERE Expense_Date BETWEEN ? AND ?
    `;
    const [cashForExpensesResult] = await executeQuery(cashForExpensesQuery, [startDate, endDate]);
    
    // Investment activities
    // Cash for purchase of inventory
    const inventoryPurchasesQuery = `
      SELECT SUM(total_amount) as total
      FROM purchase_orders
      WHERE order_date BETWEEN ? AND ?
      AND status = 'confirmed'
    `;
    const [inventoryPurchasesResult] = await executeQuery(inventoryPurchasesQuery, [startDate, endDate]);
    
    // Calculate cash flow components
    const operatingCashFlow = (cashFromSalesResult[0]?.total || 0) - (cashForExpensesResult[0]?.total || 0);
    
    const investingCashFlow = -(inventoryPurchasesResult[0]?.total || 0);
    
    // Calculate ending balance
    const endingBalance = (startingBalanceResult[0]?.balance || 0) + operatingCashFlow + investingCashFlow;
    
    const cashFlowData = {
      period: `${startDate} to ${endDate}`,
      starting_cash_balance: startingBalanceResult[0]?.balance || 0,
      operating_activities: {
        cash_from_sales: cashFromSalesResult[0]?.total || 0,
        cash_for_expenses: cashForExpensesResult[0]?.total || 0,
        net_operating_cash_flow: operatingCashFlow
      },
      investing_activities: {
        inventory_purchases: inventoryPurchasesResult[0]?.total || 0,
        net_investing_cash_flow: investingCashFlow
      },
      financing_activities: {
        net_financing_cash_flow: 0 // Placeholder for future implementation
      },
      net_cash_flow: operatingCashFlow + investingCashFlow,
      ending_cash_balance: endingBalance
    };
    
    res.status(200).json({
      success: true,
      data: cashFlowData
    });
  } catch (error) {
    console.error('Error generating cash flow statement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate cash flow statement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Department profitability report
exports.getDepartmentProfitability = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    // Get sales by product category
    const salesByCategoryQuery = `
      SELECT 
        COALESCE(p.Category, 'Uncategorized') as category_id,
        COALESCE(pc.name, 'Uncategorized') as category_name,
        SUM(oi.Quantity * oi.Price) as total_sales,
        SUM(oi.Quantity * p.cost_price) as total_cost,
        COUNT(DISTINCT co.Order_ID) as order_count,
        SUM(oi.Quantity) as units_sold
      FROM order_item oi
      JOIN customerorder co ON oi.Order_ID = co.Order_ID
      LEFT JOIN product p ON oi.Product_ID = p.Product_ID
      LEFT JOIN product_categories pc ON p.Category = pc.id
      WHERE co.Order_Date BETWEEN ? AND ?
      GROUP BY COALESCE(p.Category, 'Uncategorized'), COALESCE(pc.name, 'Uncategorized')
      ORDER BY total_sales DESC
    `;
    
    const departmentSales = await executeQuery(salesByCategoryQuery, [startDate, endDate]);
    
    // Calculate totals and margins
    const departmentResults = departmentSales.map(dept => {
      const grossProfit = dept.total_sales - dept.total_cost;
      const grossMargin = dept.total_sales > 0 ? (grossProfit / dept.total_sales) * 100 : 0;
      
      return {
        ...dept,
        gross_profit: grossProfit,
        gross_margin_percent: grossMargin,
        average_order_value: dept.order_count > 0 ? dept.total_sales / dept.order_count : 0
      };
    });
    
    // Calculate overall totals
    const totalSales = departmentResults.reduce((sum, dept) => sum + dept.total_sales, 0);
    const totalCost = departmentResults.reduce((sum, dept) => sum + dept.total_cost, 0);
    const totalGrossProfit = totalSales - totalCost;
    const totalGrossMargin = totalSales > 0 ? (totalGrossProfit / totalSales) * 100 : 0;
    
    const profitabilityData = {
      period: `${startDate} to ${endDate}`,
      departments: departmentResults,
      totals: {
        total_sales: totalSales,
        total_cost: totalCost,
        total_gross_profit: totalGrossProfit,
        overall_gross_margin: totalGrossMargin
      }
    };
    
    res.status(200).json({
      success: true,
      data: profitabilityData
    });
  } catch (error) {
    console.error('Error generating department profitability report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate department profitability report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get financial metrics dashboard data
exports.getFinancialMetrics = async (req, res) => {
  try {
    const { period } = req.query;
    let startDate, endDate;
    const now = new Date();
    
    // Determine date range based on period
    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        endDate = now;
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        endDate = now;
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        endDate = now;
        break;
      default:
        // Default to 30 days
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        endDate = now;
    }
    
    startDate = startDate.toISOString().split('T')[0];
    endDate = endDate.toISOString().split('T')[0];
    
    // Get profitability metrics
    const profitabilityQuery = `
      SELECT 
        SUM(CASE WHEN transaction_type = 'SALE' THEN amount ELSE 0 END) as total_sales,
        COUNT(DISTINCT order_id) as order_count
      FROM sales_transaction
      WHERE transaction_date BETWEEN ? AND ?
    `;
    const [profitabilityResult] = await executeQuery(profitabilityQuery, [startDate, endDate]);
    
    // Get cost of goods sold
    const cogsQuery = `
      SELECT SUM(oi.Quantity * p.cost_price) as total_cost
      FROM order_item oi
      JOIN customerorder co ON oi.Order_ID = co.Order_ID
      JOIN product p ON oi.Product_ID = p.Product_ID
      WHERE co.Order_Date BETWEEN ? AND ?
      AND p.cost_price IS NOT NULL
    `;
    const [cogsResult] = await executeQuery(cogsQuery, [startDate, endDate]);
    
    // Get expenses
    const expensesQuery = `
      SELECT SUM(Amount) as total_expenses
      FROM expense
      WHERE Expense_Date BETWEEN ? AND ?
    `;
    const [expensesResult] = await executeQuery(expensesQuery, [startDate, endDate]);
    
    // Get inventory metrics
    const inventoryQuery = `
      SELECT 
        COUNT(*) as product_count,
        SUM(i.Stock_Level) as total_units,
        SUM(i.Stock_Level * p.cost_price) as inventory_value
      FROM inventory i
      JOIN product p ON i.Product_ID = p.Product_ID
      WHERE p.cost_price IS NOT NULL
    `;
    const [inventoryResult] = await executeQuery(inventoryQuery);
    
    // Get sales data for previous period to calculate growth
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    
    const prevSalesQuery = `
      SELECT SUM(CASE WHEN transaction_type = 'SALE' THEN amount ELSE 0 END) as total_sales
      FROM sales_transaction
      WHERE transaction_date BETWEEN ? AND ?
    `;
    const [prevSalesResult] = await executeQuery(prevSalesQuery, [
      prevStartDate.toISOString().split('T')[0],
      prevEndDate.toISOString().split('T')[0]
    ]);
    
    // Calculate metrics
    const totalSales = profitabilityResult[0]?.total_sales || 0;
    const totalCogs = cogsResult[0]?.total_cost || 0;
    const totalExpenses = expensesResult[0]?.total_expenses || 0;
    const orderCount = profitabilityResult[0]?.order_count || 0;
    
    const grossProfit = totalSales - totalCogs;
    const netProfit = grossProfit - totalExpenses;
    const grossMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
    const netMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
    const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;
    
    const prevSales = prevSalesResult[0]?.total_sales || 0;
    const salesGrowth = prevSales > 0 ? ((totalSales - prevSales) / prevSales) * 100 : 0;
    
    const metricsData = {
      period: {
        start_date: startDate,
        end_date: endDate,
        name: period || '30_days'
      },
      profitability: {
        total_sales: totalSales,
        cost_of_goods_sold: totalCogs,
        gross_profit: grossProfit,
        gross_margin_percent: grossMargin,
        operating_expenses: totalExpenses,
        net_profit: netProfit,
        net_margin_percent: netMargin
      },
      efficiency: {
        average_order_value: avgOrderValue,
        inventory_value: inventoryResult[0]?.inventory_value || 0,
        inventory_count: inventoryResult[0]?.product_count || 0,
        total_units: inventoryResult[0]?.total_units || 0
      },
      growth: {
        sales_growth_percent: salesGrowth,
        prev_period_sales: prevSales
      }
    };
    
    res.status(200).json({
      success: true,
      data: metricsData
    });
  } catch (error) {
    console.error('Error getting financial metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve financial metrics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};