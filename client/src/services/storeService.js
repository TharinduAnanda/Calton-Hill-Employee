import axios from '../utils/axiosConfig';

export const getStoreSettings = async () => {
  const response = await axios.get('/api/store/settings');
  return response.data;
};

export const updateStoreSettings = async (settings) => {
  const response = await axios.put('/api/store/settings', settings);
  return response.data;
};