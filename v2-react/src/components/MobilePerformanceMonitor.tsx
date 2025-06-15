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
    <div className={`perf-monitor ${minimized ? 'minimized' : ''}`}>
      <button 
        className="toggle-btn"
        onClick={() => setMinimized(!minimized)}
      >
        {minimized ? '📊' : '−'}
      </button>

      {!minimized && (
        <div className="perf-content">
          <div className="perf-item">
            <span className="perf-label">FPS:</span>
            <span className={`perf-value ${fps < 30 ? 'warning' : fps < 50 ? 'caution' : 'good'}`}>
              {fps}
            </span>
          </div>

          {memory.total > 0 && (
            <div className="perf-item">
              <span className="perf-label">Memory:</span>
              <span className="perf-value">
                {memory.used}/{memory.total}MB
              </span>
            </div>
          )}

          <div className="perf-item">
            <span className="perf-label">Network:</span>
            <span className="perf-value">{connection.type}</span>
          </div>

          <div className="perf-item">
            <span className="perf-label">Device:</span>
            <span className="perf-value">
              {window.innerWidth}x{window.innerHeight}
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        .perf-monitor {
          position: fixed;
          top: 80px;
          right: 10px;
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 8px;
          padding: 8px;
          font-family: monospace;
          font-size: 12px;
          z-index: 9999;
          min-width: 150px;
          transition: all 0.3s ease;
        }

        .perf-monitor.minimized {
          min-width: auto;
          padding: 4px;
        }

        .toggle-btn {
          position: absolute;
          top: 2px;
          right: 2px;
          background: none;
          border: none;
          color: #a855f7;
          cursor: pointer;
          font-size: 16px;
          padding: 2px 6px;
          line-height: 1;
        }

        .perf-content {
          margin-top: 20px;
        }

        .perf-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          color: #e5e7eb;
        }

        .perf-label {
          color: #9ca3af;
        }

        .perf-value {
          font-weight: bold;
        }

        .perf-value.good {
          color: #10b981;
        }

        .perf-value.caution {
          color: #f59e0b;
        }

        .perf-value.warning {
          color: #ef4444;
        }

        /* Hide on production */
        @media (min-width: 640px) {
          .perf-monitor {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default MobilePerformanceMonitor;