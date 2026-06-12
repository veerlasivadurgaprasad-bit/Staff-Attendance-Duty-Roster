import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function StaffManagement({ searchQuery }) {
  const { isAdmin, isCentreHead } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    staff_id: '',
    name: '',
    email: '',
    role: 'Teacher',
    designation: '',
    department: '',
    phone: '',
    shift: 'General Shift (09:00 AM - 05:00 PM)',
    status: 'Active',
    password: ''
  });

  const isPrivileged = isAdmin() || isCentreHead();

  const loadStaff = async () => {
    setLoading(true);
    try {
      const list = await api.getStaff({
        search: searchQuery,
        role: roleFilter,
        status: statusFilter
      });
      setStaff(list);
    } catch (err) {
      alert("Error loading staff directory: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [searchQuery, roleFilter, statusFilter]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createStaff(formData);
      setIsAddModalOpen(false);
      resetForm();
      loadStaff();
    } catch (err) {
      alert("Error adding staff: " + err.message);
    }
  };

  const handleEditClick = (member) => {
    setSelectedStaff(member);
    setFormData({
      staff_id: member.staff_id,
      name: member.name,
      email: member.email,
      role: member.role,
      designation: member.designation,
      department: member.department || '',
      phone: member.phone,
      shift: member.shift,
      status: member.status,
      password: ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updateStaff(selectedStaff.staff_id, formData);
      setIsEditModalOpen(false);
      resetForm();
      loadStaff();
    } catch (err) {
      alert("Error updating staff: " + err.message);
    }
  };

  const handleDeleteClick = async (staff_id) => {
    if (window.confirm(`Are you sure you want to remove staff member ${staff_id}? This will also delete their login user account.`)) {
      try {
        await api.deleteStaff(staff_id);
        loadStaff();
      } catch (err) {
        alert("Error deleting staff: " + err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      staff_id: '',
      name: '',
      email: '',
      role: 'Teacher',
      designation: '',
      department: '',
      phone: '',
      shift: 'General Shift (09:00 AM - 05:00 PM)',
      status: 'Active',
      password: ''
    });
    setSelectedStaff(null);
  };

  return (
    <div className="page-container animate-fade">
      {/* Action Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px'
      }}>
        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="form-select"
            style={{ width: '160px', padding: '8px 12px' }}
          >
            <option value="">All Roles</option>
            <option value="Teacher">Teachers</option>
            <option value="Helper">Helpers</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: '160px', padding: '8px 12px' }}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>

        {isPrivileged && (
          <button 
            className="btn btn-primary"
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Staff
          </button>
        )}
      </div>

      {/* Staff Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Syncing directory...</div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Assigned Shift</th>
                <th>Status</th>
                {isPrivileged && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={isPrivileged ? 9 : 8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                    No staff records match search filters.
                  </td>
                </tr>
              ) : (
                staff.map((member) => (
                  <tr key={member.staff_id}>
                    <td style={{ fontWeight: '700', fontFamily: 'Outfit' }}>{member.staff_id}</td>
                    <td style={{ fontWeight: '600' }}>{member.name}</td>
                    <td>
                      <span className={`badge ${member.role === 'Teacher' ? 'badge-present' : 'badge-leave'}`} style={{ fontSize: '0.7rem' }}>
                        {member.role}
                      </span>
                    </td>
                    <td>{member.department}</td>
                    <td>{member.designation}</td>
                    <td>{member.email}</td>
                    <td>{member.phone}</td>
                    <td style={{ fontSize: '0.75rem', fontWeight: '500' }}>{member.shift.split(' ')[0]}</td>
                    <td>
                      <span className={`badge badge-${member.status.toLowerCase().replace(' ', '')}`}>
                        {member.status}
                      </span>
                    </td>
                    {isPrivileged && (
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-outline"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                            onClick={() => handleEditClick(member)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-danger"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                            onClick={() => handleDeleteClick(member.staff_id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Daycare Staff">
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Staff ID</label>
              <input type="text" name="staff_id" value={formData.staff_id} onChange={handleInputChange} className="form-input" placeholder="e.g. T-003" required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" placeholder="e.g. Anita Sharma" required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" placeholder="anita@firstcry.com" required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="form-input" placeholder="9876543222" required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">System Role</label>
              <select name="role" value={formData.role} onChange={handleInputChange} className="form-select">
                <option value="Teacher">Teacher</option>
                <option value="Helper">Helper</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Department</label>
              <input type="text" name="department" value={formData.department} onChange={handleInputChange} className="form-input" placeholder="e.g. Early Years" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Designation / Title</label>
            <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="form-input" placeholder="e.g. Playgroup Lead" required />
          </div>

          <div className="form-group">
            <label className="form-label">Contract Shift</label>
            <select name="shift" value={formData.shift} onChange={handleInputChange} className="form-select">
              <option value="Morning Shift (08:00 AM - 02:00 PM)">Morning Shift (08:00 AM - 02:00 PM)</option>
              <option value="General Shift (09:00 AM - 05:00 PM)">General Shift (09:00 AM - 05:00 PM)</option>
              <option value="Afternoon Shift (12:00 PM - 06:00 PM)">Afternoon Shift (12:00 PM - 06:00 PM)</option>
              <option value="Daycare Shift (10:00 AM - 07:00 PM)">Daycare Shift (10:00 AM - 07:00 PM)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Initial Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="form-input" placeholder="staff123" required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Initial Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className="form-select">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Member</button>
          </div>
        </form>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Modify Profile: ${selectedStaff?.name}`}>
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Staff ID (Read-only)</label>
              <input type="text" className="form-input" value={formData.staff_id} disabled style={{ backgroundColor: '#f1f5f9' }} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-input" required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="form-input" required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Role</label>
              <select name="role" value={formData.role} onChange={handleInputChange} className="form-select">
                <option value="Teacher">Teacher</option>
                <option value="Helper">Helper</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Department</label>
              <input type="text" name="department" value={formData.department} onChange={handleInputChange} className="form-input" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Designation / Title</label>
            <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">Shift</label>
            <select name="shift" value={formData.shift} onChange={handleInputChange} className="form-select">
              <option value="Morning Shift (08:00 AM - 02:00 PM)">Morning Shift (08:00 AM - 02:00 PM)</option>
              <option value="General Shift (09:00 AM - 05:00 PM)">General Shift (09:00 AM - 05:00 PM)</option>
              <option value="Afternoon Shift (12:00 PM - 06:00 PM)">Afternoon Shift (12:00 PM - 06:00 PM)</option>
              <option value="Daycare Shift (10:00 AM - 07:00 PM)">Daycare Shift (10:00 AM - 07:00 PM)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">New Password (Optional)</label>
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="form-input" placeholder="Leave blank to keep current" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className="form-select">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
