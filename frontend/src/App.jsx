import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StaffManagement from './pages/StaffManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import DutyRoster from './pages/DutyRoster';
import ClassroomAllocation from './pages/ClassroomAllocation';
import TaskBoard from './pages/TaskBoard';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

import { api } from './services/api';

function MainLayout() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);

  // Sync notification counts on launch
  useEffect(() => {
    if (user) {
      api.getNotifications(user.id).then(list => {
        const unread = list.filter(n => !n.is_read).length;
        setNotificationCount(unread);
      }).catch(e => console.error(e));
    }
  }, [currentPage, user]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'staff':
        return <StaffManagement searchQuery={searchQuery} />;
      case 'attendance':
        return <AttendanceManagement searchQuery={searchQuery} />;
      case 'roster':
        return <DutyRoster />;
      case 'classrooms':
        return <ClassroomAllocation />;
      case 'tasks':
        return <TaskBoard />;
      case 'reports':
        return <Reports />;
      case 'notifications':
        return <Notifications setNotificationCount={setNotificationCount} />;
      case 'settings':
        return <Profile />;
      default:
        return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Panel */}
      <Sidebar currentPage={currentPage} setCurrentPage={(p) => { setCurrentPage(p); setSearchQuery(''); }} />
      
      {/* Viewport Frame */}
      <div className="main-content">
        <Navbar 
          currentPage={currentPage} 
          onSearchChange={setSearchQuery} 
          notificationCount={notificationCount}
          setNotificationCount={setNotificationCount}
          setCurrentPage={(p) => { setCurrentPage(p); setSearchQuery(''); }}
        />
        
        {/* Rendered Component Page */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
