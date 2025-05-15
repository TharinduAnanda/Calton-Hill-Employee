import axios from 'axios';

// Add this function at the top of your file, after the imports and before the api configuration
/**
 * Generate a random coupon code
 * @returns {string} Random coupon code
 */
const generateRandomCode = () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoiding confusing characters like 0/O and 1/I
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

// Add these logging helper functions at the top of your file
const logRequest = (method, endpoint, data = null) => {
  console.log(`🔷 API REQUEST: ${method} ${endpoint}`);
  if (data) console.log('📦 Request Payload:', data);
};

const logResponse = (method, endpoint, response) => {
  console.log(`🟢 API RESPONSE: ${method} ${endpoint}`);
  console.log('📊 Response Data:', response);
};

const logError = (method, endpoint, error) => {
  console.error(`🔴 API ERROR: ${method} ${endpoint}`);
  console.error('⚠️ Error Details:', error);
  if (error.response) {
    console.error('📄 Response Data:', error.response.data);
    console.error('🔢 Status Code:', error.response.status);
  }
};

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Configure API requests to handle authentication
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor for consistent error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Handle expired tokens or authentication issues
    if (error.response && error.response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      // Redirect to login if needed
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const marketingService = {
  // Analytics Services
  getMarketingAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/marketing/analytics', { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching marketing analytics:', error);
      throw error;
    }
  },
  
  // Dashboard Services
  getMarketingDashboard: async () => {
    logRequest('GET', '/marketing/dashboard');
    try {
      const response = await api.get('/marketing/dashboard');
      logResponse('GET', '/marketing/dashboard', response.data);
      return response.data;
    } catch (error) {
      logError('GET', '/marketing/dashboard', error);
      throw error;
    }
  },

  // Loyalty Program Services
  getLoyaltySettings: async () => {
    logRequest('GET', '/marketing/loyalty/settings');
    try {
      const response = await api.get('/marketing/loyalty/settings');
      logResponse('GET', '/marketing/loyalty/settings', response.data);
      return response.data.data || response.data;
    } catch (error) {
      logError('GET', '/marketing/loyalty/settings', error);
      console.error('Error fetching loyalty program settings:', error);
      throw error;
    }
  },

  updateLoyaltySettings: async (settings) => {
    logRequest('PUT', '/marketing/loyalty/settings', settings);
    try {
      const response = await api.put('/marketing/loyalty/settings', settings);
      logResponse('PUT', '/marketing/loyalty/settings', response.data);
      return response.data.data || response.data;
    } catch (error) {
      logError('PUT', '/marketing/loyalty/settings', error);
      console.error('Error updating loyalty program settings:', error);
      throw error;
    }
  },

  getLoyaltyRewards: async () => {
    logRequest('GET', '/marketing/loyalty/rewards');
    try {
      const response = await api.get('/marketing/loyalty/rewards');
      logResponse('GET', '/marketing/loyalty/rewards', response.data);
      return response.data.data || response.data || [];
    } catch (error) {
      logError('GET', '/marketing/loyalty/rewards', error);
      console.error('Error fetching loyalty rewards:', error);
      throw error;
    }
  },

  createLoyaltyReward: async (rewardData) => {
    logRequest('POST', '/marketing/loyalty/rewards', rewardData);
    try {
      const response = await api.post('/marketing/loyalty/rewards', rewardData);
      logResponse('POST', '/marketing/loyalty/rewards', response.data);
      return response.data.data || response.data;
    } catch (error) {
      logError('POST', '/marketing/loyalty/rewards', error);
      console.error('Error creating loyalty reward:', error);
      throw error;
    }
  },

  updateLoyaltyReward: async (id, rewardData) => {
    const endpoint = `/marketing/loyalty/rewards/${id}`;
    logRequest('PUT', endpoint, rewardData);
    try {
      const response = await api.put(endpoint, rewardData);
      logResponse('PUT', endpoint, response.data);
      return response.data;
    } catch (error) {
      logError('PUT', endpoint, error);
      throw error;
    }
  },

  deleteLoyaltyReward: async (id) => {
    logRequest('DELETE', `/marketing/loyalty/rewards/${id}`);
    try {
      const response = await api.delete(`/marketing/loyalty/rewards/${id}`);
      logResponse('DELETE', `/marketing/loyalty/rewards/${id}`, response.data);
      return response.data;
    } catch (error) {
      logError('DELETE', `/marketing/loyalty/rewards/${id}`, error);
      console.error('Error deleting loyalty reward:', error);
      throw error;
    }
  },

  getLoyaltyTiers: async () => {
    logRequest('GET', '/marketing/loyalty/tiers');
    try {
      const response = await api.get('/marketing/loyalty/tiers');
      logResponse('GET', '/marketing/loyalty/tiers', response.data);
      return response.data.data || response.data || [];
    } catch (error) {
      logError('GET', '/marketing/loyalty/tiers', error);
      console.error('Error fetching loyalty tiers:', error);
      throw error;
    }
  },

  createLoyaltyTier: async (tierData) => {
    logRequest('POST', '/marketing/loyalty/tiers', tierData);
    try {
      const response = await api.post('/marketing/loyalty/tiers', tierData);
      logResponse('POST', '/marketing/loyalty/tiers', response.data);
      return response.data.data || response.data;
    } catch (error) {
      logError('POST', '/marketing/loyalty/tiers', error);
      console.error('Error creating loyalty tier:', error);
      throw error;
    }
  },

  updateLoyaltyTier: async (id, tierData) => {
    logRequest('PUT', `/marketing/loyalty/tiers/${id}`, tierData);
    try {
      const response = await api.put(`/marketing/loyalty/tiers/${id}`, tierData);
      logResponse('PUT', `/marketing/loyalty/tiers/${id}`, response.data);
      return response.data.data || response.data;
    } catch (error) {
      logError('PUT', `/marketing/loyalty/tiers/${id}`, error);
      console.error('Error updating loyalty tier:', error);
      throw error;
    }
  },

  deleteLoyaltyTier: async (id) => {
    logRequest('DELETE', `/marketing/loyalty/tiers/${id}`);
    try {
      const response = await api.delete(`/marketing/loyalty/tiers/${id}`);
      logResponse('DELETE', `/marketing/loyalty/tiers/${id}`, response.data);
      return response.data;
    } catch (error) {
      logError('DELETE', `/marketing/loyalty/tiers/${id}`, error);
      console.error('Error deleting loyalty tier:', error);
      throw error;
    }
  },

  getLoyaltyMembers: async () => {
    console.log('👥 Starting to fetch loyalty program members');
    logRequest('GET', '/marketing/loyalty/members');
    try {
      console.log('⏳ Awaiting response from loyalty members API');
      const response = await api.get('/marketing/loyalty/members');
      logResponse('GET', '/marketing/loyalty/members', response.data);
      
      console.log('🔍 Examining loyalty members response structure');
      // Check if we got data in the expected format and return ONLY real data
      if (response.data && response.data.data) {
        console.log(`✅ Found ${response.data.data.length} members in database`);
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        console.log(`✅ Found ${response.data.length} members in database`);
        return response.data;
      } else {
        // No fallback data - just return an empty array
        console.warn('⚠️ No loyalty members found in database');
        return [];
      }
    } catch (error) {
      console.log('❌ Error occurred in getLoyaltyMembers');
      logError('GET', '/marketing/loyalty/members', error);
      console.error('📛 Error fetching loyalty members:', error);
      // Return empty array instead of mock data
      return [];
    }
  },

  getMemberPointsHistory: async (memberId) => {
    const endpoint = `/marketing/loyalty/members/${memberId}/history`;
    console.log(`🔍 Fetching points history for member: ${memberId}`);
    logRequest('GET', endpoint);
    try {
      console.log('⏳ Awaiting response from member history API');
      const response = await api.get(endpoint);
      logResponse('GET', endpoint, response.data);
      
      console.log('🔍 Examining points history response structure');
      // Check if we got data in the expected format
      if (response.data && response.data.data) {
        console.log(`✅ Found ${response.data.data.length} transactions in database`);
        return response.data;
      } else {
        // No fallback data - return empty data structure
        console.warn('⚠️ No transaction history found in database');
        return { data: [] };
      }
    } catch (error) {
      console.log('❌ Error occurred in getMemberPointsHistory');
      logError('GET', endpoint, error);
      console.error('📛 Error fetching member points history:', error);
      // Return empty data on error without mock data
      return { data: [] };
    }
  },

  // Campaign Services
  getCampaigns: async () => {
    try {
      console.log('Fetching marketing campaigns');
      const response = await api.get('/marketing/campaigns');
      
      // Ensure we always return an array
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response && response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response && response.data && response.data.success === false) {
        console.warn('API returned error:', response.data.message);
        return [];
      } else {
        console.warn('Unexpected API response format', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching marketing campaigns:', error);
      // Return empty array instead of throwing to make component more resilient
      return [];
    }
  },

  createCampaign: async (campaignData) => {
    try {
      const response = await api.post('/marketing/campaigns', campaignData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating marketing campaign:', error);
      throw error;
    }
  },

  updateCampaign: async (id, campaignData) => {
    try {
      const response = await api.put(`/marketing/campaigns/${id}`, campaignData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating marketing campaign:', error);
      throw error;
    }
  },

  deleteCampaign: async (id) => {
    try {
      const response = await api.delete(`/marketing/campaigns/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting marketing campaign:', error);
      throw error;
    }
  },
  
  scheduleCampaign: async (id, scheduleData) => {
    try {
      const response = await api.post(`/marketing/campaigns/${id}/schedule`, scheduleData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error scheduling campaign:', error);
      throw error;
    }
  },

  getCampaignAnalytics: async (id) => {
    try {
      const response = await api.get(`/marketing/campaigns/${id}/analytics`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
      throw error;
    }
  },

  // Promotion Services
  getPromotions: async () => {
    console.log('📊 Attempting to fetch automatic promotions...');
    logRequest('GET', '/marketing/promotions');
    try {
      const response = await api.get('/marketing/promotions');
      logResponse('GET', '/marketing/promotions', response.data);
      
      // Add explicit validation of the response
      if (!response.data) {
        console.warn('⚠️ Empty response received from promotions API');
        return [];
      }
      
      const promotionsData = response.data.data || [];
      console.log(`📦 Successfully loaded ${promotionsData.length} automatic promotions`);
      return promotionsData;
    } catch (error) {
      logError('GET', '/marketing/promotions', error);
      console.error('💥 Failed to fetch automatic promotions:', error.message);
      return [];
    }
  },

  // Create promotion (automatic type)
  createPromotion: async (promotionData) => {
    try {
      // Generate a unique code that's guaranteed to be different each time
      const uniqueCode = `AUTO-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // Create a clean object with all required fields and proper values
      const requestData = {
        name: promotionData.name || `Auto Promotion ${uniqueCode}`,
        description: promotionData.description || '',
        // Always use a unique code, regardless of what's passed in
        code: uniqueCode, 
        type: promotionData.type || 'percentage',
        value: Number(promotionData.value) || 0,
        min_purchase: Number(promotionData.min_purchase) || 0,
        max_discount: promotionData.max_discount ? Number(promotionData.max_discount) : null,
        start_date: promotionData.start_date || new Date(),
        end_date: promotionData.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        max_uses: promotionData.usage_limit ? Number(promotionData.usage_limit) : 100,
        usage_limit: promotionData.usage_limit ? Number(promotionData.usage_limit) : 100,
        usage_limit_per_user: Number(promotionData.usage_limit_per_user) || 1,
        applies_to: promotionData.applies_to || 'entire_order',
        category_ids: Array.isArray(promotionData.category_ids) ? promotionData.category_ids : [],
        product_ids: Array.isArray(promotionData.product_ids) ? promotionData.product_ids : [],
        segment_id: promotionData.segment_id || null,
        image_url: promotionData.image_url || null,
        is_active: promotionData.is_active ? 1 : 0,
        trigger_type: promotionData.trigger_type || 'cart_value',
        customer_description: promotionData.customer_description || '',
        distribution_channel: promotionData.distribution_channel || 'online',
        promotion_type: 'automatic'
      };
      
      // Add deep clone of the data being sent for debugging
      console.log('Final promotion request data:', JSON.parse(JSON.stringify(requestData)));
      console.log('Code value type:', typeof requestData.code);
      console.log('Code value:', requestData.code);
      
      // Normal path - always use the standard endpoint
      logRequest('POST', '/marketing/promotions', requestData);
      const response = await api.post('/marketing/promotions', requestData);
      logResponse('POST', '/marketing/promotions', response.data);
      return response.data.data || response.data;
    } catch (error) {
      // Special error handling for duplicate entry
      if (error?.response?.data?.error?.includes('Duplicate entry')) {
        console.log('Attempting recovery from duplicate entry error');
        try {
          // Try again with a different code that includes more randomness
          const randomCode = `AUTO-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
          const recoveryData = {
            ...promotionData,
            code: randomCode,
            name: promotionData.name || `Auto Promotion ${randomCode}`
          };
          
          // Add additional logging for recovery attempt
          console.log('Recovery attempt with code:', randomCode);
          console.log('Recovery data:', JSON.parse(JSON.stringify(recoveryData)));
          
          logRequest('POST', '/marketing/promotions', recoveryData);
          const recoveryResponse = await api.post('/marketing/promotions', recoveryData);
          logResponse('POST', '/marketing/promotions', recoveryResponse.data);
          return recoveryResponse.data.data || recoveryResponse.data;
        } catch (recoveryError) {
          logError('POST', '/marketing/promotions (recovery attempt)', recoveryError);
          throw recoveryError;
        }
      }
      
      logError('POST', '/marketing/promotions', error);
      throw error;
    }
  },

  updatePromotion: async (id, promotionData) => {
    logRequest('PUT', `/marketing/promotions/${id}`, promotionData);
    try {
      const response = await api.put(`/marketing/promotions/${id}`, promotionData);
      logResponse('PUT', `/marketing/promotions/${id}`, response.data);
      return response.data;  // Return direct response
    } catch (error) {
      logError('PUT', `/marketing/promotions/${id}`, error);
      throw error;
    }
  },

  deletePromotion: async (id) => {
    logRequest('DELETE', `/marketing/promotions/${id}`);
    try {
      const response = await api.delete(`/marketing/promotions/${id}`);
      logResponse('DELETE', `/marketing/promotions/${id}`, response.data);
      return response.data;  // Return response with success and ID
    } catch (error) {
      logError('DELETE', `/marketing/promotions/${id}`, error);
      throw error;
    }
  },

  // Get automatic promotions only (no code required)
  // Make sure these methods in marketingService.js are correctly implemented:

// For automatic promotions only
getAutomaticPromotions: async () => {
  logRequest('GET', '/marketing/promotions?type=automatic');
  try {
    const response = await api.get('/marketing/promotions?type=automatic');
    logResponse('GET', '/marketing/promotions?type=automatic', response.data);
    return response.data.data || [];
  } catch (error) {
    logError('GET', '/marketing/promotions?type=automatic', error);
    return [];
  }
},

// For coupons only
getCoupons: async () => {
  console.log('🎫 Attempting to fetch coupons...');
  logRequest('GET', '/marketing/coupons');
  try {
    const response = await api.get('/marketing/coupons');
    logResponse('GET', '/marketing/coupons', response.data);
    
    // Add explicit validation of the response
    if (!response.data) {
      console.warn('⚠️ Empty response received from coupons API');
      return [];
    }
    
    const couponsData = response.data.data || [];
    console.log(`🎟️ Successfully loaded ${couponsData.length} coupons`);
    return couponsData;
  } catch (error) {
    logError('GET', '/marketing/coupons', error);
    console.error('💥 Failed to fetch coupons:', error.message);
    return [];
  }
},

  // Coupon Services
  // Create coupon
  createCoupon: async (couponData) => {
    // Function to handle the coupon creation with retry logic
    const attemptCouponCreation = async (data, retryCount = 0, maxRetries = 3) => {
      try {
        // Log the exact structure being sent
        console.log('Sending coupon data with promotion_type:', data.promotion_type);
        
        const response = await api.post('/marketing/coupons', data);
        logResponse('POST', '/marketing/coupons', response.data);
        
        // If the response data doesn't have promotion_type set, try to update it
        if (response.data && response.data.id && (!response.data.promotion_type || response.data.promotion_type === null)) {
          console.log('Promotion type is NULL in response, attempting to update it');
          try {
            // Make an additional update request to set the promotion_type
            await api.put(`/marketing/promotions/${response.data.id}`, {
              promotion_type: 'coupon'
            });
            console.log('Successfully updated promotion_type after creation');
            // Add the promotion_type to the returned data
            response.data.promotion_type = 'coupon';
          } catch (updateError) {
            console.error('Failed to update promotion_type after creation:', updateError);
          }
        }
        
        return response.data;
      } catch (error) {
        // Check if it's a duplicate error and we haven't exceeded max retries
        if (error.response?.data?.error?.includes('Duplicate entry') && retryCount < maxRetries) {
          console.log(`Duplicate coupon code detected, generating new code (attempt ${retryCount + 1})`);
          // Generate a new code and retry
          const newCode = generateRandomCode();
          console.log(`Trying with new code: ${newCode}`);
          
          // Create new request data with the new code
          const newData = {
            ...data,
            code: newCode,
            name: newCode
          };
          
          // Recursive call with the new code and incremented retry count
          return attemptCouponCreation(newData, retryCount + 1, maxRetries);
        }
        
        // If not a duplicate error or we've exceeded retries, just throw the error
        logError('POST', '/marketing/coupons', error);
        throw error;
      }
    };
    
    // Prepare the initial request data with proper field mapping for server expectations
    const requestData = {
      name: couponData.code || generateRandomCode(),
      code: couponData.code || generateRandomCode(),
      promotion_type: 'coupon', // Make sure this is explicitly set
      type: couponData.discount_type === 'percentage' ? 'percentage' : 'fixed',
      value: couponData.discount_value || 0,
      min_purchase: couponData.min_purchase || 0,
      max_discount: couponData.max_discount || null,
      start_date: couponData.start_date || new Date(),
      end_date: couponData.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      max_uses: couponData.usage_limit || 100,
      usage_limit: couponData.usage_limit || 100, // Add this field explicitly
      usage_limit_per_user: couponData.usage_limit_per_user || 1,
      description: couponData.description || '',
      is_active: couponData.is_active ? 1 : 0,
      applies_to: couponData.applies_to || 'entire_order',
      category_ids: Array.isArray(couponData.category_ids) ? couponData.category_ids : [],
      product_ids: Array.isArray(couponData.product_ids) ? couponData.product_ids : [],
      segment_id: couponData.segment_id || null,
      distribution_channel: couponData.distribution_channel || 'email',
      trigger_type: 'cart_value'
    };
    
    console.log('Coupon data being sent to API:', requestData);
    logRequest('POST', '/marketing/coupons', requestData);
    
    // Start the creation process with retry logic
    return attemptCouponCreation(requestData);
  },

  updateCoupon: async (id, couponData) => {
    // Transform fields to match the server expectations
    const transformedData = {
      name: couponData.code, // Use code as name for coupons
      code: couponData.code,
      type: couponData.discount_type === 'percentage' ? 'percentage' : 'fixed',
      value: couponData.discount_value,
      min_purchase: couponData.min_purchase || 0,
      max_discount: couponData.max_discount || null,
      start_date: couponData.start_date,
      end_date: couponData.end_date,
      max_uses: couponData.usage_limit,
      description: couponData.description,
      is_active: couponData.is_active ? 1 : 0,
      applies_to: couponData.applies_to || 'entire_order',
      category_ids: couponData.category_ids || [],
      product_ids: couponData.product_ids || []
    };

    logRequest('PUT', `/marketing/coupons/${id}`, transformedData);
    try {
      const response = await api.put(`/marketing/coupons/${id}`, transformedData);
      logResponse('PUT', `/marketing/coupons/${id}`, response.data);
      
      // Transform response back to expected client format
      const couponResponse = {
        ...response.data,
        discount_type: response.data.type,
        discount_value: response.data.value,
        usage_limit: response.data.max_uses
      };
      return couponResponse;
    } catch (error) {
      logError('PUT', `/marketing/coupons/${id}`, error);
      throw error;
    }
  },

  deleteCoupon: async (id) => {
    logRequest('DELETE', `/marketing/coupons/${id}`);
    try {
      const response = await api.delete(`/marketing/coupons/${id}`);
      logResponse('DELETE', `/marketing/coupons/${id}`, response.data);
      return response.data;
    } catch (error) {
      logError('DELETE', `/marketing/coupons/${id}`, error);
      throw error;
    }
  },

  validateCoupon: async (code, orderId = null) => {
    const payload = { code };
    if (orderId) payload.order_id = orderId;
    
    logRequest('POST', '/marketing/coupons/validate', payload);
    try {
      const response = await api.post('/marketing/coupons/validate', payload);
      logResponse('POST', '/marketing/coupons/validate', response.data);
      return response.data;
    } catch (error) {
      logError('POST', '/marketing/coupons/validate', error);
      throw error;
    }
  },

  applyCouponToOrder: async (code, orderId) => {
    try {
      const response = await api.post(`/marketing/coupons/apply`, { 
        code, 
        order_id: orderId 
      });
      return response.data;
    } catch (error) {
      console.error('Error applying coupon to order:', error);
      throw error;
    }
  },

  // Email Campaign Services
  getEmailCampaigns: async (params = {}) => {
    try {
      const queryParams = { ...params, type: 'email' };
      const response = await api.get('/marketing/campaigns', { params: queryParams });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching email campaigns:', error);
      throw error;
    }
  },

  createEmailCampaign: async (emailData) => {
    try {
      const response = await api.post('/marketing/campaigns', {
        ...emailData,
        type: 'email'
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating email campaign:', error);
      throw error;
    }
  },

  updateEmailCampaign: async (id, emailData) => {
    try {
      const response = await api.put(`/marketing/campaigns/${id}`, emailData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating email campaign:', error);
      throw error;
    }
  },

  deleteEmailCampaign: async (id) => {
    try {
      const response = await api.delete(`/marketing/campaigns/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting email campaign:', error);
      throw error;
    }
  },

  sendTestEmail: async (id, emailAddress) => {
    try {
      const response = await api.post(`/marketing/campaigns/${id}/test`, { email: emailAddress });
      return response.data;
    } catch (error) {
      console.error('Error sending test email:', error);
      throw error;
    }
  },

  sendSingleCampaignEmail: async (id, data) => {
    try {
      const response = await api.post(`/marketing/campaigns/${id}/send-single`, data);
      return response.data;
    } catch (error) {
      console.error('Error sending single campaign email:', error);
      throw error;
    }
  },
  
  sendEmailCampaign: async (id, options = {}) => {
    try {
      console.log(`Sending email campaign ${id}`, options);
      const response = await api.post(`/marketing/campaigns/${id}/send`, options);
      console.log('Send campaign response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending email campaign:', error);
      throw error;
    }
  },

  // Add this method to your marketingService object
  getEmailMetrics: async () => {
    try {
      const response = await api.get('/marketing/email-metrics');
      return {
        ...response.data.data,
        hasData: response.data.hasData
      };
    } catch (error) {
      console.error('Error fetching email metrics:', error);
      return {
        totalSent: 0,
        openRate: 0,
        clickRate: 0,
        conversionRate: 0,
        revenue: 0,
        hasData: false
      };
    }
  },

  // Customer Segments Services
  getCustomerSegments: async () => {
    logRequest('GET', '/marketing/segments');
    try {
      const response = await api.get('/marketing/segments');
      logResponse('GET', '/marketing/segments', response.data);
      
      // Always return an array, even if API responds with null
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      logError('GET', '/marketing/segments', error);
      console.error('Failed to load customer segments:', error);
      return []; // Always return an array on error
    }
  },

  createCustomerSegment: async (segmentData) => {
    try {
      const response = await api.post('/marketing/segments', segmentData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating customer segment:', error);
      throw error;
    }
  },

  updateCustomerSegment: async (id, segmentData) => {
    try {
      const response = await api.put(`/marketing/segments/${id}`, segmentData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating customer segment:', error);
      throw error;
    }
  },

  deleteCustomerSegment: async (id) => {
    try {
      const response = await api.delete(`/marketing/segments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting customer segment:', error);
      throw error;
    }
  },
  
  // Hardware store specific marketing functions
  getProductPromotions: async (productId) => {
    try {
      const response = await api.get(`/marketing/promotions/product/${productId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching product promotions:', error);
      throw error;
    }
  },
  
  getCategoryPromotions: async (categoryId) => {
    try {
      const response = await api.get(`/marketing/promotions/category/${categoryId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching category promotions:', error);
      throw error;
    }
  },
  
  getBulkDiscounts: async () => {
    try {
      const response = await api.get('/marketing/bulk-discounts');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching bulk discounts:', error);
      throw error;
    }
  },

  getCategories: async () => {
    console.log('🏷️ Attempting to fetch categories from database...');
    logRequest('GET', '/products/categories'); // Changed from '/categories'
    try {
      const response = await api.get('/products/categories');
      logResponse('GET', '/products/categories', response.data);
      
      if (!response.data || !response.data.data) {
        console.warn('⚠️ Empty or invalid response from categories API');
        return [];
      }
      
      console.log(`✅ Successfully loaded ${response.data.data.length} categories from database`);
      return response.data.data;
    } catch (error) {
      logError('GET', '/products/categories', error);
      console.error('💥 Failed to fetch categories:', error.message);
      
      // Return empty array when API fails
      console.log('Returning empty categories array due to API failure');
      return [];
    }
  },

  // Add this function to your marketingService
  togglePromotionStatus: async (id, isActive) => {
    logRequest('PUT', `/promotions/${id}/status`);
    try {
      // Use the standard update promotion endpoint instead of a dedicated toggle endpoint
      const response = await api.put(`/marketing/promotions/${id}`, { 
        is_active: isActive
      });
      logResponse('PUT', `/promotions/${id}/status`, response.data);
      return response.data;
    } catch (error) {
      logError('PUT', `/promotions/${id}/status`, error);
      throw error;
    }
  },
}

export default marketingService;