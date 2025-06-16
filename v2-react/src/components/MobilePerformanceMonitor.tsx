import React, { useState, useEffect } from 'react';

interface MobilePerformanceMonitorProps {
  show?: boolean;
}

/**
 * Development-only mobile performance monitor
 * Shows FPS, memory usage, and connection info
 */
const MobilePerformanceMonitor: React.FC<MobilePerformanceMonitorProps> = ({ 
  show = process.env.NODE_ENV === 'development' 
}) => {
  const [fps, setFps] = useState(0);
  const [memory, setMemory] = useState({ used: 0, total: 0 });
  const [connection, setConnection] = useState({ type: 'unknown', speed: 'unknown' });
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    if (!show) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round(frameCount * 1000 / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    // Start FPS measurement
    animationId = requestAnimationFrame(measureFPS);

    // Memory monitoring
    const memoryInterval = setInterval(() => {
      if ('memory' in performance) {
        const mem = (performance as any).memory;
        setMemory({
          used: Math.round(mem.usedJSHeapSize / 1048576),
          total: Math.round(mem.totalJSHeapSize / 1048576)
        });
      }
    }, 1000);

    // Network connection monitoring
    const updateConnection = () => {
      const conn = (navigator as any).connection;
      if (conn) {
        setConnection({
          type: conn.effectiveType || 'unknown',
          speed: conn.downlink ? `${conn.downlink}Mbps` : 'unknown'
        });
      }
    };

    updateConnection();
    const conn = (navigator as any).connection;
    conn?.addEventListener('change', updateConnection);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(memoryInterval);
      conn?.removeEventListener('change', updateConnection);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div 
      className="sm:hidden"
      style={{
        position: 'fixed',
        top: '80px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.9)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        borderRadius: '8px',
        padding: minimized ? '4px' : '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 9999,
        minWidth: minimized ? 'auto' : '150px',
        transition: 'all 0.3s ease'
      }}
    >
      <button 
        onClick={() => setMinimized(!minimized)}
        style={{
          position: 'absolute',
          top: '2px',
          right: '2px',
          background: 'none',
          border: 'none',
          color: '#a855f7',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '2px 6px',
          lineHeight: 1
        }}
      >
        {minimized ? '📊' : '−'}
      </button>

      {!minimized && (
        <div style={{ marginTop: '20px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '4px',
            color: '#e5e7eb'
          }}>
            <span style={{ color: '#9ca3af' }}>FPS:</span>
            <span style={{
              fontWeight: 'bold',
              color: fps < 30 ? '#ef4444' : fps < 50 ? '#f59e0b' : '#10b981'
            }}>
              {fps}
            </span>
          </div>

          {memory.total > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
              color: '#e5e7eb'
            }}>
              <span style={{ color: '#9ca3af' }}>Memory:</span>
              <span style={{ fontWeight: 'bold' }}>
                {memory.used}/{memory.total}MB
              </span>
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '4px',
            color: '#e5e7eb'
          }}>
            <span style={{ color: '#9ca3af' }}>Network:</span>
            <span style={{ fontWeight: 'bold' }}>{connection.type}</span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '4px',
            color: '#e5e7eb'
          }}>
            <span style={{ color: '#9ca3af' }}>Device:</span>
            <span style={{ fontWeight: 'bold' }}>
              {window.innerWidth}x{window.innerHeight}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobilePerformanceMonitor;