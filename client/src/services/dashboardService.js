// src/services/dashboardService.js
import axiosInstance from '../utils/axiosConfig';

// Mock data for when API fails
const mockData = {
  summary: {
    pendingTasks: 4,
    lowStockItems: 7, 
    activeOrders: 12,
    totalProducts: 156,
    dailySales: 2350.75,
    mostSoldCategory: 'Power Tools'
  },
  recentTasks: [
    { 
      id: 1, 
      name: 'Restock Inventory', 
      status: 'pending', 
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      description: 'Restock power tools section'
    },
    { 
      id: 2, 
      name: 'Update Product Prices', 
      status: 'completed', 
      dueDate: new Date().toISOString(),
      description: 'Update prices for new product line'
    }
  ],
  lowStockItems: [
    { id: 1, name: 'Power Drill', quantity: 3, reorderThreshold: 10, sku: 'PD-001', supplier: 'Tools Inc.' },
    { id: 2, name: 'Pipe Fittings', quantity: 5, reorderThreshold: 20, sku: 'PF-120', supplier: 'Plumbing Supplies Ltd.' },
    { id: 3, name: 'Electrical Tape', quantity: 2, reorderThreshold: 15, sku: 'ET-033', supplier: 'Electrical Goods Co.' }
  ],
  salesData: [
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 3000 },
    { month: 'Mar', sales: 2780 },
    { month: 'Apr', sales: 4890 },
    { month: 'May', sales: 3390 },
    { month: 'Jun', sales: 5100 }
  ],
  categoryBreakdown: [
    { name: 'Power Tools', value: 35 },
    { name: 'Hand Tools', value: 25 },
    { name: 'Plumbing', value: 15 },
    { name: 'Electrical', value: 15 },
    { name: 'Materials', value: 10 }
  ]
};

/**
 * Get dashboard data for staff users
 * @returns {Promise<Object>} Dashboard data
 */
const getStaffDashboardData = async () => {
  try {
    console.log('Fetching dashboard data from API...');
    const response = await axiosInstance.get('/api/dashboard/summary');
    
    if (response?.data?.data) {
      console.log('Successfully retrieved dashboard data from API');
      return response.data.data;
    } else {
      console.warn('API returned unexpected response format');
      return mockData;
    }
  } catch (error) {
    console.error('Error fetching staff dashboard data:', error);
    console.log('Using mock data instead');
    return mockData; // Return mock data on error
  }
};

/**
 * Get dashboard data for owner users
 * @returns {Promise<Object>} Dashboard data
 */
const getOwnerDashboardData = async () => {
  try {
    const response = await axiosInstance.get('/api/dashboard/owner');
    
    if (response?.data?.data) {
      return response.data.data;
    }
    
    return mockData;
  } catch (error) {
    console.error('Error fetching owner dashboard data:', error);
    return mockData;
  }
};

const dashboardService = {
  getStaffDashboardData,
  getOwnerDashboardData
};

export default dashboardService;