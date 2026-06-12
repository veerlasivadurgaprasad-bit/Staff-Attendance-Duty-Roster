import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function DutyRoster() {
  const { isAdmin, isCentreHead } = useAuth();
  const [activeView, setActiveView] = useState('calendar'); // 'calendar' or 'table'
  const [roster, setRoster] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto-allocate date target
  const [allocateDate, setAllocateDate] = useState(new Date().toISOString().split('T')[0]);

  // Suggestion Modal
  const [selectedStaffForSuggestion, setSelectedStaffForSuggestion] = useState('');
  const [suggestionResult, setSuggestionResult] = useState(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  // Manual Assignment Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    staff_id: '',
    classroom_id: '',
    shift: 'Morning Shift (08:00 AM - 02:00 PM)',
    assigned_date: new Date().toISOString().split('T')[0]
  });

  const isPrivileged = isAdmin() || isCentreHead();

  // Selected date range for weekly calendar (starts at Mon June 8, 2026 for illustration)
  const weekdays = [
    { name: 'Monday', date: '2026-06-08' },
    { name: 'Tuesday', date: '2026-06-09' },
    { name: 'Wednesday', date: '2026-06-10' },
    { name: 'Thursday', date: '2026-06-11' },
    { name: 'Friday', date: '2026-06-12' }
  ];

  const loadRosterData = async () => {
    setLoading(true);
    try {
      const rosterList = await api.getRoster();
      setRoster(rosterList);

      const staff = await api.getStaff({ status: 'Active' });
      setStaffList(staff);

      const classes = await api.getClassrooms();
      setClassrooms(classes);
    } catch (err) {
      alert("Error sync duty log sheets: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRosterData();
  }, []);

  const handleAutoAllocate = async () => {
    if (window.confirm(`Are you sure you want to run the AI Auto Duty Allocation algorithm for date ${allocateDate}? This will re-evaluate capacity weights and available active staff.`)) {
      setLoading(true);
      try {
        const res = await api.autoAllocateRoster(allocateDate);
        if (res.warning) {
          alert(`Auto Duty Allocation completed with warning:\n${res.warning}`);
        } else {
          alert(`Success! Auto Duty Allocation completed for date ${allocateDate}.`);
        }
        loadRosterData();
      } catch (err) {
        alert("Failed to auto allocate duties: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGetSuggestion = async () => {
    if (!selectedStaffForSuggestion) return;
    setLoadingSuggestion(true);
    try {
      const res = await api.getShiftSuggestions(selectedStaffForSuggestion, allocateDate);
      setSuggestionResult(res);
    } catch (err) {
      alert("Failed to fetch shift advice: " + err.message);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleManualAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.saveRoster(assignmentForm);
      setIsAssignModalOpen(false);
      setAssignmentForm({
        staff_id: '',
        classroom_id: '',
        shift: 'Morning Shift (08:00 AM - 02:00 PM)',
        assigned_date: new Date().toISOString().split('T')[0]
      });
      loadRosterData();
    } catch (err) {
      alert("Failed to save assignment: " + err.message);
    }
  };

  // Find assignments for specific classroom, staff role and date
  const findRosterAssignment = (roomId, role, date) => {
    return roster.filter(
      r => r.classroom_id === roomId && r.role === role && r.assigned_date === date
    );
  };

  return (
    <div className="page-container animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Action panel carrying filters + AI triggers */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Date Selector & Manual Trigger */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <input 
              type="date" 
              value={allocateDate} 
              onChange={(e) => setAllocateDate(e.target.value)} 
              className="form-input" 
            />
          </div>
          {isPrivileged && (
            <button className="btn btn-secondary" onClick={handleAutoAllocate}>
              🧠 AI Auto-Allocate
            </button>
          )}
        </div>

        {/* View Toggles & Add Button */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            className={`btn ${activeView === 'calendar' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveView('calendar')}
          >
            Calendar View
          </button>
          <button 
            className={`btn ${activeView === 'table' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveView('table')}
          >
            Table Register
          </button>
          {isPrivileged && (
            <button className="btn btn-primary" onClick={() => setIsAssignModalOpen(true)}>
              Assign Duty Slot
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading duty allocations...</div>
      ) : (
        <>
          {/* VIEW 1: Weekly Calendar Grid */}
          {activeView === 'calendar' && (
            <div className="card" style={{ overflowX: 'auto', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.95rem', fontFamily: 'Outfit', color: 'var(--text-primary)' }}>
                  Weekly Shift Matrix (Mon Jun 8 - Fri Jun 12, 2026)
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>* Displays allocations for active learning classrooms</span>
              </div>

              <div className="table-container" style={{ border: 'none' }}>
                <table className="custom-table" style={{ border: '1px solid var(--border)' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '180px' }}>Classrooms / Roles</th>
                      {weekdays.map(day => (
                        <th key={day.date} style={{ textAlign: 'center', minWidth: '150px' }}>
                          <div>{day.name}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{day.date}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {classrooms.map((room) => (
                      <React.Fragment key={room.classroom_id}>
                        {/* Teacher Row */}
                        <tr>
                          <td style={{ fontWeight: '700', borderBottom: 'none' }}>
                            <div style={{ fontFamily: 'Outfit', fontSize: '0.8rem' }}>{room.classroom_name}</div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase' }}>Educators</span>
                          </td>
                          {weekdays.map(day => {
                            const assignments = findRosterAssignment(room.classroom_id, 'Teacher', day.date);
                            return (
                              <td key={day.date} style={{ borderBottom: 'none', padding: '10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {assignments.map((asg, index) => (
                                    <div key={index} style={{
                                      backgroundColor: 'var(--accent-light)',
                                      border: '1px solid rgba(59, 130, 246, 0.2)',
                                      borderRadius: '6px',
                                      padding: '6px 10px',
                                      fontSize: '0.75rem',
                                      textAlign: 'center'
                                    }}>
                                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{asg.staff_name}</div>
                                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{asg.shift.split(' ')[0]}</div>
                                    </div>
                                  ))}
                                  {assignments.length === 0 && (
                                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.7rem', textAlign: 'center', padding: '8px' }}>Unassigned</div>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                        {/* Helper Row */}
                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                          <td style={{ fontWeight: '700' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Helpers</span>
                          </td>
                          {weekdays.map(day => {
                            const assignments = findRosterAssignment(room.classroom_id, 'Helper', day.date);
                            return (
                              <td key={day.date} style={{ padding: '10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {assignments.map((asg, index) => (
                                    <div key={index} style={{
                                      backgroundColor: '#faf5ff',
                                      border: '1px solid rgba(168, 85, 247, 0.2)',
                                      borderRadius: '6px',
                                      padding: '6px 10px',
                                      fontSize: '0.75rem',
                                      textAlign: 'center'
                                    }}>
                                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{asg.staff_name}</div>
                                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{asg.shift.split(' ')[0]}</div>
                                    </div>
                                  ))}
                                  {assignments.length === 0 && (
                                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.7rem', textAlign: 'center', padding: '8px' }}>Unassigned</div>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 2: Assigned Duty Table */}
          {activeView === 'table' && (
            <div className="card">
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Classroom</th>
                      <th>Staff ID</th>
                      <th>Staff Name</th>
                      <th>Workspace Role</th>
                      <th>Shift Allocated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                          No duties allocated in register.
                        </td>
                      </tr>
                    ) : (
                      roster.map((r) => (
                        <tr key={r.roster_id}>
                          <td style={{ fontWeight: '600' }}>{r.assigned_date}</td>
                          <td style={{ fontWeight: '600' }}>{r.classroom_name}</td>
                          <td style={{ fontWeight: '700', fontFamily: 'Outfit' }}>{r.staff_id}</td>
                          <td style={{ fontWeight: '600' }}>{r.staff_name}</td>
                          <td>
                            <span className={`badge ${r.role === 'Teacher' ? 'badge-present' : 'badge-leave'}`}>
                              {r.role}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', fontWeight: '500' }}>{r.shift}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI Shift Suggestions Panel */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '20px', height: '20px', color: 'var(--primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 style={{ fontSize: '0.95rem', fontFamily: 'Outfit', color: 'var(--text-primary)' }}>AI Shift Recommendation Analyzer</h3>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Select Staff Member</label>
                <select
                  value={selectedStaffForSuggestion}
                  onChange={(e) => { setSelectedStaffForSuggestion(e.target.value); setSuggestionResult(null); }}
                  className="form-select"
                  style={{ width: '220px' }}
                >
                  <option value="">Select Staff...</option>
                  {staffList.map(s => (
                    <option key={s.staff_id} value={s.staff_id}>{s.staff_id} - {s.name}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" onClick={handleGetSuggestion} disabled={!selectedStaffForSuggestion}>
                {loadingSuggestion ? 'Analyzing...' : 'Analyze Shift Match'}
              </button>
            </div>

            {suggestionResult && (
              <div style={{
                marginTop: '20px',
                backgroundColor: 'var(--accent-light)',
                border: '1px solid rgba(59, 130, 246, 0.15)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.85rem'
              }} className="animate-fade">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                  <span>Suggested Shift:</span>
                  <span style={{ color: 'var(--primary)' }}>{suggestionResult.suggested_shift}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Workload Index:</span>
                  <span style={{ fontWeight: '600', color: suggestionResult.workloadIndex === 'High' ? 'var(--warning)' : 'var(--success)' }}>
                    {suggestionResult.workloadIndex}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>AI Match Confidence:</span>
                  <span style={{ fontWeight: '700', color: 'var(--secondary)' }}>{suggestionResult.confidence}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                  💡 <strong>Recommendation Insight:</strong> {suggestionResult.insights}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Manual Allocation Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Classroom Shift Slot">
        <form onSubmit={handleManualAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Select Staff</label>
            <select
              value={assignmentForm.staff_id}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, staff_id: e.target.value })}
              className="form-select"
              required
            >
              <option value="">Choose Staff...</option>
              {staffList.map(s => (
                <option key={s.staff_id} value={s.staff_id}>{s.staff_id} - {s.name} ({s.role})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Classroom</label>
            <select
              value={assignmentForm.classroom_id}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, classroom_id: e.target.value })}
              className="form-select"
              required
            >
              <option value="">Choose Classroom...</option>
              {classrooms.map(c => (
                <option key={c.classroom_id} value={c.classroom_id}>{c.classroom_name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Allocated Shift</label>
            <select
              value={assignmentForm.shift}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, shift: e.target.value })}
              className="form-select"
            >
              <option value="Morning Shift (08:00 AM - 02:00 PM)">Morning Shift (08:00 AM - 02:00 PM)</option>
              <option value="General Shift (09:00 AM - 05:00 PM)">General Shift (09:00 AM - 05:00 PM)</option>
              <option value="Afternoon Shift (12:00 PM - 06:00 PM)">Afternoon Shift (12:00 PM - 06:00 PM)</option>
              <option value="Daycare Shift (10:00 AM - 07:00 PM)">Daycare Shift (10:00 AM - 07:00 PM)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Assignment Date</label>
            <input
              type="date"
              value={assignmentForm.assigned_date}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, assigned_date: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Assignment</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
