import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import './StaffList.css';

function StaffList({ staffMembers = [], onStaffSelect, refreshTrigger, onDeleteStaff, roleFilter = 'all', roleSortFunction }) {
  // Add sorting to the filtered staff
  const sortedAndFilteredStaff = useMemo(() => {
    // First filter by role if needed
    const filtered = roleFilter === 'all' 
      ? [...staffMembers]
      : staffMembers.filter(staff => 
          (staff.role || staff.Role || '').toLowerCase() === roleFilter.toLowerCase()
        );
    
    // Then sort by role seniority if showing all roles
    if (roleFilter === 'all' && roleSortFunction) {
      return filtered.sort((a, b) => {
        const roleA = a.role || a.Role || 'staff';
        const roleB = b.role || b.Role || 'staff';
        return roleSortFunction(roleB) - roleSortFunction(roleA);
      });
    }
    
    return filtered;
  }, [staffMembers, roleFilter, roleSortFunction]);

  if (!sortedAndFilteredStaff || sortedAndFilteredStaff.length === 0) {
    return <div className="no-staff-message">No staff members found</div>;
  }

  return (
    <div className="staff-list-container">
      <table className="staff-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedAndFilteredStaff.map((staffMember) => (
            <tr key={staffMember.staff_id}>
              <td>{staffMember.name}</td>
              <td>{staffMember.email}</td>
              <td>{staffMember.role}</td>
              <td>
                <div className="action-buttons">
                  <button 
                    className="edit-button"
                    onClick={() => onStaffSelect(staffMember)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => onDeleteStaff(staffMember)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Update propTypes
StaffList.propTypes = {
  staffMembers: PropTypes.array,
  onStaffSelect: PropTypes.func.isRequired,
  refreshTrigger: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  onDeleteStaff: PropTypes.func,
  roleFilter: PropTypes.string,
  roleSortFunction: PropTypes.func
};

export default StaffList;