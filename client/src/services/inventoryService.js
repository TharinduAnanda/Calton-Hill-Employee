import axios from '../utils/axiosConfig';

const API_URL = '/api/inventory';

export const getInventoryItems = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch inventory items' };
  }
};

export const getInventoryItemById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch inventory item' };
  }
};

export const createInventoryItem = async (itemData) => {
  try {
    const response = await axios.post(API_URL, itemData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create inventory item' };
  }
};

export const updateInventoryItem = async (id, itemData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, itemData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update inventory item' };
  }
};

export const deleteInventoryItem = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete inventory item' };
  }
};

export const adjustInventoryQuantity = async (id, adjustment) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}/quantity`, { adjustment });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to adjust inventory quantity' };
  }
};