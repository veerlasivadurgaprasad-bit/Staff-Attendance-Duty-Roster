import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

export default function Navbar({ currentPage, onSearchChange, notificationCount, setNotificationCount, setCurrentPage }) {
  const { user, demoMode, refreshDemoModeStatus } = useAuth();
  const [searchValue, setSearchValue] = useState('');

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Dashboard Overview';
      case 'staff': return 'Staff Directory';
      case 'attendance': return 'Attendance Logs';
      case 'roster': return 'Duty Shift Allocation';
      case 'classrooms': return 'Classroom Layouts';
      case 'tasks': return 'Daycare Tasks Board';
      case 'reports': return 'Reports & Analytics';
      case 'notifications': return 'Notification Center';
      case 'settings': return 'System Settings';
      default: return 'Management Roster';
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    if (onSearchChange) onSearchChange(val);
  };

  const toggleDemoMode = () => {
    const active = localStorage.getItem('force_demo_mode') === 'true';
    localStorage.setItem('force_demo_mode', !active ? 'true' : 'false');
    api.recheckHealth().then(() => {
      refreshDemoModeStatus();
      window.location.reload();
    });
  };

  return (
    <header style={{
      height: '70px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Page Title & Breadcrumbs */}
      <div>
        <h1 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontFamily: 'Outfit', fontWeight: '700' }}>
          {getPageTitle()}
        </h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          FirstCry Intellitots &bull; {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Utilities */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Search Bar (Visible on searchable pages) */}
        {['staff', 'attendance', 'tasks'].includes(currentPage) && (
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search record..."
              value={searchValue}
              onChange={handleSearch}
              className="form-input"
              style={{
                width: '240px',
                paddingLeft: '36px',
                paddingTop: '8px',
                paddingBottom: '8px',
                borderRadius: '8px'
              }}
            />
          </div>
        )}

        {/* Demo Mode Toggle Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span 
            className={`badge ${demoMode ? 'badge-present' : 'badge-leave'}`}
            style={{ 
              fontSize: '0.7rem', 
              cursor: 'pointer',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              userSelect: 'none'
            }}
            onClick={toggleDemoMode}
            title="Click to toggle network server connection check"
          >
            {demoMode ? '🟢 Demo Mode (Local)' : '⚡ Live Mode (API)'}
          </span>
        </div>

        {/* Notification Icon */}
        <button
          onClick={() => setCurrentPage('notifications')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            position: 'relative',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notificationCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              backgroundColor: 'var(--danger)',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: '700',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white'
            }}>
              {notificationCount}
            </span>
          )}
        </button>

        {/* Profile Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderLeft: '1px solid var(--border)',
          paddingLeft: '20px'
        }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>{user?.name}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</p>
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-light)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: '600',
            fontFamily: 'Outfit',
            border: '2px solid var(--border)'
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
