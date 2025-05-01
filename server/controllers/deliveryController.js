const { executeQuery, executeTransaction } = require('../config/db');
const { validationResult } = require('express-validator');

// Get all delivery zones
exports.getAllDeliveryZones = async (req, res) => {
  try {
    const zones = await executeQuery(
      `SELECT * FROM delivery_zone WHERE is_active = TRUE ORDER BY zone_name`
    );
    
    res.status(200).json({
      success: true,
      data: zones
    });
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve delivery zones',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create delivery zone
exports.createDeliveryZone = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const {
      zone_name,
      zone_description,
      delivery_fee,
      estimated_delivery_time
    } = req.body;
    
    if (!zone_name) {
      return res.status(400).json({
        success: false,
        message: 'Zone name is required'
      });
    }
    
    const result = await executeQuery(
      `INSERT INTO delivery_zone 
      (zone_name, zone_description, delivery_fee, estimated_delivery_time) 
      VALUES (?, ?, ?, ?)`,
      [zone_name, zone_description, delivery_fee, estimated_delivery_time]
    );
    
    res.status(201).json({
      success: true,
      message: 'Delivery zone created successfully',
      data: { zone_id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating delivery zone:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create delivery zone',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await executeQuery(
      `SELECT * FROM delivery_vehicle ORDER BY vehicle_name`
    );
    
    res.status(200).json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve vehicles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create vehicle
exports.createVehicle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const {
      vehicle_name,
      vehicle_number,
      vehicle_type,
      capacity,
      notes
    } = req.body;
    
    if (!vehicle_name || !vehicle_number || !vehicle_type) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle name, number, and type are required'
      });
    }
    
    const result = await executeQuery(
      `INSERT INTO delivery_vehicle 
      (vehicle_name, vehicle_number, vehicle_type, capacity, notes) 
      VALUES (?, ?, ?, ?, ?)`,
      [vehicle_name, vehicle_number, vehicle_type, capacity, notes]
    );
    
    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: { vehicle_id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vehicle',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Schedule delivery
exports.scheduleDelivery = async (req, res) => {
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
      vehicle_id,
      driver_staff_id,
      delivery_zone,
      estimated_delivery_date,
      delivery_notes
    } = req.body;
    
    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }
    
    // Check if order exists
    const orderCheck = await executeQuery(
      'SELECT Order_ID FROM customerorder WHERE Order_ID = ?',
      [order_id]
    );
    
    if (orderCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if logistics entry already exists for this order
    const logisticsCheck = await executeQuery(
      'SELECT Logistics_ID FROM logistics WHERE Order_ID = ?',
      [order_id]
    );
    
    let logisticsId;
    
    if (logisticsCheck.length > 0) {
      // Update existing logistics entry
      logisticsId = logisticsCheck[0].Logistics_ID;
      
      await executeQuery(
        `UPDATE logistics 
         SET vehicle_id = ?, driver_staff_id = ?, delivery_zone = ?, 
         estimated_delivery_date = ?, delivery_notes = ?, delivery_status = 'SCHEDULED' 
         WHERE Logistics_ID = ?`,
        [vehicle_id, driver_staff_id, delivery_zone, estimated_delivery_date, delivery_notes, logisticsId]
      );
    } else {
      // Create new logistics entry
      const result = await executeQuery(
        `INSERT INTO logistics 
         (Order_ID, Staff_ID, vehicle_id, driver_staff_id, delivery_zone, 
          estimated_delivery_date, delivery_notes, delivery_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'SCHEDULED')`,
        [order_id, req.user.userId, vehicle_id, driver_staff_id, delivery_zone, estimated_delivery_date, delivery_notes]
      );
      
      logisticsId = result.insertId;
    }
    
    // Update the order delivery status
    await executeQuery(
      "UPDATE customerorder SET Delivery_Status = 'Scheduled' WHERE Order_ID = ?",
      [order_id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Delivery scheduled successfully',
      data: { logistics_id: logisticsId }
    });
  } catch (error) {
    console.error('Error scheduling delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule delivery',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      actual_delivery_date,
      delivery_notes,
      signature_image_url
    } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // Check if logistics entry exists
    const logisticsCheck = await executeQuery(
      'SELECT l.Logistics_ID, l.Order_ID FROM logistics l WHERE l.Logistics_ID = ?',
      [id]
    );
    
    if (logisticsCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Delivery record not found'
      });
    }
    
    const orderId = logisticsCheck[0].Order_ID;
    
    await executeTransaction(async (connection) => {
      const updateFields = ['delivery_status = ?'];
      const updateValues = [status];
      
      if (status === 'DELIVERED') {
        updateFields.push('actual_delivery_date = ?');
        updateValues.push(actual_delivery_date || new Date());
      }
      
      if (delivery_notes !== undefined) {
        updateFields.push('delivery_notes = ?');
        updateValues.push(delivery_notes);
      }
      
      if (signature_image_url !== undefined) {
        updateFields.push('signature_image_url = ?');
        updateValues.push(signature_image_url);
      }
      
      updateValues.push(id);
      
      // Update logistics record
      await connection.query(
        `UPDATE logistics 
         SET ${updateFields.join(', ')} 
         WHERE Logistics_ID = ?`,
        updateValues
      );
      
      // Update order status if delivered or failed
      if (status === 'DELIVERED') {
        await connection.query(
          "UPDATE customerorder SET Delivery_Status = 'Delivered' WHERE Order_ID = ?",
          [orderId]
        );
      } else if (status === 'FAILED') {
        await connection.query(
          "UPDATE customerorder SET Delivery_Status = 'Failed' WHERE Order_ID = ?",
          [orderId]
        );
      } else if (status === 'IN_TRANSIT') {
        await connection.query(
          "UPDATE customerorder SET Delivery_Status = 'Shipped' WHERE Order_ID = ?",
          [orderId]
        );
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Delivery status updated successfully'
    });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update delivery status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get deliveries
exports.getDeliveries = async (req, res) => {
  try {
    const { status, date, driverId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    const queryParams = [];
    
    if (status) {
      whereConditions.push('l.delivery_status = ?');
      queryParams.push(status);
    }
    
    if (date) {
      whereConditions.push('(l.estimated_delivery_date = ? OR l.actual_delivery_date = ?)');
      queryParams.push(date, date);
    }
    
    if (driverId) {
      whereConditions.push('l.driver_staff_id = ?');
      queryParams.push(driverId);
    }
    
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';
    
    const query = `
      SELECT 
        l.Logistics_ID,
        l.Order_ID,
        l.delivery_status,
        l.estimated_delivery_date,
        l.actual_delivery_date,
        l.delivery_zone,
        l.delivery_notes,
        co.Shipping_Address,
        co.Total_Amount,
        CONCAT(s.first_name, ' ', s.last_name) as driver_name,
        dv.vehicle_name,
        dv.vehicle_number,
        c.NAME as customer_name,
        c.PHONE_NUM as customer_phone
      FROM logistics l
      JOIN customerorder co ON l.Order_ID = co.Order_ID
      JOIN customer c ON co.Customer_ID = c.ID
      LEFT JOIN staff s ON l.driver_staff_id = s.Staff_ID
      LEFT JOIN delivery_vehicle dv ON l.vehicle_id = dv.vehicle_id
      ${whereClause}
      ORDER BY 
        CASE 
          WHEN l.delivery_status = 'SCHEDULED' THEN 1
          WHEN l.delivery_status = 'IN_TRANSIT' THEN 2
          ELSE 3
        END,
        l.estimated_delivery_date
      LIMIT ? OFFSET ?
    `;
    
    queryParams.push(parseInt(limit), offset);
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM logistics l
      ${whereClause}
    `;
    
    const [deliveries, countResult] = await Promise.all([
      executeQuery(query, queryParams),
      executeQuery(countQuery, queryParams.slice(0, -2))
    ]);
    
    const total = countResult[0].total;
    
    res.status(200).json({
      success: true,
      data: deliveries,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve deliveries',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get delivery details
exports.getDeliveryDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        l.*,
        co.Order_ID,
        co.Order_Date,
        co.Total_Amount,
        co.Shipping_Address,
        c.NAME as customer_name,
        c.EMAIL as customer_email,
        c.PHONE_NUM as customer_phone,
        CONCAT(s.first_name, ' ', s.last_name) as driver_name,
        s.phone_number as driver_phone,
        dv.vehicle_name,
        dv.vehicle_number,
        dv.vehicle_type,
        dz.zone_name,
        dz.delivery_fee
      FROM logistics l
      JOIN customerorder co ON l.Order_ID = co.Order_ID
      JOIN customer c ON co.Customer_ID = c.ID
      LEFT JOIN staff s ON l.driver_staff_id = s.Staff_ID
      LEFT JOIN delivery_vehicle dv ON l.vehicle_id = dv.vehicle_id
      LEFT JOIN delivery_zone dz ON l.delivery_zone = dz.zone_id
      WHERE l.Logistics_ID = ?
    `;
    
    const deliveries = await executeQuery(query, [id]);
    
    if (deliveries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }
    
    const delivery = deliveries[0];
    
    // Get order items
    const itemsQuery = `
      SELECT 
        oi.Order_Item_ID,
        oi.Quantity,
        oi.Unit_Price,
        p.Name as product_name,
        p.SKU as product_sku,
        p.Image_URL as product_image
      FROM order_item oi
      JOIN product p ON oi.Product_ID = p.Product_ID
      WHERE oi.Order_ID = ?
    `;
    
    const items = await executeQuery(itemsQuery, [delivery.Order_ID]);
    
    res.status(200).json({
      success: true,
      data: {
        delivery,
        items
      }
    });
  } catch (error) {
    console.error('Error fetching delivery details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve delivery details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get delivery drivers
exports.getDeliveryDrivers = async (req, res) => {
  try {
    const drivers = await executeQuery(
      `SELECT 
       s.Staff_ID,
       CONCAT(s.first_name, ' ', s.last_name) as name,
       s.email,
       s.phone_number,
       COUNT(l.Logistics_ID) as total_deliveries,
       SUM(CASE WHEN l.delivery_status = 'IN_TRANSIT' THEN 1 ELSE 0 END) as active_deliveries
       FROM staff s
       LEFT JOIN logistics l ON s.Staff_ID = l.driver_staff_id
       WHERE s.role = 'driver'
       GROUP BY s.Staff_ID
       ORDER BY s.first_name, s.last_name`
    );
    
    res.status(200).json({
      success: true,
      data: drivers
    });
  } catch (error) {
    console.error('Error fetching delivery drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve delivery drivers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};