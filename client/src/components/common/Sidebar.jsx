import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Tooltip,
  ListItemButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Category as ProductIcon,
  People as SupplierIcon,
  ShoppingCart as OrderIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Analytics as AnalyticsIcon,
  Storefront as StorefrontIcon,
} from '@mui/icons-material';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const mainMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
  ];

  const catalogMenuItems = [
    { text: 'Products', icon: <ProductIcon />, path: '/products' },
    { text: 'Suppliers', icon: <SupplierIcon />, path: '/suppliers' },
    { text: 'Store', icon: <StorefrontIcon />, path: '/store' },
    { text: 'Orders', icon: <OrderIcon />, path: '/orders' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const firstLetter = user?.name?.charAt(0) || 'U';

  return (
    <Drawer
      variant="permanent"
      className="sidebar-drawer"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box className="sidebar-header">
          <Box className="sidebar-logo">
            <InventoryIcon fontSize="large" />
            <Typography variant="h6" component="div" className="sidebar-title">
              Calton Hill
            </Typography>
          </Box>
        </Box>
        
        <Box className="sidebar-welcome">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#60a5fa', width: 40, height: 40 }}>
              {firstLetter}
            </Avatar>
            <Box>
              <Typography variant="body2" className="sidebar-welcome-text">
                Welcome,
              </Typography>
              <Typography variant="body1" className="sidebar-user-name">
                {user?.name || 'User'}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Box className="menu-section">
          <Typography className="menu-section-title">
            Main
          </Typography>
          <List>
            {mainMenuItems.map((item) => (
              <ListItemButton
                component={Link}
                to={item.path}
                className={`sidebar-item ${isActive(item.path) ? 'sidebar-item-active' : ''}`}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </Box>
        
        <Box className="menu-section">
          <Typography className="menu-section-title">
            Catalog
          </Typography>
          <List>
            {catalogMenuItems.map((item) => (
              <ListItemButton
                component={Link}
                to={item.path}
                className={`sidebar-item ${isActive(item.path) ? 'sidebar-item-active' : ''}`}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </Box>
        
        <Box className="footer-section" sx={{ marginTop: 'auto' }}>
          <List>
            <Tooltip title="Settings" placement="right">
              <ListItemButton
                component={Link}
                to="/settings"
                className="sidebar-item"
              >
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </Tooltip>
            <Tooltip title="Logout" placement="right">
              <ListItemButton
                onClick={logout}
                className="sidebar-item logout-item"
                sx={{ cursor: 'pointer' }}
              >
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </Tooltip>
          </List>
          <Typography className="sidebar-version">
            v2.5.0
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;