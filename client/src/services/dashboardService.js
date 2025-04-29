// src/services/dashboardService.js
import axiosInstance from '../utils/axiosConfig';

/**
 * Fetch all dashboard data including summary metrics, recent orders, and low stock items
 * @returns {Promise<Object>} Dashboard data
 */
export const getDashboardData = async () => {
  try {
    const response = await axiosInstance.get('/api/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

/**
 * Fetch summary metrics for the dashboard
 * @returns {Promise<Object>} Summary metrics
 */
export const getDashboardSummary = async () => {
  try {
    const response = await axiosInstance.get('/api/dashboard/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw error;
  }
};

/**
 * Fetch sales data for a specific time period
 * @param {string} period - Time period ('week', 'month', 'quarter', 'year')
 * @returns {Promise<Array>} Sales data
 */
export const getSalesData = async (period = 'month') => {
  try {
    const response = await axiosInstance.get(`/api/dashboard/sales?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sales data:', error);
    throw error;
  }
};

/**
 * Fetch recent activities for dashboard activity feed
 * @param {number} limit - Number of activities to fetch
 * @returns {Promise<Array>} Recent activities
 */
export const getRecentActivities = async (limit = 10) => {
  try {
    const response = await axiosInstance.get(`/api/dashboard/activities?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};

/**
 * Fetch inventory value by category
 * @returns {Promise<Array>} Inventory value by category
 */
export const getInventoryValueByCategory = async () => {
  try {
    const response = await axiosInstance.get('/api/dashboard/inventory-value');
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory value by category:', error);
    throw error;
  }
};