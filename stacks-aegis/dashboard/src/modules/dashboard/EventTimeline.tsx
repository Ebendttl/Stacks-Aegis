import { useEffect, useState } from 'react';

export function EventTimeline() {
  const [events] = useState([
    { title: 'System initialized', timestamp: new Date().toISOString(), blockHeight: 3888930, severity: 'info' },
    { title: 'Oracle price feed synced', timestamp: new Date().toISOString(), blockHeight: 3888929, severity: 'info' },
    { title: 'Stability score computed: 96/100', timestamp: new Date().toISOString(), blockHeight: 3888928, severity: 'info' },
  ]);

  useEffect(() => {
    // Polling logic would go here
  }, []);

  return (
    <div className="space-y-4">
      {events.map((event, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          border: '1px solid #2a2a2a',
          background: '#111',
          marginBottom: '8px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#fff',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              {event.title}
            </span>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '10px',
              color: '#666'
            }}>
              {new Date(event.timestamp).toLocaleTimeString()} · Block #{event.blockHeight}
            </span>
          </div>
          <span style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: event.severity === 'critical' ? '#ff4444'
                      : event.severity === 'warning'  ? '#f5a623'
                      : '#00ff88',
            flexShrink: 0
          }} />
        </div>
      ))}
    </div>
  );
}
