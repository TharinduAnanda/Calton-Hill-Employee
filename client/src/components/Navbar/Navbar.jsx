import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaWarehouse, FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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
    <nav className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <FaWarehouse className="h-8 w-8 mr-2" />
              <span className="font-bold text-xl">Inventory System</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Dashboard
              </Link>
              <Link
                to="/products"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Products
              </Link>
              <Link
                to="/inventory"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Inventory
              </Link>
              <Link
                to="/suppliers"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Suppliers
              </Link>
              <Link
                to="/orders"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Orders
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="relative">
              <button
                onClick={toggleProfileDropdown}
                className="flex items-center text-sm rounded-full focus:outline-none"
              >
                <span className="mr-2">{currentUser?.name || 'User'}</span>
                <div className="h-8 w-8 rounded-full bg-blue-800 flex items-center justify-center">
                  <FaUser />
                </div>
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="bg-blue-700 inline-flex items-center justify-center p-2 rounded-md hover:bg-blue-800 focus:outline-none"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={toggleMenu}
            >
              Dashboard
            </Link>
            <Link
              to="/products"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={toggleMenu}
            >
              Products
            </Link>
            <Link
              to="/inventory"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={toggleMenu}
            >
              Inventory
            </Link>
            <Link
              to="/suppliers"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={toggleMenu}
            >
              Suppliers
            </Link>
            <Link
              to="/orders"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={toggleMenu}
            >
              Orders
            </Link>

            <hr className="border-blue-700" />

            <Link
              to="/profile"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={toggleMenu}
            >
              Your Profile
            </Link>
            <Link
              to="/settings"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
              onClick={toggleMenu}
            >
              Settings
            </Link>
            <button
              onClick={() => {
                handleLogout();
                toggleMenu();
              }}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700 flex items-center"
            >
              <FaSignOutAlt className="mr-2" /> Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;