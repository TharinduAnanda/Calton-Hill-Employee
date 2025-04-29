// src/services/customerService.js
import axios from 'axios';

// Define the base URL for the API
const API_URL = '/api';

/**
 * Get all customers
 * @returns {Promise} Promise object that resolves to the response data
 */
export const getAllCustomers = async () => {
  try {
    const response = await axios.get(`${API_URL}/customers`);
    return response;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

/**
 * Get a customer by ID
 * @param {string} id - Customer ID
 * @returns {Promise} Promise object that resolves to the response data
 */
export const getCustomerById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/customers/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching customer with id ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new customer
 * @param {Object} customerData - Customer data
 * @returns {Promise} Promise object that resolves to the response data
 */
export const createCustomer = async (customerData) => {
  try {
    const response = await axios.post(`${API_URL}/customers`, customerData);
    return response;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

/**
 * Update a customer
 * @param {string} id - Customer ID
 * @param {Object} customerData - Updated customer data
 * @returns {Promise} Promise object that resolves to the response data
 */
export const updateCustomer = async (id, customerData) => {
  try {
    const response = await axios.put(`${API_URL}/customers/${id}`, customerData);
    return response;
  } catch (error) {
    console.error(`Error updating customer with id ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a customer
 * @param {string} id - Customer ID
 * @returns {Promise} Promise object that resolves to the response data
 */
export const deleteCustomer = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/customers/${id}`);
    return response;
  } catch (error) {
    console.error(`Error deleting customer with id ${id}:`, error);
    throw error;
  }
};

/**
 * Get customer orders
 * @param {string} id - Customer ID
 * @returns {Promise} Promise object that resolves to the response data
 */
export const getCustomerOrders = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/customers/${id}/orders`);
    return response;
  } catch (error) {
    console.error(`Error fetching orders for customer with id ${id}:`, error);
    throw error;
  }
};