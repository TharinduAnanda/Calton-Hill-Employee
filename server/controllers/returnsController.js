const { executeQuery, executeTransaction } = require('../config/db');
const { validationResult } = require('express-validator');

// Get all return requests
exports.getAllReturns = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    const queryParams = [];
    
    if (status) {
      whereConditions.push('r.status = ?');
      queryParams.push(status);
    }
    
    if (startDate && endDate) {
      whereConditions.push('r.request_date BETWEEN ? AND ?');
      queryParams.push(startDate, endDate);
    }
    
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';
    
    const query = `
      SELECT 
        r.return_id,
        r.order_id,
        r.request_date,
        r.status,
        r.return_reason,
        r.total_refund_amount,
        r.refund_method,
        c.NAME as customer_name,
        c.ID as customer_id,
        COUNT(ri.return_item_id) as total_items,
        CONCAT(s.first_name, ' ', s.last_name) as approved_by_name,
        r.approved_date
      FROM return_request r
      JOIN customer c ON r.customer_id = c.ID
      LEFT JOIN return_item ri ON r.return_id = ri.return_id
      LEFT JOIN staff s ON r.approved_by = s.Staff_ID
      ${whereClause}
      GROUP BY r.return_id
      ORDER BY r.request_date DESC
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(parseInt(limit), offset);
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM return_request r
      ${whereClause}
    `;
    
    const [returns, countResult] = await Promise.all([
      executeQuery(query, queryParams),
      executeQuery(countQuery, queryParams.slice(0, -2))
    ]);
    
    const total = countResult[0].total;
    
    res.status(200).json({
      success: true,
      data: returns,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching returns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve returns',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get return request details
exports.getReturnDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get return request details
    const returnQuery = `
      SELECT 
        r.*,
        c.NAME as customer_name,
        c.EMAIL as customer_email,
        c.PHONE_NUM as customer_phone,
        CONCAT(s.first_name, ' ', s.last_name) as approved_by_name,
        co.Order_Date as order_date,
        co.Total_Amount as order_total
      FROM return_request r
      JOIN customer c ON r.customer_id = c.ID
      JOIN customerorder co ON r.order_id = co.Order_ID
      LEFT JOIN staff s ON r.approved_by = s.Staff_ID
      WHERE r.return_id = ?
    `;
    
    const returns = await executeQuery(returnQuery, [id]);
    
    if (returns.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Return request not found'
      });
    }
    
    const returnDetails = returns[0];
    
    // Get return items
    const itemsQuery = `
      SELECT 
        ri.*,
        oi.Unit_Price as original_price,
        oi.Quantity as original_quantity,
        p.Name as product_name,
        p.SKU as product_sku,
        p.Image_URL as product_image
      FROM return_item ri
      JOIN order_item oi ON ri.order_item_id = oi.Order_Item_ID
      JOIN product p ON ri.product_id = p.Product_ID
      WHERE ri.return_id = ?
    `;
    
    const returnItems = await executeQuery(itemsQuery, [id]);
    
    res.status(200).json({
      success: true,
      data: {
        return: returnDetails,
        items: returnItems
      }
    });
  } catch (error) {
    console.error('Error fetching return details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve return details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create return request
exports.createReturnRequest = async (req, res) => {
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
      customer_id,
      return_reason,
      items
    } = req.body;
    
    if (!order_id || !customer_id || !return_reason || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, customer ID, return reason and at least one item are required'
      });
    }
    
    // Check if order exists
    const orderCheck = await executeQuery(
      'SELECT Order_ID, Customer_ID FROM customerorder WHERE Order_ID = ?',
      [order_id]
    );
    
    if (orderCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Verify customer owns the order
    if (orderCheck[0].Customer_ID != customer_id) {
      return res.status(403).json({
        success: false,
        message: 'This order does not belong to the specified customer'
      });
    }
    
    // Create the return request and items
    const result = await executeTransaction(async (connection) => {
      // Insert main return request
      const [returnResult] = await connection.query(
        `INSERT INTO return_request 
        (order_id, customer_id, return_reason, status) 
        VALUES (?, ?, ?, 'PENDING')`,
        [order_id, customer_id, return_reason]
      );
      
      const returnId = returnResult.insertId;
      let totalRefundAmount = 0;
      
      // Insert return items
      for (const item of items) {
        if (!item.order_item_id || !item.product_id || !item.quantity || !item.reason) {
          throw new Error('Each item must include order_item_id, product_id, quantity, and reason');
        }
        
        // Check if order item exists
        const [orderItemResult] = await connection.query(
          'SELECT Order_Item_ID, Quantity, Unit_Price FROM order_item WHERE Order_Item_ID = ? AND Order_ID = ?',
          [item.order_item_id, order_id]
        );
        
        if (orderItemResult.length === 0) {
          throw new Error(`Order item ${item.order_item_id} not found in order ${order_id}`);
        }
        
        const orderItem = orderItemResult[0];
        
        // Check if return quantity is valid
        if (item.quantity > orderItem.Quantity) {
          throw new Error(`Return quantity cannot exceed original quantity for item ${item.order_item_id}`);
        }
        
        // Calculate refund amount
        const refundAmount = orderItem.Unit_Price * item.quantity;
        totalRefundAmount += refundAmount;
        
        // Insert return item
        await connection.query(
          `INSERT INTO return_item 
          (return_id, order_item_id, product_id, quantity, reason, item_condition, refund_amount, return_to_inventory) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [returnId, item.order_item_id, item.product_id, item.quantity, item.reason, item.condition || 'NEW', refundAmount, item.return_to_inventory !== false]
        );
      }
      
      // Update total refund amount in return request
      await connection.query(
        'UPDATE return_request SET total_refund_amount = ? WHERE return_id = ?',
        [totalRefundAmount, returnId]
      );
      
      return {
        return_id: returnId,
        total_refund_amount: totalRefundAmount
      };
    });
    
    res.status(201).json({
      success: true,
      message: 'Return request created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error creating return request:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create return request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Process return (approve/reject)
exports.processReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      refund_method,
      notes
    } = req.body;
    
    if (!status || !['APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Valid status (APPROVED or REJECTED) is required'
      });
    }
    
    // Check if return exists
    const returnCheck = await executeQuery(
      'SELECT return_id, status FROM return_request WHERE return_id = ?',
      [id]
    );
    
    if (returnCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Return request not found'
      });
    }
    
    // Check if return is already processed
    if (['APPROVED', 'REJECTED', 'COMPLETED'].includes(returnCheck[0].status)) {
      return res.status(400).json({
        success: false,
        message: `Return request has already been ${returnCheck[0].status.toLowerCase()}`
      });
    }
    
    // Process the return
    await executeTransaction(async (connection) => {
      // Update return request
      await connection.query(
        `UPDATE return_request 
        SET status = ?, approved_by = ?, approved_date = NOW(), refund_method = ?, notes = ? 
        WHERE return_id = ?`,
        [status.toUpperCase(), req.user.userId, refund_method, notes, id]
      );
      
      // If approved, update inventory for items that should be returned to inventory
      if (status.toUpperCase() === 'APPROVED') {
        const [returnItems] = await connection.query(
          'SELECT product_id, quantity, return_to_inventory FROM return_item WHERE return_id = ?',
          [id]
        );
        
        for (const item of returnItems) {
          if (item.return_to_inventory) {
            // Update product stock
            await connection.query(
              'UPDATE product SET Stock_Level = Stock_Level + ? WHERE Product_ID = ?',
              [item.quantity, item.product_id]
            );
            
            // Update inventory
            await connection.query(
              'UPDATE inventory SET Stock_Level = Stock_Level + ?, Last_Updated = NOW() WHERE Product_ID = ?',
              [item.quantity, item.product_id]
            );
            
            // Add inventory audit record
            await connection.query(
              `INSERT INTO inventory_audit 
              (product_id, batch_id, previous_quantity, new_quantity, adjustment_reason, adjusted_by) 
              VALUES (?, NULL, 
              (SELECT Stock_Level - ? FROM inventory WHERE Product_ID = ?), 
              (SELECT Stock_Level FROM inventory WHERE Product_ID = ?), 
              ?, ?)`,
              [item.product_id, item.quantity, item.product_id, item.product_id, `Return from RMA #${id}`, req.user.userId]
            );
          }
        }
      }
    });
    
    res.status(200).json({
      success: true,
      message: `Return request ${status.toLowerCase()} successfully`
    });
  } catch (error) {
    console.error('Error processing return request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process return request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Complete return (issue refund)
exports.completeReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      account_id,
      refund_reference
    } = req.body;
    
    if (!account_id) {
      return res.status(400).json({
        success: false,
        message: 'Financial account ID is required'
      });
    }
    
    // Check if return exists and is approved
    const returnCheck = await executeQuery(
      'SELECT r.*, c.NAME as customer_name FROM return_request r JOIN customer c ON r.customer_id = c.ID WHERE r.return_id = ?',
      [id]
    );
    
    if (returnCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Return request not found'
      });
    }
    
    const returnData = returnCheck[0];
    
    if (returnData.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Return request must be approved before completing'
      });
    }
    
    // Process the refund and complete the return
    await executeTransaction(async (connection) => {
      // Update return request status
      await connection.query(
        'UPDATE return_request SET status = ?, notes = CONCAT(IFNULL(notes, ""), ?) WHERE return_id = ?',
        ['COMPLETED', `\nRefund completed: ${new Date().toISOString()} - Ref: ${refund_reference || 'N/A'}`, id]
      );
      
      // Create refund transaction
      await connection.query(
        `INSERT INTO sales_transaction 
        (order_id, transaction_date, amount, transaction_type, payment_method, account_id, reference_number, notes, created_by) 
        VALUES (?, NOW(), ?, 'REFUND', ?, ?, ?, ?, ?)`,
        [
          returnData.order_id,
          returnData.total_refund_amount,
          returnData.refund_method,
          account_id,
          refund_reference || `RMA-${id}`,
          `Refund for return #${id} - Customer: ${returnData.customer_name}`,
          req.user.userId
        ]
      );
      
      // Update financial account
      await connection.query(
        'UPDATE financial_account SET current_balance = current_balance - ? WHERE account_id = ?',
        [returnData.total_refund_amount, account_id]
      );
    });
    
    res.status(200).json({
      success: true,
      message: 'Return request completed and refund processed successfully'
    });
  } catch (error) {
    console.error('Error completing return request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete return request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get return statistics
exports.getReturnStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE r.request_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    // Get count by status
    const statusCountQuery = `
      SELECT 
        r.status,
        COUNT(*) as count
      FROM return_request r
      ${dateFilter}
      GROUP BY r.status
    `;
    
    // Get total refund amount
    const refundQuery = `
      SELECT 
        SUM(r.total_refund_amount) as total_refund_amount,
        COUNT(*) as total_returns
      FROM return_request r
      ${dateFilter}
    `;
    
    // Get top return reasons
    const reasonsQuery = `
      SELECT 
        ri.reason,
        COUNT(*) as count
      FROM return_item ri
      JOIN return_request r ON ri.return_id = r.return_id
      ${dateFilter}
      GROUP BY ri.reason
      ORDER BY count DESC
      LIMIT 5
    `;
    
    // Get top returned products
    const productsQuery = `
      SELECT 
        p.Product_ID,
        p.Name,
        p.SKU,
        COUNT(*) as return_count,
        SUM(ri.quantity) as total_units_returned
      FROM return_item ri
      JOIN return_request r ON ri.return_id = r.return_id
      JOIN product p ON ri.product_id = p.Product_ID
      ${dateFilter}
      GROUP BY p.Product_ID, p.Name, p.SKU
      ORDER BY total_units_returned DESC
      LIMIT 5
    `;
    
    const [statusCounts, refundData, topReasons, topProducts] = await Promise.all([
      executeQuery(statusCountQuery, params),
      executeQuery(refundQuery, params),
      executeQuery(reasonsQuery, params),
      executeQuery(productsQuery, params)
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        status_distribution: statusCounts,
        total_returns: refundData[0]?.total_returns || 0,
        total_refund_amount: refundData[0]?.total_refund_amount || 0,
        top_return_reasons: topReasons,
        top_returned_products: topProducts
      }
    });
  } catch (error) {
    console.error('Error fetching return statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve return statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get warranty claims
exports.getWarrantyClaims = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    const queryParams = [];
    
    if (status) {
      whereConditions.push('wc.status = ?');
      queryParams.push(status);
    }
    
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';
    
    const query = `
      SELECT 
        wc.claim_id,
        wc.customer_id,
        wc.product_id,
        wc.order_id,
        wc.claim_date,
        wc.purchase_date,
        wc.issue_description,
        wc.status,
        wc.warranty_end_date,
        c.NAME as customer_name,
        p.Name as product_name,
        p.SKU as product_sku,
        CONCAT(s.first_name, ' ', s.last_name) as handled_by_name
      FROM warranty_claim wc
      JOIN customer c ON wc.customer_id = c.ID
      JOIN product p ON wc.product_id = p.Product_ID
      LEFT JOIN staff s ON wc.handled_by = s.Staff_ID
      ${whereClause}
      ORDER BY wc.claim_date DESC
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(parseInt(limit), offset);
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM warranty_claim wc
      ${whereClause}
    `;
    
    const [claims, countResult] = await Promise.all([
      executeQuery(query, queryParams),
      executeQuery(countQuery, queryParams.slice(0, -2))
    ]);
    
    const total = countResult[0].total;
    
    res.status(200).json({
      success: true,
      data: claims,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching warranty claims:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve warranty claims',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create warranty claim
exports.createWarrantyClaim = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const {
      customer_id,
      product_id,
      order_id,
      purchase_date,
      issue_description,
      warranty_end_date
    } = req.body;
    
    if (!customer_id || !product_id || !issue_description) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID, product ID, and issue description are required'
      });
    }
    
    // Check if customer and product exist
    const customerCheck = await executeQuery('SELECT ID FROM customer WHERE ID = ?', [customer_id]);
    const productCheck = await executeQuery('SELECT Product_ID FROM product WHERE Product_ID = ?', [product_id]);
    
    if (customerCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    if (productCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // If order_id provided, check if it exists
    if (order_id) {
      const orderCheck = await executeQuery('SELECT Order_ID FROM customerorder WHERE Order_ID = ?', [order_id]);
      if (orderCheck.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
    }
    
    // Create warranty claim
    const result = await executeQuery(
      `INSERT INTO warranty_claim 
      (customer_id, product_id, order_id, purchase_date, issue_description, warranty_end_date, status) 
      VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
      [customer_id, product_id, order_id || null, purchase_date || null, issue_description, warranty_end_date || null]
    );
    
    res.status(201).json({
      success: true,
      message: 'Warranty claim created successfully',
      data: { claim_id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating warranty claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create warranty claim',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Process warranty claim
exports.processWarrantyClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      resolution,
      handled_by
    } = req.body;
    
    if (!status || !['APPROVED', 'REJECTED', 'IN_PROCESS', 'COMPLETED', 'CANCELLED'].includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }
    
    // Check if claim exists
    const claimCheck = await executeQuery(
      'SELECT claim_id FROM warranty_claim WHERE claim_id = ?',
      [id]
    );
    
    if (claimCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Warranty claim not found'
      });
    }
    
    // Update claim
    await executeQuery(
      `UPDATE warranty_claim 
       SET status = ?, resolution = ?, handled_by = ? 
       WHERE claim_id = ?`,
      [status.toUpperCase(), resolution || null, handled_by || req.user.userId, id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Warranty claim updated successfully'
    });
  } catch (error) {
    console.error('Error processing warranty claim:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process warranty claim',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};