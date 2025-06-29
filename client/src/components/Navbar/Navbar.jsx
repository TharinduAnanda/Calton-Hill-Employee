import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaWarehouse, FaBars, FaTimes, FaUser, FaSignOutAlt, FaCog, FaUserCircle, FaBell } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css'; // Import the CSS file

const Navbar = ({ unreadNotificationCount, onControlCenterToggle }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Get current date in the same format as Owner Dashboard
  const formattedDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Function to get the user's display name based on their role and available properties
  const getUserDisplayName = () => {
    if (!currentUser) return 'User';
    
    if (currentUser.type === 'owner' || currentUser.role === 'owner') {
      return currentUser.name || 'Owner';
    } else {
      // For staff members
      if (currentUser.first_name) {
        return currentUser.first_name;
      } else if (currentUser.name) {
        return currentUser.name.split(' ')[0]; // Get first name from full name
      }
      return 'Staff';
    }
  };

  const handleLogout = () => {
    logout();
    // Skip React Router navigation and use direct browser navigation
    // This prevents any intermediate screens from showing
    window.location.replace('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isProfileDropdownOpen) setIsProfileDropdownOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };
  
  // Get the appropriate inventory link based on user role
  const getInventoryPath = () => {
    if (currentUser?.role === 'owner') {
      return '/owner/inventory';
    } else {
      return '/inventory';
    }
  };

  // Handle navigation with proper replace
  const handleNavigation = (path) => {
    // Use direct navigation
    window.location.href = path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo" onClick={(e) => {
          e.preventDefault();
          window.location.href = '/dashboard';
        }}>
          <FaWarehouse className="logo-icon" />
          <span>Calton Hill</span>
        </Link>
        
        {/* Welcome Message */}
        <div className="welcome-message">
          <span>Welcome back, {getUserDisplayName()}!</span>
          <span className="date-display">Today is {formattedDate}</span>
        </div>

        {/* Desktop Navigation */}
        <div className="desktop-menu">
          <div className="nav-links">
            <button onClick={() => handleNavigation('/dashboard')} className="nav-link">
              Dashboard
            </button>
            <button onClick={() => handleNavigation('/products')} className="nav-link">
              Products
            </button>
            <button onClick={() => handleNavigation(getInventoryPath())} className="nav-link">
              Inventory
            </button>
            <button onClick={() => handleNavigation('/suppliers')} className="nav-link">
              Suppliers
            </button>
            <button onClick={() => handleNavigation('/orders')} className="nav-link">
              Orders
            </button>
          </div>
        </div>

        <div className="desktop-menu">
          {/* Control Center Button */}
          {currentUser?.role === 'owner' && (
            <button 
              className="control-center-btn"
              onClick={onControlCenterToggle}
            >
              <div className="icon-wrapper">
                <FaBell />
                {unreadNotificationCount > 0 && (
                  <span className="notification-badge">
                    {unreadNotificationCount}
                  </span>
                )}
              </div>
              <span>Control Center</span>
            </button>
          )}
          
          <div className="profile-menu">
            <button onClick={toggleProfileDropdown} className="profile-button">
              <span className="user-name">{getUserDisplayName()}</span>
              <div className="avatar">
                <FaUser />
              </div>
            </button>

            {isProfileDropdownOpen && (
              <div className="dropdown">
                <button className="dropdown-link" onClick={() => handleNavigation('/profile')}>
                  <FaUserCircle />
                  Your Profile
                </button>
                <button className="dropdown-link" onClick={() => handleNavigation('/settings')}>
                  <FaCog />
                  Settings
                </button>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="signout-btn">
                  <FaSignOutAlt style={{ marginRight: '0.75rem' }} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <button onClick={toggleMenu} className="mobile-menu-button">
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <button className="mobile-link" onClick={() => handleNavigation('/dashboard')}>
            Dashboard
          </button>
          <button className="mobile-link" onClick={() => handleNavigation('/products')}>
            Products
          </button>
          <button className="mobile-link" onClick={() => handleNavigation(getInventoryPath())}>
            Inventory
          </button>
          <button className="mobile-link" onClick={() => handleNavigation('/suppliers')}>
            Suppliers
          </button>
          <button className="mobile-link" onClick={() => handleNavigation('/orders')}>
            Orders
          </button>
          
          {/* Add Control Center for mobile */}
          {currentUser?.role === 'owner' && (
            <button 
              className="mobile-link" 
              onClick={() => {
                onControlCenterToggle();
                toggleMenu();
              }}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <FaBell style={{ marginRight: '0.75rem' }} />
              Control Center {unreadNotificationCount > 0 && `(${unreadNotificationCount})`}
            </button>
          )}

          <div className="mobile-divider"></div>

          <button className="mobile-link" onClick={() => handleNavigation('/profile')}>
            <FaUserCircle style={{ marginRight: '0.75rem' }} />
            Your Profile
          </button>
          <button className="mobile-link" onClick={() => handleNavigation('/settings')}>
            <FaCog style={{ marginRight: '0.75rem' }} />
            Settings
          </button>
          <button
            onClick={() => {
              handleLogout();
              toggleMenu();
            }}
            className="mobile-link"
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <FaSignOutAlt style={{ marginRight: '0.75rem' }} /> Sign out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;