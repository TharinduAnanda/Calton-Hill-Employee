import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StaffList from '../Staff/StaffList';
import StaffForm from '../Staff/StaffForm';
import Loading from '../../components/common/Loading';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import './StaffManagement.css';

const StaffManagement = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'owner') {
      navigate('/login');
      return;
    }

    const fetchStaff = async () => {
      try {
        setLoading(true);
        // Replace with your actual API call
        // const response = await staffService.getAllStaff();
        // setStaffList(response.data);
        
        // Temporary mock data
        const mockStaff = [
          { id: 1, name: 'John Doe', email: 'john@example.com', role: 'manager' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'staff' }
        ];
        setStaffList(mockStaff);
      } catch (err) {
        setError('Failed to load staff data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [currentUser, navigate]);

  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    setActiveTab('form');
  };

  const handleDelete = (staff) => {
    setStaffToDelete(staff);
    setShowConfirmDialog(true);
  };

  const confirmDelete = () => {
    if (staffToDelete) {
      try {
        // Replace with your actual API call
        // await staffService.deleteStaff(staffToDelete.id);
        
        // Update local state
        setStaffList(staffList.filter(staff => staff.id !== staffToDelete.id));
        setShowConfirmDialog(false);
        setStaffToDelete(null);
      } catch (err) {
        setError('Failed to delete staff member');
        console.error(err);
      }
    }
  };

  const handleFormSuccess = (newStaff) => {
    if (selectedStaff) {
      // Update existing staff
      setStaffList(staffList.map(staff => 
        staff.id === selectedStaff.id ? newStaff : staff
      ));
    } else {
      // Add new staff
      setStaffList([...staffList, newStaff]);
    }
    setSelectedStaff(null);
    setActiveTab('list');
  };

  if (loading) return <Loading />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="staff-management-container">
      <div className="staff-management-header">
        <h2>Staff Management</h2>
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            Staff List
          </button>
          <button
            className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
            onClick={() => {
              setSelectedStaff(null);
              setActiveTab('form');
            }}
          >
            {selectedStaff ? 'Edit Staff' : 'Add New Staff'}
          </button>
        </div>
      </div>

      <div className="staff-management-content">
        {activeTab === 'list' ? (
          <StaffList 
            staff={staffList} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        ) : (
          <StaffForm 
            staff={selectedStaff} 
            onSuccess={handleFormSuccess} 
            onCancel={() => setActiveTab('list')}
          />
        )}
      </div>

      <ConfirmDialog
        show={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete ${staffToDelete?.name}?`}
      />
    </div>
  );
};

export default StaffManagement;