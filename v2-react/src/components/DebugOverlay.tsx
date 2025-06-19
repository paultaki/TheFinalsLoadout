import React from 'react';

const DebugOverlay: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 9999
    }}>
      {/* Center line */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: '2px',
        backgroundColor: 'red',
        transform: 'translateX(-50%)'
      }} />
      
      {/* Viewport edges */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '2px',
        backgroundColor: 'blue'
      }} />
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '2px',
        backgroundColor: 'blue'
      }} />
      
      {/* Info */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        backgroundColor: 'black',
        color: 'white',
        padding: '10px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <div>Viewport: {window.innerWidth}px</div>
        <div>Red line = center</div>
        <div>Blue lines = edges</div>
      </div>
    </div>
  );
};

export default DebugOverlay;