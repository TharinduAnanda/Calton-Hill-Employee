import React from 'react';
import './StaffList.css';

const StaffList = ({ staff = [], onEdit, onDelete }) => {
  if (!staff || staff.length === 0) {
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
          {staff.map((staffMember) => (
            <tr key={staffMember.staff_id}>
              <td>{staffMember.name}</td>
              <td>{staffMember.email}</td>
              <td>{staffMember.role}</td>
              <td>
                <div className="action-buttons">
                  <button 
                    className="edit-button"
                    onClick={() => onEdit(staffMember)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => onDelete(staffMember)}
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
};

export default StaffList;