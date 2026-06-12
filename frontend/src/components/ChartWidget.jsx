import React from 'react';

export default function ChartWidget({ title, data, type = 'bar' }) {
  if (type === 'bar') {
    // Expects data format: [{ day: 'Mon', rate: 90 }]
    const maxVal = 100;
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '320px' }}>
        <h3 style={{ fontSize: '0.95rem', fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '24px' }}>{title}</h3>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '12px',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--border)'
        }}>
          {data?.map((item, idx) => {
            const pct = Math.min((item.rate / maxVal) * 100, 100);
            return (
              <div key={idx} style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                height: '100%'
              }}>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'flex-end',
                  width: '100%',
                  height: '100%',
                  position: 'relative'
                }}>
                  {/* Tooltip value */}
                  <span style={{
                    position: 'absolute',
                    top: '-24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    color: 'var(--primary)'
                  }}>{item.rate}%</span>
                  
                  {/* Bar */}
                  <div style={{
                    width: '60%',
                    margin: '0 auto',
                    height: `${pct}%`,
                    backgroundImage: 'linear-gradient(to top, var(--primary), var(--secondary))',
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 0.8s ease'
                  }}></div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  {item.day || item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'progress') {
    // Expects data format: [{ month: 'Jan', rate: 95 }]
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '320px' }}>
        <h3 style={{ fontSize: '0.95rem', fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '24px' }}>{title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          {data?.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '500' }}>
                <span style={{ color: 'var(--text-primary)' }}>{item.month || item.name}</span>
                <span style={{ color: 'var(--secondary)', fontWeight: '700' }}>{item.rate}%</span>
              </div>
              <div style={{
                height: '8px',
                width: '100%',
                backgroundColor: 'var(--surface-hover)',
                borderRadius: '9999px',
                overflow: 'hidden',
                border: '1px solid var(--border)'
              }}>
                <div style={{
                  height: '100%',
                  width: `${item.rate}%`,
                  backgroundImage: 'linear-gradient(to right, var(--secondary), var(--primary))',
                  borderRadius: '9999px',
                  transition: 'width 0.8s ease'
                }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'performance') {
    // Expects data format: [{ name: 'Ananya Sen', performanceScore: 95, role: 'Teacher' }]
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '320px' }}>
        <h3 style={{ fontSize: '0.95rem', fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '20px' }}>{title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', flex: 1 }}>
          {data?.map((item, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--background)'
            }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.name}</p>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.role}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <div style={{
                  height: '6px',
                  width: '60px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '9999px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${item.performanceScore}%`,
                    backgroundColor: item.performanceScore >= 80 ? 'var(--success)' : 'var(--warning)',
                    borderRadius: '9999px'
                  }}></div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>{item.performanceScore}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
