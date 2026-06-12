import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function AttendanceManagement({ searchQuery }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('register'); // 'register' or 'history'
  const [staffList, setStaffList] = useState([]);
  const [attendanceToday, setAttendanceToday] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manual Log Form State
  const [manualForm, setManualForm] = useState({
    staff_id: '',
    date: new Date().toISOString().split('T')[0],
    check_in: '09:00',
    check_out: '17:00',
    attendance_status: 'Present'
  });

  // Filters for History
  const [historyFilterDate, setHistoryFilterDate] = useState('');
  const [historyFilterStaff, setHistoryFilterStaff] = useState('');

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      const staff = await api.getStaff({ status: 'Active' });
      setStaffList(staff);

      const today = new Date().toISOString().split('T')[0];
      const todayLogs = await api.getAttendance({ date: today });
      setAttendanceToday(todayLogs);

      const history = await api.getAttendance({
        date: historyFilterDate,
        staff_id: historyFilterStaff
      });
      setHistoryLogs(history.reverse());
    } catch (err) {
      alert("Error sync attendance logs: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceData();
  }, [activeTab, historyFilterDate, historyFilterStaff]);

  const handleQuickStatus = async (staff_id, status) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const timeNow = new Date().toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit' });

      await api.markAttendance({
        staff_id,
        date: today,
        check_in: status === 'Present' || status === 'Half Day' ? timeNow : null,
        check_out: null,
        attendance_status: status
      });
      
      loadAttendanceData();
    } catch (err) {
      alert("Failed to mark status: " + err.message);
    }
  };

  const handleCheckout = async (log) => {
    try {
      const timeNow = new Date().toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit' });
      await api.markAttendance({
        staff_id: log.staff_id,
        date: log.date,
        check_in: log.check_in,
        check_out: timeNow,
        attendance_status: log.attendance_status
      });
      loadAttendanceData();
    } catch (err) {
      alert("Failed to sign out staff: " + err.message);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.markAttendance(manualForm);
      alert("Attendance logged successfully!");
      setManualForm({
        staff_id: '',
        date: new Date().toISOString().split('T')[0],
        check_in: '09:00',
        check_out: '17:00',
        attendance_status: 'Present'
      });
      loadAttendanceData();
    } catch (err) {
      alert("Error saving manual entry: " + err.message);
    }
  };

  // Export report
  const handleExportCSV = () => {
    if (historyLogs.length === 0) {
      alert("No attendance records to export.");
      return;
    }

    const headers = ['Attendance ID,Staff ID,Name,Role,Date,Check In,Check Out,Status\n'];
    const rows = historyLogs.map(log => 
      `${log.attendance_id || ''},${log.staff_id},"${log.name}","${log.role}",${log.date},${log.check_in || ''},${log.check_out || ''},${log.attendance_status}`
    );

    const blob = new Blob([headers.concat(rows.join('\n'))], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Intellitots_Attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Tabs Menu */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        gap: '24px'
      }}>
        <button
          onClick={() => setActiveTab('register')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'register' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'register' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: '600',
            fontSize: '0.9rem',
            paddingBottom: '12px',
            cursor: 'pointer',
            fontFamily: 'Outfit'
          }}
        >
          Daily Roll Call Register
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'history' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: '600',
            fontSize: '0.9rem',
            paddingBottom: '12px',
            cursor: 'pointer',
            fontFamily: 'Outfit'
          }}
        >
          Attendance Archives
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'manual' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'manual' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: '600',
            fontSize: '0.9rem',
            paddingBottom: '12px',
            cursor: 'pointer',
            fontFamily: 'Outfit'
          }}
        >
          Manual Time Correction
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading registry files...</div>
      ) : (
        <>
          {/* TAB 1: Roll Call Register */}
          {activeTab === 'register' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
              <div className="card">
                <h3 style={{ fontSize: '0.95rem', fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '18px' }}>
                  Register Sheet: Today ({new Date().toISOString().split('T')[0]})
                </h3>
                
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Staff Name</th>
                        <th>Role</th>
                        <th>Preferred Shift</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Attendance Status</th>
                        <th style={{ textAlign: 'right' }}>Log Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map((member) => {
                        const log = attendanceToday.find(l => l.staff_id === member.staff_id);
                        return (
                          <tr key={member.staff_id}>
                            <td>
                              <div style={{ fontWeight: '600' }}>{member.name}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {member.staff_id}</div>
                            </td>
                            <td>
                              <span className={`badge ${member.role === 'Teacher' ? 'badge-present' : 'badge-leave'}`} style={{ fontSize: '0.7rem' }}>
                                {member.role}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.75rem' }}>{member.shift.split(' ')[0]}</td>
                            <td style={{ fontWeight: '600' }}>{log?.check_in || '--'}</td>
                            <td style={{ fontWeight: '600' }}>{log?.check_out || '--'}</td>
                            <td>
                              {log ? (
                                <span className={`badge badge-${log.attendance_status.toLowerCase().replace(' ', '')}`}>
                                  {log.attendance_status}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>Unmarked</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {!log ? (
                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                  <button className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '0.75rem' }} onClick={() => handleQuickStatus(member.staff_id, 'Present')}>
                                    Check In
                                  </button>
                                  <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '0.75rem', borderColor: 'var(--warning)', color: 'var(--warning)' }} onClick={() => handleQuickStatus(member.staff_id, 'Half Day')}>
                                    Half Day
                                  </button>
                                  <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '0.75rem' }} onClick={() => handleQuickStatus(member.staff_id, 'Absent')}>
                                    Absent
                                  </button>
                                </div>
                              ) : log.check_in && !log.check_out && (log.attendance_status === 'Present' || log.attendance_status === 'Half Day') ? (
                                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleCheckout(log)}>
                                  Sign Out
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Logged ✅</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Attendance Archives */}
          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* History Search Headers */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <input 
                      type="date" 
                      value={historyFilterDate} 
                      onChange={(e) => setHistoryFilterDate(e.target.value)}
                      className="form-input" 
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <select 
                      value={historyFilterStaff} 
                      onChange={(e) => setHistoryFilterStaff(e.target.value)}
                      className="form-select"
                      style={{ width: '180px' }}
                    >
                      <option value="">All Staff ID</option>
                      {staffList.map(s => (
                        <option key={s.staff_id} value={s.staff_id}>{s.staff_id} - {s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button className="btn btn-outline" onClick={handleExportCSV}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export History (CSV)
                </button>
              </div>

              {/* History Table */}
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Staff ID</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                          No historical attendance records found.
                        </td>
                      </tr>
                    ) : (
                      historyLogs.map((log) => (
                        <tr key={log.attendance_id}>
                          <td style={{ fontWeight: '600' }}>{log.date}</td>
                          <td style={{ fontWeight: '700', fontFamily: 'Outfit' }}>{log.staff_id}</td>
                          <td style={{ fontWeight: '600' }}>{log.name}</td>
                          <td>
                            <span className={`badge ${log.role === 'Teacher' ? 'badge-present' : 'badge-leave'}`} style={{ fontSize: '0.7rem' }}>
                              {log.role}
                            </span>
                          </td>
                          <td style={{ fontWeight: '600' }}>{log.check_in || '--'}</td>
                          <td style={{ fontWeight: '600' }}>{log.check_out || '--'}</td>
                          <td>
                            <span className={`badge badge-${log.attendance_status.toLowerCase().replace(' ', '')}`}>
                              {log.attendance_status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Manual Time Correction */}
          {activeTab === 'manual' && (
            <div className="card" style={{ maxWidth: '550px', margin: '0 auto', width: '100%' }}>
              <h3 style={{ fontSize: '0.95rem', fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '20px' }}>
                Manually Adjust Attendance Record
              </h3>
              <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Select Staff Member</label>
                  <select
                    value={manualForm.staff_id}
                    onChange={(e) => setManualForm({ ...manualForm, staff_id: e.target.value })}
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
                  <label className="form-label">Record Date</label>
                  <input
                    type="date"
                    value={manualForm.date}
                    onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Check-In Time</label>
                    <input
                      type="time"
                      value={manualForm.check_in}
                      onChange={(e) => setManualForm({ ...manualForm, check_in: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Check-Out Time</label>
                    <input
                      type="time"
                      value={manualForm.check_out}
                      onChange={(e) => setManualForm({ ...manualForm, check_out: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Attendance Status</label>
                  <select
                    value={manualForm.attendance_status}
                    onChange={(e) => setManualForm({ ...manualForm, attendance_status: e.target.value })}
                    className="form-select"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', padding: '12px' }}>
                  Commit Attendance Entry
                </button>
              </form>
            </div>
          )}
        </>
      )}

    </div>
  );
}
