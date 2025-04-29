import axios from '../utils/axiosConfig';

export const updateOwnerAccount = async (data) => {
  try {
    const response = await axios.put('/api/owner/account', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update account');
  }
};

// Add other owner-specific API calls here