const { executeQuery, executeTransaction } = require('../config/db');

// Helper functions
const calculateTotals = (items, taxRate = 0, shippingCost = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount + parseFloat(shippingCost || 0);
  
  return {
    subtotal,
    taxAmount,
    totalAmount
  };
};

// PurchaseOrder model functions
const PurchaseOrder = {
  // Get all purchase orders
  findAll: async (filter = {}) => {
    let query = `
      SELECT po.*, 
             s.Name as supplierName, 
             s.Email as supplierEmail,
             s.Phone_Number as supplierPhone
      FROM purchase_orders po
      LEFT JOIN supplier s ON po.supplier_id = s.Supplier_ID
    `;

    const conditions = [];
    const params = [];

    // Apply filters
    if (filter.status) {
      conditions.push('po.status = ?');
      params.push(filter.status);
    }

    if (filter.supplier) {
      conditions.push('po.supplier_id = ?');
      params.push(filter.supplier);
    }

    if (filter.orderDate && filter.orderDate.$gte) {
      conditions.push('po.order_date >= ?');
      params.push(filter.orderDate.$gte);
    }

    if (filter.orderDate && filter.orderDate.$lte) {
      conditions.push('po.order_date <= ?');
      params.push(filter.orderDate.$lte);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY po.created_at DESC';

    const orders = await executeQuery(query, params);

    // For each order, get its items
    for (const order of orders) {
      const items = await executeQuery(
        `SELECT * FROM purchase_order_items WHERE purchase_order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    return orders;
  },

  // Find purchase order by ID
  findById: async (id) => {
    const [order] = await executeQuery(
      `SELECT po.*, 
              s.Name as supplierName, 
              s.Email as supplierEmail,
              s.Phone_Number as supplierPhone,
              s.street, s.city, s.state, s.zipCode, s.country
       FROM purchase_orders po
       LEFT JOIN supplier s ON po.supplier_id = s.Supplier_ID
       WHERE po.id = ?`,
      [id]
    );

    if (!order) return null;

    // Get order items
    const items = await executeQuery(
      `SELECT poi.*, p.Name as productName
       FROM purchase_order_items poi
       LEFT JOIN product p ON poi.product_id = p.Product_ID
       WHERE poi.purchase_order_id = ?`,
      [id]
    );

    order.items = items;
    
    // Format address from individual components
    const addressParts = [
      order.street,
      order.city,
      order.state,
      order.zipCode,
      order.country
    ].filter(Boolean);
    
    const formattedAddress = addressParts.length > 0 ? addressParts.join(', ') : null;
    
    // Format supplier details
    order.supplier = {
      id: order.supplier_id,
      name: order.supplierName,
      email: order.supplierEmail,
      phone: order.supplierPhone,
      address: {
        street: order.street,
        city: order.city,
        state: order.state,
        zipCode: order.zipCode,
        country: order.country
      },
      formattedAddress
    };

    return order;
  },

  // Create a new purchase order
  create: async (orderData) => {
    // Validate that poNumber is provided and not empty
    if (!orderData.poNumber || orderData.poNumber.trim() === '') {
      throw new Error('Purchase order number is required and cannot be empty');
    }
    
    return executeTransaction(async (connection) => {
      // Calculate totals
      const { subtotal, taxAmount, totalAmount } = calculateTotals(
        orderData.items,
        orderData.taxRate,
        orderData.shippingCost
      );

      // Extract supplier ID correctly
      let supplierId = null;
      if (orderData.supplier) {
        // Check if supplier is an object or a direct ID
        supplierId = typeof orderData.supplier === 'object' ? 
          (orderData.supplier.Supplier_ID || orderData.supplier.id) : 
          orderData.supplier;
      }

      // Insert purchase order
      const [result] = await connection.query(
        `INSERT INTO purchase_orders (
          po_number, order_date, expected_delivery_date, supplier_id,
          subtotal, tax_rate, tax_amount, shipping_cost, total_amount,
          status, notes, created_by, created_by_name,
          fulfillment_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderData.poNumber,
          orderData.orderDate || new Date(),
          orderData.expectedDeliveryDate,
          supplierId,
          subtotal,
          orderData.taxRate || 0,
          taxAmount,
          orderData.shippingCost || 0,
          totalAmount,
          orderData.status || 'draft',
          orderData.notes,
          orderData.createdBy,
          orderData.createdByName,
          'not_fulfilled'
        ]
      );

      const orderId = result.insertId;

      // Insert order items
      for (const item of orderData.items) {
        await connection.query(
          `INSERT INTO purchase_order_items (
            purchase_order_id, product_id, product_name, 
            sku, description, quantity, unit_price, total,
            status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.productId,
            item.productName,
            item.sku || null,
            item.description || null,
            item.quantity,
            item.unitPrice,
            item.total,
            'pending'
          ]
        );
      }

      // Return the created order
      return PurchaseOrder.findById(orderId);
    });
  },

  // Update a purchase order
  update: async (id, orderData) => {
    return executeTransaction(async (connection) => {
      // If items are provided, recalculate totals
      let subtotal, taxAmount, totalAmount;
      
      if (orderData.items) {
        const totals = calculateTotals(
          orderData.items,
          orderData.taxRate,
          orderData.shippingCost
        );
        subtotal = totals.subtotal;
        taxAmount = totals.taxAmount;
        totalAmount = totals.totalAmount;
      }

      // Update purchase order
      const updateFields = [];
      const updateParams = [];

      if (orderData.poNumber) {
        updateFields.push('po_number = ?');
        updateParams.push(orderData.poNumber);
      }

      if (orderData.orderDate) {
        updateFields.push('order_date = ?');
        updateParams.push(orderData.orderDate);
      }

      if (orderData.expectedDeliveryDate !== undefined) {
        updateFields.push('expected_delivery_date = ?');
        updateParams.push(orderData.expectedDeliveryDate);
      }

      if (orderData.supplier) {
        updateFields.push('supplier_id = ?');
        updateParams.push(typeof orderData.supplier === "object" ? orderData.supplier.Supplier_ID : orderData.supplier);
      }

      if (subtotal !== undefined) {
        updateFields.push('subtotal = ?');
        updateParams.push(subtotal);
      }

      if (orderData.taxRate !== undefined) {
        updateFields.push('tax_rate = ?');
        updateParams.push(orderData.taxRate);
      }

      if (taxAmount !== undefined) {
        updateFields.push('tax_amount = ?');
        updateParams.push(taxAmount);
      }

      if (orderData.shippingCost !== undefined) {
        updateFields.push('shipping_cost = ?');
        updateParams.push(orderData.shippingCost);
      }

      if (totalAmount !== undefined) {
        updateFields.push('total_amount = ?');
        updateParams.push(totalAmount);
      }

      if (orderData.status) {
        updateFields.push('status = ?');
        updateParams.push(orderData.status);
        
        // Set appropriate date fields based on status
        if (orderData.status === 'sent' && !orderData.sentDate) {
          updateFields.push('sent_date = ?');
          updateParams.push(new Date());
        }
        
        if (orderData.status === 'confirmed' && !orderData.confirmedDate) {
          updateFields.push('confirmed_date = ?');
          updateParams.push(new Date());
          
          // Add confirmed_by if available
          if (orderData.confirmedBy) {
            updateFields.push('confirmed_by = ?');
            updateParams.push(orderData.confirmedBy);
          }
          
          // Add confirm_notes if available
          if (orderData.confirmNotes) {
            updateFields.push('confirm_notes = ?');
            updateParams.push(orderData.confirmNotes);
          }
          
          // Add payment_terms if available
          if (orderData.paymentTerms) {
            updateFields.push('payment_terms = ?');
            updateParams.push(orderData.paymentTerms);
          }
          
          // Add received_date if available
          if (orderData.receivedDate) {
            updateFields.push('received_date = ?');
            updateParams.push(orderData.receivedDate);
          }
        }
        
        if (orderData.status === 'cancelled') {
          updateFields.push('canceled_at = ?');
          updateParams.push(new Date());
          
          // Add canceled_by if available
          if (orderData.canceledBy) {
            updateFields.push('canceled_by = ?');
            updateParams.push(orderData.canceledBy);
          }
          
          // Add cancellation_reason if available
          if (orderData.cancellationReason) {
            updateFields.push('cancellation_reason = ?');
            updateParams.push(orderData.cancellationReason);
          }
        }
      }

      if (orderData.notes !== undefined) {
        updateFields.push('notes = ?');
        updateParams.push(orderData.notes);
      }

      if (orderData.sentTo) {
        updateFields.push('sent_to = ?');
        updateParams.push(orderData.sentTo);
      }

      // Update partial fulfillment status if provided
      if (orderData.isPartiallyFulfilled !== undefined) {
        updateFields.push('is_partially_fulfilled = ?');
        updateParams.push(orderData.isPartiallyFulfilled);
      }

      // Update fulfillment status if provided
      if (orderData.fulfillmentStatus) {
        updateFields.push('fulfillment_status = ?');
        updateParams.push(orderData.fulfillmentStatus);
      }

      // Always update the updated_at timestamp
      updateFields.push('updated_at = ?');
      updateParams.push(new Date());
      
      // Track who updated the record if provided
      if (orderData.updatedBy) {
        updateFields.push('updated_by = ?');
        updateParams.push(orderData.updatedBy);
      }

      // Add ID as the last parameter
      updateParams.push(id);

      if (updateFields.length > 0) {
        await connection.query(
          `UPDATE purchase_orders SET ${updateFields.join(', ')} WHERE id = ?`,
          updateParams
        );
      }

      // If items are provided, delete existing items and insert new ones
      if (orderData.items) {
        // Delete existing items
        await connection.query(
          'DELETE FROM purchase_order_items WHERE purchase_order_id = ?',
          [id]
        );

        // Insert new items
        for (const item of orderData.items) {
          await connection.query(
            `INSERT INTO purchase_order_items (
              purchase_order_id, product_id, product_name, 
              sku, description, quantity, unit_price, total, 
              received_quantity, received_at, received_by, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              item.productId,
              item.productName,
              item.sku || null,
              item.description || null,
              item.quantity,
              item.unitPrice,
              item.total,
              item.receivedQuantity || null,
              item.receivedAt || null,
              item.receivedBy || null,
              item.status || 'pending'
            ]
          );
        }
      }

      // Return the updated order
      return PurchaseOrder.findById(id);
    });
  },

  // Record partial receipt of items for a purchase order
  recordItemReceipt: async (id, itemUpdates, userId) => {
    return executeTransaction(async (connection) => {
      // Get current purchase order
      const [currentPO] = await connection.query(
        'SELECT * FROM purchase_orders WHERE id = ?',
        [id]
      );
      
      if (!currentPO || currentPO.length === 0) {
        throw new Error('Purchase order not found');
      }
      
      const po = currentPO[0];
      
      // Get all items for this purchase order
      const orderItems = await connection.query(
        'SELECT * FROM purchase_order_items WHERE purchase_order_id = ?',
        [id]
      );
      
      // Track counts to determine overall fulfillment status
      let totalItems = orderItems.length;
      let fulfilledItems = 0;
      let partialItems = 0;
      
      // Process each item update
      for (const update of itemUpdates) {
        const { itemId, receivedQuantity } = update;
        
        // Find the matching item
        const itemIndex = orderItems.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) {
          continue; // Skip if item not found
        }
        
        const item = orderItems[itemIndex];
        const orderQuantity = parseInt(item.quantity, 10);
        const newReceivedQuantity = parseInt(receivedQuantity, 10);
        
        // Determine item status
        let itemStatus = 'pending';
        if (newReceivedQuantity >= orderQuantity) {
          itemStatus = 'complete';
          fulfilledItems++;
        } else if (newReceivedQuantity > 0) {
          itemStatus = 'partial';
          partialItems++;
        }
        
        // Update the item
        await connection.query(
          `UPDATE purchase_order_items 
           SET received_quantity = ?, 
               received_at = NOW(), 
               received_by = ?, 
               status = ? 
           WHERE id = ?`,
          [newReceivedQuantity, userId, itemStatus, itemId]
        );
      }
      
      // Determine overall fulfillment status
      let fulfillmentStatus = 'not_fulfilled';
      if (fulfilledItems === totalItems) {
        fulfillmentStatus = 'fully_fulfilled';
      } else if (fulfilledItems > 0 || partialItems > 0) {
        fulfillmentStatus = 'partially_fulfilled';
      }
      
      // Update the PO's fulfillment status
      await connection.query(
        `UPDATE purchase_orders 
         SET fulfillment_status = ?, 
             is_partially_fulfilled = ?, 
             updated_at = NOW(),
             updated_by = ? 
         WHERE id = ?`,
        [fulfillmentStatus, fulfillmentStatus !== 'not_fulfilled', userId, id]
      );
      
      // Return the updated purchase order
      return PurchaseOrder.findById(id);
    });
  },

  // Delete a purchase order
  delete: async (id) => {
    return executeTransaction(async (connection) => {
      // Delete order items first
      await connection.query(
        'DELETE FROM purchase_order_items WHERE purchase_order_id = ?',
        [id]
      );

      // Delete the purchase order
      await connection.query(
        'DELETE FROM purchase_orders WHERE id = ?',
        [id]
      );

      return { id };
    });
  }
};

module.exports = PurchaseOrder; 