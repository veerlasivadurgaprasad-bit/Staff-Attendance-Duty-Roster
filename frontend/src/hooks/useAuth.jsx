import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    const activeUser = api.getCurrentUser();
    if (activeUser) {
      setUser(activeUser);
    }
    setDemoMode(api.isMockMode());
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const data = await api.login(email, password, role);
      setUser(data.user);
      setDemoMode(api.isMockMode());
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const refreshDemoModeStatus = () => {
    setDemoMode(api.isMockMode());
  };

  const value = {
    user,
    loading,
    demoMode,
    login,
    logout,
    refreshDemoModeStatus,
    isAdmin: () => user?.role === 'Admin',
    isCentreHead: () => user?.role === 'Centre Head',
    isStaff: () => user?.role === 'Teacher' || user?.role === 'Helper',
    isTeacher: () => user?.role === 'Teacher',
    isHelper: () => user?.role === 'Helper'
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
