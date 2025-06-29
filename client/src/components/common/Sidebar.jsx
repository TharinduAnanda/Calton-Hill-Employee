import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Box,
  Collapse
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SettingsIcon from '@mui/icons-material/Settings';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';
import { useState } from 'react';

/**
 * Sidebar navigation component
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the sidebar is open
 * @param {Function} props.onClose - Function to close the sidebar
 */
function Sidebar({ open, onClose }) {
  const { currentUser } = useAuth();
  const [inventoryOpen, setInventoryOpen] = useState(true);
  
  const handleInventoryClick = () => {
    setInventoryOpen(!inventoryOpen);
  };
  
  /**
   * Get appropriate dashboard link based on user role
   * @returns {string} Dashboard link path
   */
  function getDashboardLink() {
    if (!currentUser) return '/login';
    
    if (currentUser.role === 'owner') {
      return '/owner/dashboard';
    } else {
      return '/staff/dashboard';
    }
  }
  
  function getInventoryLink() {
    if (currentUser?.role === 'owner') {
      return '/owner/inventory';
    } else {
      return '/inventory';
    }
  }
  
  const dashboardLink = getDashboardLink();
  const inventoryLink = getInventoryLink();
  const showStaffManagement = currentUser?.role === 'owner';
  
  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItem component={Link} to={dashboardLink}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          
          {showStaffManagement && (
            <ListItem component={Link} to="/staff/management">
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Staff Management" />
            </ListItem>
          )}
          
          <ListItem onClick={handleInventoryClick}>
            <ListItemIcon>
              <InventoryIcon />
            </ListItemIcon>
            <ListItemText primary="Inventory" />
            {inventoryOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          
          <Collapse in={inventoryOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem component={Link} to={inventoryLink} sx={{ pl: 4 }}>
                <ListItemIcon>
                  <InventoryIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="All Items" />
              </ListItem>
              
              <ListItem component={Link} to={`${inventoryLink}/purchase-orders`} sx={{ pl: 4 }}>
                <ListItemIcon>
                  <ReceiptIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Purchase Orders" />
              </ListItem>
            </List>
          </Collapse>
          
          <ListItem component={Link} to="/orders">
            <ListItemIcon>
              <ShoppingCartIcon />
            </ListItemIcon>
            <ListItemText primary="Orders" />
          </ListItem>
        </List>
        
        <Divider />
        
        <List>
          <ListItem component={Link} to="/settings">
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}

export default Sidebar;