import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Profile() {
  const { user } = useAuth();
  
  // States
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '9876543210'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationConfig, setNotificationConfig] = useState({
    emailAlerts: true,
    shiftReminders: true,
    smsAnnouncements: false
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    alert("Success: Your profile details have been saved.");
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Error: New passwords do not match.");
      return;
    }
    alert("Success: Password changed successfully.");
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="page-container animate-fade" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }} className="grid-cols-2">
      
      {/* Column 1: Details and Toggles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Profile Details Card */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '20px' }}>
            Personal Profile Details
          </h3>
          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                value={profileForm.name} 
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} 
                className="form-input" 
                required 
              />
            </div>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                value={profileForm.email} 
                disabled 
                className="form-input" 
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>* Email edits are locked by administrator policy.</span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Phone</label>
              <input 
                type="text" 
                value={profileForm.phone} 
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} 
                className="form-input" 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
              Save Profile
            </button>
          </form>
        </div>

        {/* Preferences / Toggles */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '20px' }}>
            Notification Preferences
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', cursor: 'pointer' }}>
              <div>
                <p style={{ fontWeight: '600' }}>Email Attendance Digests</p>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Send summaries of daily checkout attendance</span>
              </div>
              <input 
                type="checkbox" 
                checked={notificationConfig.emailAlerts}
                onChange={(e) => setNotificationConfig({ ...notificationConfig, emailAlerts: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', cursor: 'pointer' }}>
              <div>
                <p style={{ fontWeight: '600' }}>Shift Change Reminders</p>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Notify immediately on calendar roster adjustments</span>
              </div>
              <input 
                type="checkbox" 
                checked={notificationConfig.shiftReminders}
                onChange={(e) => setNotificationConfig({ ...notificationConfig, shiftReminders: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', cursor: 'pointer' }}>
              <div>
                <p style={{ fontWeight: '600' }}>SMS Alerts Announcements</p>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Push system-wide broadcasts directly to phone</span>
              </div>
              <input 
                type="checkbox" 
                checked={notificationConfig.smsAnnouncements}
                onChange={(e) => setNotificationConfig({ ...notificationConfig, smsAnnouncements: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
            </label>
          </div>
        </div>

      </div>

      {/* Column 2: Security settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Change Password Card */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '20px' }}>
            Modify Security Credentials
          </h3>
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Current Password</label>
              <input 
                type="password" 
                value={passwordForm.currentPassword} 
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} 
                className="form-input" 
                required 
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">New Security Password</label>
              <input 
                type="password" 
                value={passwordForm.newPassword} 
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} 
                className="form-input" 
                required 
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Confirm New Password</label>
              <input 
                type="password" 
                value={passwordForm.confirmPassword} 
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} 
                className="form-input" 
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
              Change Password
            </button>
          </form>
        </div>

        {/* Theme Settings Card */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '20px' }}>
            Interface Theme & Layout
          </h3>
          <div className="form-group">
            <label className="form-label">Select Theme Colors</label>
            <select className="form-select" defaultValue="light">
              <option value="light">Soft Blue & Lavender Theme (Default)</option>
              <option value="dark" disabled>Dark Charcoal Mode (Coming soon)</option>
              <option value="kids" disabled>FirstCry Colorful Theme (Coming soon)</option>
            </select>
          </div>
        </div>

      </div>

    </div>
  );
}
