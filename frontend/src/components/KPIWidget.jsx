import React from 'react';

export default function KPIWidget({ title, value, subtext, icon, type = 'default' }) {
  const getColorScheme = () => {
    switch (type) {
      case 'success': return { bg: 'var(--success-light)', border: 'rgba(16, 185, 129, 0.2)', text: 'var(--success)' };
      case 'warning': return { bg: 'var(--warning-light)', border: 'rgba(245, 158, 11, 0.2)', text: 'var(--warning)' };
      case 'danger': return { bg: 'var(--danger-light)', border: 'rgba(239, 68, 68, 0.2)', text: 'var(--danger)' };
      case 'info': return { bg: 'var(--info-light)', border: 'rgba(6, 182, 212, 0.2)', text: 'var(--info)' };
      case 'primary': return { bg: 'var(--accent-light)', border: 'rgba(99, 102, 241, 0.2)', text: 'var(--primary)' };
      default: return { bg: 'var(--surface-hover)', border: 'var(--border)', text: 'var(--text-secondary)' };
    }
  };

  const scheme = getColorScheme();

  return (
    <div className="card card-hover animate-fade" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      padding: '20px 24px',
      borderLeftWidth: '5px',
      borderLeftColor: scheme.text
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        <h3 style={{ fontSize: '1.75rem', fontWeight: '800', fontFamily: 'Outfit', color: 'var(--text-primary)', lineHeight: 1.1 }}>
          {value}
        </h3>
        {subtext && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {subtext}
          </span>
        )}
      </div>

      <div style={{
        backgroundColor: scheme.bg,
        border: `1px solid ${scheme.border}`,
        color: scheme.text,
        padding: '12px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {icon}
      </div>
    </div>
  );
}
