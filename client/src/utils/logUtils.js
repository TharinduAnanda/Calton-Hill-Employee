// Create this new utility file for logging functions

export const logRequest = (method, endpoint, data = null) => {
  console.log(`🔷 API REQUEST: ${method} ${endpoint}`);
  if (data) console.log('📦 Request Payload:', data);
};

export const logResponse = (method, endpoint, response) => {
  console.log(`🟢 API RESPONSE: ${method} ${endpoint}`);
  console.log('📊 Response Data:', response);
};

export const logError = (method, endpoint, error) => {
  console.error(`🔴 API ERROR: ${method} ${endpoint}`);
  console.error('⚠️ Error Details:', error);
  if (error.response) {
    console.error('📄 Response Data:', error.response.data);
    console.error('🔢 Status Code:', error.response.status);
  }
};