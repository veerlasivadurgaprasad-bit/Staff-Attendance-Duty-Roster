import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function TaskBoard() {
  const { isAdmin, isCentreHead, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [workloads, setWorkloads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isWorkloadModalOpen, setIsWorkloadModalOpen] = useState(false);

  // Form
  const [taskForm, setTaskForm] = useState({
    assigned_to: '',
    title: '',
    description: '',
    priority: 'Medium',
    due_date: new Date().toISOString().split('T')[0]
  });

  const isPrivileged = isAdmin() || isCentreHead();

  const loadTaskBoard = async () => {
    setLoading(true);
    try {
      // If teacher/helper is logged in, they see their own tasks.
      // If admin/head, they see all tasks.
      const assignedToFilter = isPrivileged ? null : user.staff_id;
      const list = await api.getTasks(assignedToFilter);
      setTasks(list);

      const staff = await api.getStaff({ status: 'Active' });
      setStaffList(staff);

      if (isPrivileged) {
        const workloadStats = await api.getTeacherWorkload();
        setWorkloads(workloadStats);
      }
    } catch (err) {
      alert("Error sync task board: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaskBoard();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.createTask(taskForm);
      setIsTaskModalOpen(false);
      setTaskForm({
        assigned_to: '',
        title: '',
        description: '',
        priority: 'Medium',
        due_date: new Date().toISOString().split('T')[0]
      });
      loadTaskBoard();
    } catch (err) {
      alert("Error creating task: " + err.message);
    }
  };

  const handleStatusShift = async (task_id, nextStatus) => {
    try {
      await api.updateTask(task_id, nextStatus);
      loadTaskBoard();
    } catch (err) {
      alert("Error shifting task state: " + err.message);
    }
  };

  // Group tasks by status columns
  const getTasksByStatus = (status) => {
    return tasks.filter(t => t.status === status);
  };

  return (
    <div className="page-container animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Controls row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {isPrivileged ? (
          <button className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }} onClick={() => setIsWorkloadModalOpen(true)}>
            📊 Educator Workload Scorecard
          </button>
        ) : (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>You are viewing checklist tasks assigned to you.</span>
        )}

        {isPrivileged && (
          <button className="btn btn-primary" onClick={() => setIsTaskModalOpen(true)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Task
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading tasks boards...</div>
      ) : (
        /* Kanban Columns Container */
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '20px',
          minHeight: '550px'
        }} className="grid-cols-3">
          
          {/* COLUMN 1: Pending */}
          <div className="card" style={{ backgroundColor: '#f8fafc', borderColor: 'var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
              <h4 style={{ fontSize: '0.85rem', fontFamily: 'Outfit', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Checklist</h4>
              <span className="badge badge-pending">{getTasksByStatus('Pending').length}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
              {getTasksByStatus('Pending').map(task => (
                <div key={task.task_id} className="card animate-fade" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 2px 4px 0 rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className={`badge badge-${task.priority.toLowerCase()}`} style={{ fontSize: '0.6rem' }}>
                      {task.priority} Priority
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Due: {task.due_date}</span>
                  </div>
                  <h5 style={{ fontSize: '0.875rem', fontWeight: '700' }}>{task.title}</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{task.description}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>👤 {task.assigned_name}</span>
                    <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.65rem' }} onClick={() => handleStatusShift(task.task_id, 'In Progress')}>
                      Start &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 2: In Progress */}
          <div className="card" style={{ backgroundColor: '#f8fafc', borderColor: 'var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
              <h4 style={{ fontSize: '0.85rem', fontFamily: 'Outfit', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Progress</h4>
              <span className="badge badge-inprogress">{getTasksByStatus('In Progress').length}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
              {getTasksByStatus('In Progress').map(task => (
                <div key={task.task_id} className="card animate-fade" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 2px 4px 0 rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className={`badge badge-${task.priority.toLowerCase()}`} style={{ fontSize: '0.6rem' }}>
                      {task.priority} Priority
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Due: {task.due_date}</span>
                  </div>
                  <h5 style={{ fontSize: '0.875rem', fontWeight: '700' }}>{task.title}</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{task.description}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>👤 {task.assigned_name}</span>
                    <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.65rem' }} onClick={() => handleStatusShift(task.task_id, 'Completed')}>
                      Complete &check;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 3: Completed */}
          <div className="card" style={{ backgroundColor: '#f8fafc', borderColor: 'var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
              <h4 style={{ fontSize: '0.85rem', fontFamily: 'Outfit', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</h4>
              <span className="badge badge-completed">{getTasksByStatus('Completed').length}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
              {getTasksByStatus('Completed').map(task => (
                <div key={task.task_id} className="card animate-fade" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', opacity: 0.75 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="badge badge-completed" style={{ fontSize: '0.6rem' }}>Done</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Finished</span>
                  </div>
                  <h5 style={{ fontSize: '0.875rem', fontWeight: '700', textDecoration: 'line-through', color: 'var(--text-secondary)' }}>{task.title}</h5>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.description}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>👤 {task.assigned_name}</span>
                    <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.65rem', color: 'var(--text-muted)' }} onClick={() => handleStatusShift(task.task_id, 'Pending')}>
                      Reopen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Create Task Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create Daycare Checklist Activity">
        <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Assign To Staff Member</label>
            <select
              value={taskForm.assigned_to}
              onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
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
            <label className="form-label">Task Title</label>
            <input
              type="text"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              className="form-input"
              placeholder="e.g. Disinfect soft play areas"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Task Description</label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="form-textarea"
              rows="3"
              placeholder="Provide specific notes or checklist details..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Priority Weight</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="form-select"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Target Due Date</label>
              <input
                type="date"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                className="form-input"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsTaskModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Checklist</button>
          </div>
        </form>
      </Modal>

      {/* Workload Analysis Modal */}
      <Modal isOpen={isWorkloadModalOpen} onClose={() => setIsWorkloadModalOpen(false)} title="Educator Workload Scorecard (AI-powered)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.85rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            This panel analyzes outstanding tasks, priority scores, and due dates to compute operational burn-out metrics for educators.
          </p>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Educator</th>
                  <th>Open Tasks</th>
                  <th>Score</th>
                  <th>Index</th>
                  <th>Action Plan Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {workloads.map((w, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '600' }}>
                      <div>{w.name}</div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{w.designation}</span>
                    </td>
                    <td style={{ fontWeight: '700', textAlign: 'center' }}>{w.totalPendingTasks}</td>
                    <td style={{ fontWeight: '700', textAlign: 'center' }}>{w.workloadScore}</td>
                    <td>
                      <span className={`badge badge-${w.status === 'Overloaded' ? 'high' : w.status === 'High' ? 'medium' : 'low'}`} style={{ fontSize: '0.65rem' }}>
                        {w.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{w.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

    </div>
  );
}
