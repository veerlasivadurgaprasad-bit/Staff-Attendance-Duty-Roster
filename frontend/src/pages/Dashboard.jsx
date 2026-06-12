import React, { useState, useEffect } from 'react';
import KPIWidget from '../components/KPIWidget';
import ChartWidget from '../components/ChartWidget';
import { api } from '../services/api';

export default function Dashboard({ setCurrentPage }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [upcomingDuties, setUpcomingDuties] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardStats = await api.getDashboardStats();
        setStats(dashboardStats);
        
        // Load recent attendance log
        const attendance = await api.getAttendance();
        setRecentAttendance(attendance.slice(-3).reverse());

        // Load upcoming duties
        const roster = await api.getRoster();
        setUpcomingDuties(roster.slice(0, 3));

        // Load tasks
        const tasks = await api.getTasks();
        setPendingTasks(tasks.filter(t => t.status !== 'Completed').slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard intelligence...</div>;
  }

  const kpis = stats?.kpis || {};
  const charts = stats?.charts || {};
  const insights = stats?.aiInsights || {};

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* 1. AI Insights Center banner */}
      {(insights.shortageAlerts?.length > 0 || insights.attendanceTrendAnalysis || insights.performanceInsights) && (
        <div className="card animate-fade" style={{
          backgroundImage: 'linear-gradient(135deg, #f5f3ff 0%, #eff6ff 100%)',
          borderColor: 'rgba(99, 102, 241, 0.15)',
          padding: '20px 24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <svg style={{ color: 'var(--primary)', width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 style={{ fontSize: '1rem', fontFamily: 'Outfit', color: 'var(--primary)', fontWeight: '700' }}>AI Daycare Operational Insights</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            {/* Shortage Warnings */}
            {insights.shortageAlerts?.map((alert, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontWeight: '500' }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                <span>{alert}</span>
              </div>
            ))}
            
            {/* Attendance trends */}
            {insights.attendanceTrendAnalysis && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--info)' }}>📊</span>
                <span><strong>Attendance Trend:</strong> {insights.attendanceTrendAnalysis}</span>
              </div>
            )}

            {/* Performance Insights */}
            {insights.performanceInsights && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--secondary)' }}>💡</span>
                <span><strong>Staff Performance:</strong> {insights.performanceInsights}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. KPI Cards Grid */}
      <div className="grid-cols-4">
        <KPIWidget 
          title="Total Staff" 
          value={kpis.totalStaff} 
          subtext="Registered accounts"
          type="primary"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
        <KPIWidget 
          title="Present Today" 
          value={kpis.presentToday} 
          subtext={`${kpis.attendancePercentage}% Present Today`}
          type="success"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KPIWidget 
          title="Teachers On Duty" 
          value={kpis.teachersOnDuty} 
          subtext="Classroom leads"
          type="info"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />
        <KPIWidget 
          title="Pending Tasks" 
          value={kpis.pendingTasks} 
          subtext="Tasks in progress"
          type="warning"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* 3. Charts and Analytics section */}
      <div className="grid-cols-3">
        <ChartWidget title="Weekly Attendance Trend (%)" data={charts.weeklyAttendance} type="bar" />
        <ChartWidget title="Monthly Attendance Rate (%)" data={charts.monthlyAttendance} type="progress" />
        <ChartWidget title="Educator Performance Index" data={charts.staffPerformance} type="performance" />
      </div>

      {/* 4. Bottom Grid: Quick Actions & Log Previews */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
        {/* Quick Actions Container */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '18px' }}>Daycare Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <button className="btn btn-primary" onClick={() => setCurrentPage('attendance')}>
              Mark Attendance
            </button>
            <button className="btn btn-secondary" onClick={() => setCurrentPage('roster')}>
              Create Duty Roster
            </button>
            <button className="btn btn-outline" onClick={() => setCurrentPage('classrooms')}>
              Assign Classroom
            </button>
            <button className="btn btn-outline" onClick={() => setCurrentPage('reports')}>
              Generate Reports
            </button>
          </div>
        </div>

        {/* Detailed Panels Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '24px'
        }} className="grid-cols-3">
          
          {/* Recent Attendance */}
          <div className="card">
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Logs</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentAttendance.map((log, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <div>
                    <p style={{ fontWeight: '600' }}>{log.name}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.date} &bull; {log.check_in || '--'}</span>
                  </div>
                  <span className={`badge badge-${log.attendance_status.toLowerCase().replace(' ', '')}`}>
                    {log.attendance_status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Shifts */}
          <div className="card">
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shift Allocation</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingDuties.map((duty, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <div>
                    <p style={{ fontWeight: '600' }}>{duty.staff_name}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{duty.classroom_name} &bull; {duty.assigned_date}</span>
                  </div>
                  <span className="badge badge-inprogress" style={{ fontSize: '0.65rem' }}>
                    {duty.shift.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="card">
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daycare Checklist</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingTasks.map((task, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{task.title}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Assigned: {task.assigned_name}</span>
                  </div>
                  <span className={`badge badge-${task.priority.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
