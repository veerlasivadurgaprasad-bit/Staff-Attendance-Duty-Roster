import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function ClassroomAllocation() {
  const { isAdmin, isCentreHead } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal forms
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);

  const [newClassroomForm, setNewClassroomForm] = useState({
    classroom_name: '',
    capacity: 15
  });

  const [assignForm, setAssignForm] = useState({
    teacher_id: '',
    helper_id: ''
  });

  const isPrivileged = isAdmin() || isCentreHead();

  const loadClassrooms = async () => {
    setLoading(true);
    try {
      const list = await api.getClassrooms();
      setClassrooms(list);

      const staff = await api.getStaff({ status: 'Active' });
      setTeachers(staff.filter(s => s.role === 'Teacher'));
      setHelpers(staff.filter(s => s.role === 'Helper'));
    } catch (err) {
      alert("Error sync classroom data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClassrooms();
  }, []);

  const handleCreateClassroom = async (e) => {
    e.preventDefault();
    try {
      await api.createClassroom(newClassroomForm);
      setIsClassModalOpen(false);
      setNewClassroomForm({ classroom_name: '', capacity: 15 });
      loadClassrooms();
    } catch (err) {
      alert("Error adding classroom: " + err.message);
    }
  };

  const handleAssignClick = (room) => {
    setSelectedClassroom(room);
    setAssignForm({
      teacher_id: room.teacher_id || '',
      helper_id: room.helper_id || ''
    });
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.assignClassroomStaff(selectedClassroom.classroom_id, assignForm.teacher_id, assignForm.helper_id);
      setIsAssignModalOpen(false);
      setSelectedClassroom(null);
      loadClassrooms();
    } catch (err) {
      alert("Error assigning staff: " + err.message);
    }
  };

  return (
    <div className="page-container animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header controls */}
      {isPrivileged && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => setIsClassModalOpen(true)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Classroom
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading classroom layouts...</div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {classrooms.map((room) => (
            <div key={room.classroom_id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Card Title */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontFamily: 'Outfit', color: 'var(--text-primary)' }}>{room.classroom_name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Classroom ID: #{room.classroom_id}</span>
                </div>
                <span className={`badge badge-${room.status === 'Active' ? 'active' : 'inactive'}`}>
                  {room.status}
                </span>
              </div>

              {/* Assignments Info */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                padding: '14px 0',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Lead Teacher:</span>
                  <span style={{ fontWeight: '600', color: room.teacher_id ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {room.teacherName}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Classroom Helper:</span>
                  <span style={{ fontWeight: '600', color: room.helper_id ? 'var(--secondary)' : 'var(--text-muted)' }}>
                    {room.helperName}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Class Capacity:</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    {room.capacity} Intellitots
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {isPrivileged && (
                <button className="btn btn-outline" style={{ marginTop: 'auto', width: '100%' }} onClick={() => handleAssignClick(room)}>
                  Reassign Staff
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Classroom Modal */}
      <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title="Add Learning Classroom">
        <form onSubmit={handleCreateClassroom} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Classroom Name</label>
            <input
              type="text"
              name="classroom_name"
              value={newClassroomForm.classroom_name}
              onChange={(e) => setNewClassroomForm({ ...newClassroomForm, classroom_name: e.target.value })}
              className="form-input"
              placeholder="e.g. Playgroup - Nestling"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Capacity (Limit of Children)</label>
            <input
              type="number"
              name="capacity"
              value={newClassroomForm.capacity}
              onChange={(e) => setNewClassroomForm({ ...newClassroomForm, capacity: parseInt(e.target.value) })}
              className="form-input"
              min="1"
              max="50"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsClassModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Room</button>
          </div>
        </form>
      </Modal>

      {/* Reassign Staff Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title={`Assign Staff: ${selectedClassroom?.classroom_name}`}>
        <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Select Educator (Teacher)</label>
            <select
              value={assignForm.teacher_id}
              onChange={(e) => setAssignForm({ ...assignForm, teacher_id: e.target.value })}
              className="form-select"
            >
              <option value="">Unassigned</option>
              {teachers.map(t => (
                <option key={t.staff_id} value={t.staff_id}>{t.name} ({t.staff_id})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Attendant (Helper)</label>
            <select
              value={assignForm.helper_id}
              onChange={(e) => setAssignForm({ ...assignForm, helper_id: e.target.value })}
              className="form-select"
            >
              <option value="">Unassigned</option>
              {helpers.map(h => (
                <option key={h.staff_id} value={h.staff_id}>{h.name} ({h.staff_id})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
