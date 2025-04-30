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
        SUM(oi.Quantity * oi.Unit_Price) as total_sales
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
        price: item.Unit_Price,
        subtotal: item.Quantity * item.Unit_Price
      })),
      subtotal: orderItems.reduce((sum, item) => sum + (item.Quantity * item.Unit_Price), 0),
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