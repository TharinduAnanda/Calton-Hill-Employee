const { executeQuery } = require('../config/db');
const { validationResult } = require('express-validator');

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, segment } = req.query;
    const offset = (page - 1) * limit;
    
    let queryConditions = [];
    const queryParams = [];
    
    if (search) {
      queryConditions.push('(c.NAME LIKE ? OR c.EMAIL LIKE ? OR c.PHONE_NUM LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (segment) {
      queryConditions.push('c.customer_segment = ?');
      queryParams.push(segment);
    }
    
    const whereClause = queryConditions.length > 0 
      ? 'WHERE ' + queryConditions.join(' AND ') 
      : '';
    
    const query = `
      SELECT 
        c.ID,
        c.NAME as name,
        c.EMAIL as email,
        c.PHONE_NUM as phone,
        c.ADDRESS as address,
        c.loyalty_points,
        c.customer_segment,
        c.customer_since,
        c.last_purchase_date,
        c.total_spent,
        COUNT(co.Order_ID) as total_orders
      FROM customer c
      LEFT JOIN customerorder co ON c.ID = co.Customer_ID
      ${whereClause}
      GROUP BY c.ID
      ORDER BY c.NAME
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(parseInt(limit), offset);
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM customer c
      ${whereClause}
    `;
    
    const [customers, countResult] = await Promise.all([
      executeQuery(query, queryParams),
      executeQuery(countQuery, queryParams.slice(0, -2))
    ]);
    
    const total = countResult[0].total;
    
    res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get customer details
exports.getCustomerDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get customer basic info
    const customerQuery = `
      SELECT 
        c.*,
        cs.segment_name as segment_name,
        cs.segment_description as segment_description
      FROM customer c
      LEFT JOIN customer_segment cs ON c.customer_segment = cs.segment_id
      WHERE c.ID = ?
    `;
    const customers = await executeQuery(customerQuery, [id]);
    
    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    const customer = customers[0];
    
    // Get customer orders
    const ordersQuery = `
      SELECT 
        co.Order_ID,
        co.Order_Date,
        co.Total_Amount,
        co.Payment_Status,
        co.Delivery_Status,
        COUNT(oi.Order_Item_ID) as item_count
      FROM customerorder co
      LEFT JOIN order_item oi ON co.Order_ID = oi.Order_ID
      WHERE co.Customer_ID = ?
      GROUP BY co.Order_ID
      ORDER BY co.Order_Date DESC
      LIMIT 10
    `;
    const orders = await executeQuery(ordersQuery, [id]);
    
    // Get customer support tickets
    const ticketsQuery = `
      SELECT 
        ticket_id,
        subject,
        status,
        priority,
        created_at,
        resolved_at
      FROM support_ticket
      WHERE customer_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const tickets = await executeQuery(ticketsQuery, [id]);
    
    // Get customer feedback
    const feedbackQuery = `
      SELECT 
        f.Feedback_ID,
        f.Rating,
        f.Feedback_Text,
        f.Feedback_Date,
        p.Name as product_name
      FROM feedback f
      LEFT JOIN product p ON f.Product_ID = p.Product_ID
      WHERE f.Customer_ID = ?
      ORDER BY f.Feedback_Date DESC
      LIMIT 10
    `;
    const feedback = await executeQuery(feedbackQuery, [id]);
    
    // Calculate lifetime value
    const ltv = customer.total_spent || 0;
    
    res.status(200).json({
      success: true,
      data: {
        customer,
        orders,
        tickets,
        feedback,
        analytics: {
          lifetime_value: ltv,
          total_orders: orders.length,
          average_order_value: orders.length > 0 ? ltv / orders.length : 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching customer details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customer details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      address,
      birthdate,
      gender,
      customer_segment,
      notes,
      marketing_consent,
      loyalty_points
    } = req.body;
    
    // Check if customer exists
    const customerCheck = await executeQuery(
      'SELECT ID FROM customer WHERE ID = ?',
      [id]
    );
    
    if (customerCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Update customer info
    const updateFields = [];
    const updateValues = [];
    
    if (name !== undefined) {
      updateFields.push('NAME = ?');
      updateValues.push(name);
    }
    
    if (email !== undefined) {
      updateFields.push('EMAIL = ?');
      updateValues.push(email);
    }
    
    if (phone !== undefined) {
      updateFields.push('PHONE_NUM = ?');
      updateValues.push(phone);
    }
    
    if (address !== undefined) {
      updateFields.push('ADDRESS = ?');
      updateValues.push(address);
    }
    
    if (birthdate !== undefined) {
      updateFields.push('birthdate = ?');
      updateValues.push(birthdate);
    }
    
    if (gender !== undefined) {
      updateFields.push('gender = ?');
      updateValues.push(gender);
    }
    
    if (customer_segment !== undefined) {
      updateFields.push('customer_segment = ?');
      updateValues.push(customer_segment);
    }
    
    if (notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(notes);
    }
    
    if (marketing_consent !== undefined) {
      updateFields.push('marketing_consent = ?');
      updateValues.push(marketing_consent ? 1 : 0);
    }
    
    if (loyalty_points !== undefined) {
      updateFields.push('loyalty_points = ?');
      updateValues.push(loyalty_points);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    updateValues.push(id);
    
    await executeQuery(
      `UPDATE customer SET ${updateFields.join(', ')} WHERE ID = ?`,
      updateValues
    );
    
    res.status(200).json({
      success: true,
      message: 'Customer updated successfully'
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get customer segments
exports.getCustomerSegments = async (req, res) => {
  try {
    const segments = await executeQuery(
      'SELECT * FROM customer_segment ORDER BY segment_name'
    );
    
    res.status(200).json({
      success: true,
      data: segments
    });
  } catch (error) {
    console.error('Error fetching customer segments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customer segments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create customer segment
exports.createCustomerSegment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const {
      segment_name,
      segment_description,
      segment_criteria
    } = req.body;
    
    if (!segment_name) {
      return res.status(400).json({
        success: false,
        message: 'Segment name is required'
      });
    }
    
    const result = await executeQuery(
      `INSERT INTO customer_segment (segment_name, segment_description, segment_criteria)
       VALUES (?, ?, ?)`,
      [segment_name, segment_description, JSON.stringify(segment_criteria || {})]
    );
    
    res.status(201).json({
      success: true,
      message: 'Customer segment created successfully',
      data: { segment_id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating customer segment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer segment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Support tickets
exports.getTickets = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    const queryParams = [];
    
    if (status) {
      whereConditions.push('t.status = ?');
      queryParams.push(status);
    }
    
    if (priority) {
      whereConditions.push('t.priority = ?');
      queryParams.push(priority);
    }
    
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';
    
    const query = `
      SELECT 
        t.ticket_id,
        t.subject,
        t.description,
        t.status,
        t.priority,
        t.created_at,
        t.resolved_at,
        c.NAME as customer_name,
        c.ID as customer_id,
        CONCAT(s.first_name, ' ', s.last_name) as assigned_to_name,
        s.Staff_ID as assigned_to_id,
        co.Order_ID as order_id
      FROM support_ticket t
      LEFT JOIN customer c ON t.customer_id = c.ID
      LEFT JOIN staff s ON t.assigned_to = s.Staff_ID
      LEFT JOIN customerorder co ON t.order_id = co.Order_ID
      ${whereClause}
      ORDER BY 
        CASE 
          WHEN t.status = 'OPEN' THEN 1
          WHEN t.status = 'IN_PROGRESS' THEN 2
          WHEN t.status = 'WAITING' THEN 3
          WHEN t.status = 'RESOLVED' THEN 4
          WHEN t.status = 'CLOSED' THEN 5
        END,
        CASE 
          WHEN t.priority = 'CRITICAL' THEN 1
          WHEN t.priority = 'HIGH' THEN 2
          WHEN t.priority = 'MEDIUM' THEN 3
          WHEN t.priority = 'LOW' THEN 4
        END,
        t.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(parseInt(limit), offset);
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM support_ticket t
      ${whereClause}
    `;
    
    const [tickets, countResult] = await Promise.all([
      executeQuery(query, queryParams),
      executeQuery(countQuery, queryParams.slice(0, -2))
    ]);
    
    const total = countResult[0].total;
    
    res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve support tickets',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get ticket details
exports.getTicketDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get ticket details
    const ticketQuery = `
      SELECT 
        t.*,
        c.NAME as customer_name,
        c.EMAIL as customer_email,
        c.PHONE_NUM as customer_phone,
        CONCAT(s.first_name, ' ', s.last_name) as assigned_to_name,
        s.Staff_ID as assigned_to_id,
        co.Order_ID as order_id,
        co.Order_Date as order_date
      FROM support_ticket t
      LEFT JOIN customer c ON t.customer_id = c.ID
      LEFT JOIN staff s ON t.assigned_to = s.Staff_ID
      LEFT JOIN customerorder co ON t.order_id = co.Order_ID
      WHERE t.ticket_id = ?
    `;
    
    const tickets = await executeQuery(ticketQuery, [id]);
    
    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    const ticket = tickets[0];
    
    // Get ticket messages
    const messagesQuery = `
      SELECT 
        tm.*,
        CASE
          WHEN tm.sender_type = 'CUSTOMER' THEN c.NAME
          WHEN tm.sender_type = 'STAFF' THEN CONCAT(s.first_name, ' ', s.last_name)
        END as sender_name
      FROM ticket_message tm
      LEFT JOIN customer c ON tm.sender_type = 'CUSTOMER' AND tm.sender_id = c.ID
      LEFT JOIN staff s ON tm.sender_type = 'STAFF' AND tm.sender_id = s.Staff_ID
      WHERE tm.ticket_id = ?
      ORDER BY tm.created_at
    `;
    
    const messages = await executeQuery(messagesQuery, [id]);
    
    res.status(200).json({
      success: true,
      data: {
        ticket,
        messages
      }
    });
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve ticket details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create support ticket
exports.createTicket = async (req, res) => {
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
      order_id,
      subject,
      description,
      priority = 'MEDIUM',
      assigned_to,
      initial_message
    } = req.body;
    
    if (!customer_id || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID, subject, and description are required'
      });
    }
    
    // Check if the customer exists
    const customerCheck = await executeQuery(
      'SELECT ID FROM customer WHERE ID = ?',
      [customer_id]
    );
    
    if (customerCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Check if the order exists if provided
    if (order_id) {
      const orderCheck = await executeQuery(
        'SELECT Order_ID FROM customerorder WHERE Order_ID = ?',
        [order_id]
      );
      
      if (orderCheck.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Order not found'
        });
      }
    }
    
    // Insert the ticket
    const result = await executeQuery(
      `INSERT INTO support_ticket 
      (customer_id, order_id, subject, description, priority, assigned_to, status) 
      VALUES (?, ?, ?, ?, ?, ?, 'OPEN')`,
      [customer_id, order_id || null, subject, description, priority, assigned_to || null]
    );
    
    const ticketId = result.insertId;
    
    // Add initial message if provided
    if (initial_message) {
      await executeQuery(
        `INSERT INTO ticket_message 
        (ticket_id, sender_type, sender_id, message) 
        VALUES (?, ?, ?, ?)`,
        [ticketId, 'STAFF', req.user.userId, initial_message]
      );
    }
    
    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: { ticket_id: ticketId }
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add message to ticket
exports.addTicketMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }
    
    // Check if the ticket exists
    const ticketCheck = await executeQuery(
      'SELECT ticket_id FROM support_ticket WHERE ticket_id = ?',
      [id]
    );
    
    if (ticketCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // Get the sender type based on the authenticated user (assuming staff)
    const senderType = 'STAFF';
    const senderId = req.user.userId;
    
    await executeQuery(
      `INSERT INTO ticket_message 
      (ticket_id, sender_type, sender_id, message) 
      VALUES (?, ?, ?, ?)`,
      [id, senderType, senderId, message]
    );
    
    // Update the ticket status to IN_PROGRESS if it's currently OPEN
    await executeQuery(
      `UPDATE support_ticket 
       SET status = CASE WHEN status = 'OPEN' THEN 'IN_PROGRESS' ELSE status END 
       WHERE ticket_id = ?`,
      [id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Message added successfully'
    });
  } catch (error) {
    console.error('Error adding ticket message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add message to ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update ticket status
exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_to } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // Check if the ticket exists
    const ticketCheck = await executeQuery(
      'SELECT ticket_id FROM support_ticket WHERE ticket_id = ?',
      [id]
    );
    
    if (ticketCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    const updateFields = ['status = ?'];
    const updateValues = [status];
    
    // If status is RESOLVED, set resolved_at timestamp
    if (status === 'RESOLVED') {
      updateFields.push('resolved_at = NOW()');
    } else if (status === 'OPEN' || status === 'IN_PROGRESS') {
      // If reopening ticket, clear resolved timestamp
      updateFields.push('resolved_at = NULL');
    }
    
    // Update assigned staff if provided
    if (assigned_to !== undefined) {
      updateFields.push('assigned_to = ?');
      updateValues.push(assigned_to !== null ? assigned_to : null);
    }
    
    updateValues.push(id);
    
    await executeQuery(
      `UPDATE support_ticket 
       SET ${updateFields.join(', ')} 
       WHERE ticket_id = ?`,
      updateValues
    );
    
    res.status(200).json({
      success: true,
      message: 'Ticket status updated successfully'
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};