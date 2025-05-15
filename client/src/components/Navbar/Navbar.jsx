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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isProfileDropdownOpen) setIsProfileDropdownOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          <FaWarehouse className="logo-icon" />
          <span>Calton Hill</span>
        </Link>
        
        {/* Welcome Message */}
        <div className="welcome-message">
          <span>Welcome back, {currentUser?.name || 'Owner'}!</span>
          <span className="date-display">Today is {formattedDate}</span>
        </div>

        {/* Desktop Navigation */}
        <div className="desktop-menu">
          <div className="nav-links">
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link to="/products" className="nav-link">
              Products
            </Link>
            <Link to="/inventory" className="nav-link">
              Inventory
            </Link>
            <Link to="/suppliers" className="nav-link">
              Suppliers
            </Link>
            <Link to="/orders" className="nav-link">
              Orders
            </Link>
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
              <span className="user-name">{currentUser?.name || 'User'}</span>
              <div className="avatar">
                <FaUser />
              </div>
            </button>

            {isProfileDropdownOpen && (
              <div className="dropdown">
                <Link to="/profile" className="dropdown-link" onClick={() => setIsProfileDropdownOpen(false)}>
                  <FaUserCircle />
                  Your Profile
                </Link>
                <Link to="/settings" className="dropdown-link" onClick={() => setIsProfileDropdownOpen(false)}>
                  <FaCog />
                  Settings
                </Link>
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
          <Link to="/dashboard" className="mobile-link" onClick={toggleMenu}>
            Dashboard
          </Link>
          <Link to="/products" className="mobile-link" onClick={toggleMenu}>
            Products
          </Link>
          <Link to="/inventory" className="mobile-link" onClick={toggleMenu}>
            Inventory
          </Link>
          <Link to="/suppliers" className="mobile-link" onClick={toggleMenu}>
            Suppliers
          </Link>
          <Link to="/orders" className="mobile-link" onClick={toggleMenu}>
            Orders
          </Link>
          
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

          <Link to="/profile" className="mobile-link" onClick={toggleMenu}>
            <FaUserCircle style={{ marginRight: '0.75rem' }} />
            Your Profile
          </Link>
          <Link to="/settings" className="mobile-link" onClick={toggleMenu}>
            <FaCog style={{ marginRight: '0.75rem' }} />
            Settings
          </Link>
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