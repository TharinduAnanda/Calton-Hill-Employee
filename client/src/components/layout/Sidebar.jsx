import React from 'react';
import { 
  Drawer, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Box,
  Typography
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Import your icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

const Sidebar = ({ open, onClose, width = 240 }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isOwner = currentUser?.role === 'owner';
  
  // Define menu items based on user role
  const ownerMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/owner/dashboard' },
    { text: 'Staff Management', icon: <PeopleIcon />, path: '/owner/staff' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/owner/inventory' },
    { text: 'Orders', icon: <ReceiptIcon />, path: '/owner/orders' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/owner/settings' },
  ];

  const staffMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/staff/dashboard' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/staff/inventory' },
    { text: 'Orders', icon: <ReceiptIcon />, path: '/staff/orders' },
  ];

  const menuItems = isOwner ? ownerMenuItems : staffMenuItems;

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose && window.innerWidth < 900) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%' 
        }}
      >
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Store Management
          </Typography>
          {currentUser && (
            <Typography variant="body2" color="text.secondary">
              {`${currentUser.firstName || ''} ${currentUser.lastName || ''}`}
            </Typography>
          )}
        </Box>
        
        <Divider />
        
        <List sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => (
            // Add a unique key prop using the path or text
            <ListItemButton
              key={item.path} 
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  }
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
        
        <Divider />
        
        <List>
          <ListItemButton onClick={handleLogout} key="logout">
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;