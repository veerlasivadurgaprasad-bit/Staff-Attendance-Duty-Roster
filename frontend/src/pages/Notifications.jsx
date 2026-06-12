import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function Notifications({ setNotificationCount }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const list = await api.getNotifications(user.id);
      setNotifications(list);
      
      // Calculate unread count
      const unread = list.filter(n => !n.is_read).length;
      setNotificationCount(unread);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getAlertStyle = (type) => {
    switch (type) {
      case 'Attendance': return { color: 'var(--success)', icon: '📅', bg: 'var(--success-light)' };
      case 'Shift Alert': return { color: 'var(--danger)', icon: '⚠️', bg: 'var(--danger-light)' };
      case 'Duty Change': return { color: 'var(--primary)', icon: '🔄', bg: 'var(--accent-light)' };
      default: return { color: 'var(--secondary)', icon: '📣', bg: '#faf5ff' };
    }
  };

  return (
    <div className="page-container animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading alerts log...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {notifications.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Bell is silent. You have no notifications.
            </div>
          ) : (
            notifications.map((notif) => {
              const style = getAlertStyle(notif.type);
              return (
                <div 
                  key={notif.notification_id}
                  className="card animate-fade"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '18px 24px',
                    borderColor: notif.is_read ? 'var(--border)' : 'rgba(99, 102, 241, 0.3)',
                    backgroundColor: notif.is_read ? '#ffffff' : 'rgba(99, 102, 241, 0.02)',
                    boxShadow: notif.is_read ? 'var(--shadow-sm)' : '0 4px 6px -1px rgba(99, 102, 241, 0.05)',
                    borderLeft: `5px solid ${style.color}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{
                      backgroundColor: style.bg,
                      padding: '10px',
                      borderRadius: '10px',
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {style.icon}
                    </div>
                    <div>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: notif.is_read ? '500' : '700',
                        color: 'var(--text-primary)'
                      }}>
                        {notif.message}
                      </p>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Category: {notif.type} &bull; {new Date(notif.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {!notif.is_read && (
                    <button
                      className="btn btn-outline animate-fade"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      onClick={() => handleMarkRead(notif.notification_id)}
                    >
                      Clear
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}
