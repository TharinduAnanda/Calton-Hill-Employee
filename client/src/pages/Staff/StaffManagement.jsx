import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import StaffForm from './StaffForm';
import StaffList from './StaffList'; // You'll need to create this component

const StaffManagement = () => {
  const [selectedStaff, setSelectedStaff] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('list'); // Changed default to 'list'

  const handleFormSuccess = async (formData) => {
    try {
      // Handle form submission logic here
      console.log('Form submitted successfully:', formData);
      setSelectedStaff(null); // Reset selected staff after submission
      setActiveTab('list'); // Switch to list view
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleStaffSelect = (staff) => {
    setSelectedStaff(staff);
    setActiveTab('form');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
        >
          <Tab label="Staff List" value="list" />
          <Tab label={selectedStaff ? 'Edit Staff' : 'Add Staff'} value="form" />
        </Tabs>
      </Box>

      {activeTab === 'list' ? (
        <StaffList 
          onStaffSelect={handleStaffSelect}
          onAddNew={() => {
            setSelectedStaff(null);
            setActiveTab('form');
          }}
        />
      ) : (
        <StaffForm 
          initialData={selectedStaff} 
          onSubmit={(formData) => {
            if (formData === null) {
              setActiveTab('list');
            } else {
              handleFormSuccess(formData);
            }
          }}
        />
      )}
    </Box>
  );
};

export default StaffManagement;