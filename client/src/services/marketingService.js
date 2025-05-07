import axios from 'axios';

// Create a new axios instance with the correct base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api' // Point to your backend server
});

// Add request interceptor to include the auth token
api.interceptors.request.use(
  config => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      // Add Authorization header to all requests
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

const API_URL = '/marketing'; // Remove duplicated '/api' part

// Get marketing analytics data
const getMarketingAnalytics = async (params = {}) => {
  try {
    const response = await api.get(`${API_URL}/analytics`, { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching marketing analytics:', error);
    throw error;
  }
};

// Get loyalty program settings
const getLoyaltySettings = async () => {
  try {
    const response = await api.get(`${API_URL}/loyalty/settings`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching loyalty program settings:', error);
    throw error;
  }
};

// Update loyalty program settings
const updateLoyaltySettings = async (settings) => {
  try {
    const response = await api.put(`${API_URL}/loyalty/settings`, settings);
    return response.data.data;
  } catch (error) {
    console.error('Error updating loyalty program settings:', error);
    throw error;
  }
};

// Get loyalty program rewards
const getLoyaltyRewards = async () => {
  try {
    const response = await api.get(`${API_URL}/loyalty/rewards`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching loyalty rewards:', error);
    throw error;
  }
};

// Create loyalty reward
const createLoyaltyReward = async (rewardData) => {
  try {
    const response = await api.post(`${API_URL}/loyalty/rewards`, rewardData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating loyalty reward:', error);
    throw error;
  }
};

// Update loyalty reward
const updateLoyaltyReward = async (id, rewardData) => {
  try {
    const response = await api.put(`${API_URL}/loyalty/rewards/${id}`, rewardData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating loyalty reward:', error);
    throw error;
  }
};

// Delete loyalty reward
const deleteLoyaltyReward = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/loyalty/rewards/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting loyalty reward:', error);
    throw error;
  }
};

// Get loyalty tiers
const getLoyaltyTiers = async () => {
  try {
    const response = await api.get(`${API_URL}/loyalty/tiers`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching loyalty tiers:', error);
    throw error;
  }
};

// Create loyalty tier
const createLoyaltyTier = async (tierData) => {
  try {
    const response = await api.post(`${API_URL}/loyalty/tiers`, tierData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating loyalty tier:', error);
    throw error;
  }
};

// Update loyalty tier
const updateLoyaltyTier = async (id, tierData) => {
  try {
    const response = await api.put(`${API_URL}/loyalty/tiers/${id}`, tierData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating loyalty tier:', error);
    throw error;
  }
};

// Delete loyalty tier
const deleteLoyaltyTier = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/loyalty/tiers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting loyalty tier:', error);
    throw error;
  }
};

// Get loyalty members
const getLoyaltyMembers = async () => {
  try {
    const response = await api.get(`${API_URL}/loyalty/members`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching loyalty members:', error);
    throw error;
  }
};

// Get marketing campaigns
const getCampaigns = async (params = {}) => {
  try {
    const response = await api.get(`${API_URL}/campaigns`, { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching marketing campaigns:', error);
    throw error;
  }
};

// Create marketing campaign
const createCampaign = async (campaignData) => {
  try {
    const response = await api.post(`${API_URL}/campaigns`, campaignData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating marketing campaign:', error);
    throw error;
  }
};

// Update marketing campaign
const updateCampaign = async (id, campaignData) => {
  try {
    const response = await api.put(`${API_URL}/campaigns/${id}`, campaignData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating marketing campaign:', error);
    throw error;
  }
};

// Delete marketing campaign
const deleteCampaign = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/campaigns/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting marketing campaign:', error);
    throw error;
  }
};

// Get promotions
const getPromotions = async (params = {}) => {
  try {
    const response = await api.get(`${API_URL}/promotions`, { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching promotions:', error);
    throw error;
  }
};

// Create promotion
const createPromotion = async (promotionData) => {
  try {
    const response = await api.post(`${API_URL}/promotions`, promotionData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating promotion:', error);
    throw error;
  }
};

// Update promotion
const updatePromotion = async (id, promotionData) => {
  try {
    const response = await api.put(`${API_URL}/promotions/${id}`, promotionData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating promotion:', error);
    throw error;
  }
};

// Delete promotion
const deletePromotion = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/promotions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting promotion:', error);
    throw error;
  }
};

// Get email campaigns
const getEmailCampaigns = async (params = {}) => {
  try {
    const response = await api.get(`${API_URL}/emails`, { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching email campaigns:', error);
    throw error;
  }
};

// Create email campaign
const createEmailCampaign = async (emailData) => {
  try {
    const response = await api.post(`${API_URL}/emails`, emailData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating email campaign:', error);
    throw error;
  }
};

// Update email campaign
const updateEmailCampaign = async (id, emailData) => {
  try {
    const response = await api.put(`${API_URL}/emails/${id}`, emailData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating email campaign:', error);
    throw error;
  }
};

// Send test email
const sendTestEmail = async (id, emailAddress) => {
  try {
    const response = await api.post(`${API_URL}/emails/${id}/test`, { email: emailAddress });
    return response.data;
  } catch (error) {
    console.error('Error sending test email:', error);
    throw error;
  }
};

// Send email campaign
const sendEmailCampaign = async (id) => {
  try {
    const response = await api.post(`${API_URL}/emails/${id}/send`);
    return response.data;
  } catch (error) {
    console.error('Error sending email campaign:', error);
    throw error;
  }
};

/**
 * Get marketing dashboard data
 * @returns {Promise<Object>}
 */
const getMarketingDashboard = async () => {
  try {
    console.log('Fetching marketing dashboard data');
    const response = await api.get(`${API_URL}/dashboard`); // Use API_URL constant
    return response.data;
  } catch (error) {
    console.error('Error fetching marketing dashboard:', error);
    throw error;
  }
};

const marketingService = {
  getMarketingAnalytics,
  getLoyaltySettings,
  updateLoyaltySettings,
  getLoyaltyRewards,
  createLoyaltyReward,
  updateLoyaltyReward,
  deleteLoyaltyReward,
  getLoyaltyTiers,
  createLoyaltyTier,
  updateLoyaltyTier,
  deleteLoyaltyTier,
  getLoyaltyMembers,
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getEmailCampaigns,
  createEmailCampaign,
  updateEmailCampaign,
  sendTestEmail,
  sendEmailCampaign,
  getMarketingDashboard
};

export default marketingService;