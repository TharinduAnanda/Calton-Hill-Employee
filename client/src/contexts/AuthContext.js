import React, { createContext, useState, useContext, useEffect } from 'react';
import instance from '../utils/axiosConfig';
import { jwtDecode } from 'jwt-decode';

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
    return decodedToken.exp * 1000 > Date.now();
  } catch (error) {
    console.error('Invalid token:', error);
    return false;
  }
}

/**
 * Log out the current user
 * @param {function} setCurrentUser - State setter for the current user
 */
function logoutUser(setCurrentUser) {
  localStorage.removeItem('token');
  delete instance.defaults.headers.common['Authorization'];
  setCurrentUser(null);
}

/**
 * Fetch the current user's data with improved error handling
 * @param {function} setCurrentUser - State setter for the current user
 * @param {function} logoutCallback - Function to call if fetching fails
 * @returns {Promise} Promise that resolves when the user data is fetched
 */
function fetchUserData(setCurrentUser, logoutCallback) {
  // Check if token exists before making the request
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('No token found, skipping user data fetch');
    logoutCallback();
    return Promise.resolve(null);
  }

  return instance.get('/api/auth/me')
    .then(response => {
      if (response.data?.success && response.data?.data) {
        // Format user data consistently
        const userData = response.data.data;
        
        // Normalize the user object format based on role
        let normalizedUser;
        
        if (userData.role === 'owner') {
          normalizedUser = {
            owner_id: userData.id,
            name: userData.name,
            email: userData.email,
            role: 'owner',
            type: 'owner'
          };
        } else {
          normalizedUser = {
            staff_id: userData.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            role: userData.role,
            owner_id: userData.owner_id,
            type: 'staff'
          };
        }
        
        setCurrentUser(normalizedUser);
        return normalizedUser;
      } else {
        console.warn('Invalid response format from /api/auth/me:', response.data);
        throw new Error('Failed to fetch user data: invalid response format');
      }
    })
    .catch(error => {
      console.error('Error fetching user:', error);
      
      // Only logout if it's a 401 error or the specific 404 error for this route
      // This prevents unnecessary logouts during development when routes might not exist
      if (error.response && (error.response.status === 401 || 
         (error.response.status === 404 && error.config.url === '/api/auth/me'))) {
        logoutCallback();
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
  // Change from /api/auth/staff/login to just /api/auth/login
  return instance.post('/api/auth/login', { email, password })
    .then(response => {
      // Log full response to help with debugging
      console.log('Staff login complete response:', response);
      
      // Validate response structure
      if (!response.data?.success && !response.data?.data && !response.data?.token) {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response structure from server');
      }
      
      let token, staff;
      
      // Handle different response formats
      if (response.data.data) {
        // Standard format with data field
        token = response.data.data.token;
        staff = response.data.data.staff || response.data.data.user;
      } else {
        // Direct format with token and staff/user fields
        token = response.data.token;
        staff = response.data.staff || response.data.user;
      }
      
      if (!token || !staff) {
        console.error('Missing token or staff data:', { token: !!token, staff: !!staff });
        throw new Error('Missing token or staff data in response');
      }
      
      // Store token
      localStorage.setItem('token', token);
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Ensure you're storing the user's ID correctly
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
      console.log('Original staff object:', staff);
      setCurrentUser(userData);
      
      return staff;
    })
    .catch(error => {
      console.error('Staff login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(error.response?.data?.message || 'Invalid email or password');
    });
}

/**
 * Login an owner
 * @param {string} email - Owner email
 * @param {string} password - Owner password
 * @param {function} setCurrentUser - State setter for the current user
 * @returns {Promise} Promise that resolves with the owner user data
 */
function loginOwnerUser(email, password, setCurrentUser) {
  return instance.post('/api/auth/owner/login', { email, password })
    .then(response => {
      // Debug response to see its structure
      console.log('Owner login response:', response);
      
      // Validate response structure with robust checks
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      // Check if data is in response.data (default structure)
      if (response.data.success && response.data.data) {
        const { token, owner } = response.data.data;
        
        if (!token || !owner) {
          throw new Error('Missing token or owner data in response');
        }
        
        // Store token
        localStorage.setItem('token', token);
        instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update user state
        setCurrentUser({
          owner_id: owner.owner_id,
          name: owner.name || `${owner.first_name} ${owner.last_name}`,
          email: owner.email,
          role: 'owner',
          type: 'owner'
        });
        
        return owner;
      }
      // Alternative structure: data might be directly in response.data
      else if (response.data.token && (response.data.owner || response.data.user)) {
        const { token } = response.data;
        const owner = response.data.owner || response.data.user;
        
        // Store token
        localStorage.setItem('token', token);
        instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update user state
        setCurrentUser({
          owner_id: owner.owner_id || owner.id,
          name: owner.name || `${owner.first_name} ${owner.last_name}`,
          email: owner.email,
          role: 'owner',
          type: 'owner'
        });
        
        return owner;
      }
      else {
        throw new Error('Invalid response format from server');
      }
    })
    .catch(error => {
      console.error('Owner login error:', error);
      throw new Error(error.response?.data?.message || 'Invalid email or password');
    });
}

/**
 * Auth Provider Component
 */
function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Handle logout
  function handleLogout() {
    logoutUser(setCurrentUser);
  }
  
  // Initial auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token && isTokenValid(token)) {
      // Set default auth header for subsequent requests
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch current user data
      fetchUserData(setCurrentUser, handleLogout)
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);
  
  // Context value - now including loading state
  const authContextValue = {
    currentUser,
    loading,
    loginStaff: (email, password) => loginStaffMember(email, password, setCurrentUser),
    loginOwner: (email, password) => loginOwnerUser(email, password, setCurrentUser),
    logout: () => logoutUser(setCurrentUser),
    isAuthenticated: Boolean(currentUser),
    isStaff: currentUser?.role === 'staff',
    isManager: currentUser?.role === 'manager',
    isOwner: currentUser?.role === 'owner'
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading ? children : <div>Loading authentication...</div>}
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