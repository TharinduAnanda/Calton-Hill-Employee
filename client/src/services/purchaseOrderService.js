import instance from '../utils/axiosConfig';

const createPurchaseOrder = async (orderData) => {
  try {
    const response = await instance.post('/api/purchase-orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating purchase order:', error);
    throw error;
  }
};

const getPurchaseOrders = async (filters = {}) => {
  try {
    const response = await instance.get('/api/purchase-orders', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    throw error;
  }
};

const getPurchaseOrderById = async (id) => {
  try {
    const response = await instance.get(`/api/purchase-orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching purchase order with id ${id}:`, error);
    throw error;
  }
};

const updatePurchaseOrder = async (id, orderData) => {
  try {
    const response = await instance.put(`/api/purchase-orders/${id}`, orderData);
    return response.data;
  } catch (error) {
    console.error(`Error updating purchase order with id ${id}:`, error);
    throw error;
  }
};

const deletePurchaseOrder = async (id) => {
  try {
    const response = await instance.delete(`/api/purchase-orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting purchase order with id ${id}:`, error);
    throw error;
  }
};

const sendPurchaseOrderEmail = async (id, emailData) => {
  try {
    const response = await instance.post(`/api/purchase-orders/${id}/send-email`, emailData);
    return response.data;
  } catch (error) {
    console.error(`Error sending purchase order ${id} via email:`, error);
    throw error;
  }
};

const generatePDF = async (id, options = {}) => {
  try {
    const response = await instance.get(`/api/purchase-orders/${id}/pdf`, {
      params: options,
      responseType: 'blob'
    });
    
    // Create a blob URL and open it in a new tab
    const file = new Blob([response.data], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(file);
    
    // Return the blob URL for the caller to use
    return {
      blobUrl: fileURL,
      fileName: `purchase-order-${id}.pdf`
    };
  } catch (error) {
    console.error(`Error generating PDF for purchase order ${id}:`, error);
    throw error;
  }
};

const generatePONumber = async () => {
  try {
    const response = await instance.get('/api/purchase-orders/generate-po-number');
    return response.data.poNumber;
  } catch (error) {
    console.error('Error generating PO number:', error);
    throw error;
  }
};

const updatePurchaseOrderStatus = async (id, status) => {
  try {
    // Use PUT instead of PATCH to avoid CORS issues
    const response = await instance.put(`/api/purchase-orders/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating purchase order status for id ${id}:`, error);
    throw error;
  }
};

/**
 * Update inventory quantities when a purchase order is received
 * @param {number|string} productId - The ID of the product to update
 * @param {number} quantity - The quantity to add to inventory
 */
const updateInventoryOnReceive = async (productId, quantity) => {
  try {
    const response = await instance.post('/api/inventory/receive', {
      product_id: productId,
      quantity: quantity
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating inventory for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Record received quantities for purchase order items (partial fulfillment)
 * @param {number|string} id - The purchase order ID
 * @param {Array} items - Array of items with received quantities
 * @returns {Promise<Object>} Updated purchase order data
 */
const receiveItems = async (id, items) => {
  try {
    const response = await instance.put(`/api/purchase-orders/${id}/receive-items`, { items });
    return response.data;
  } catch (error) {
    console.error(`Error recording received items for purchase order ${id}:`, error);
    throw error;
  }
};

/**
 * Update inventory quantities when a purchase order is received (partial fulfillment)
 * @param {number|string} productId - The ID of the product to update
 * @param {number} actualQuantity - The actual quantity received
 * @param {number} orderedQuantity - The originally ordered quantity
 */
const updateInventoryWithReceivedQuantity = async (productId, actualQuantity, orderedQuantity) => {
  try {
    const response = await instance.post('/api/inventory/receive-partial', {
      product_id: productId,
      actual_quantity: actualQuantity,
      ordered_quantity: orderedQuantity
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating inventory with received quantity for product ${productId}:`, error);
    throw error;
  }
};

const purchaseOrderService = {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
  sendPurchaseOrderEmail,
  generatePDF,
  generatePONumber,
  updatePurchaseOrderStatus,
  updateInventoryOnReceive,
  receiveItems,
  updateInventoryWithReceivedQuantity
};

export default purchaseOrderService; 