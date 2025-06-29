import React, { createContext, useState, useContext, useEffect } from 'react';
import instance from '../utils/axiosConfig';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/authService';

// Create the auth context
const AuthContext = createContext();

/**
 * Check if a token is valid
 * @param {string} token - JWT token to check
 * @returns {boolean} Whether the token is valid
 */
function isTokenValid(token) {
  if (!token) return false;
  
  try {
    const decodedToken = jwtDecode(token);
    const isValid = decodedToken.exp * 1000 > Date.now();
    console.log('Token validation:', { 
      valid: isValid,
      expiresAt: new Date(decodedToken.exp * 1000).toISOString(),
      now: new Date().toISOString()
    });
    return isValid;
  } catch (error) {
    console.error('Invalid token:', error);
    return false;
  }
}

/**
 * Fetch the current user's data with improved error handling
 * @param {function} setCurrentUser - State setter for the current user
 * @param {function} logoutCallback - Function to call if fetching fails
 * @returns {Promise} Promise that resolves when the user data is fetched
 */
function fetchUserData(setCurrentUser, logoutCallback) {
  // Check if token exists before making the request
  const token = authService.getToken();
  if (!token) {
    console.log('No token found, skipping user data fetch');
    logoutCallback();
    return Promise.resolve(null);
  }

  // Try to get user data from localStorage first
  const storedUserData = localStorage.getItem('user');
  let parsedStoredUserData = null;
  
  if (storedUserData) {
    try {
      parsedStoredUserData = JSON.parse(storedUserData);
      console.log('Using cached user data from localStorage:', parsedStoredUserData);
      setCurrentUser(parsedStoredUserData);
      
      // Return cached user data but still attempt to refresh it
      // This ensures the user stays logged in even if the API call fails
    } catch (error) {
      console.error('Error parsing stored user data:', error);
    }
  }

  console.log('Fetching user data with token');
  return instance.get('http://localhost:5000/api/auth/me')
    .then(response => {
      console.log('User data response:', response.data);
      
      if (!response.data) {
        console.error('Empty response from /api/auth/me');
        throw new Error('Empty response when fetching user data');
      }
      
      if (response.data?.success && response.data?.data) {
        // Format user data consistently
        const userData = response.data.data;
        console.log('Raw user data received:', userData);
        
        // Normalize the user object format based on role
        let normalizedUser;
        
        if (userData.role === 'owner') {
          normalizedUser = {
            owner_id: userData.id || userData._id || userData.owner_id,
            name: userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
            email: userData.email,
            role: 'owner',
            type: 'owner'
          };
        } else {
          normalizedUser = {
            staff_id: userData.id || userData._id || userData.staff_id,
            first_name: userData.first_name || (userData.name ? userData.name.split(' ')[0] : ''),
            last_name: userData.last_name || (userData.name ? userData.name.split(' ').slice(1).join(' ') : ''),
            email: userData.email,
            role: userData.role || 'staff',
            owner_id: userData.owner_id || userData.Owner_ID || userData.ownerId,
            type: 'staff'
          };
        }
        
        console.log('Normalized user data:', normalizedUser);
        setCurrentUser(normalizedUser);
        // Store updated user data in localStorage
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        return normalizedUser;
      } else if (response.data?.user || response.data?.owner || response.data?.staff) {
        // Alternative format - direct user data
        const userData = response.data.user || response.data.owner || response.data.staff;
        console.log('Alternative format user data:', userData);
        
        let normalizedUser;
        
        if (userData.role === 'owner' || !userData.owner_id) {
          normalizedUser = {
            owner_id: userData.id || userData._id || userData.owner_id,
            name: userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
            email: userData.email,
            role: 'owner',
            type: 'owner'
          };
        } else {
          normalizedUser = {
            staff_id: userData.id || userData._id || userData.staff_id,
            first_name: userData.first_name || (userData.name ? userData.name.split(' ')[0] : ''),
            last_name: userData.last_name || (userData.name ? userData.name.split(' ').slice(1).join(' ') : ''),
            email: userData.email,
            role: userData.role || 'staff',
            owner_id: userData.owner_id || userData.Owner_ID || userData.ownerId,
            type: 'staff'
          };
        }
        
        console.log('Normalized user data:', normalizedUser);
        setCurrentUser(normalizedUser);
        // Store updated user data in localStorage
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        return normalizedUser;
      } else {
        console.warn('Invalid response format from /api/auth/me:', response.data);
        throw new Error('Failed to fetch user data: invalid response format');
      }
    })
    .catch(error => {
      console.error('Error fetching user:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        endpoint: '/api/auth/me'
      });
      
      // If we have user data from localStorage and token is valid, don't log out on API errors
      if (parsedStoredUserData && authService.validateJWT(token).valid) {
        console.log('API error, but token is valid and we have cached user data - maintaining session');
        return parsedStoredUserData;
      }
      
      // Only logout if it's a 401 error
      // Don't logout on 404 errors since the endpoint might not exist in development
      if (error.response && error.response.status === 401) {
        logoutCallback();
      } else if (error.response && error.response.status === 404) {
        console.log('404 error for /api/auth/me - endpoint may not exist, using cached data if available');
        // Don't log out if we have stored user data - the endpoint might be missing in development
        if (parsedStoredUserData) {
          return parsedStoredUserData;
        }
      }
      
      return null;
    });
}

/**
 * Login a staff member
 * @param {string} email - Staff email
 * @param {string} password - Staff password
 * @param {function} setCurrentUser - State setter for the current user
 * @returns {Promise} Promise that resolves with the staff user data
 */
function loginStaffMember(email, password, setCurrentUser) {
  console.log('Attempting staff login with email:', email);
  
  try {
    // Change from /api/auth/staff/login to just /api/auth/login
    return instance.post('http://localhost:5000/api/auth/login', { email, password })
      .then(response => {
        // Log full response to help with debugging
        console.log('Staff login complete response:', response);
        
        // Validate response structure
        if (!response.data) {
          console.error('No data received from server');
          throw new Error('No data received from server');
        }
        
        let token, staff;
        
        // Handle different response formats
        if (response.data.success && response.data.data) {
          console.log('Using standard response structure with data field');
          // Standard format with data field
          token = response.data.data.token;
          staff = response.data.data.staff || response.data.data.user;
        } else if (response.data.token) {
          console.log('Using alternative response structure with direct token field');
          // Direct format with token and staff/user fields
          token = response.data.token;
          staff = response.data.staff || response.data.user;
        } else {
          console.error('Invalid response structure:', response.data);
          throw new Error('Invalid response structure from server');
        }
        
        if (!token) {
          console.error('No token found in response');
          throw new Error('Missing authentication token in response');
        }
        
        if (!staff) {
          console.error('No staff data found in response');
          throw new Error('Missing staff data in response');
        }
        
        console.log('Staff data received:', staff);
        
        // Store token using authService
        authService.storeToken(token);
        
        // Also set in axios defaults
        instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Ensure you're storing the user's ID correctly with better property handling
        const userData = {
          id: staff.staff_id || staff.id || staff._id,
          owner_id: staff.owner_id || staff.Owner_ID || staff.ownerId || staff.OwnerId,
          first_name: staff.first_name || staff.firstName || staff.First_Name || (staff.name ? staff.name.split(' ')[0] : ''),
          last_name: staff.last_name || staff.lastName || staff.Last_Name || (staff.name ? staff.name.split(' ').slice(1).join(' ') : ''),
          email: staff.email || staff.Email,
          role: staff.role || staff.Role || 'staff',
          type: 'staff'
        };

        console.log('Setting user data with owner_id:', userData.owner_id);
        console.log('Setting currentUser with:', userData);
        
        // Store user data in localStorage too
        localStorage.setItem('user', JSON.stringify(userData));
        
        setCurrentUser(userData);
        
        return staff;
      })
      .catch(error => {
        console.error('Staff login error:', error);
        // Special handling for the cancelToken error
        if (error.message && error.message.includes('cancelToken')) {
          console.error('CancelToken error detected - this is a configuration issue');
          throw new Error('Login system is experiencing technical issues. Please try again later.');
        }
        
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          endpoint: '/api/auth/login',
          requestData: { email }
        });
        throw new Error(error.response?.data?.message || 'Login failed. Please verify your credentials and try again.');
      });
  } catch (outerError) {
    console.error('Critical staff login error (outside promise chain):', outerError);
    return Promise.reject(new Error('Login system error. Please try again later.'));
  }
}

/**
 * Login an owner
 * @param {string} email - Owner email
 * @param {string} password - Owner password
 * @param {function} setCurrentUser - State setter for the current user
 * @returns {Promise} Promise that resolves with the owner user data
 */
function loginOwnerUser(email, password, setCurrentUser) {
  console.log('Attempting owner login with email:', email);
  
  try {
    return instance.post('http://localhost:5000/api/auth/owner/login', { email, password })
      .then(response => {
        // Log full response to help with debugging
        console.log('Owner login complete response:', response);
        
        // Validate response structure with robust checks
        if (!response.data) {
          console.error('No data received from server');
          throw new Error('No data received from server');
        }
        
        let token, owner;
        
        // Check if data is in response.data.data (default structure)
        if (response.data.success && response.data.data) {
          console.log('Using standard response structure with data field');
          token = response.data.data.token;
          owner = response.data.data.owner || response.data.data.user;
        }
        // Alternative structure: data might be directly in response.data
        else if (response.data.token) {
          console.log('Using alternative response structure with direct token field');
          token = response.data.token;
          owner = response.data.owner || response.data.user;
        }
        // Last resort: try to find any token and owner data in the response
        else {
          console.error('Unexpected response format:', response.data);
          throw new Error('Invalid response format from server');
        }
        
        if (!token) {
          console.error('No token found in response');
          throw new Error('Missing authentication token in response');
        }
        
        if (!owner) {
          console.error('No owner data found in response');
          throw new Error('Missing owner data in response');
        }
        
        console.log('Owner data received:', owner);
        
        // Store token using authService
        authService.storeToken(token);
        
        // Also set in axios defaults
        instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update user state with more flexible property handling
        const userData = {
          owner_id: owner.owner_id || owner.id || owner._id,
          name: owner.name || (owner.first_name && owner.last_name ? `${owner.first_name} ${owner.last_name}` : email.split('@')[0]),
          email: owner.email,
          role: 'owner',
          type: 'owner'
        };
        
        console.log('Setting currentUser with:', userData);
        
        // Store user data in localStorage too
        localStorage.setItem('user', JSON.stringify(userData));
        
        setCurrentUser(userData);
        
        return owner;
      })
      .catch(error => {
        console.error('Owner login error:', error);
        // Special handling for the cancelToken error
        if (error.message && error.message.includes('cancelToken')) {
          console.error('CancelToken error detected - this is a configuration issue');
          throw new Error('Login system is experiencing technical issues. Please try again later.');
        }
        
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          endpoint: '/api/auth/owner/login',
          requestData: { email }
        });
        throw new Error(error.response?.data?.message || 'Login failed. Please verify your credentials and try again.');
      });
  } catch (outerError) {
    console.error('Critical owner login error (outside promise chain):', outerError);
    return Promise.reject(new Error('Login system error. Please try again later.'));
  }
}

/**
 * Auth Provider Component
 */
function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshAttempted, setRefreshAttempted] = useState(false);

  // Enhanced function to initialize the auth state
  useEffect(() => {
    // Debug localStorage contents
    console.log('[AuthProvider] LocalStorage contents:', {
      authToken: localStorage.getItem('authToken'),
      user: localStorage.getItem('user'),
      hasUserData: !!localStorage.getItem('user')
    });
    
    if (localStorage.getItem('user')) {
      try {
        const parsedUser = JSON.parse(localStorage.getItem('user'));
        console.log('[AuthProvider] Parsed user data:', parsedUser);
      } catch (e) {
        console.error('[AuthProvider] Error parsing user data:', e);
      }
    }
    
    const token = localStorage.getItem('authToken');
    console.log('[AuthProvider] Initializing auth state, token exists:', !!token);
    
    if (!token) {
      console.log('[AuthProvider] No token found in localStorage');
      setCurrentUser(null);
      setLoading(false);
      return;
    }
    
    // Check if token is valid before trying to use it
    if (!isTokenValid(token)) {
      console.log('[AuthProvider] Token is invalid or expired, clearing auth state');
      localStorage.removeItem('authToken');
      setCurrentUser(null);
      setLoading(false);
      return;
    }
    
    // If we have a token, set it in axios defaults
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Try to get stored user data first (faster startup)
    const storedUser = localStorage.getItem('user');
    let userData = null;
    
    if (storedUser) {
      try {
        userData = JSON.parse(storedUser);
        console.log('[AuthProvider] Retrieved user data from localStorage:', userData);
        setCurrentUser(userData);
        
        // Set loading to false right away if we have valid stored data
        // This ensures the app becomes interactive quickly
        setLoading(false);
      } catch (error) {
        console.error('[AuthProvider] Error parsing stored user data', error);
        // Will continue to fetch from server
      }
    }
    
    // Now fetch user data from server to ensure it's up to date
    // But don't block the UI on this if we already have valid data
    fetchUserData(setCurrentUser, () => {
      console.log('[AuthProvider] Logout triggered by fetchUserData');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setCurrentUser(null);
    })
      .then(userData => {
        if (userData) {
          console.log('[AuthProvider] Successfully fetched user data from server');
          // Store user data in localStorage for faster initialization next time
          localStorage.setItem('user', JSON.stringify(userData));
        }
        setRefreshAttempted(true);
      })
      .catch(error => {
        console.error('[AuthProvider] Error during initialization:', error);
        setRefreshAttempted(true);
      })
      .finally(() => {
        // Only set loading to false if we didn't already do it
        if (loading) {
          setLoading(false);
        }
      });
  }, []);

  // Handle logout with improved cleanup
  function handleLogout() {
    console.log('[AuthProvider] Logout initiated');
    // Clear both auth token and user data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    delete instance.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    // Ensure we reset any cached authentication state
    setRefreshAttempted(false);
    // Force page reload to reset the application state completely
    // Using replace instead of href for more immediate navigation without history entry
    window.location.replace('/');
  }

  // Staff login function
  const staffLogin = async (email, password) => {
    console.log('[AuthProvider] Staff login attempt');
    try {
      const response = await loginStaffMember(email, password, setCurrentUser);
      
      // Extra check to ensure user data is stored in localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser && response) {
        console.log('[AuthProvider] Backup storage of user data after login');
        
        // Create normalized user data
        const userData = {
          id: response.staff_id || response.id || response._id,
          owner_id: response.owner_id || response.Owner_ID || response.ownerId,
          first_name: response.first_name || response.firstName || (response.name ? response.name.split(' ')[0] : ''),
          last_name: response.last_name || response.lastName || (response.name ? response.name.split(' ').slice(1).join(' ') : ''),
          email: email,
          role: response.role || 'staff',
          type: 'staff'
        };
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return response;
    } catch (error) {
      console.error('[AuthProvider] Staff login error:', error);
      throw error;
    }
  };

  // Owner login function
  const ownerLogin = async (email, password) => {
    console.log('[AuthProvider] Owner login attempt');
    try {
      const response = await loginOwnerUser(email, password, setCurrentUser);
      
      // Extra check to ensure user data is stored in localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser && response) {
        console.log('[AuthProvider] Backup storage of user data after login');
        
        // Create normalized user data
        const userData = {
          owner_id: response.owner_id || response.id || response._id,
          name: response.name || (response.first_name && response.last_name ? `${response.first_name} ${response.last_name}` : email.split('@')[0]),
          email: email,
          role: 'owner',
          type: 'owner'
        };
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return response;
    } catch (error) {
      console.error('[AuthProvider] Owner login error:', error);
      throw error;
    }
  };

  // Construct and memorize the auth context value
  const value = {
    currentUser,
    loading: loading && !refreshAttempted,
    isAuthenticated: !!currentUser,
    staffLogin,
    ownerLogin,
    logout: handleLogout
  };

  console.log('[AuthProvider] Current auth state:', { 
    hasUser: !!currentUser, 
    loading, 
    refreshAttempted 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use the auth context
 */
function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuth, isTokenValid };
export default AuthProvider;