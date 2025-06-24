import React from 'react';

const DebugPage: React.FC = () => {
  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '50px', backgroundColor: 'red', zIndex: 9999 }}>
        <div style={{ textAlign: 'center', color: 'white', lineHeight: '50px' }}>
          Full Width Header - Should touch both edges
        </div>
      </div>
      
      <div style={{ marginTop: '60px', padding: '20px' }}>
        <div style={{ backgroundColor: 'blue', color: 'white', padding: '20px', marginBottom: '20px' }}>
          <h1>Debug: This div has padding: 20px on the parent</h1>
          <p>Window width: {window.innerWidth}px</p>
        </div>
        
        <div className="container" style={{ backgroundColor: 'green', color: 'white', padding: '20px', marginBottom: '20px' }}>
          <h2>This uses the Tailwind container class</h2>
          <p>It should be centered with proper padding</p>
        </div>
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: 'purple', color: 'white', padding: '20px' }}>
          <h2>This is manually centered with max-width and margin: 0 auto</h2>
        </div>
      </div>
    </>
  );
};

export default DebugPage;