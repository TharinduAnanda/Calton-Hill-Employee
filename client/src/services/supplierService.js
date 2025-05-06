import axios from '../utils/axiosConfig';

const API_URL = '/api/suppliers';

// Get all suppliers
const getSuppliers = async () => {
  try {
    console.log('Fetching suppliers...');
    const response = await axios.get(API_URL);
    console.log('Suppliers API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    throw error;
  }
};

// Get supplier by ID
const getSupplierById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching supplier #${id}:`, error);
    throw error;
  }
};

// Create a new supplier
const createSupplier = async (supplierData) => {
  try {
    const response = await axios.post(API_URL, supplierData);
    return response.data;
  } catch (error) {
    console.error('Error creating supplier:', error);
    throw error;
  }
};

// Update a supplier
const updateSupplier = async (id, supplierData, config = {}) => {
  try {
    console.log(`Sending update request for supplier #${id}...`);
    const response = await axios.put(`${API_URL}/${id}`, supplierData, config);
    console.log(`Update successful for supplier #${id}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating supplier #${id}:`, error);
    throw error;
  }
};

// Delete a supplier
const deleteSupplier = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting supplier #${id}:`, error);
    throw error;
  }
};

// Get supplier's inventory
const getSupplierInventory = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}/inventory`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching inventory for supplier #${id}:`, error);
    throw error;
  }
};

// Export as named exports
export {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierInventory
};

// Also provide a default export for backward compatibility
const supplierService = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierInventory
};

export default supplierService;