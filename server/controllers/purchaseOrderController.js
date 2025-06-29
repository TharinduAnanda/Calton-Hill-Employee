const PurchaseOrder = require('../models/PurchaseOrder');
const fs = require('fs');
const path = require('path');
const { executeQuery } = require('../config/db');
const { createPurchaseOrderPdf } = require('../utils/pdfGenerator');
const { sendPurchaseOrderEmail } = require('../services/emailService');

/**
 * Generate a unique PO number
 * @returns {Promise<string>} A unique PO number
 */
const generateUniquePONumber = async () => {
  try {
    // Generate a 6-digit random number
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const basePoNumber = `PO-${randomNum}`;
    
    // Check if this PO number already exists
    const existingPO = await executeQuery(
      'SELECT 1 FROM purchase_orders WHERE po_number = ?', 
      [basePoNumber]
    );
    
    // If it exists, recursively try again with a new random number
    if (existingPO && existingPO.length > 0) {
      return generateUniquePONumber();
    }
    
    return basePoNumber;
  } catch (error) {
    console.error('Error generating unique PO number:', error);
    // Fallback with timestamp to ensure uniqueness
    return `PO-${Date.now().toString().substring(3, 9)}`;
  }
};

// Get all purchase orders
exports.getAllPurchaseOrders = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { status, supplier, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (supplier) {
      filter.supplier = supplier;
    }
    
    // Date range filter
    if (startDate || endDate) {
      filter.orderDate = {};
      if (startDate) {
        filter.orderDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.orderDate.$lte = new Date(endDate);
      }
    }
    
    const purchaseOrders = await PurchaseOrder.findAll(filter);
    
    res.status(200).json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get purchase order by ID
exports.getPurchaseOrderById = async (req, res) => {
  try {
    const id = req.params.id;
    
    // If the ID is 'generate-po-number', return 404 to prevent route conflicts
    if (id === 'generate-po-number') {
      return res.status(404).json({ message: 'Invalid purchase order ID' });
    }
    
    const purchaseOrder = await PurchaseOrder.findById(id);
    
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    
    // Log raw data to help debugging
    console.log("Raw PO from database:", JSON.stringify(purchaseOrder, null, 2));
    console.log("Raw items from database:", JSON.stringify(purchaseOrder.items, null, 2));
    
    // Create a structured and consistent response format
    const formattedPurchaseOrder = {
      id: purchaseOrder.id,
      poNumber: purchaseOrder.po_number,
      orderDate: purchaseOrder.order_date,
      expectedDeliveryDate: purchaseOrder.expected_delivery_date,
      supplier_id: purchaseOrder.supplier_id,
      supplier: (() => {
        if (!purchaseOrder.supplier) return null;
        
        // Extract supplier info
        const supplier = {
          Supplier_ID: purchaseOrder.supplier.id || purchaseOrder.supplier_id,
          Name: purchaseOrder.supplier.name || purchaseOrder.supplierName,
          Email: purchaseOrder.supplier.email || purchaseOrder.supplierEmail,
          Phone_Number: purchaseOrder.supplier.phone || purchaseOrder.supplierPhone,
          Contact_Person: purchaseOrder.supplier.contactPerson
        };

        // Format address the same way as in supplierController
        const addressParts = [
          purchaseOrder.street, 
          purchaseOrder.city,
          purchaseOrder.state,
          purchaseOrder.zipCode,
          purchaseOrder.country
        ].filter(Boolean);
        
        const formattedAddress = addressParts.length > 0 ? addressParts.join(', ') : null;
        
        return {
          ...supplier,
          address: {
            street: purchaseOrder.street || '',
            city: purchaseOrder.city || '',
            state: purchaseOrder.state || '',
            zipCode: purchaseOrder.zipCode || '',
            country: purchaseOrder.country || ''
          },
          street: purchaseOrder.street || '',
          city: purchaseOrder.city || '', 
          state: purchaseOrder.state || '',
          zipCode: purchaseOrder.zipCode || '',
          country: purchaseOrder.country || '',
          formattedAddress
        };
      })(),
      subtotal: parseFloat(purchaseOrder.subtotal || 0),
      taxRate: parseFloat(purchaseOrder.tax_rate || 0),
      taxAmount: parseFloat(purchaseOrder.tax_amount || 0),
      shippingCost: parseFloat(purchaseOrder.shipping_cost || 0),
      totalAmount: parseFloat(purchaseOrder.total_amount || 0),
      status: purchaseOrder.status || 'draft',
      notes: purchaseOrder.notes || '',
      createdAt: purchaseOrder.created_at,
      createdBy: purchaseOrder.created_by,
      createdByName: purchaseOrder.created_by_name,
      updatedAt: purchaseOrder.updated_at,
      updatedBy: purchaseOrder.updated_by,
      sentDate: purchaseOrder.sent_date,
      sentTo: purchaseOrder.sent_to,
      confirmedDate: purchaseOrder.confirmed_date,
      confirmedBy: purchaseOrder.confirmed_by,
      confirmNotes: purchaseOrder.confirm_notes,
      paymentTerms: purchaseOrder.payment_terms,
      canceledBy: purchaseOrder.canceled_by,
      canceledAt: purchaseOrder.canceled_at,
      cancellationReason: purchaseOrder.cancellation_reason,
      receivedDate: purchaseOrder.received_date
    };
    
    // Format items to ensure consistent field names across API
    if (purchaseOrder.items && Array.isArray(purchaseOrder.items)) {
      formattedPurchaseOrder.items = purchaseOrder.items.map(item => {
        // Make sure we calculate total if it's missing
        const quantity = parseInt(item.quantity || 0, 10);
        const unitPrice = parseFloat(item.unit_price || 0);
        const total = item.total ? parseFloat(item.total) : quantity * unitPrice;

        return {
          id: item.id,
          productId: item.product_id,
          productName: item.productName || item.product_name || "Unknown Product",
          sku: item.sku || '',
          description: item.description || '',
          quantity: quantity,
          unitPrice: unitPrice,
          total: total
        };
      });
    } else {
      formattedPurchaseOrder.items = [];
    }
    
    // Print the formatted PO for debugging
    console.log('Formatted PO being sent to client:', JSON.stringify(formattedPurchaseOrder, null, 2));
    
    res.status(200).json(formattedPurchaseOrder);
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new purchase order
exports.createPurchaseOrder = async (req, res) => {
  try {
    // Set creator info if available
    if (req.user) {
      req.body.createdBy = req.user.id;
      
      // Build the creator name based on available user fields
      let creatorName = '';
      if (req.user.firstName) {
        creatorName += req.user.firstName;
      }
      if (req.user.lastName) {
        creatorName += (creatorName ? ' ' : '') + req.user.lastName;
      }
      
      // If no name parts are available, use email or username as fallback
      if (!creatorName) {
        creatorName = req.user.email || req.user.username || `User #${req.user.id}`;
      }
      
      req.body.createdByName = creatorName;
    } else {
      console.warn('Warning: Creating purchase order without user information');
    }
    
    // Always generate a unique PO number regardless of what was sent
    const poNumber = await generateUniquePONumber();
    
    // First, check and delete any records with empty PO numbers
    await executeQuery('DELETE FROM purchase_orders WHERE po_number = ""');
    
    // Create the data object with the generated PO number
    const orderData = {
      ...req.body,
      poNumber: poNumber
    };
    
    // Create new purchase order
    const savedPurchaseOrder = await PurchaseOrder.create(orderData);
    
    // Ensure savedPurchaseOrder is not null before accessing its properties
    if (savedPurchaseOrder && savedPurchaseOrder.status === 'confirmed') {
      await updateInventoryLevels(savedPurchaseOrder);
    }
    
    res.status(201).json(savedPurchaseOrder);
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update purchase order
exports.updatePurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    
    // Check if status is being changed to confirmed
    const wasConfirmedBefore = purchaseOrder.status === 'confirmed';
    const isConfirmedNow = req.body.status === 'confirmed';
    const isCancelledNow = req.body.status === 'cancelled';
    
    // Remove poNumber from the request body to prevent changes
    const updateData = { ...req.body };
    delete updateData.poNumber;
    
    // Add user information for tracking who made changes
    if (req.user) {
      // Always track who updated the record
      updateData.updatedBy = req.user.id;
      
      if (isConfirmedNow && !wasConfirmedBefore) {
        updateData.confirmedBy = req.user.id;
        
        // Make sure we have payment terms
        if (!updateData.paymentTerms) {
          return res.status(400).json({ 
            message: 'Payment terms are required when confirming a purchase order'
          });
        }
        
        // Add confirmation notes if provided
        if (req.body.confirmNotes) {
          updateData.confirmNotes = req.body.confirmNotes;
        }
      }
      
      if (isCancelledNow) {
        updateData.canceledBy = req.user.id;
        
        // Make sure we have a cancellation reason
        if (!updateData.cancellationReason) {
          return res.status(400).json({ 
            message: 'A reason is required when cancelling a purchase order'
          });
        }
      }
    }
    
    // Update the purchase order
    const updatedPurchaseOrder = await PurchaseOrder.update(req.params.id, updateData);
    
    // If status is changing to confirmed, update inventory levels
    if (!wasConfirmedBefore && isConfirmedNow) {
      await updateInventoryLevels(updatedPurchaseOrder);
    }
    
    res.status(200).json(updatedPurchaseOrder);
  } catch (error) {
    console.error('Error updating purchase order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete purchase order
exports.deletePurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    
    // Don't allow deletion of confirmed purchase orders
    if (purchaseOrder.status === 'confirmed') {
      return res.status(400).json({ 
        message: 'Cannot delete a confirmed purchase order'
      });
    }
    
    await PurchaseOrder.delete(req.params.id);
    
    res.status(200).json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate PDF for purchase order
exports.generatePDF = async (req, res) => {
  try {
    // Skip authentication - this endpoint is public
    console.log('Generating PDF for PO ID:', req.params.id);
    
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    
    // Create PDF using the utility function
    const pdfBuffer = await createPurchaseOrderPdf(purchaseOrder);
    
    // Get PO Number with fallbacks
    const poNumber = purchaseOrder.poNumber || purchaseOrder.po_number || 'order';
    
    // Set all necessary headers for cross-origin PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=PO-${poNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Simple CORS headers for direct download access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Expose-Headers', '*');
    
    // Send the PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send purchase order email
exports.sendEmail = async (req, res) => {
  try {
    const { recipientEmail, subject, message } = req.body || {};
    const id = req.params?.id;
    
    // Validate input
    if (!recipientEmail) {
      return res.status(400).json({ message: 'Recipient email is required' });
    }
    
    if (!id) {
      return res.status(400).json({ message: 'Purchase order ID is required' });
    }
    
    // Get purchase order
    let purchaseOrder;
    try {
      purchaseOrder = await PurchaseOrder.findById(id);
    } catch (dbError) {
      console.error('Database error when fetching purchase order:', dbError);
      return res.status(500).json({ 
        message: 'Error retrieving purchase order from database', 
        error: dbError.message 
      });
    }
    
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    
    console.log('Retrieved purchase order for email:', JSON.stringify({
      id: purchaseOrder.id,
      po_number: purchaseOrder.po_number,
      poNumber: purchaseOrder.poNumber
    }, null, 2));
    
    // Send email using the emailService
    const emailResult = await sendPurchaseOrderEmail(
      purchaseOrder,
      recipientEmail,
      subject,
      message
    );
    
    if (!emailResult.success) {
      return res.status(500).json({
        message: 'Error sending email',
        error: emailResult.error
      });
    }
    
    // Update purchase order status to sent and record email details
    let updatedOrder;
    try {
      updatedOrder = await PurchaseOrder.update(id, {
        status: 'sent',
        sentDate: new Date(),
        sentTo: recipientEmail
      });
    } catch (updateError) {
      console.error('Error updating purchase order after email:', updateError);
      // We still return 200 because the email was sent successfully
    }
    
    res.status(200).json({ 
      message: 'Email sent successfully', 
      messageId: emailResult?.messageId,
      purchaseOrder: updatedOrder || purchaseOrder
    });
  } catch (error) {
    console.error('Error in email sending process:', error);
    res.status(500).json({ 
      message: 'Error sending email', 
      error: error.message || 'Unknown error' 
    });
  }
};

// Helper function to update inventory levels when a purchase order is confirmed
const updateInventoryLevels = async (purchaseOrder) => {
  try {
    // Ensure we have a valid purchase order with items
    if (!purchaseOrder || !Array.isArray(purchaseOrder.items)) {
      console.warn('Invalid purchase order or missing items array:', purchaseOrder);
      return; // Exit early if invalid data
    }
    
    const items = purchaseOrder.items || [];
    
    for (const item of items) {
      // Skip items with invalid product ID or quantity
      const productId = item.productId || item.product_id;
      const quantity = parseInt(item.quantity, 10);
      
      if (!productId || isNaN(quantity) || quantity <= 0) {
        console.warn('Skipping invalid item:', item);
        continue;
      }
      
      try {
        // Check if inventory record exists
        const inventoryRecords = await executeQuery(
          'SELECT * FROM inventory WHERE Product_ID = ?',
          [productId]
        );
        
        if (inventoryRecords && inventoryRecords.length > 0) {
          // Update existing inventory record
          const currentStock = parseInt(inventoryRecords[0].Stock_Level || 0, 10);
          const newStock = currentStock + quantity;
          
          await executeQuery(
            'UPDATE inventory SET Stock_Level = ?, Last_Updated = NOW() WHERE Product_ID = ?',
            [newStock, productId]
          );
          
          // Also update the stock level in the product table
          await executeQuery(
            'UPDATE product SET Stock_Level = ? WHERE Product_ID = ?',
            [newStock, productId]
          );
        } else {
          // Create a new inventory record
          await executeQuery(
            'INSERT INTO inventory (Product_ID, Stock_Level, reorder_level, optimal_level) VALUES (?, ?, 10, 50)',
            [productId, quantity]
          );
          
          // Update the stock level in the product table
          await executeQuery(
            'UPDATE product SET Stock_Level = ? WHERE Product_ID = ?',
            [quantity, productId]
          );
        }
        
        // Get current stock for stock movement record
        const [product] = await executeQuery(
          'SELECT Stock_Level FROM product WHERE Product_ID = ?',
          [productId]
        );
        
        const previousQuantity = product ? parseInt(product.Stock_Level, 10) || 0 : 0;
        const newQuantity = previousQuantity + quantity;
        
        // Record the stock movement
        await executeQuery(
          `INSERT INTO stock_movement 
           (product_id, quantity_change, movement_type, reference_id, notes, 
            previous_quantity, new_quantity)
           VALUES (?, ?, 'PURCHASE', ?, ?, ?, ?)`,
          [
            productId, 
            quantity, 
            purchaseOrder.poNumber || `PO-${Date.now()}`, 
            `Purchase Order #${purchaseOrder.poNumber || 'New'}`,
            previousQuantity,
            newQuantity
          ]
        );
      } catch (itemError) {
        // Log error but continue processing other items
        console.error(`Error updating inventory for product ${productId}:`, itemError);
      }
    }
    
    console.log(`Inventory updated for purchase order #${purchaseOrder.poNumber || 'New'}`);
  } catch (error) {
    console.error('Error updating inventory:', error);
    // Don't throw error to prevent PO creation failure
    // Log error but allow the purchase order to be created
  }
};

// Generate a PO number without creating an order
exports.generatePONumber = async (req, res) => {
  try {
    const poNumber = await generateUniquePONumber();
    res.status(200).json({ poNumber });
  } catch (error) {
    console.error('Error generating PO number:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Test PDF access with a simple HTML page
exports.testPdfAccess = async (req, res) => {
  try {
    // Get all PO IDs for testing
    const purchaseOrders = await PurchaseOrder.findAll({});
    
    // Generate simple HTML with links to test PDFs
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PDF Download Test</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1976d2; }
          .po-link { margin: 10px 0; padding: 8px; border: 1px solid #ddd; border-radius: 4px; display: block; }
          .po-link:hover { background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        <h1>Purchase Order PDF Test Links</h1>
        <p>Click on any link to test direct PDF download:</p>
        ${purchaseOrders.map(po => {
          const poNumber = po.po_number || po.poNumber || 'N/A';
          const poId = po.id;
          return `<a class="po-link" href="/api/purchase-orders/${poId}/pdf" target="_blank">Download PO #${poNumber} (ID: ${poId})</a>`;
        }).join('')}
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error generating test page:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update a purchase order's status
 * @route PUT /api/purchase-orders/:id/status
 */
exports.updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate required fields
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // Validate status value - add partially_fulfilled as a valid status
    const validStatuses = ['draft', 'pending', 'sent', 'partially_fulfilled', 'confirmed', 'canceled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    console.log(`Updating purchase order ${id} status to: ${status}`);
    
    // Get the current purchase order
    const [currentPO] = await executeQuery(
      'SELECT * FROM purchase_orders WHERE id = ?',
      [id]
    );
    
    if (!currentPO || currentPO.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }
    
    // Define status-specific fields to update
    let additionalFields = '';
    let additionalParams = [];
    
    if (status === 'confirmed') {
      additionalFields = ', confirmed_date = NOW(), confirmed_by = ?';
      additionalParams.push(req.user?.id || null);
      
      // Add payment terms if provided
      if (req.body.paymentTerms) {
        additionalFields += ', payment_terms = ?';
        additionalParams.push(req.body.paymentTerms);
      }
      
      // Add confirmation notes if provided
      if (req.body.confirmNotes) {
        additionalFields += ', confirm_notes = ?';
        additionalParams.push(req.body.confirmNotes);
      }
    } else if (status === 'sent') {
      additionalFields = ', sent_date = NOW()';
    } else if (status === 'partially_fulfilled') {
      additionalFields = ', partial_fulfillment_date = NOW()';
      
      // Add notes about partial fulfillment if provided
      if (req.body.partialFulfillmentNotes) {
        additionalFields += ', partial_fulfillment_notes = ?';
        additionalParams.push(req.body.partialFulfillmentNotes);
      }
    } else if (status === 'canceled') {
      additionalFields = ', canceled_at = NOW(), canceled_by = ?';
      additionalParams.push(req.user?.id || null);
      
      // Add cancellation reason if provided
      if (req.body.cancellationReason) {
        additionalFields += ', cancellation_reason = ?';
        additionalParams.push(req.body.cancellationReason);
      }
    }
    
    // Update the purchase order status
    await executeQuery(
      `UPDATE purchase_orders SET status = ?${additionalFields}, updated_at = NOW() WHERE id = ?`,
      [status, ...additionalParams, id]
    );
    
    // Get the updated purchase order
    const [updatedPO] = await executeQuery(
      'SELECT * FROM purchase_orders WHERE id = ?',
      [id]
    );
    
    return res.status(200).json({
      success: true,
      message: `Purchase order status updated to ${status}`,
      data: updatedPO[0]
    });
    
  } catch (error) {
    console.error('Error updating purchase order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating purchase order status',
      error: error.message
    });
  }
};

/**
 * Record partial receipt of items for a purchase order
 * @route PUT /api/purchase-orders/:id/receive-items
 */
exports.receiveItems = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item with received quantity is required'
      });
    }
    
    // Validate each item has an ID and received quantity
    for (const item of items) {
      if (!item.itemId || item.receivedQuantity === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Each item must include itemId and receivedQuantity'
        });
      }
      
      if (isNaN(item.receivedQuantity) || item.receivedQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Received quantity must be a non-negative number'
        });
      }
    }
    
    // Process the item updates and update inventory
    const updatedPO = await PurchaseOrder.recordItemReceipt(id, items, req.user?.id || null);
    
    // Update inventory for each received item
    try {
      for (const item of items) {
        if (item.receivedQuantity > 0) {
          const itemDetails = updatedPO.items.find(i => i.id === item.itemId);
          if (itemDetails && itemDetails.product_id) {
            // Call the inventory update function
            await executeQuery(
              'INSERT INTO stock_movement (product_id, quantity_change, movement_type, reference_id, notes) VALUES (?, ?, ?, ?, ?)',
              [
                itemDetails.product_id, 
                item.receivedQuantity, 
                'PURCHASE_RECEIVE', 
                updatedPO.po_number, 
                `Received from purchase order #${updatedPO.po_number}`
              ]
            );
            
            // Update inventory levels
            await executeQuery(
              'UPDATE inventory SET Stock_Level = Stock_Level + ? WHERE Product_ID = ?',
              [item.receivedQuantity, itemDetails.product_id]
            );
          }
        }
      }
    } catch (inventoryError) {
      console.error('Error updating inventory:', inventoryError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update inventory quantities',
        error: inventoryError.message
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Purchase order items received successfully',
      data: updatedPO
    });
    
  } catch (error) {
    console.error('Error receiving purchase order items:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error receiving purchase order items',
      error: error.message
    });
  }
}; 