import axios from '../utils/axiosConfig';

const API_URL = '/api/suppliers';

export const getSuppliers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch suppliers' };
  }
};

export const getSupplierById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch supplier' };
  }
};

export const createSupplier = async (supplierData) => {
  try {
    const response = await axios.post(API_URL, supplierData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create supplier' };
  }
};

export const updateSupplier = async (id, supplierData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, supplierData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update supplier' };
  }
};

export const deleteSupplier = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete supplier' };
  }
};

export const getSupplierProducts = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}/products`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch supplier products' };
  }
};