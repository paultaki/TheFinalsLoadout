import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div style={{ width: '100%', backgroundColor: 'red', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'blue', padding: '20px' }}>
        <h1 style={{ textAlign: 'center', color: 'white' }}>Test Centering</h1>
        <p style={{ textAlign: 'center', color: 'white' }}>This should be centered</p>
      </div>
    </div>
  );
};

export default TestPage;