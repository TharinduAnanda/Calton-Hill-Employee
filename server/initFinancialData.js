const { executeQuery } = require('./config/db');

async function initFinancialData() {
  try {
    console.log('Setting up expense categories...');
    await executeQuery(`
      INSERT IGNORE INTO expense_category (Category_Name, Category_Description) 
      VALUES 
        ('Rent', 'Office and store rent'),
        ('Utilities', 'Electricity, water, internet'),
        ('Payroll', 'Employee salaries and wages'),
        ('Supplies', 'Office supplies'),
        ('Marketing', 'Advertising and promotions'),
        ('Maintenance', 'Building and equipment maintenance'),
        ('Insurance', 'Business insurance costs'),
        ('Taxes', 'Business taxes and fees')
    `);

    console.log('Setting up financial accounts...');
    await executeQuery(`
      INSERT IGNORE INTO financial_account 
      (account_name, account_type, opening_balance, current_balance, currency) 
      VALUES 
        ('Main Checking', 'BANK', 50000, 50000, 'USD'),
        ('Savings Account', 'BANK', 25000, 25000, 'USD'),
        ('Cash Register', 'CASH', 1000, 1000, 'USD'),
        ('Business Credit Card', 'CREDIT', 0, 0, 'USD')
    `);

    console.log('Setting up tax rates...');
    await executeQuery(`
      INSERT IGNORE INTO tax_rate 
      (tax_name, tax_rate, tax_type, is_default) 
      VALUES 
        ('Standard Sales Tax', 8.5, 'PERCENTAGE', TRUE),
        ('Reduced Rate', 5.0, 'PERCENTAGE', FALSE),
        ('Zero Rate', 0, 'PERCENTAGE', FALSE)
    `);

    console.log('Adding sample financial transactions...');
    // Convert orders to financial transactions
    await executeQuery(`
      INSERT IGNORE INTO sales_transaction 
      (order_id, transaction_date, amount, transaction_type, payment_method, reference_number)
      SELECT 
        Order_ID, 
        Order_Date, 
        Total_Amount, 
        'SALE', 
        payment_method, 
        CONCAT('ORD-', Order_ID)
      FROM customerorder
      WHERE Payment_Status = 'paid'
      AND Order_ID NOT IN (SELECT order_id FROM sales_transaction WHERE transaction_type = 'SALE')
    `);

    // Add sample expenses
    await executeQuery(`
      INSERT IGNORE INTO expense 
      (Expense_Date, Expense_Category, Description, Amount)
      VALUES 
        (DATE_SUB(CURDATE(), INTERVAL 25 DAY), 1, 'Monthly store rent', 5000),
        (DATE_SUB(CURDATE(), INTERVAL 20 DAY), 2, 'Electricity bill', 850),
        (DATE_SUB(CURDATE(), INTERVAL 18 DAY), 2, 'Internet services', 200),
        (DATE_SUB(CURDATE(), INTERVAL 15 DAY), 3, 'Staff salaries', 12000),
        (DATE_SUB(CURDATE(), INTERVAL 10 DAY), 4, 'Office supplies', 350),
        (DATE_SUB(CURDATE(), INTERVAL 5 DAY), 5, 'Online advertising', 1200)
    `);

    console.log('Setup complete!');
  } catch (error) {
    console.error('Error during setup:', error);
  } finally {
    process.exit(0);
  }
}

initFinancialData(); 