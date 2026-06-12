import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill helper credentials for demo convenience
  const applyQuickLogin = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'Admin') {
      setEmail('admin@firstcry.com');
      setPassword('admin123');
    } else if (selectedRole === 'Centre Head') {
      setEmail('priya.sharma@firstcry.com');
      setPassword('head123');
    } else if (selectedRole === 'Teacher') {
      setEmail('ananya.sen@firstcry.com');
      setPassword('teacher123');
    } else if (selectedRole === 'Helper') {
      setEmail('sita.devi@firstcry.com');
      setPassword('helper123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password, role);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f1f5f9',
      backgroundImage: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.08), transparent 40%), radial-gradient(circle at bottom left, rgba(168, 85, 247, 0.08), transparent 40%)',
      padding: '20px'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.1)'
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            backgroundColor: 'var(--primary)',
            padding: '10px',
            borderRadius: '12px',
            marginBottom: '12px',
            color: 'white'
          }}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '32px', height: '32px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'Outfit', fontWeight: '800' }}>FirstCry Intellitots</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Staff Attendance & Duty Roster</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger)',
            fontSize: '0.8rem',
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">Select Workspace Role</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="form-select"
            >
              <option value="Admin">Administrator</option>
              <option value="Centre Head">Centre Head</option>
              <option value="Teacher">Educator (Teacher)</option>
              <option value="Helper">Helper / Attendant</option>
            </select>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="e.g. name@firstcry.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Security Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* Remember and Forgot */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px',
            fontSize: '0.8rem'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
                style={{ accentColor: 'var(--primary)' }}
              />
              Remember me
            </label>
            <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Please contact your Centre Administrator to reset your password."); }} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', fontWeight: '600', fontSize: '0.9rem' }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Logins */}
        <div style={{ marginTop: '28px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '12px' }}>
            QUICK LOGIN DEMO CREDENTIALS
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button type="button" className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '6px' }} onClick={() => applyQuickLogin('Admin')}>Admin</button>
            <button type="button" className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '6px' }} onClick={() => applyQuickLogin('Centre Head')}>Centre Head</button>
            <button type="button" className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '6px' }} onClick={() => applyQuickLogin('Teacher')}>Teacher</button>
            <button type="button" className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '6px' }} onClick={() => applyQuickLogin('Helper')}>Helper</button>
          </div>
        </div>
      </div>
    </div>
  );
}
